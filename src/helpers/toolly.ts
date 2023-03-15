import { ArgumentType } from '../Argument.ts';
import { ICliCommand } from '../CliCommandBuilder.ts';
import { Cli } from '../Tool.ts';
import * as errors from '../errors/mod.ts';

/**
 * Добавляет имя команды, опции и флаги в свойство knownLexemes экземпляра Cli.
 * @param command - Команда, лексемы которой будут добавлены в Cli.knownLexemes.
 * @param cli - Экземпляр Cli, в который будут добавлены лексемы команды.
 * @returns void.
 */
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

/**
 * Проверяет, является ли команда дочерней для другой команды.
 * @param parentCmd - Потенциальная родительская команда.
 * @param childCmd - Потенциальная дочерняя команда.
 * @returns Булево значение, указывающее, является ли дочерняя команда подкомандой родительской команды.
 */
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

/**
 * Форматирует строку или массив строк в строку, разделенную пробелами с правильной обработкой кавычек.
 * @param rawSource - Строка или массив строк для форматирования.
 * @returns Правильно отформатированную строку.
 * @throws InvalidSourceError, если ввод недопустимый.
 */
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
