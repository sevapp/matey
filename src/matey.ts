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

// interface IcommandInfo {
//   numOfrightArgs: number;
//   numOfleftArgs: number;
// }

interface IexecutionContext {
  commandsWithoutArgs: CLICommand[];
  data?: any;
}

interface IparsedCmds {
  [key: number]: CLICommand;
}

export class CLI {
  constructor(validator: Validator) {
    this.validator = validator; // тут можно если что дефолт валидатор передать
  }
  private validator: Validator;

  // private commandsInfo: Record<string, commandInfo>[] = [];

  private commands: CLICommand[] = [];

  public executionContext: IexecutionContext = {
    commandsWithoutArgs: [],
  };

  public addCommand(command: CLICommand) {
    // const commandKeys = Object.keys(this.commandsInfo);
    if (this.commands.find((key) => key.name === command.name)) {
      throw new Error(`Command "${command.name}" already exists.`);
    }
    // const numOfrightArgs =
    //   command.arguments.filter((arg) => arg.side === 'right').length;
    // const numOfleftArgs =
    //   command.arguments.filter((arg) => arg.side === 'left').length;

    // this.commandsInfo.push({
    //   [command.name]: {
    //     numOfrightArgs,
    //     numOfleftArgs,
    //   },
    // });
    this.commands.push(command);
  }

  private detectArgugments(
    args: string[],
    parsedCmds: Record<string, CLICommand>,
  ) {
    const parsedArgs: handlerArgs = {};
    for (const pos of Object.keys(parsedCmds)) {
      // const cmdPos = args.indexOf(cmd.name);

      // const commandInfo = this.commandsInfo.find((info) => {
      //   return Object.keys(info).includes(cmd.name);
      // });
      // if (!commandInfo) {
      //   throw new Error(`Command "${cmd.name}" not found.`);
      // }
      const command = parsedCmds[pos];
      // const numOfrightArgs = command.arguments.filter((arg) =>
      //   arg.side === 'right'
      // ).length;
      // const numOfleftArgs = command.arguments.filter((arg) =>
      //   arg.side === 'left'
      // ).length;

      const numPos = parseInt(pos);
      // let argsCount = 0;

      // let i = 1;
      const posiibleArgs = args.slice(numPos, numPos + 1);
      // Перебираем аргументы справа
      while (argsCount < numOfrightArgs) {
        if (!args[numPos + i]) {
          throw new MissingArgumentError(
            `Expected ${
              commandInfo[cmd.name].numOfrightArgs
            } right arguments but received ${argsCount}.`,
          );
        }
        // Аргумент справа есть и он с префиксом
        if (
          args[cmdPos + i].startsWith('-') ||
          args[cmdPos + i].startsWith('--')
        ) {
          const argByPrefix = cmd.arguments.find((arg) => {
            return arg.prefixName === args[cmdPos + i];
          });
          if (!argByPrefix) {
            throw new ArgumentValidError(
              `Unknown prefix name "${args[cmdPos + i]}"`,
            );
          }
          const argValue = args[cmdPos + i + 1];
          if (
            !argValue ||
            !this.validator.validate(argByPrefix.type, argValue)
          ) {
            throw new ArgumentValidError(
              `Invalid argument value "${argValue}"`,
            );
          }
          parsedArgs[argByPrefix.name] = args[cmdPos + i + 1];
          argsCount++;
          i += 2;
        } else {
          const expectedArg = cmd.arguments.filter((arg) =>
            arg.side === 'right'
          )[argsCount];

          const isValid = this.validator.validate(
            expectedArg.type,
            args[cmdPos + i],
          );
          if (!isValid) {
            throw new ArgumentValidError(
              `Invalid argument value "${args[cmdPos + i]}"`,
            );
          }
          parsedArgs[expectedArg.name] = args[cmdPos + i];
          argsCount++;
          i++;
        }
      }
    
      }
      console.log(parsedArgs);
    }
  }

  public parse(args: string[]) {
    const knownCommands = this.commands.filter((cmd) => {
      return args.includes(cmd.name);
    });

    if (knownCommands.length === 0) {
      console.error(`No available commands found.`);
      // this.printHelp();
      Deno.exit(1);
    }
    const parsedArgs: handlerArgs = {};
    const parsedCmds: Record<string, CLICommand> = {};

    for (const cmd of knownCommands) {
      const cmdPos = args.indexOf(cmd.name).toString();
      // const commandInfo = this.commandsInfo.find((info) => {
      //   return Object.keys(info).includes(cmd.name);
      // });
      // if (!commandInfo) {
      //   throw new Error(`Command "${cmd.name}" not found.`);
      // }
      parsedCmds[cmdPos] = cmd;
    }
    // console.log(Object.keys(parsedCmds));
    // this.detectArgugments(args, parsedCmds);
  }

  // public parseTest(args: string[]): any {
  //   const knownCommands = this.commands.filter((cmd) => {
  //     return args.includes(cmd.name);
  //   });

  //   if (knownCommands.length === 0) {
  //     console.error(`No available commands found.`);
  //     // this.printHelp();
  //     Deno.exit(1);
  //   }
  //   const parsedArgs: handlerArgs = {};
  //   const parsedCmds Record<string, >= knownCommands.map((cmd) => {
  //     [args.indexOf(cmd.name)] =  this.commandsInfo.find((info) => {
  //       return Object.keys(info).includes(cmd.name);
  //     });
  //   });
  //   for (const cmd of knownCommands) {
  //     const commandInfo = this.commandsInfo.find((info) => {
  //       return Object.keys(info).includes(cmd.name);
  //     });
  //     if (!commandInfo) {
  //       throw new Error(`Command "${cmd.name}" not found.`);
  //     }
  //     let argsCount = 0;
  //     //Надо собрать все аргументы команды справа
  //     let i = 1;
  //     // Заводим переменную для счетчика аргументов
  //     while (argsCount < commandInfo[cmd.name].numOfrightArgs) {
  //       // Аргумент справа есть и он с префиксом
  //       if (
  //         args[cmdPos + i].startsWith('-') ||
  //         args[cmdPos + i].startsWith('--')
  //       ) {
  //         const argByPrefix = cmd.arguments.find((arg) => {
  //           return arg.prefixName === args[cmdPos + i];
  //         });
  //         if (!argByPrefix) {
  //           throw new ArgumentValidError(
  //             `Unknown prefix name "${args[cmdPos + i]}"`,
  //           );
  //         }
  //         const argValue = args[cmdPos + i + 1];
  //         if (
  //           !argValue ||
  //           !this.validator.validate(argByPrefix.type, argValue)
  //         ) {
  //           throw new ArgumentValidError(
  //             `Invalid argument value "${argValue}"`,
  //           );
  //         }
  //         parsedArgs[argByPrefix.name] = args[cmdPos + i + 1];
  //         argsCount++;
  //         i += 2;
  //       } else {
  //         const expectedArg = cmd.arguments.filter((arg) => {
  //           arg.side === 'right';
  //         })[argsCount];
  //         const isValid = this.validator.validate(
  //           expectedArg.type,
  //           args[cmdPos + i],
  //         );
  //         if (!isValid) {
  //           throw new ArgumentValidError(
  //             `Invalid argument value "${args[cmdPos + i]}"`,
  //           );
  //         }
  //         parsedArgs[expectedArg.name] = args[cmdPos + i];
  //         argsCount++;
  //         i++;
  //       }
  //       // const inPrefix = (args[cmdPos + i].startsWith('-') ||
  //       //     args[cmdPos + i].startsWith('--'))
  //       //   ? args[cmdPos + i]
  //       //   : null;
  //       // if (inPrefix) {
  //       //   const inArg = args[cmdPos + i + 1] &&
  //       //       this.validator.validate(
  //       //         cmd.arguments.find((argum) => {
  //       //           argum.prefix == args[cmdPos + i];
  //       //         })!.type,
  //       //         args[cmdPos + i + 1],
  //       //       )
  //       //     ? args[cmdPos + i + 1]
  //       //     : '';
  //       //   if (inArg) {
  //       //     parsedArgs[args[cmdPos + i]] = args[cmdPos + i + 1];
  //       //     argsCount++;
  //       //     i++;
  //       //   }
  //       //   continue;
  //       // } else {
  //       // }
  //     }
  //     return parsedArgs;
  //   }
  // }
}

