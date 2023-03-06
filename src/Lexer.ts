import { Option } from "./Argument.ts";

import * as errors from './errors/mod.ts';

enum LexemeType {
  COMMAND,
  OPTION,
  FLAG,
  VALUE,
  UNKNOWN,
}

interface ILexeme {
  type: LexemeType;
  value: string;
}


function isCommand(term: string, cli: Cli): boolean {
  return cli.knownLexemes.knownCommands.some((key) => key === term);
}

function isOption(term: string, cli: Cli): boolean {
  return cli.commands.some((key) => {
    if(!key.arguments) return false;
    return key.arguments.some((option) => option.name === term);
  });

// Лучше в самой cli хранить все опции, флаги и команды в одном массиве, а не разбивать на 3
function isFlag(term: string, cli: Cli): boolean {
  return cli.commands.some((key) => {
    if(!key.arguments) return false;
    return key.arguments.some((arg) => {
      if(arg.type instanceof Option) {
        return (arg.type as Option).flags.some((flag) => flag === term);
      }
      return false;
    });
  });
}


export function lex(source: string | string[], cli: Cli): ILexeme[] {
  const lexemes: ILexeme[] = [];
  const quotesAvoidRegExp = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const tokens = Array.isArray(source)
    ? source
    : source.match(quotesAvoidRegExp);
  if (tokens === null) {
    throw new errors.InvalidSourceError();
  }
  for (const token of tokens) {
    const isCmd = isCommand(token, cli);
    const isOpt = isOption(token, cli);
    const isFlg = isFlag(token, cli);
  }
}
