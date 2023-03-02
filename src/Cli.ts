import { Validator } from './Validator.ts';
import { HandlerArgs, ICliCommand } from './CliCommandBuilder.ts';
import defaultCmdService, { CmdService } from './CmdService.ts';
import * as errors from './errors/mod.ts';
import defaultValidator from './defaultValidator.ts';

interface ISplitSource {
  commandChain: ICliCommand[];
  rawArgs: string[];
  specCommand?: string;
}

export class Cli {
  private validator: Validator;
  public cmdService: CmdService;
  private commands: ICliCommand[] = [];

  constructor(validator?: Validator, cmdService?: CmdService) {
    this.validator = validator ? validator : defaultValidator;
    this.cmdService = cmdService ? cmdService : defaultCmdService;
  }

  public setValidator(validator: Validator) {
    this.validator = validator;
  }

  public addCommand(command: ICliCommand) {
    if (this.commands.some((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }

    this.commands.push(command);
  }

  private isChildCommand(
    parentCmd: ICliCommand | null,
    childCmd: ICliCommand | undefined,
  ) {
    if (childCmd === undefined) return false;
    if (!parentCmd) {
      return this.commands.some((key) => key.name === childCmd.name);
    }

    return parentCmd.subcommands.some((key) =>
      key.name === childCmd.name
    );
  }

  public splitSource(rawSource: string[]): ISplitSource {
    if (rawSource.length === 0) {
      throw new errors.EmptySourceError();
    }
    const specCommands: string[] = [];
    const specCmds = rawSource.filter((term) => {
      return this.cmdService.checkSpecCommand(term);
    });
    const specCmd = specCmds[0];
    if (specCmds.length > 1) {
      throw new errors.TooManySpecError(specCmds);
    }
    if (specCmd) {
      specCommands.push(specCmd);
    }
    const source = rawSource.filter((term) => term !== specCmd);
    const commandChain: ICliCommand[] = [];
    const rawArgs: string[] = [];
    let parent: ICliCommand | null = null;
    let term = this.commands.find((c) => c.name === source[0]);
    if (term === undefined) {
      throw new errors.NoCommandError(source[0]);
    }
    let i = 0;
    while (
      i < source.length &&
      this.isChildCommand(parent, term)
    ) {
      commandChain.push(term as ICliCommand);
      parent = term as ICliCommand;
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
    parentCmd: ICliCommand,
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
          throw new errors.UnknownOptionError(term);
        }
        if (option.type === 'flag') {
          parsedArgs[option.name] = true;
          index++;
        } else {
          if (option.required) requiredArgsCount++;
          const value = rawArgs[index + 1];
          if (value === undefined) {
            throw new errors.MissingValueError(option);
          }

          const isValid = this.validator.validate(
            option.type,
            value,
          );
          if (!isValid) {
            const validResult = this.validator.getExamples(
              option.type,
            );
            throw new errors.ArgumentValidError(
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
          throw new errors.ExtraOptionalArgumentError(term);
        }
        const isValid = this.validator.validate(
          requiredArgs[requiredArgsCount].type,
          term,
        );
        if (!isValid) {
          const validResult = this.validator.getExamples(
            requiredArgs[requiredArgsCount].type,
          );
          throw new errors.ArgumentValidError(
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
      throw new errors.MissingRequiredArgsError(
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
      throw new errors.EmptySourceError();
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
