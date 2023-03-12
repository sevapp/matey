import { Validator } from './Validator.ts';
import { HandlerArgs, ICliCommand } from './CliCommandBuilder.ts';
import * as errors from './errors/mod.ts';
import defaultValidator from './defaultValidator.ts';
import { DuplicateMiddlewareError } from './errors/mod.ts';

import {
  ArgumentType,
  defaultValueType,
  ICommandArgument,
} from './Argument.ts';
import {
  ILexeme,
  lex,
  LexemeType,
  quoteAvoidSplit,
} from './Lexer.ts';
import {
  addToKnownLexemes,
  isChildCommand,
  prepareSource,
} from './helpers/toolHelper.ts';

export interface IMiddleware {
  pattern: RegExp;
  handler: (
    lexemes: ILexeme[],
  ) => boolean;
}

interface IKnownLexemes {
  knownCommands: string[];
  knownOptions: string[];
  knownFlags: string[];
}

export class Cli<valueType = defaultValueType> {
  private validator: Validator;
  private middlewares: IMiddleware[] = [];

  public knownLexemes: IKnownLexemes = {
    knownCommands: [],
    knownOptions: [],
    knownFlags: [],
  };
  public commands: ICliCommand<valueType>[] = [];
  public subcommands: ICliCommand<valueType>[] = [];
  constructor(validator?: Validator) {
    this.validator = validator ? validator : defaultValidator;
  }

  public setValidator(validator: Validator) {
    this.validator = validator;
  }

  public addCommand(command: ICliCommand<valueType>) {
    if (this.commands.some((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }
    addToKnownLexemes(command, this);
    command.subcommands?.forEach((subcommand) => {
      this.subcommands.push(subcommand);
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

  getValidCommandChain(lexemes: ILexeme[]): ICliCommand<valueType>[] {
    const commandTree: (ICliCommand<valueType> | null)[] = [null];
    const commands = lexemes.map((lexeme) =>
      lexeme.type === LexemeType.COMMAND
        ? this.commands.concat(this.subcommands).find(
          (key) => key.name === lexeme.content,
        )
        : null
    ).filter((value) => value !== null) as ICliCommand<valueType>[];
    if (commands.length === 0) throw new errors.NoCommandFoundError();
    commands.forEach((command) => {
      if (
        isChildCommand<valueType>(
          commandTree[commandTree.length - 1],
          command,
        )
      ) {
        commandTree.push(command);
      }
    });
    const finalTree = commandTree.filter((value) =>
      value !== null
    ) as ICliCommand<valueType>[];
    return finalTree;
  }

  runMiddlewares(source: string): [boolean, ILexeme[]] {
    const lexemes = lex(source, this);
    let allHandlersReturnedTrue = true;
    for (let i = 0; i < this.middlewares.length; i++) {
      const middleware = this.middlewares[i];
      if (middleware.pattern.test(source)) {
        const handlerResult = middleware.handler(lexemes);
        if (!handlerResult) {
          allHandlersReturnedTrue = false;
          break;
        }
      }
    }
    return [allHandlersReturnedTrue, lexemes];
  }

  parseArgs(lexemes: ILexeme[], source: string): HandlerArgs {
    const commandChain = this.getValidCommandChain(lexemes);
    if (
      !this.commands.includes(commandChain[0])
    ) {
      throw new errors.UnknownMainCommandError(commandChain[0].name);
    }
    const lastCommand = commandChain[commandChain.length - 1];
    const commandChainNames = commandChain.map((command) =>
      command.name
    );
    const commandsOnStart = source.startsWith(
      commandChainNames.join(' '),
    );
    if (!commandsOnStart) {
      throw new errors.CommandNotOnStartError();
    }
    const args = quoteAvoidSplit(
      source.replace(commandChainNames.join(' '), ''),
    );
    const lexemeArgs = lexemes.filter((lexeme) => {
      return lexeme.type !== LexemeType.COMMAND;
    });
    const parsedArgs: HandlerArgs = {};
    const requiredArgs = lastCommand.arguments?.filter((arg) =>
      arg.required
    );
    let requiredArgsGrabbed = 0;
    let waitingForValue: ICommandArgument<valueType> | null = null;
    lexemes.forEach((lexeme, index) => {
      if (lexeme.type === LexemeType.OPTION) {
        if (waitingForValue !== null) {
          throw new errors.MissingValueError(waitingForValue.name);
        }
        const option = lastCommand.arguments?.find((arg) =>
          arg.name === lexeme.content
        );
        if (option === undefined) {
          throw new errors.UnknownOptionError(lexeme.content);
        }
        waitingForValue = option;
      } else if (lexeme.type === LexemeType.FLAG) {
        if (waitingForValue !== null) {
          throw new errors.MissingValueError(waitingForValue.name);
        }
        const flag = lastCommand.arguments?.find((arg) =>
          arg.name === lexeme.content
        );
        if (flag === undefined) {
          throw new errors.UnknownFlagError(lexeme.content);
        }
        parsedArgs[flag.name] = true;
        flag.required && requiredArgsGrabbed++;
      } else if (lexeme.type === LexemeType.MAYBE_VALUE) {
        if (waitingForValue !== null) {
          const possibleValue = lexeme.content;
          const valueType = waitingForValue.valueType;
          const isValidValue = this.validator.validate(
            waitingForValue.valueType as defaultValueType,
            possibleValue,
          );
          if (!isValidValue) {
            throw new errors.InvalidValueError(
              possibleValue,
              valueType as defaultValueType,
            );
          }
          parsedArgs[waitingForValue.name] = possibleValue;
          waitingForValue.required && requiredArgsGrabbed++;
          waitingForValue = null;
        } else {
          if (
            requiredArgs === undefined ||
            requiredArgsGrabbed >= requiredArgs.length
          ) {
            throw new errors.TooManyArgumentsError(
              requiredArgs?.length || 0,
              args.length,
              lastCommand.name,
            );
            // throw new errors.TooManyArgumentsError(requiredArgs, args.length);
          }
          const possibleValue = lexeme.content;
          const valueType =
            requiredArgs[requiredArgsGrabbed].valueType;
          const isValidValue = this.validator.validate(
            requiredArgs[requiredArgsGrabbed]
              .valueType as defaultValueType,
            possibleValue,
          );
          if (!isValidValue) {
            throw new errors.InvalidValueError(
              possibleValue,
              valueType as defaultValueType,
            );
          }
          parsedArgs[requiredArgs[requiredArgsGrabbed].name] =
            possibleValue;
          requiredArgsGrabbed++;
        }
      }
    });
    return parsedArgs;
  }

  execute(rawSource: TemplateStringsArray | string[]): void {
    const source = prepareSource(rawSource);
    const [allHandlersReturnedTrue, lexemes] = this.runMiddlewares(
      source,
    );
    if (!allHandlersReturnedTrue) return;
    console.log(this.parseArgs(lexemes, source));
  }
}
