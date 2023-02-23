import {
  ArgumentValidError,
  Validator,
} from '../helpers/validator.ts';
import {
  CLICommand,
  CLICommandBuilder,
  CommandArgument,
  handlerArgs,
} from './command.ts';

interface postionOfCommand {
  [key: string]: number;
}

class MissingArgumentError extends Error {}
interface IexecutionContext {
  commandsWithoutArgs: CLICommand[];
  data?: any;
}

export class CLI {
  constructor(validator: Validator) {
    this.validator = validator;
  }
  private validator: Validator;

  private commands: CLICommand[] = [];

  public executionContext: IexecutionContext = {
    commandsWithoutArgs: [],
  };

  public addCommand(command: CLICommand) {
    if (this.commands.find((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }

    this.commands.push(command);
  }

  private detectArgugments(
    args: string[],
    parsedCmds: Record<number, CLICommand>,
  ) {
    const parsedArgs: handlerArgs = {};
    const sortedKeys = Object.keys(parsedCmds).sort();
    sortedKeys.forEach((pos, index) => {
      const numPos = parseInt(pos);
      const command = parsedCmds[numPos];
      const posibleArgs = args.slice(
        numPos + 1,
        Math.min(
          parseInt(sortedKeys[index + 1]) || Infinity,
          args.length,
        ),
      );
      const namedArgs = command.arguments.filter(
        (arg) =>
          arg.name.startsWith('-') || arg.name.startsWith('--'),
      );
      const namedArgsMap: Record<string, CommandArgument> = {};
      namedArgs.forEach((arg) => {
        namedArgsMap[arg.name] = arg;
      });
      const requiredArgs = command.arguments.filter((arg) =>
        arg.required
      );
      // if (posibleArgs.length < requiredArgs.length) {
      //   throw new MissingArgumentError(
      //     `Expected ${requiredArgs.length} arguments but received ${posibleArgs.length} for command ${command.name}.`,
      //   );
      // }
      // console.log(posibleArgs);
      let argsCount = 0;
      let curPos = numPos + 1;
      //   while (argsCount < posibleArgs.length) {
      //     const arg = posibleArgs[argsCount];
      //     const isNamedArg = arg.startsWith('-') || arg.startsWith('--');

      //     if (isNamedArg) {
      //       const namedArg = namedArgsMap[arg];
      //       if (!namedArg) {
      //         throw new ArgumentValidError(
      //           `Unexpected argument "${arg}" for command "${command.name}".`,
      //         );
      //       }
      //       parsedArgs[namedArg.name] = namedArg.validate(possibleArgs, argsCount);
      //       argsCount += namedArg.validate.length + 1;
      //     } else {
      //       const curArg = command.arguments[curPos];
      //       if (!curArg) {
      //         throw new ArgumentValidError(
      //           `Unexpected argument "${arg}" for command "${command.name}".`,
      //         );
      //       }
      //       parsedArgs[curArg.name] = curArg.validate(possibleArgs, argsCount);
      //       argsCount += curArg.validate.length + 1;
      //       curPos++;
      //     }
    });
  }

  public parse(args: string[]) {
    const knownCommands = this.commands.filter((cmd) => {
      return args.includes(cmd.name);
    });

    if (knownCommands.length === 0) {
      console.error(`No available commands found.`);
      Deno.exit(1);
    }
    // const parsedArgs: handlerArgs = {};
    const parsedCmds: Record<string, CLICommand> = {};
    for (const cmd of knownCommands) {
      const cmdPos = args.indexOf(cmd.name);
      parsedCmds[cmdPos] = cmd;
    }
    // console.log(parsedCmds);
    this.detectArgugments(args, parsedCmds);
  }
}
