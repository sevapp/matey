// import { v1 } from 'https://deno.land/std@0.177.0/uuid/mod.ts';
// const { generate } = v1;
export type handlerArgs = Record<string, string | boolean>;
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

export interface CLICommand {
  name: string;
  description: string;
  arguments: CommandArgument[];
  subcommands: CLICommand[];
  handler: (args: handlerArgs) => void;
}

export class CLICommandBuilder {
  private name = '';
  private description = '';
  private arguments: CommandArgument[] = [];
  private subcommands: CLICommand[] = [];
  private handler?: (args: handlerArgs) => void;

  setName(name: string): CLICommandBuilder {
    this.name = name;
    return this;
  }

  setDescription(description: string): CLICommandBuilder {
    this.description = description;
    return this;
  }

  addArgument(argument: CommandArgument): CLICommandBuilder {
    if (!argument.required && !argument.prefixName) {
      throw new Error(
        'Argument must have prefixName if it is not required',
      );
    }
    this.arguments.push(argument);
    return this;
  }

  addSubcommand(subcommand: CLICommand): CLICommandBuilder {
    this.subcommands.push(subcommand);
    return this;
  }

  setHandler(
    handler: (args: handlerArgs) => void,
  ): CLICommandBuilder {
    this.handler = handler;
    return this;
  }

  build(): CLICommand {
    if (!this.name) {
      throw new Error('Command name is required');
    }

    if (!this.handler) {
      throw new Error('Command handler is required');
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
