import {
  NoCommandHandler,
  NoCommandName,
  NoCommandPrefix,
} from './errors/cmdErrors.ts';

export type HandlerArgs = Record<string, string | boolean> | null;
export interface CommandArgument {
  name: string;
  prefixName?: string; // - or --
  type: string;
  description: string;
  required?: boolean;
}

export const DefaultCommandArgument: Pick<
  CommandArgument,
  'type' | 'required' | 'prefixName'
> = {
  type: 'data',
  required: true,
  prefixName: '',
};

export interface ICliCommand {
  name: string;
  description: string;
  arguments: CommandArgument[];
  subcommands: ICliCommand[];
  handler: (args: HandlerArgs) => void;
}

export class CliCommandBuilder {
  private name = '';
  private description = '';
  private arguments: CommandArgument[] = [];
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

  addArgument(argument: CommandArgument): CliCommandBuilder {
    if (!argument.required && !argument.prefixName) {
      throw new NoCommandPrefix();
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
      throw new NoCommandName();
    }

    if (!this.handler) {
      throw new NoCommandHandler(this.name);
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
