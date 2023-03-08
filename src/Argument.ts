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

export class Option<valueType> {
  constructor(
    value: IValue<valueType>,
    name?: string,
    nameRequired?: boolean,
  ) {
    this.name = name || null;
    this.value = value;
    if (nameRequired !== undefined) {
      this.nameRequired = nameRequired;
    }
  }
  name?: string | null = null;

  nameRequired = true;
  value: IValue<valueType> | null = null;
}

export class Flag {
  constructor(name: string) {
    this.name = name;
  }
  name: string;
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
