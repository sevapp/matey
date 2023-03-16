import * as errors from '../errors/mod.ts';

/**
 * Форматирует строку или массив строк в строку, разделенную пробелами, игнорируя сплит внутри кавычек.
 * @param rawSource - Строка или массив строк для форматирования.
 * @returns Правильно отформатированную строку.
 * @throws InvalidSourceError, если ввод недопустимый.
 */
export function prepareSource(
  rawSource: TemplateStringsArray | string[],
): string {
  const source = typeof rawSource === 'string'
    ? rawSource
    : rawSource.join(' ');
  const quotesAvoidRegExp = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const matches = source.match(quotesAvoidRegExp);
  if (matches === null) {
    throw new errors.InvalidSourceError();
  }
  return matches.join(' ');
}
