export enum defaultValueType {
  DATA,
  EMAIL,
  NUMBER,
  UUID,
  IP,
  URL,
  PHONE,
  TIME,
  FILENAME,
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
  valueType?: defaultValueType | valueType;
  optionNameRequired?: boolean;
  required: boolean;
}
