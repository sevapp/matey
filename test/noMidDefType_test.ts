import {
  ArgumentType,
  assertEquals,
  assertThrows,
  Cli,
  CliCommandBuilder,
  defaultValueType,
  lex,
  LexemeType,
} from './mod.ts';
import * as errors from '../src/errors/mod.ts';
import defaultValidator from '../src/defaultValidator.ts';

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
          name: '--msg',
          description: 'Message to send',
          type: ArgumentType.OPTION,
          valueValidator: defaultValidator.getValidator(
            defaultValueType.DATA,
          ),
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

const tgSend = new CliCommandBuilder()
  .setName('send')
  .setDescription('Send --msg to --tgID')
  .addArgument({
    name: '--tgID',
    description: 'Telegram ID',
    type: ArgumentType.OPTION,
    optionNameRequired: false,
    required: true,
  })
  .addArgument({
    name: '--msg',
    description: 'Message to send',
    type: ArgumentType.OPTION,
    required: true,
  })
  .setHandler((args) => {})
  .build();

const telegram = new CliCommandBuilder()
  .setName('telegram')
  .setDescription('Telegram commands')
  .addSubcommand(tgSend)
  .setHandler((args) => {})
  .build();

cli.addCommand(telegram);

Deno.test('[lex](email) Correct detect lexemes', () => {
  assertEquals(
    lex(
      'email send --to a@mail.ru \'Hello\' --noResponse',
      cli,
    ),
    [
      { type: LexemeType.COMMAND, content: 'email' },
      { type: LexemeType.COMMAND, content: 'send' },
      { type: LexemeType.OPTION, content: '--to' },
      { type: LexemeType.MAYBE_VALUE, content: 'a@mail.ru' },
      { type: LexemeType.MAYBE_VALUE, content: '\'Hello\'' },
      { type: LexemeType.FLAG, content: '--noResponse' },
    ],
  );
});

Deno.test('[lex](email) Correct detect lexemes 2', () => {
  assertEquals(
    lex(
      'email send telegram send --to --to ololo --noResponse',
      cli,
    ),
    [
      { type: LexemeType.COMMAND, content: 'email' },
      { type: LexemeType.COMMAND, content: 'send' },
      { type: LexemeType.COMMAND, content: 'telegram' },
      { type: LexemeType.COMMAND, content: 'send' },
      { type: LexemeType.OPTION, content: '--to' },
      { type: LexemeType.OPTION, content: '--to' },
      { type: LexemeType.MAYBE_VALUE, content: 'ololo' },
      { type: LexemeType.FLAG, content: '--noResponse' },
    ],
  );
});

Deno.test('[lex](email) Correct detect lexemes 3', () => {
  assertEquals(
    lex(
      '--noResponse --to --msg',
      cli,
    ),
    [
      { type: LexemeType.FLAG, content: '--noResponse' },
      { type: LexemeType.OPTION, content: '--to' },
      { type: LexemeType.OPTION, content: '--msg' },
    ],
  );
});

Deno.test('[lex](email) No source ', () => {
  assertThrows(() => {
    cli.getValidCommandChain(
      lex('', cli),
    );
  }, errors.InvalidSourceError);
});
Deno.test('[lex](email) Correct detect lexemes 4 ', () => {
  assertEquals(
    lex(
      'email send --to --msg Hello',
      cli,
    ),
    [
      { type: LexemeType.COMMAND, content: 'email' },
      { type: LexemeType.COMMAND, content: 'send' },
      { type: LexemeType.OPTION, content: '--to' },
      { type: LexemeType.OPTION, content: '--msg' },
      { type: LexemeType.MAYBE_VALUE, content: 'Hello' },
    ],
  );
});

Deno.test('[parseArgs](email) Commands are not at begin ', () => {
  assertThrows(() => {
    cli.parseArgs(lex('email  --to send', cli), 'email --to send');
  }, errors.CommandNotOnStartError);
});

Deno.test('[parseArgs](email) Unknown command', () => {
  assertThrows(() => {
    cli.parseArgs(lex(' --to send email', cli), ' --to send email');
  }, errors.UnknownMainCommandError);
});

Deno.test('[getValidCommandChain](email) Correct build command chain 1', () => {
  assertEquals(
    cli.getValidCommandChain(lex(
      'email send --to a@mail.ru Hello --noResponse',
      cli,
    )).map((cmd) => cmd.name),
    ['email', 'send'],
  );
});

Deno.test('[getValidCommandChain](email) Correct build command chain 2', () => {
  assertEquals(
    cli.getValidCommandChain(lex(
      'email ololo',
      cli,
    )).map((cmd) => cmd.name),
    ['email'],
  );
});

Deno.test('[getValidCommandChain](email) Correct build command chain 1', () => {
  assertEquals(
    cli.getValidCommandChain(lex(
      'send email --to a@mail.ru Hello --noResponse',
      cli,
    )).map((cmd) => cmd.name),
    ['send'],
  );
});

Deno.test('[getValidCommandChain](email) No commands detect ', () => {
  assertThrows(() => {
    cli.getValidCommandChain(
      lex('--to amail.ru Hello --noResponse', cli),
    );
  }, errors.NoCommandFoundError);
});

Deno.test('[lex](telegram) Correct detect lexemes', () => {
  assertEquals(
    lex(
      [
        'telegram',
        'send',
        '--tgID',
        '12345',
        '--msg',
        'ololo',
      ].join(' '),
      cli,
    ),
    [
      { type: LexemeType.COMMAND, content: 'telegram' },
      { type: LexemeType.COMMAND, content: 'send' },
      { type: LexemeType.OPTION, content: '--tgID' },
      { type: LexemeType.MAYBE_VALUE, content: '12345' },
      { type: LexemeType.OPTION, content: '--msg' },
      { type: LexemeType.MAYBE_VALUE, content: 'ololo' },
    ],
  );
});

Deno.test('[parseArgs](email) Missing value detect', () => {
  assertThrows(() => {
    cli.parseArgs(
      lex('email send --to --msg Hello', cli),
      'email send --to --msg Hello',
    );
  }, errors.MissingValueError);
});

Deno.test('[pardeArgs](email) Validation failed', () => {
  assertThrows(() => {
    cli.parseArgs(
      lex('email send --to popop --msg', cli),
      'email send --to popop --msg',
    );
  }, errors.InvalidValueError);
});

Deno.test('[pardeArgs](email) Extra argument ', () => {
  assertThrows(() => {
    cli.parseArgs(
      lex('email send --to a@tt.ru --msg message whoami ', cli),
      'email send --to a@tt.ru --msg message whoami  ',
    );
  }, errors.TooManyArgumentsError);
});

// Deno.test('[parseArgs](email) Correct parse required args without option name', () => {
//   assertEquals(
//     cli.parseArgs(
//       lex(
//         'email send a@mail.ru Hello --noResponse',
//         cli,
//       ),
//       'email send  a@mail.ru Hello --noResponse',
//     ),
//     [{
//       '--to': 'a@mail.ru',
//       '--msg': 'Hello',
//       '--noResponse': true,
//     }, ],
//   );
// });

// Deno.test('[parseArgs](email) Correct parse required args without option name 2', () => {
//   assertEquals(
//     cli.parseArgs(
//       lex(
//         'email send a@mail.ru Hello ',
//         cli,
//       ),
//       'email send  a@mail.ru Hello',
//     ),
//     {
//       '--to': 'a@mail.ru',
//       '--msg': 'Hello',
//     },
//   );
// });
