import { Validator } from './Validator.ts';
import { HandlerArgs, ICliCommand } from './CliCommandBuilder.ts';
import * as errors from './errors/mod.ts';
import defaultValidator from './defaultValidator.ts';
import { DuplicateMiddlewareError } from './errors/mod.ts';
import { Flag, Option } from './Argument.ts';
import { ArgumentType } from './Argument.ts';

interface ISplitSource {
  commandChain: ICliCommand[];
  rawArgs: string[];
  // specCommand?: string;
}

interface IMiddleware {
  pattern: RegExp;
  handler: (
    commands: ICliCommand[],
    parsedArgs: HandlerArgs,
  ) => boolean;
}

interface IParsed {
  execCommand: ICliCommand;
  parsedArgs: HandlerArgs;
}

interface IKnownLexemes {
  knownCommands: string[];
  knownOptions: string[];
  knownFlags: string[];
}

export class Cli {
  private validator: Validator;
  private middlewares: IMiddleware[] = [];

  public knownLexemes: IKnownLexemes = {
    knownCommands: [],
    knownOptions: [],
    knownFlags: [],
  };
  public commands: ICliCommand[] = [];
  constructor(validator?: Validator) {
    this.validator = validator ? validator : defaultValidator;
  }

  public setValidator(validator: Validator) {
    this.validator = validator;
  }

  public addCommand(command: ICliCommand) {
    if (this.commands.some((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }
    this.knownLexemes.knownCommands.push(command.name);
    command.arguments?.forEach((arg) => {
      if (arg.type === ArgumentType.OPTION) {
        if (arg.type.name !== undefined && arg.type.name !== null) {
          this.knownLexemes.knownOptions.push(arg.type.name);
        }
      } else if (arg.type instanceof Flag) {
        this.knownLexemes.knownFlags.push(arg.type.name);
      }
    });
    this.commands.push(command);
  }

  public use(middleware: IMiddleware): void {
    const alreadyExists = this.middlewares.some((key) => {
      key.pattern === middleware.pattern;
    });

    if (alreadyExists) {
      throw new DuplicateMiddlewareError(middleware.pattern);
    }
    this.middlewares.push(middleware);
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

  // public splitSource(rawSource: string[]): ISplitSource {
  //   if (rawSource.length === 0) {
  //     throw new errors.EmptySourceError();
  //   }
  //   const commandChain: ICliCommand[] = [];
  //   const rawArgs: string[] = [];
  //   let parent: ICliCommand | null = null;
  //   let term = this.commands.find((c) => c.name === rawSource[0]);
  //   if (term === undefined) {
  //     throw new errors.NoCommandError(rawSource[0]);
  //   }
  //   let i = 0;
  //   while (
  //     i < rawSource.length &&
  //     this.isChildCommand(parent, term)
  //   ) {
  //     commandChain.push(term as ICliCommand);
  //     parent = term as ICliCommand;
  //     i++;
  //     term = commandChain[commandChain.length - 1].subcommands.find((
  //       c,
  //     ) => c.name === rawSource[i]);
  //   }
  //   rawArgs.push(...rawSource.slice(i));
  //   return {
  //     commandChain,
  //     rawArgs,
  //   };
  // }

  // public parseArgs(
  //   parentCmd: ICliCommand,
  //   rawArgs: string[],
  // ): HandlerArgs {
  //   if (parentCmd.arguments?.length === 0) return null;
  //   const parsedArgs: HandlerArgs = {};
  //   const requiredArgs = parentCmd.arguments
  //     .filter((arg) => arg.required);
  //   let index = 0;
  //   let requiredArgsCount = 0;
  //   while (index < rawArgs.length) {
  //     const term = rawArgs[index];
  //     const isTermOption = term.startsWith('--') ||
  //       term.startsWith('-');
  //     if (isTermOption) {
  //       const option = parentCmd.arguments.find((arg) =>
  //         arg.prefixName === term
  //       );
  //       if (option === undefined) {
  //         throw new errors.UnknownOptionError(term);
  //       }
  //       if (option.type === 'flag') {
  //         parsedArgs[option.name] = true;
  //         index++;
  //       } else {
  //         if (option.required) requiredArgsCount++;
  //         const value = rawArgs[index + 1];
  //         if (value === undefined) {
  //           throw new errors.MissingValueError(option);
  //         }

  //         const isValid = this.validator.validate(
  //           option.type,
  //           value,
  //         );
  //         if (!isValid) {
  //           const validResult = this.validator.getExamples(
  //             option.type,
  //           );
  //           throw new errors.ArgumentValidError(
  //             value,
  //             option,
  //             validResult,
  //           );
  //         }
  //         parsedArgs[option.name] = value;
  //         index += 2;
  //       }
  //     } else {
  //       if (requiredArgsCount === requiredArgs.length) {
  //         throw new errors.ExtraOptionalArgumentError(term);
  //       }
  //       const isValid = this.validator.validate(
  //         requiredArgs[requiredArgsCount].type,
  //         term,
  //       );
  //       if (!isValid) {
  //         const validResult = this.validator.getExamples(
  //           requiredArgs[requiredArgsCount].type,
  //         );
  //         throw new errors.ArgumentValidError(
  //           term,
  //           requiredArgs[requiredArgsCount],
  //           validResult,
  //         );
  //       }
  //       parsedArgs[requiredArgs[requiredArgsCount].name] = term;
  //       index++;
  //       requiredArgsCount++;
  //     }
  //   }
  //   if (requiredArgsCount < requiredArgs.length) {
  //     throw new errors.MissingRequiredArgsError(
  //       requiredArgs,
  //       parentCmd,
  //       requiredArgsCount,
  //     );
  //   }
  //   return parsedArgs;
  // }

  // public parse(
  //   s: string | string[],
  // ): IParsed {
  //   const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  //   const rawSource = Array.isArray(s) ? s : s.match(regex);
  //   if (rawSource === null) {
  //     throw new errors.EmptySourceError();
  //   }
  //   const { commandChain, rawArgs } = this.splitSource(
  //     rawSource,
  //   );

  //   const parentCmd = commandChain[commandChain.length - 1];
  //   const parsedArgs = this.parseArgs(parentCmd, rawArgs);
  //   return {
  //     execCommand: parentCmd,
  //     parsedArgs,
  //   };
  //   // parentCmd.handler(parsedArgs);
  // }

  // public exec(s: string | string[]) {
  //   const rawSource = Array.isArray(s) ? s : s.split(' ');
  //   let commandStr = rawSource.join(' ');
  //   this.middlewares.forEach((middleware) => {
  //     commandStr = commandStr.replace(middleware.pattern, ' ');
  //   });

  //   const { execCommand, parsedArgs } = this.parse(commandStr.trim());
  //   let currentMiddlewareIndex = -1;
  //   const executeMiddleware = (error?: Error) => {
  //     currentMiddlewareIndex++;
  //     if (
  //       error || currentMiddlewareIndex >= this.middlewares.length
  //     ) {
  //       execCommand.handler(parsedArgs);
  //     } else {
  //       const currentMiddleware =
  //         this.middlewares[currentMiddlewareIndex];
  //       if (currentMiddleware.pattern.test(rawSource.join(' '))) {
  //         currentMiddleware.handler(
  //           [execCommand],
  //           parsedArgs,
  //           executeMiddleware,
  //         );
  //       } else {
  //         executeMiddleware();
  //       }
  //     }
  //   };
  //   executeMiddleware();
  // }
}
