import { defaultValueType } from '../Argument.ts';

export class NoValidatorError extends Error {
  constructor(type: string) {
    super(`No validator found for type ${type}`);
    this.name = 'NoValidatorError';
  }
}

export class InvalidValueError extends Error {
  constructor(value: string, type: keyof typeof defaultValueType) {
    super(`Invalid value ${value} for type ${type}`);
    this.name = 'InvalidValueError';
  }
}

export class UnknownFlagError extends Error {
  constructor(flag: string) {
    super(`Unknown flag ${flag}`);
    this.name = 'UnknownFlagError';
  }
}
