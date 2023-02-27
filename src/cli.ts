import { Validator } from '../helpers/validator.ts';
import {
  CLICommand,
  CLICommandBuilder,
  CommandArgument,
  handlerArgs,
} from './command.ts';
import { CMDService } from './commandService.ts';
import * as Errors from './errors.ts';

export class CLI {
  constructor(validator: Validator) {
    this.validator = validator;
    this.cmdService = new CMDService();
    this.cmdService.addSpecCommand(
      'help',
      (specCmd: string, argCmd: CLICommand) => {
        console.log(`${specCmd}`);
        console.log(`${argCmd.name} - ${argCmd.description}`);
      },
    );
  }
  private validator: Validator;
  public cmdService: CMDService;

  private commands: CLICommand[] = [];

  public setValidator(validator: Validator) {
    this.validator = validator;
  }

  public addCommand(command: CLICommand) {
    if (this.commands.some((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }

    this.commands.push(command);
  }

  /**
   * Parse array of arguments and return object with parsed arguments
   * @param {string[]} args
   * @param {CLICommand | null} parentCmd
   * @returns {handlerArgs} Object with parsed arguments
   * or throw error if command not found or arguments are invalid
   */
  public parse(
    args: string[],
    parentCmd: CLICommand | null = null,
  ): handlerArgs {
    const specCmd = args.find((term) => {
      return this.cmdService.checkSpecCommand(term);
    });
    args = specCmd
      ? args.filter((term) => {
        term !== specCmd;
      })
      : args;
    if (!parentCmd) {
      const [cmd, ...rest] = args;
      const command = this.commands.find((key) => key.name === cmd);
      if (!command) {
        throw new Errors.NoCommandError(cmd);
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

        if (specCmd) {
          this.cmdService.handleSpecCommand(specCmd, parentCmd);
          return {};
        }
        if (
          allRest.length < parentCmd.arguments.filter((arg) => {
            return arg.required;
          }).length
        ) {
          throw new Errors.MissingArgumentError(parentCmd);
        }
        if (parentCmd.arguments?.length) {
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
                      const validResult = this.validator.getExamples(
                        option.type,
                      );
                      throw new Errors.ArgumentValidError(
                        value,
                        option,
                        validResult,
                      );
                    }
                    parsedArgs[option.name] = value;
                    index += 2;
                  } else {
                    throw new Errors.MissingValueError(option);
                  }
                }
              } else {
                throw new Errors.UnknownOptionError(term);
              }
            } else {
              if (requiredArgsCount === requiredArgs.length) {
                throw new Errors.ExtraOptionalArgumentError(term);
              }
              const isValid = this.validator.validate(
                requiredArgs[requiredArgsCount].type,
                term,
              );
              if (!isValid) {
                const validResult = this.validator.getExamples(
                  requiredArgs[requiredArgsCount].type,
                );
                throw new Errors.ArgumentValidError(
                  term,
                  requiredArgs[requiredArgsCount],
                  validResult,
                );
              }
              parsedArgs[requiredArgs[requiredArgsCount].name] = term;
              index++;
              requiredArgsCount++;
            }
          }
          if (requiredArgsCount < requiredArgs.length) {
            throw new Errors.MissingRequiedArgsError(
              requiredArgs,
              parentCmd,
              requiredArgsCount,
            );
          }
          return parsedArgs;
        }
        if (rest.length > 0) {
          throw new Errors.ExtraArgumentError(
            parentCmd,
          );
        }
        return {};
      }
    }
  }
}
