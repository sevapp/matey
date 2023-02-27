import { CLICommand } from './command.ts';

type specCommandHandler = (
  specCmd: string,
  argCmd: CLICommand,
  option?: 'description' | 'arguments' | 'subcommands' | 'all',
) => void;

export class ExtraArgumentError extends Error {
  constructor(parentCmd: CLICommand) {
    super(`Command "${parentCmd.name}" does not accept arguments.`);
    this.name = 'ExtraArgumentError';
  }
}
export class CMDService {
  private specCommands: { [key: string]: specCommandHandler } = {};
  public addSpecCommand(name: string, handler: specCommandHandler) {
    this.specCommands[name] = handler;
  }

  public handleSpecCommand(
    specCmdName: string,
    argCmd: CLICommand,
    option?: 'description' | 'arguments' | 'subcommands' | 'all',
  ) {
    if (specCmdName in this.specCommands) {
      this.specCommands[specCmdName](specCmdName, argCmd, option);
    } else {
      throw new Error(`Spec command "${specCmdName}" not found.`);
    }
  }
  public checkSpecCommand(specCmdName: string) {
    return specCmdName in this.specCommands;
  }
}
