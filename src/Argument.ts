import { IValidationFunction } from './mod.ts';

export enum ArgumentType {
  FLAG,
  OPTION,
}

export interface ICommandArgument {
  name: string;
  description: string;
  type: ArgumentType;

  valueValidator?: IValidationFunction;
  optionNameRequired?: boolean;
  required: boolean;
}