// public parse(args: string[]): any {
//   const [commandName, ...commandArgs] = args;

//   const command = this.commands.find((cmd) =>
//     cmd.name === commandName
//   );

//   if (!command) {
//     console.error(`Command "${commandName}" not found.`);
//     this.printHelp();
//     Deno.exit(1);
//   }

//   if (command.subcommands.length > 0) {
//     const [subcommandName, ...subcommandArgs] = commandArgs;

//     const subcommand = command.subcommands.find((cmd) =>
//       cmd.name === subcommandName
//     );

//     if (!subcommand) {
//       console.error(
//         `Subcommand "${subcommandName}" not found for command "${commandName}".`,
//       );
//       this.printHelp(command);
//       Deno.exit(1);
//     }
//     return this.parse(commandArgs);
//   }

//   const parsedArgs = this.parseArgs(commandArgs, command);

//   command.handler(parsedArgs);
// }

// private parseArgs(args: string[], command: CLICommand) {
//   const parsedArgs: handlerArgs = {};

//   const expectedArgs = command.arguments.filter((
//     arg: CommandArgument,
//   ) => arg.required);
//   if (args.length < expectedArgs.length) {
//     console.error(
//       `Expected ${expectedArgs.length} arguments but received ${args.length}.`,
//     );
//     this.printHelp(command);
//     Deno.exit(1);
//   }

//   for (let i = 0; i < args.length; i++) {
//     const arg = args[i];
//     const argument = command.arguments[i];
//     parsedArgs[argument.name] = arg;
//   }

//   return parsedArgs;
// }

// private printHelp(command?: CLICommand) {
//   if (command) {
//     console.log(command.description);

//     if (command.arguments.length > 0) {
//       console.log('Arguments:');
//       for (const arg of command.arguments) {
//         console.log(`  ${arg.name}: ${arg.description}`);
//       }
//     }

// if (command.subcommands.length > 0) {
//   console.log('Subcommands:');
//   for (const subcommand of command.subcommands) {
//     console.log(
//       `  ${subcommand.name}: ${subcommand.description}`,
//     );
//   }
// }
//     } else {
//       console.log('Usage:');
//       console.log('<command> [arguments]');

//       console.log('\nAvailable commands:');
//       for (const command of this.commands) {
//         console.log(`  ${command.name}: ${command.description}`);
//       }
//     }
//   }
// }
