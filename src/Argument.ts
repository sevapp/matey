export enum defaultValueType {
  DATA = 'DATA',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER',
  UUID = 'UUID',
  IP = 'IP',
  URL = 'URL',
  PHONE = 'PHONE',
  TIME = 'TIME',
  FILENAME = 'FILENAME',
}

export enum ArgumentType {
  FLAG,
  OPTION,
}

export interface IValue<valueType> {
  data: string | null;
  type: valueType;
}

export interface ICommandArgument<valueType> {
  name: string;
  description: string;
  type: ArgumentType;
  valueType?: defaultValueType | valueType[keyof valueType];
  optionNameRequired?: boolean;
  required: boolean;
}
