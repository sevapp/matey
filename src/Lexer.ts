import * as errors from './errors/mod.ts';
import { Cli } from './mod.ts';
export enum LexemeType {
  COMMAND,
  OPTION,
  FLAG,
  MAYBE_VALUE,
}

export interface ILexeme {
  type: LexemeType;
  content: string;
}

function isCommand(
  term: string,
  cli: Cli,
): boolean {
  return cli.knownLexemes.knownCommands.some((key) => key === term);
}

function isOption(
  term: string,
  cli: Cli,
): boolean {
  return cli.knownLexemes.knownOptions.some((key) => key === term);
}

function isFlag(
  term: string,
  cli: Cli,
): boolean {
  return cli.knownLexemes.knownFlags.some((key) => key === term);
}

export function quoteAvoidSplit(source: string): string[] {
  const quotesAvoidRegExp = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const matches = source.match(quotesAvoidRegExp);
  if (matches === null) {
    throw new errors.InvalidSourceError();
  }
  return matches;
}

export function lex(
  source: string,
  cli: Cli,
): ILexeme[] {
  const lexemes: ILexeme[] = [];
  const tokens = quoteAvoidSplit(source);

  if (tokens === null) {
    throw new errors.InvalidSourceError();
  }
  for (const token of tokens) {
    if (isCommand(token, cli)) {
      lexemes.push({ type: LexemeType.COMMAND, content: token });
    } else if (isOption(token, cli)) {
      lexemes.push({ type: LexemeType.OPTION, content: token });
    } else if (isFlag(token, cli)) {
      lexemes.push({ type: LexemeType.FLAG, content: token });
    } else {
      lexemes.push({ type: LexemeType.MAYBE_VALUE, content: token });
    }
  }
  return lexemes;
}
