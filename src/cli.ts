import { Validator } from './helpers/Validator.ts';
import { CLICommand, HandlerArgs } from './command.ts';
import defaultCMDService, { CMDService } from './commandService.ts';
import * as cliErrors from './errors/cliErrors.ts';
import { TooManySpecError } from './errors/cmdServiceErrors.ts';
import defaultValidator from './helpers/standartValidators.ts';

interface IsplitSource {
  commandChain: CLICommand[];
  rawArgs: string[];
  specCommand?: string;
}

export class CLI {
  private validator: Validator;
  public cmdService: CMDService;
  private commands: CLICommand[] = [];

  constructor(validator?: Validator, cmdService?: CMDService) {
    this.validator = validator ? validator : defaultValidator;
    this.cmdService = cmdService ? cmdService : defaultCMDService;
  }

  public setValidator(validator: Validator) {
    this.validator = validator;
  }

  public addCommand(command: CLICommand) {
    if (this.commands.some((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }

    this.commands.push(command);
  }

  private isChildCommand(
    parentCmd: CLICommand | null,
    childCmd: CLICommand | undefined,
  ) {
    if (childCmd === undefined) return false;
    if (!parentCmd) {
      return this.commands.some((key) => key.name === childCmd.name);
    }

    return parentCmd.subcommands.some((key) =>
      key.name === childCmd.name
    );
  }

  public splitSource(rawSource: string[]): IsplitSource {
    if (rawSource.length === 0) {
      throw new cliErrors.EmptySourceError();
    }
    const specCommands: string[] = [];
    const specCmds = rawSource.filter((term) => {
      return this.cmdService.checkSpecCommand(term);
    });
    const specCmd = specCmds[0];
    if (specCmds.length > 1) {
      throw new TooManySpecError(specCmds);
    }
    if (specCmd) {
      specCommands.push(specCmd);
    }
    const source = rawSource.filter((term) => term !== specCmd);
    const commandChain: CLICommand[] = [];
    const rawArgs: string[] = [];
    let parent: CLICommand | null = null;
    let term = this.commands.find((c) => c.name === source[0]);
    if (term === undefined) {
      throw new cliErrors.NoCommandError(source[0]);
    }
    let i = 0;
    while (
      i < source.length &&
      this.isChildCommand(parent, term)
    ) {
      commandChain.push(term as CLICommand);
      parent = term as CLICommand;
      i++;
      term = commandChain[commandChain.length - 1].subcommands.find((
        c,
      ) => c.name === source[i]);
    }
    rawArgs.push(...source.slice(i));
    return {
      commandChain,
      rawArgs,
      specCommand: specCommands[0],
    };
  }

  public parseArgs(
    parentCmd: CLICommand,
    rawArgs: string[],
  ): HandlerArgs {
    if (parentCmd.arguments?.length === 0) return null;
    const parsedArgs: HandlerArgs = {};
    const requiredArgs = parentCmd.arguments
      .filter((arg) => arg.required);
    let index = 0;
    let requiredArgsCount = 0;
    while (index < rawArgs.length) {
      const term = rawArgs[index];
      const isTermOption = term.startsWith('--') ||
        term.startsWith('-');
      if (isTermOption) {
        const option = parentCmd.arguments.find((arg) =>
          arg.prefixName === term
        );
        if (option === undefined) {
          throw new cliErrors.UnknownOptionError(term);
        }
        if (option.type === 'flag') {
          parsedArgs[option.name] = true;
          index++;
        } else {
          if (option.required) requiredArgsCount++;
          const value = rawArgs[index + 1];
          if (value === undefined) {
            throw new cliErrors.MissingValueError(option);
          }

          const isValid = this.validator.validate(
            option.type,
            value,
          );
          if (!isValid) {
            const validResult = this.validator.getExamples(
              option.type,
            );
            throw new cliErrors.ArgumentValidError(
              value,
              option,
              validResult,
            );
          }
          parsedArgs[option.name] = value;
          index += 2;
        }
      } else {
        if (requiredArgsCount === requiredArgs.length) {
          throw new cliErrors.ExtraOptionalArgumentError(term);
        }
        const isValid = this.validator.validate(
          requiredArgs[requiredArgsCount].type,
          term,
        );
        if (!isValid) {
          const validResult = this.validator.getExamples(
            requiredArgs[requiredArgsCount].type,
          );
          throw new cliErrors.ArgumentValidError(
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
      throw new cliErrors.MissingRequiredArgsError(
        requiredArgs,
        parentCmd,
        requiredArgsCount,
      );
    }
    return parsedArgs;
  }

  public parse(
    s: string | string[],
  ): void {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const rawSource = Array.isArray(s) ? s : s.match(regex);
    if (rawSource === null) {
      throw new cliErrors.EmptySourceError();
    }
    const { commandChain, rawArgs, specCommand } = this.splitSource(
      rawSource,
    );
    if (specCommand !== undefined) {
      this.cmdService.handleSpecCommand(
        specCommand,
        commandChain[commandChain.length - 1],
      );
      return;
    }
    const parentCmd = commandChain[commandChain.length - 1];
    const parsedArgs = this.parseArgs(parentCmd, rawArgs);
    parentCmd.handler(parsedArgs);
  }
}
