import * as errors from './errors/mod.ts';
import { Cli } from './Tool.ts';
export enum LexemeType {
  COMMAND,
  OPTION,
  FLAG,
  MAYBE_VALUE,
}

interface ILexeme {
  type: LexemeType;
  content: string;
}

function isCommand(term: string, cli: Cli): boolean {
  return cli.knownLexemes.knownCommands.some((key) => key === term);
}

function isOption(term: string, cli: Cli): boolean {
  return cli.knownLexemes.knownOptions.some((key) => key === term);
}

function isFlag(term: string, cli: Cli): boolean {
  return cli.knownLexemes.knownFlags.some((key) => key === term);
}

export function lex(source: string | string[], cli: Cli): ILexeme[] {
  console.log(cli.knownLexemes);
  const lexemes: ILexeme[] = [];
  const quotesAvoidRegExp = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const tokens = Array.isArray(source)
    ? source
    : source.match(quotesAvoidRegExp);
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
