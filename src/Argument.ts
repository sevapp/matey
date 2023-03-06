export enum ValueType {
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

export class Option {
  constructor(value: IValue, name?: string, nameRequired?: boolean) {
    this.name = name || null;
    this.value = value;
    if (nameRequired !== undefined) {
      this.nameRequired = nameRequired;
    }
  }
  name?: string | null = null;

  nameRequired = true;
  value: IValue | null = null;
}

export class Flag {
  constructor(name: string) {
    this.name = name;
  }
  name: string;
}

export interface IValue {
  data: string | null;
  type: ValueType;
}

export interface ICommandArgument {
  name: string;
  type: ArgumentType;
  optionNameRequired?: boolean;
  description: string;
  required: boolean;
}
