import {
  addToKnownLexemes,
  HandlerArgs,
  ICliCommand,
  ICommandArgument,
  ILexeme,
  isChildCommand,
  lex,
  LexemeType,
  parsedArgs,
  prepareSource,
  quoteAvoidSplit,
} from './mod.ts';
import * as errors from './errors/mod.ts';

export interface IMiddleware {
  pattern: RegExp;
  handler: (
    lexemes: ILexeme[],
  ) => boolean;
}

interface IKnownLexemes {
  knownCommands: string[];
  knownOptions: string[];
  knownFlags: string[];
}

export class Cli {
  private middlewares: IMiddleware[] = [];

  public knownLexemes: IKnownLexemes = {
    knownCommands: [],
    knownOptions: [],
    knownFlags: [],
  };
  public commands: ICliCommand[] = [];
  public subcommands: ICliCommand[] = [];

  public addCommand(command: ICliCommand) {
    if (this.commands.some((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }
    addToKnownLexemes(command, this);
    command.subcommands?.forEach((subcommand) => {
      this.subcommands.push(subcommand);
    });
    this.commands.push(command);
  }

  public use(middleware: IMiddleware): void {
    const alreadyExists = this.middlewares.some((key) => {
      key.pattern === middleware.pattern;
    });

    if (alreadyExists) {
      throw new errors.DuplicateMiddlewareError(middleware.pattern);
    }
    this.middlewares.push(middleware);
  }

  getValidCommandChain(lexemes: ILexeme[]): ICliCommand[] {
    const commandTree: (ICliCommand | null)[] = [null];
    const commands = lexemes.map((lexeme) =>
      lexeme.type === LexemeType.COMMAND
        ? this.commands.concat(this.subcommands).find(
          (key) => key.name === lexeme.content,
        )
        : null
    ).filter((value) => value !== null) as ICliCommand[];
    if (commands.length === 0) throw new errors.NoCommandFoundError();
    commands.forEach((command) => {
      if (
        isChildCommand(
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

  runMiddlewares(source: string): [boolean, ILexeme[]] {
    const lexemes = lex(source, this);
    let allHandlersReturnedTrue = true;
    for (let i = 0; i < this.middlewares.length; i++) {
      const middleware = this.middlewares[i];
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

  parseArgs(lexemes: ILexeme[], source: string): parsedArgs {
    const commandChain = this.getValidCommandChain(lexemes);
    if (
      !this.commands.includes(commandChain[0])
    ) {
      throw new errors.UnknownMainCommandError(commandChain[0].name);
    }
    const lastCommand = commandChain[commandChain.length - 1];
    const commandChainNames = commandChain.map((command) =>
      command.name
    );
    const commandsOnStart = source.startsWith(
      commandChainNames.join(' '),
    );
    if (!commandsOnStart) {
      throw new errors.CommandNotOnStartError();
    }
    const args = quoteAvoidSplit(
      source.replace(commandChainNames.join(' '), ''),
    );
    const lexemeArgs = lexemes.filter((lexeme) => {
      return lexeme.type !== LexemeType.COMMAND;
    });
    const parsedArgs: parsedArgs = [{}, null];
    const requiredArgs = lastCommand.arguments?.filter((arg) =>
      arg.required
    );
    let requiredArgsGrabbed = 0;
    let waitingForValue: ICommandArgument | null = null;
    lexemes.forEach((lexeme, index) => {
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
        waitingForValue = option;
      } else if (lexeme.type === LexemeType.FLAG) {
        if (waitingForValue !== null) {
          throw new errors.MissingValueError(waitingForValue.name);
        }
        const flag = lastCommand.arguments?.find((arg) =>
          arg.name === lexeme.content
        );
        if (flag === undefined) {
          throw new errors.UnknownFlagError(lexeme.content);
        }
        parsedArgs[0][flag.name] = true;
        flag.required && requiredArgsGrabbed++;
      } else if (lexeme.type === LexemeType.MAYBE_VALUE) {
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
          waitingForValue.required && requiredArgsGrabbed++;
          waitingForValue = null;
        } else {
          if (
            requiredArgs === undefined ||
            requiredArgsGrabbed >= requiredArgs.length
          ) {
            throw new errors.TooManyArgumentsError(
              requiredArgs?.length || 0,
              args.length,
              lastCommand.name,
            );
          }
          const possibleValue = lexeme.content;
          const validator =
            requiredArgs[requiredArgsGrabbed].valueValidator;
          if (validator) {
            const isValidValue = validator(possibleValue);
            if (!isValidValue) {
              throw new errors.InvalidValueError(
                possibleValue,
              );
            }
          }
          parsedArgs[0][requiredArgs[requiredArgsGrabbed].name] =
            possibleValue;
          requiredArgsGrabbed++;
        }
      }
    });
    return parsedArgs;
  }

  execute(rawSource: TemplateStringsArray | string[]): void {
    const source = prepareSource(rawSource);
    const [allHandlersReturnedTrue, lexemes] = this.runMiddlewares(
      source,
    );
    if (!allHandlersReturnedTrue) return;
    const [parsedArgs, command] = this.parseArgs(lexemes, source);
    if (command === null) return;
    command.handler(parsedArgs);
  }
}
