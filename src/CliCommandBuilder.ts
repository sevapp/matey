import { ArgumentType, ICommandArgument } from './Argument.ts';
import {
  InvalidOptionCreateError,
  NoCommandHandlerError,
  NoCommandNameError,
} from './errors/mod.ts';

export type parsedArgs = [{
  [key: string]: string | boolean;
}, ICliCommand | null];

export type HandlerArgs = {
  [key: string]: string | boolean;
};

export interface ICliCommand {
  name: string;
  description?: string;
  arguments?: ICommandArgument[];
  subcommands: ICliCommand[];
  handler: (args: HandlerArgs) => void;
}

export class CliCommandBuilder {
  private name = '';
  private description = '';
  private arguments: ICommandArgument[] = [];
  private subcommands: ICliCommand[] = [];
  private handler?: (args: HandlerArgs) => void;

  /**
   * Устанавливает имя команды.
   * @method
   * @param {string} name - Имя команды.
   * @returns {CliCommandBuilder} - Возвращает экземпляр класса CliCommandBuilder.
   */
  setName(name: string): CliCommandBuilder {
    this.name = name;
    return this;
  }

  /**
   * Устанавливает описание команды.
   * @method
   * @param {string} description - Описание команды.
   * @returns {CliCommandBuilder} - Возвращает экземпляр класса CliCommandBuilder.
   */
  setDescription(description: string): CliCommandBuilder {
    this.description = description;
    return this;
  }

  /**
  Добавляет аргумент в список аргументов команды.
  *@method
  *@param {ICommandArgument} argument - Аргумент команды.
  *@returns {CliCommandBuilder} - Возвращает экземпляр класса CliCommandBuilder.
  *@throws {InvalidOptionCreateError} - Ошибка, возникающая, если создается некорректный опционный аргумент.
  */
  addArgument(
    argument: ICommandArgument,
  ): CliCommandBuilder {
    if (
      !argument.required && (argument.type === ArgumentType.OPTION) &&
      !argument.optionNameRequired
    ) {
      throw new InvalidOptionCreateError();
    }
    this.arguments.push(argument);
    return this;
  }

  /**
   * Добавляет подкоманду для текущей команды.
   * @param {ICliCommand} subcommand - объект, представляющий подкоманду
   * @returns {CliCommandBuilder} - текущий экземпляр объекта CliCommandBuilder
   */
  addSubcommand(
    subcommand: ICliCommand,
  ): CliCommandBuilder {
    this.subcommands.push(subcommand);
    return this;
  }

  /**
   * Задает обработчик команды.
   * @param {(args: HandlerArgs) => void} handler - функция, которая будет вызвана при обработке команды
   * @returns {CliCommandBuilder} - текущий экземпляр объекта CliCommandBuilder
   */
  setHandler(
    handler: (args: HandlerArgs) => void,
  ): CliCommandBuilder {
    this.handler = handler;
    return this;
  }

  /**
   * Собирает объект ICliCommand на основе данных, заданных с помощью методов класса CliCommandBuilder.
   * Генерирует исключение, если не задано имя команды или обработчик команды.
   * @returns {ICliCommand} - объект, представляющий команду с заданными свойствами
   * @throws {NoCommandNameError} - если не задано имя команды
   * @throws {NoCommandHandlerError} - если не задан обработчик команды
   */
  build(): ICliCommand {
    if (!this.name) {
      throw new NoCommandNameError();
    }

    if (!this.handler) {
      throw new NoCommandHandlerError(this.name);
    }

    return {
      name: this.name,
      description: this.description,
      arguments: this.arguments,
      subcommands: this.subcommands,
      handler: this.handler,
    };
  }
}
