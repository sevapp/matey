import { Validator } from '../helpers/validator.ts';
import {
  CLICommand,
  CLICommandBuilder,
  CommandArgument,
  handlerArgs,
} from './command.ts';
import * as Errors from './errors.ts';

export class CLI {
  constructor(validator: Validator) {
    this.validator = validator;
  }
  private validator: Validator;

  private commands: CLICommand[] = [];

  public setValidator(validator: Validator) {
    this.validator = validator;
  }

  public addCommand(command: CLICommand) {
    if (this.commands.find((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }

    this.commands.push(command);
  }

  public parse(
    args: string[],
    parentCmd: CLICommand | null = null,
  ): handlerArgs {
    if (!parentCmd) {
      const [cmd, ...rest] = args;
      const command = this.commands.find((key) => key.name === cmd);
      if (!command) {
        throw new Errors.NoCommandError(
          `Command "${cmd}" not found.`,
        );
      }
      return this.parse(rest, command);
    } else {
      const [subCmd, ...rest] = args;
      const subcommand = parentCmd.subcommands.find(
        (key) => key.name === subCmd,
      );
      if (subcommand) {
        return this.parse(rest, subcommand);
      } else {
        const allRest = [subCmd, ...rest];
        if (
          allRest.length < parentCmd.arguments.filter((arg) => {
            return arg.required;
          }).length
        ) {
          throw new Errors.MissingArgumentError(
            `Expected ${parentCmd.arguments.length} arguments <${
              parentCmd.arguments.map((arg) => arg.name).join(',')
            }>, received nothing.`,
          );
        }
        if (parentCmd.arguments && parentCmd.arguments.length > 0) {
          const parsedArgs: handlerArgs = {};
          const requiredArgs = parentCmd.arguments.filter((arg) =>
            arg.required
          );
          let index = 0;
          let requiredArgsCount = 0;
          while (index < allRest.length) {
            const term = allRest[index];
            const isTermOption = term.startsWith('--') ||
              term.startsWith('-');
            if (isTermOption) {
              const option = parentCmd.arguments.find((arg) =>
                arg.prefixName === term
              );
              if (option) {
                if (option.type === 'flag') {
                  parsedArgs[option.name] = true;
                  index++;
                } else {
                  if (option.required) requiredArgsCount++;
                  const value = allRest[index + 1];
                  if (value) {
                    const isValid = this.validator.validate(
                      option.type,
                      value,
                    );
                    if (!isValid) {
                      throw new Errors.ArgumentValidError(
                        `Invalid value ${value} for option ${term}`,
                      );
                    }
                    parsedArgs[option.name] = value;
                    index += 2;
                  } else {
                    throw new Errors.MissingValueError(
                      `Option ${option.name} requires a value`,
                    );
                  }
                }
              } else {
                throw new Errors.UnknownOptionError(
                  `Unknown option ${term}`,
                );
              }
            } else {
              if (requiredArgsCount === requiredArgs.length) {
                throw new Errors.ExtraArgumentError(
                  `Unknown optional argument ${term} without prefix`,
                );
              }
              const isValid = this.validator.validate(
                requiredArgs[requiredArgsCount].type,
                term,
              );
              if (!isValid) {
                throw new Errors.ArgumentValidError(
                  `Invalid value ${term} for option ${
                    requiredArgs[requiredArgsCount].name
                  }`,
                );
              }
              parsedArgs[requiredArgs[requiredArgsCount].name] = term;
              index++;
              requiredArgsCount++;
            }
          }
          if (requiredArgsCount < requiredArgs.length) {
            throw new Errors.MissingArgumentError(
              `Expected ${requiredArgs.length} arguments <${
                parentCmd.arguments.map((arg) => arg.name).join(',')
              }>, received ${requiredArgsCount} only.`,
            );
          }
          return parsedArgs;
        }
        if (rest.length > 0) {
          throw new Errors.ExtraArgumentError(
            `Command "${parentCmd.name}" does not accept arguments.`,
          );
        }
        return {};
      }
    }
  }
}