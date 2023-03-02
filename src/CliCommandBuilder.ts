import {
  NoCommandHandlerError,
  NoCommandNameError,
  NoCommandPrefixError,
} from './errors/mod.ts';

export type HandlerArgs = Record<string, string | boolean> | null;
export interface ICommandArgument {
  name: string;
  prefixName?: string; // - or --
  type: string;
  description: string;
  required?: boolean;
}

export const DefaultCommandArgument: Pick<
  ICommandArgument,
  'type' | 'required' | 'prefixName'
> = {
  type: 'data',
  required: true,
  prefixName: '',
};

export interface ICliCommand {
  name: string;
  description: string;
  arguments: ICommandArgument[];
  subcommands: ICliCommand[];
  handler: (args: HandlerArgs) => void;
}

export class CliCommandBuilder {
  private name = '';
  private description = '';
  private arguments: ICommandArgument[] = [];
  private subcommands: ICliCommand[] = [];
  private handler?: (args: HandlerArgs) => void;

  setName(name: string): CliCommandBuilder {
    this.name = name;
    return this;
  }

  setDescription(description: string): CliCommandBuilder {
    this.description = description;
    return this;
  }

  addArgument(argument: ICommandArgument): CliCommandBuilder {
    if (!argument.required && !argument.prefixName) {
      throw new NoCommandPrefixError();
    }

    this.arguments.push(argument);
    return this;
  }

  addSubcommand(subcommand: ICliCommand): CliCommandBuilder {
    this.subcommands.push(subcommand);
    return this;
  }

  setHandler(
    handler: (args: HandlerArgs) => void,
  ): CliCommandBuilder {
    this.handler = handler;
    return this;
  }

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
