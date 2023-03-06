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

export class Option {
  name: string | null = null;
  value: IValue = {} as IValue;
}

export class Flag {
  name: string | null = null;
}

export interface IValue {
  data: string | null;
  type: ValueType;
}

export interface ICommandArgument {
  name: string;
  //   prefixName?: string; // - or --
  type: Flag | Option;
  description: string;
  required: boolean;
}
