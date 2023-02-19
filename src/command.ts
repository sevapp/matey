export type handlerArgs = Record<string, string>;
export interface CommandArgument {
  name: string;
  description: string;
  required?: boolean;
}

export interface CLICommand {
  name: string;
  description: string;
  arguments: CommandArgument[];
  subcommands: CLICommand[];
  handler: (args: handlerArgs) => void;
}

export class CLICommandBuilder {
  private name: string = '';
  private description: string = '';
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
