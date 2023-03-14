import defaultValidator, {
  defaultValueType,
} from '../src/defaultValidator.ts';
import {
  ArgumentType,
  Cli,
  CliCommandBuilder,
  ILexeme,
  IMiddleware,
  LexemeType,
} from '../src/mod.ts';

const cli = new Cli();

cli.addCommand(
  new CliCommandBuilder()
    .setName('email')
    .setDescription('Email commands')
    .addSubcommand(
      new CliCommandBuilder()
        .setName('send')
        .setDescription('Send @msg to @to')
        .addArgument({
          name: '--to',
          description: 'Recipient email',
          type: ArgumentType.OPTION,
          valueValidator: defaultValidator.getValidator(
            defaultValueType.EMAIL,
          ),
          optionNameRequired: true,
          required: true,
        })
        .addArgument({
          name: 'msg',
          description: 'Message to send',
          type: ArgumentType.OPTION,
          required: true,
        })
        .addArgument({
          name: '--noResponse',
          description: 'Write  if you don\'t want to get response',
          type: ArgumentType.FLAG,
          required: false,
        })
        .setHandler((args) => {})
        .build(),
    )
    .setHandler((args) => {})
    .build(),
);
const middleware: IMiddleware = {
  pattern: / help /,
  handler: (lexemes: ILexeme[]) => {
    const toHelpCmds = lexemes.filter((lexeme) => {
      return lexeme.type === LexemeType.COMMAND;
    }).map((cmd) => cmd.content);
    console.log(`Find commands ${toHelpCmds} `);
    return false;
  },
};

cli.use(middleware);

try {
  cli
    .execute`email send --to --msg Hello`;
} catch (e) {
  console.log(e);
}
