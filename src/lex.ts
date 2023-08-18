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
/**
 * Проверяет, является ли лексема командой
 * @param term - лексема
 * @param cli - экземпляр класса Cli
 * @returns {boolean} - true, если лексема является командой
 */
function isCommand(
  term: string,
  cli: Cli,
): boolean {
  return cli.knownLexemes.knownCommands.some((key) => key === term);
}

/**
 * Проверяет, является ли лексема опцией
 * @param term - лексема
 * @param cli - экземпляр класса Cli
 * @returns {boolean} - true, если лексема является опцией
 */
function isOption(
  term: string,
  cli: Cli,
): boolean {
  return cli.knownLexemes.knownOptions.some((key) => key === term);
}

/**
 * Проверяет, является ли лексема флагом
 * @param term - лексема
 * @param cli - экземпляр класса Cli
 * @returns {boolean} - true, если лексема является флагом
 */
function isFlag(
  term: string,
  cli: Cli,
): boolean {
  return cli.knownLexemes.knownFlags.some((key) => key === term);
}

/**
 * Разбивает строку на токены, учитывая кавычки
 * @param source - исходная строка
 * @returns {string[]} - массив токенов
 * @throws {InvalidSourceError} - если исходная строка не может быть корректно разобрана
 */
export function quoteAvoidSplit(source: string): string[] {
  const quotesAvoidRegExp = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  if (!(source.includes('"') || source.includes('\''))) {
    return source.split(' ');
  }
  const matches = source.match(quotesAvoidRegExp);
  if (matches === null) {
    throw new errors.InvalidSourceError();
  }
  return matches;
}

/**
 * Разбивает исходную строку на лексемы
 * @param source - исходная строка
 * @param cli - экземпляр класса Cli
 * @returns {ILexeme[]} - массив лексем
 * @throws {InvalidSourceError} - если исходная строка не может быть корректно разобрана
 */
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
