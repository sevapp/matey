interface ILexeme {
  type: 'VALUE' | 'FLAG' | 'COMMAND';
  value: string;
}

interface IArgumentDescription {
  name: string;
  isRequired: boolean;
  flag: string | null;
  flagIsRequired: boolean;
  valueIsRequired: boolean;
}

interface IArgument {
  name: string;
  flag: string;
  value: string;
}

interface ICommand {
  name: string;
  parentName?: string;
  arguments?: IArgumentDescription[];
  execute: (args: IArgument[]) => void;
}

interface ICli {
}

type MiddlewareHandler = (
  args: {
    commands: string[];
    arguments: Array<IArgument>;
  },
) => Boolean;

class CommandBuilder {
  constructor(_name: string) {
  }

  addSubCommand(_cmd: ICommand) {
    return this;
  }

  addToCommand(_cmd: ICommand) {
    return this;
  }

  addArgument(_argumentDescription: IArgumentDescription) {
    return this;
  }

  onExecute(_handler: MiddlewareHandler) {
    return this;
  }

  build(): ICommand {
    return {
      name: 'test',
      argunets: [],
      execute: () => {},
    } as ICommand;
  }
}

class CLI {
  addCommand(_cmd: ICommand) {
    return this;
  }

  onMatch(_pattern: string, _handler: MiddlewareHandler) {
    return this;
  }

  private lex(_pureString: string): ILexeme[] {
    return [];
  }

  private useMiddlewares(_lexemes: ILexeme[]): boolean {
    return true;
  }

  private parse(_lexemes: ILexeme[]): [ICommand, IArgument[]] {
    return [
      {
        name: 'test',
        argunets: [],
        execute: () => {},
      } as ICommand,
      [],
    ];
  }

  execute(pureString: string) {
    // 1. Lexical analysis
    const lexemes = this.lex(pureString);
    // 2. Use middlewares
    const canPasre = this.useMiddlewares(lexemes);
    if (!canPasre) return;
    // 2. Parsing
    const [command, args] = this.parse(lexemes);
    // 3. Execution
    command.execute(args);
  }
}

const cmdA = new CommandBuilder('A')
  .addArgument({
    name: 'arg1',
    isRequired: true,
    flag: null,
    flagIsRequired: false,
    valueIsRequired: true,
  })
  .addArgument({
    name: 'arg2',
    isRequired: false,
    flag: 'f',
    flagIsRequired: true,
    valueIsRequired: true,
  })
  .addSubCommand(
    new CommandBuilder('B')
      .addArgument({
        name: 'arg3',
        isRequired: true,
        flag: null,
        flagIsRequired: false,
        valueIsRequired: true,
      })
      .addArgument({
        name: 'arg4',
        isRequired: false,
        flag: 'f',
        flagIsRequired: true,
        valueIsRequired: true,
      })
      .build(),
  )
  .build();

const cli = new CLI()
  .addCommand(cmdA)
  .onMatch('--help', (_args) => {
    return true;
  });

cli.execute('A 1 -f 2 B 3 -f 4');
