import { CLICommand } from './command.ts';

type specCommandHandler = (
  specCmd: string,
  argCmd: CLICommand,
  option?: 'description' | 'arguments' | 'subcommands' | 'all',
) => void;

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

const defaultCMDService = new CMDService();
defaultCMDService.addSpecCommand(
  'help',
  (_specCmd: string, argCmd: CLICommand) => {
    console.log(
      `Command: ${argCmd.name}\nDescription: ${argCmd.description}\nArguments: ${
        argCmd.arguments
          .map((arg) => arg.name)
          .join(', ') || 'No arguments'
      }\nSubcommands: ${
        argCmd.subcommands.map((sub) => sub.name).join(', ') ||
        'No subcommands'
      }`,
    );
  },
);

export default defaultCMDService;
