import { defaultValueType } from './../Argument.ts';
import { ValueExamples } from '../Validator.ts';
import { ICliCommand } from '../CliCommandBuilder.ts';

export class MissingArgumentError<valueType = defaultValueType>
  extends Error {
  constructor(parentCmd: ICliCommand<valueType>) {
    super(
      `Expected ${parentCmd.arguments?.length} arguments <${
        parentCmd.arguments?.map((arg) => arg.name).join(',')
      }>, received nothing.`,
    );
    this.name = 'MissingArgumentError';
  }
}

export class CommandNotOnStartError extends Error {
  constructor() {
    super(`Command must be on the start of the source.`);
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
  constructor(option: { name: string }) {
    super(`Option <${option.name}> requires a value`);
    this.name = 'MissingValueError';
  }
}

export class MissingRequiredArgsError<valueType = defaultValueType>
  extends Error {
  constructor(
    requiredArgs: { name: string }[],
    parentCmd: ICliCommand<valueType>,
    requiredArgsCount: number,
  ) {
    super(
      `Expected ${requiredArgs.length} arguments <${
        requiredArgs.map((arg) => arg.name).join(',')
      }> for command <${parentCmd.name}>, received ${requiredArgsCount} only.`,
    );
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

export class ExtraOptionalArgumentError extends Error {
  constructor(term: string) {
    super(`Unknown optional argument ${term} without prefix`);
    this.name = 'ExtraOptionalArgumentError';
  }
}

export class ExtraArgumentError<valueType = defaultValueType>
  extends Error {
  constructor(parentCmd: ICliCommand<valueType>) {
    super(`Command "${parentCmd.name}" does not accept arguments.`);
    this.name = 'ExtraArgumentError';
  }
}

export class ArgumentValidError extends Error {
  constructor(
    value: string,
    option: { name: string; type: string },
    validResult?: ValueExamples | null,
  ) {
    super(
      `Invalid value "${value}" for option <${option.name}>.\nOption value type must be: ${option.type}\nExmaples: ${
        validResult ? validResult : 'No infomatoin about valid values'
      }`,
    );
    this.name = 'ArgumentValidError';
  }
}
