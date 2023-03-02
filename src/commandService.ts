import { ICliCommand } from './command.ts';

type SpecCommandHandler = (
  specCmd: string,
  argCmd: ICliCommand,
  option?: 'description' | 'arguments' | 'subcommands' | 'all',
) => void;

export class CmdService {
  private specCommands: { [key: string]: SpecCommandHandler } = {};
  public addSpecCommand(name: string, handler: SpecCommandHandler) {
    this.specCommands[name] = handler;
  }

  public handleSpecCommand(
    specCmdName: string,
    argCmd: ICliCommand,
    option?: 'description' | 'arguments' | 'subcommands' | 'all',
  ) {
    if (!(specCmdName in this.specCommands)) {
      throw new Error(`Spec command "${specCmdName}" not found.`);
    }

    this.specCommands[specCmdName](specCmdName, argCmd, option);
  }

  public checkSpecCommand(specCmdName: string) {
    return specCmdName in this.specCommands;
  }
}

const defaultCmdervice = new CmdService();
defaultCmdervice.addSpecCommand(
  'help',
  (_specCmd: string, argCmd: ICliCommand) => {
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

export default defaultCmdervice;
