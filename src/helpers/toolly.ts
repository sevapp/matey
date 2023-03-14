import { ArgumentType } from '../Argument.ts';
import { ICliCommand } from '../CliCommandBuilder.ts';
import { Cli } from '../Tool.ts';
import * as errors from '../errors/mod.ts';

export function addToKnownLexemes(
  command: ICliCommand,
  cli: Cli,
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

export function isChildCommand(
  parentCmd: ICliCommand | null,
  childCmd: ICliCommand | null,
) {
  if (childCmd === null) return false;
  if (parentCmd === null) return true;

  return parentCmd.subcommands.some((key) =>
    key.name === childCmd.name
  );
}

export function prepareSource(
  rawSource: TemplateStringsArray | string[],
): string {
  let source: string;
  if (typeof rawSource === 'string') {
    source = rawSource;
  } else {
    source = rawSource.join(' ');
  }
  const quotesAvoidRegExp = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const matches = source.match(quotesAvoidRegExp);
  if (matches === null) {
    throw new errors.InvalidSourceError();
  }
  return matches.join(' ');
}
