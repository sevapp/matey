export class CommandNotOnStartError extends Error {
  constructor() {
    super(`Command must be before arguments.`);
    this.name = 'CommandNotOnStartError';
  }
}

export class NoCommandFoundError extends Error {
  constructor() {
    super(`No commands found.`);
    this.name = 'NoCommandsFoundError';
  }
}

export class NoCommandError extends Error {
  constructor(cmd: string) {
    super(`Command "${cmd}" not found.`);
    this.name = 'NoCommandError';
  }
}

export class InvalidSourceError extends Error {
  constructor() {
    super(`Invalid source.`);
    this.name = 'InvalidSourceError';
  }
}

export class MissingValueError extends Error {
  constructor(optName: string) {
    super(`Option <${optName}> requires a value`);
    this.name = 'MissingValueError';
  }
}

export class UnknownOptionError extends Error {
  constructor(term: string) {
    super(`Unknown option ${term}`);
    this.name = 'UnknownOptionError';
  }
}

export class DuplicateMiddlewareError extends Error {
  constructor(pattern: RegExp) {
    super(`Middleware with pattern "${pattern}" already exists.`);
    this.name = 'DuplicateMiddlewareError';
  }
}

export class TooManyArgumentsError extends Error {
  constructor(required: number, taken: number, cmdName: string) {
    super(
      `Too many arguments for command <${cmdName}>. Expected ${required}, received ${taken}\nCheck optional arguments`,
    );
    this.name = 'TooManyArgumentsError';
  }
}

export class UnknownMainCommandError extends Error {
  constructor(cmdName: string) {
    super(
      `Unknown main command <${cmdName}>. Use "help" to see available commands.`,
    );
    this.name = 'UnknownMainCommandError';
  }
}
