import {
  ArgumentType,
  ICliCommand,
  ICommandArgument,
  ILexeme,
  lex,
  LexemeType,
  ParsedArgs,
  prepareSource,
  quoteAvoidSplit,
} from './mod.ts';
import * as errors from './errors/mod.ts';

interface IKnownLexemes {
  knownCommands: string[];
  knownOptions: string[];
  knownFlags: string[];
}

export class Cli {
  private middleware: {
    pattern: RegExp;
    handler: (lexemes: ILexeme[]) => boolean;
  }[] = [];

  // при добавлении команды сюда добавляются лексемы, чтобы быстро искать их лексером
  public knownLexemes: IKnownLexemes = {
    knownCommands: [],
    knownOptions: [],
    knownFlags: [],
  };
  public commands: ICliCommand[] = [];
  public subcommands: ICliCommand[] = [];

  /**
   * Добавляет команду в список команд и устанавливает для нее новые лексемы.
   * @param {ICliCommand} command - объект команды
   * @throws {Error} - если команда уже существует
   */
  public addCommand(command: ICliCommand): Cli {
    if (this.commands.some((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }
    this.addToKnownLexemes(command);
    command.subcommands?.forEach((subcommand) => {
      this.subcommands.push(subcommand);
    });
    this.commands.push(command);
    return this;
  }

  /**
   * Проверяет, является ли команда дочерней для другой команды.
   * @param parentCmd - Потенциальная родительская команда.
   * @param childCmd - Потенциальная дочерняя команда.
   * @returns Булево значение, указывающее, является ли дочерняя команда подкомандой родительской команды.
   */
  private isChildCommand(
    parentCmd: ICliCommand | null,
    childCmd: ICliCommand | null,
  ) {
    if (childCmd === null) return false;
    if (parentCmd === null) return true;

    return parentCmd.subcommands.some((key) =>
      key.name === childCmd.name
    );
  }

  /**
   * Добавляет новый middleware в список middleware для обработки лексем.
   * @param {IMiddleware} middleware - объект middleware, содержащий regexp-шаблон и обработчик
   * @throws {DuplicateMiddlewareError} - если middleware с таким же паттерном уже существует
   */
  public use(
    pattern: RegExp,
    handler: (lexemes: ILexeme[]) => boolean,
  ): Cli {
    const alreadyExists = this.middleware.some((key) => {
      key.pattern === pattern;
    });

    if (alreadyExists) {
      throw new errors.DuplicateMiddlewareError(pattern);
    }
    this.middleware.push(
      {
        pattern,
        handler,
      },
    );
    return this;
  }

  /**
   * Добавляет имя команды, опции и флаги в свойство knownLexemes экземпляра Cli.
   * @param command - Команда, лексемы которой будут добавлены в Cli.knownLexemes.
   * @returns void.
   */
  private addToKnownLexemes(
    command: ICliCommand,
  ): void {
    this.knownLexemes.knownCommands.push(command.name);
    command.arguments?.forEach((arg) => {
      if (arg.type === ArgumentType.OPTION) {
        this.knownLexemes.knownOptions.push(arg.name);
      } else if (arg.type === ArgumentType.FLAG) {
        this.knownLexemes.knownFlags.push(arg.name);
      }
    });
    command.subcommands?.forEach((subcommand) => {
      this.addToKnownLexemes(subcommand);
    });
  }

  /**
   * Получает массив валидных команд из списка лексем.
   * @param {ILexeme[]} lexemes - список лексем
   * @returns {ICliCommand[]} - массив валидных команд, расположенных в правильной последовательности
   * @throws {NoCommandFoundError} - если не найдено ни одной команды в списке лексем
   */
  getValidCommandChain(lexemes: ILexeme[]): ICliCommand[] {
    const commandTree: (ICliCommand | null)[] = [null];
    // Получаем из лексем только команды, сохраняя их порядок
    const commands = lexemes.map((lexeme) =>
      lexeme.type === LexemeType.COMMAND
        ? this.commands.concat(this.subcommands).find(
          (key) => key.name === lexeme.content,
        )
        : null
    ).filter((value) => value !== null) as ICliCommand[];
    if (commands.length === 0) throw new errors.NoCommandFoundError();
    // commandTree заполняется командами до первой недочерней команды
    commands.forEach((command) => {
      if (
        this.isChildCommand(
          commandTree[commandTree.length - 1],
          command,
        )
      ) {
        commandTree.push(command);
      }
    });
    const finalTree = commandTree.filter((value) =>
      value !== null
    ) as ICliCommand[];
    return finalTree;
  }

  /**
   * Запускает middleware для списка лексем.
   * @param {string} source - входная строка
   * @returns {[boolean, ILexeme[]]} - массив, содержащий результат обработки middleware и список лексем
   */
  execMiddleware(source: string): [boolean, ILexeme[]] {
    const lexemes = lex(source, this);
    // allHandlersReturnedTrue - флаг, показывающий, что все middleware вернули true
    let allHandlersReturnedTrue = true;
    for (let i = 0; i < this.middleware.length; i++) {
      const middleware = this.middleware[i];
      if (middleware.pattern.test(source)) {
        const handlerResult = middleware.handler(lexemes);
        if (!handlerResult) {
          allHandlersReturnedTrue = false;
          break;
        }
      }
    }
    return [allHandlersReturnedTrue, lexemes];
  }

  /**
   * Разбирает список лексем на аргументы и создает из них объект parsedArgs.
   * @param {ILexeme[]} lexemes - список лексем
   * @param {string} source - входная строка
   * @returns {parsedArgs} - объект parsedArgs, содержащий набор опций и флагов команды
   * @throws {UnknownMainCommandError} - если первая команда не является известной
   * @throws {CommandNotOnStartError} - если первая команда не находится в начале входной строки
   * @throws {MissingValueError} - если не указано значение опции
   * @throws {UnknownOptionError} - если указана неизвестная опция
   * @throws {UnknownFlagError} - если указан неизвестный флаг
   * @throws {InvalidValueError} - если указано некорректное значение для опции
   * @throws {MissingArgumentError} - если не указан обязательный аргумент команды
   */
  parseArgs(lexemes: ILexeme[], source: string): ParsedArgs {
    // Получаем из лексем только команды(с проверкой дочерности), сохраняя их порядок
    const commandChain = this.getValidCommandChain(lexemes);
    if (
      !this.commands.includes(commandChain[0])
    ) {
      throw new errors.UnknownMainCommandError(commandChain[0].name);
    }
    //Исполнимая команда - последняя в списке
    const lastCommand = commandChain[commandChain.length - 1];
    const commandChainNames = commandChain.map((command) =>
      command.name
    );
    // Проверяем, что все команды находятся в начале входной строки
    const commandsOnStart = source.startsWith(
      commandChainNames.join(' '),
    );
    if (!commandsOnStart) {
      throw new errors.CommandNotOnStartError();
    }
    // Преобразуем аргументы с учтом кавычек(какие-то аргументы-строки могут быть в кавычках)
    const args = quoteAvoidSplit(
      source.replace(commandChainNames.join(' '), ''),
    );
    const parsedArgs: ParsedArgs = [{}, lastCommand];

    // Список обязательных аргументов
    let requiredArgs = lastCommand.arguments?.filter((arg) =>
      arg.required
    );
    // Сколько обязательных аргументов осталось получить
    let requiredLeast = requiredArgs?.length ?? 0;
    // Если схавали опцию, то ждем значение
    //(и знаем на след итерации, к какому аргументу оно должно относиться)
    let waitingForValue: ICommandArgument | null = null;
    lexemes.forEach((lexeme) => {
      if (lexeme.type === LexemeType.OPTION) {
        if (waitingForValue !== null) {
          throw new errors.MissingValueError(waitingForValue.name);
        }
        const option = lastCommand.arguments?.find((arg) =>
          arg.name === lexeme.content
        );
        if (option === undefined) {
          throw new errors.UnknownOptionError(lexeme.content);
        }
        // Встретили опцию - ждем значение на след итерации
        waitingForValue = option;
      } else if (lexeme.type === LexemeType.FLAG) {
        if (waitingForValue !== null) {
          throw new errors.MissingValueError(waitingForValue.name);
        }
        const flag = lastCommand.arguments?.find((arg) =>
          arg.name === lexeme.content
        );
        // Вдруг под флаг попала какая-то лексема
        if (flag === undefined) {
          throw new errors.UnknownFlagError(lexeme.content);
        }
        // parsedArgs[0] - объект с опциями и флагами
        // parsedArgs[1] - исполнимая команда
        parsedArgs[0][flag.name] = true;
        if (flag.required) {
          requiredLeast--;
          requiredArgs = requiredArgs?.filter((arg) =>
            arg.name !== flag.name
          );
        }
      } else if (lexeme.type === LexemeType.MAYBE_VALUE) {
        // Для обязательных аргументов имя опции может быть не указано
        // То есть иф ниже обрабатывает случай, когда не указано имя опции
        // Но мы встретили лексему-значение
        if (waitingForValue !== null) {
          const possibleValue = lexeme.content;
          if (waitingForValue.valueValidator) {
            const isValidValue = waitingForValue.valueValidator(
              possibleValue,
            );
            if (!isValidValue) {
              throw new errors.InvalidValueError(
                possibleValue,
              );
            }
          }
          parsedArgs[0][waitingForValue.name] = possibleValue;

          if (waitingForValue.required) {
            requiredLeast--;
            requiredArgs = requiredArgs?.filter((arg) =>
              arg.name !== (waitingForValue as ICommandArgument).name
            );
          }
          // Только что взяли значение,
          // следующая лексема не обязательно будет значением
          waitingForValue = null;
        } else {
          if (
            //Встретили лексему-значение, но обязательных аргументов не осталось
            // Ошибка, если не указано имя опции
            requiredArgs === undefined ||
            requiredLeast === 0
          ) {
            throw new errors.TooManyArgumentsError(
              requiredArgs?.length || 0,
              args.length,
              lastCommand.name,
            );
          }
          const possibleValue = lexeme.content;
          const validator = requiredArgs[0].valueValidator;
          if (validator) {
            const isValidValue = validator(possibleValue);
            if (!isValidValue) {
              throw new errors.InvalidValueError(
                possibleValue,
              );
            }
          }
          parsedArgs[0][requiredArgs[0].name] = possibleValue;
          requiredLeast--;
        }
      }
    });
    return parsedArgs;
  }

  /**
   * Выполняет команду, представленную в виде строки или шаблонной строки.
   * @param {TemplateStringsArray | string[]} rawSource - исходная строка или шаблонная строка, содержащая команду
   * @returns {void}
   */
  execute(rawSource: TemplateStringsArray | string[]): void {
    // Подготавливаем исходную строку(если это шаблонная строка или массив строк)
    const source = prepareSource(rawSource);
    const [allHandlersReturnedTrue, lexemes] = this.execMiddleware(
      source,
    );
    // Если хоть один из обработчиков  мидлварей вернул false, то команда не выполняется
    if (!allHandlersReturnedTrue) return;
    const [parsedArgs, command] = this.parseArgs(lexemes, source);
    if (command === null) return;
    command.handler(parsedArgs);
  }
}
