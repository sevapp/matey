import {
  CLICommand,
  CLICommandBuilder,
  CommandArgument,
  handlerArgs,
} from './command.ts';

export class CLI {
  private commands: CLICommand[] = [];

  public addCommand(command: CLICommand) {
    if (this.commands.find((cmd) => cmd.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }
    this.commands.push(command);
  }

  public parse(args: string[]): any {
    const [commandName, ...commandArgs] = args;

    const command = this.commands.find((cmd) =>
      cmd.name === commandName
    );

    if (!command) {
      console.error(`Command "${commandName}" not found.`);
      this.printHelp();
      Deno.exit(1);
    }

    if (command.subcommands.length > 0) {
      const [subcommandName, ...subcommandArgs] = commandArgs;

      const subcommand = command.subcommands.find((cmd) =>
        cmd.name === subcommandName
      );

      if (!subcommand) {
        console.error(
          `Subcommand "${subcommandName}" not found for command "${commandName}".`,
        );
        this.printHelp(command);
        Deno.exit(1);
      }
      return this.parse(commandArgs);
    }

    const parsedArgs = this.parseArgs(commandArgs, command);

    command.handler(parsedArgs);
  }

  private parseArgs(args: string[], command: CLICommand) {
    const parsedArgs: handlerArgs = {};

    const expectedArgs = command.arguments.filter((
      arg: CommandArgument,
    ) => arg.required);
    if (args.length < expectedArgs.length) {
      console.error(
        `Expected ${expectedArgs.length} arguments but received ${args.length}.`,
      );
      this.printHelp(command);
      Deno.exit(1);
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const argument = command.arguments[i];
      parsedArgs[argument.name] = arg;
    }

    return parsedArgs;
  }

  private printHelp(command?: CLICommand) {
    if (command) {
      console.log(command.description);

      if (command.arguments.length > 0) {
        console.log('Arguments:');
        for (const arg of command.arguments) {
          console.log(`  ${arg.name}: ${arg.description}`);
        }
      }

      if (command.subcommands.length > 0) {
        console.log('Subcommands:');
        for (const subcommand of command.subcommands) {
          console.log(
            `  ${subcommand.name}: ${subcommand.description}`,
          );
        }
      }
    } else {
      console.log('Usage:');
      console.log('<command> [arguments]');

      console.log('\nAvailable commands:');
      for (const command of this.commands) {
        console.log(`  ${command.name}: ${command.description}`);
      }
    }
  }
}
