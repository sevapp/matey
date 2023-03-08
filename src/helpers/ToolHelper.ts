import { ArgumentType } from '../Argument.ts';
import { ICliCommand } from '../CliCommandBuilder.ts';
import { Cli } from '../Tool.ts';

export function addToKnownLexemes<valueType>(
  command: ICliCommand<valueType>,
  cli: Cli<valueType>,
): void {
  cli.knownLexemes.knownCommands.push(command.name);
  command.arguments?.forEach((arg) => {
    if (arg.type === ArgumentType.OPTION) {
      cli.knownLexemes.knownOptions.push(arg.name);
    } else if (arg.type === ArgumentType.FLAG) {
      cli.knownLexemes.knownFlags.push(arg.name);
    }
  });
  command.subcommands?.forEach((subcommand) => {
    addToKnownLexemes(subcommand, cli);
  });
}

export function isChildCommand<valueType>(
  parentCmd: ICliCommand<valueType> | null,
  childCmd: ICliCommand<valueType> | null,
) {
  if (childCmd === null) return false;
  if (parentCmd === null) return true;

  return parentCmd.subcommands.some((key) =>
    key.name === childCmd.name
  );
}
