/**
 * FLAG - Флаг, указывающий на то, что аргумент команды является флагом.
 * Флаг - это аргумент команды, который не имеет значения.
 * OPTION - Флаг, указывающий на то, что аргумент команды является опцией.
 * Опция - это аргумент команды, который имеет значение.
 * @enum {number} ArgumentType
 */
export enum ArgumentType {
  FLAG,
  OPTION,
}

type ValidationFunction = (value: string) => boolean;

/**
 * Интерфейс описывает аргументы команды.
 * @interface ICommandArgument
 * @property {string} name - Название аргумента команды.
 * @property {string} description - Описание аргумента команды.
 * @property {ArgumentType} type - Тип аргумента команды.
 * @property {IValidationFunction} [valueValidator] - Функция для валидации значения аргумента команды.
 * @property {boolean} [optionNameRequired] - Флаг, указывающий на необходимость имени опции при наличии аргумента команды с типом Option.
 * @property {boolean} required - Флаг, указывающий на обязательность наличия аргумента команды.
 */
export interface ICommandArgument {
  name: string;
  description: string;
  type: ArgumentType;

  valueValidator?: ValidationFunction;
  optionNameRequired?: boolean;
  required: boolean;
}
