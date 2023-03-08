import {
  ArgumentType,
  defaultValueType,
  ICommandArgument,
} from './Argument.ts';
import {
  InvalidOptionCreateError,
  NoCommandHandlerError,
  NoCommandNameError,
} from './errors/mod.ts';

export type HandlerArgs = Record<string, string | boolean> | null;

export interface ICliCommand<valueType> {
  name: string;
  description?: string;
  arguments?: ICommandArgument<valueType>[];
  subcommands: ICliCommand<valueType>[];
  handler: (args: HandlerArgs) => void;
}

export class CliCommandBuilder<valueType = defaultValueType> {
  private name = '';
  private description = '';
  private arguments: ICommandArgument<valueType>[] = [];
  private subcommands: ICliCommand<valueType>[] = [];
  private handler?: (args: HandlerArgs) => void;

  setName(name: string): CliCommandBuilder<valueType> {
    this.name = name;
    return this;
  }

  setDescription(description: string): CliCommandBuilder<valueType> {
    this.description = description;
    return this;
  }

  addArgument(
    argument: ICommandArgument<valueType>,
  ): CliCommandBuilder<valueType> {
    if (
      !argument.required && (argument.type === ArgumentType.OPTION) &&
      !argument.optionNameRequired
    ) {
      throw new InvalidOptionCreateError();
    }
    this.arguments.push(argument);
    return this;
  }

  addSubcommand(
    subcommand: ICliCommand<valueType>,
  ): CliCommandBuilder<valueType> {
    this.subcommands.push(subcommand);
    return this;
  }

  setHandler(
    handler: (args: HandlerArgs) => void,
  ): CliCommandBuilder<valueType> {
    this.handler = handler;
    return this;
  }

  build(): ICliCommand<valueType> {
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
