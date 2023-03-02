import { valueExamples } from '../helpers/validator.ts';
import { CLICommand } from '../src/command.ts';

export class MissingArgumentError extends Error {
  constructor(parentCmd: CLICommand) {
    super(
      `Expected ${parentCmd.arguments.length} arguments <${
        parentCmd.arguments.map((arg) => arg.name).join(',')
      }>, received nothing.`,
    );
    this.name = 'MissingArgumentError';
  }
}

export class NoCommandError extends Error {
  constructor(cmd: string) {
    super(`Command "${cmd}" not found.`);
    this.name = 'NoCommandError';
  }
}

export class EmptySourceError extends Error {
  constructor() {
    super(`Empty source.`);
    this.name = 'NoCommandError';
  }
}

export class MissingValueError extends Error {
  constructor(option: { name: string }) {
    super(`Option <${option.name}> requires a value`);
    this.name = 'MissingValueError';
  }
}

export class MissingRequiredArgsError extends Error {
  constructor(
    requiredArgs: { name: string }[],
    parentCmd: CLICommand,
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

export class ExtraOptionalArgumentError extends Error {
  constructor(term: string) {
    super(`Unknown optional argument ${term} without prefix`);
    this.name = 'ExtraOptionalArgumentError';
  }
}

export class ExtraArgumentError extends Error {
  constructor(parentCmd: CLICommand) {
    super(`Command "${parentCmd.name}" does not accept arguments.`);
    this.name = 'ExtraArgumentError';
  }
}

export class ArgumentValidError extends Error {
  constructor(
    value: string,
    option: { name: string; type: string },
    validResult?: valueExamples | null,
  ) {
    super(
      `Invalid value "${value}" for option <${option.name}>.\nOption value type must be: ${option.type}\nExmaples: ${
        validResult ? validResult : 'No infomatoin about valid values'
      }`,
    );
    this.name = 'ArgumentValidError';
  }
}
