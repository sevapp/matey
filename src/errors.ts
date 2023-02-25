export class MissingArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingArgumentError';
  }
}

export class NoCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoCommandError';
  }
}

export class MissingValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingValueError';
  }
}

export class UnknownOptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownOptionError';
  }
}

export class ExtraArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtraArgumentError';
  }
}

export class ArgumentValidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArgumentValidError';
  }
}
