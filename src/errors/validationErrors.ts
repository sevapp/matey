//

export class InvalidValueError extends Error {
  constructor(value: string) {
    super(`Invalid value ${value}`);
    this.name = 'InvalidValueError';
  }
}

export class UnknownFlagError extends Error {
  constructor(flag: string) {
    super(`Unknown flag ${flag}`);
    this.name = 'UnknownFlagError';
  }
}
