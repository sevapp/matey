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

export type IFlag = string | null;

export interface IValue {
  data: string | null;
  type: ValueType;
}

export interface ICommandArgument {
  name: string;
  //   prefixName?: string; // - or --
  type: IFlag | Option;
  description: string;
  required: boolean;
}
