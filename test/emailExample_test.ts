import { ArgumentType, defaultValueType } from './../src/Argument.ts';
import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { CliCommandBuilder } from '../src/CliCommandBuilder.ts';
import { Cli } from '../src/Tool.ts';

import * as cliErrors from '../src/errors/cliErrors.ts';
import { lex, LexemeType } from '../src/Lexer.ts';

enum myValueTypes {
  myUUID,
  myEmail,
  myPassword,
}

const cli = new Cli<defaultValueType>();

cli.addCommand(
  new CliCommandBuilder<defaultValueType>()
    .setName('email')
    .setDescription('Email commands')
    .addSubcommand(
      new CliCommandBuilder<defaultValueType>()
        .setName('send')
        .setDescription('Send @msg to @to')
        .addArgument({
          name: '--to',
          description: 'Recipient email',
          type: ArgumentType.OPTION,
          valueType: defaultValueType.EMAIL,
          optionNameRequired: true,
          required: true,
        })
        .addArgument({
          name: 'msg',
          description: 'Message to send',
          type: ArgumentType.OPTION,
          valueType: defaultValueType.DATA,
          required: true,
        })
        .setHandler((args) => {})
        .build(),
    )
    .setHandler((args) => {})
    .build(),
);

Deno.test('[Lexer test] Correct detect lexemes', () => {
  assertEquals(
    lex(['email', 'send', '--to', 'a@mail.ru', 'Hello'], cli),
    [
      { type: LexemeType.COMMAND, content: 'email' },
      { type: LexemeType.COMMAND, content: 'send' },
      { type: LexemeType.OPTION, content: '--to' },
      { type: LexemeType.MAYBE_VALUE, content: 'a@mail.ru' },
      { type: LexemeType.MAYBE_VALUE, content: 'Hello' },
    ],
  );
});

// const sendCmd = new CliCommandBuilder()
//   .setName('send')
//   .setDescription('Send @msg to @to')
//   .addArgument({
//     ...DefaultCommandArgument,
//     name: 'to',
//     description: 'Recipient email',
//     prefixName: '--to',
//     type: 'email',
//   })
//   .addArgument({
//     ...DefaultCommandArgument,
//     name: 'noResponse',
//     description: 'Write  if you don\'t want to get response',
//     prefixName: '--noResponse',
//     type: 'flag',
//     required: false,
//   })
//   .addArgument({
//     ...DefaultCommandArgument,
//     name: 'msg',
//     description: 'Message to send',
//     prefixName: '--msg',
//   })
//   .setHandler(() => {
//   }).build();

// const listCmd = new CliCommandBuilder()
//   .setName('list')
//   .setDescription('List emails')
//   .addArgument({
//     ...DefaultCommandArgument,
//     name: 'from',
//     description: 'Email from',
//   })
//   .setHandler(() => {
//   }).build();

// const emailCmd = new CliCommandBuilder()
//   .setName('email')
//   .setDescription('Email commands')
//   .addSubcommand(sendCmd)
//   .addSubcommand(listCmd)
//   .setHandler(() => {
//   }).build();

// cli.addCommand(emailCmd);

// Deno.test('[Stable work] required args have no prefix', () => {
//   assertEquals(
//     cli.parse(['email', 'send', 'a@mail.ru', 'Hello']),
//     void 0,
//   );
// });

// Deno.test('[Stable work] only one required of two args has prefix', () => {
//   assertEquals(
//     cli.parse(['email', 'send', '--to', 'a@mail.ru', 'Hello']),
//     void 0,
//   );
// });

// Deno.test('[Stable work] all requierd args have prefix', () => {
//   assertEquals(
//     cli.parse([
//       'email',
//       'send',
//       '--to',
//       'a@mail.ru',
//       '--msg',
//       'Hello',
//     ]),
//     void 0,
//   );
// });

// Deno.test('[Catch error] Missing argument ', () => {
//   assertThrows(() => {
//     cli.parse(['email', 'send', 'Hello']);
//   }, cliErrors.ArgumentValidError);
// });

// Deno.test('[Catch error] No arguments, but command have required ', () => {
//   assertThrows(() => {
//     cli.parse(['email', 'send']);
//   }, cliErrors.MissingRequiredArgsError);
// });

// Deno.test('[Stable work] with flag', () => {
//   assertEquals(
//     cli.parse([
//       'email',
//       'send',
//       '--to',
//       'a@mail.ru',
//       'Hello',
//       '--noResponse',
//     ]),
//     void 0,
//   );
// });

// Deno.test('[Catch error] No command ', () => {
//   assertThrows(() => {
//     cli.parse(['send']);
//   }, cliErrors.NoCommandError);
// });

// Deno.test('[Catch error] Invalid validation ', () => {
//   assertThrows(() => {
//     cli.parse([
//       'email',
//       'send',
//       '--to',
//       'amail.ru',
//       'Hello',
//       '--noResponse',
//     ]);
//   }, cliErrors.ArgumentValidError);
// });

// Deno.test('[Catch error] Extra arguments error handling', () => {
//   assertThrows(() => {
//     cli.parse([
//       'email',
//       'send',
//       '--to',
//       'a@mail.ru',
//       'Hello',
//       '--noResponse',
//       'extra',
//     ]);
//   }, cliErrors.ExtraOptionalArgumentError);
// });
