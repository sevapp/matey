import { ArgumentType, defaultValueType } from './../src/Argument.ts';
import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { CliCommandBuilder } from '../src/CliCommandBuilder.ts';
import { Cli } from '../src/Tool.ts';

import * as errors from '../src/errors/mod.ts';
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

const tgSend = new CliCommandBuilder<defaultValueType>()
  .setName('send')
  .setDescription('Send --msg to --tgID')
  .addArgument({
    name: '--tgID',
    description: 'Telegram ID',
    type: ArgumentType.OPTION,
    valueType: defaultValueType.DATA,
    optionNameRequired: false,
    required: true,
  })
  .addArgument({
    name: '--msg',
    description: 'Message to send',
    type: ArgumentType.OPTION,
    valueType: defaultValueType.DATA,
    required: true,
  })
  .setHandler((args) => {})
  .build();

const telegram = new CliCommandBuilder<defaultValueType>()
  .setName('telegram')
  .setDescription('Telegram commands')
  .addSubcommand(tgSend)
  .setHandler((args) => {})
  .build();

cli.addCommand(telegram);

Deno.test('[lex](email) Correct detect lexemes', () => {
  assertEquals(
    lex([
      'email',
      'send',
      '--to',
      'a@mail.ru',
      'Hello',
      '--noResponse',
    ], cli),
    [
      { type: LexemeType.COMMAND, content: 'email' },
      { type: LexemeType.COMMAND, content: 'send' },
      { type: LexemeType.OPTION, content: '--to' },
      { type: LexemeType.MAYBE_VALUE, content: 'a@mail.ru' },
      { type: LexemeType.MAYBE_VALUE, content: 'Hello' },
      { type: LexemeType.FLAG, content: '--noResponse' },
    ],
  );
});

Deno.test('[getValidCommandChain](email) Correct build command chain 1', () => {
  assertEquals(
    cli.getValidCommandChain(lex([
      'email',
      'send',
      '--to',
      'a@mail.ru',
      'Hello',
      '--noResponse',
    ], cli)).map((cmd) => cmd.name),
    ['email', 'send'],
  );
});

Deno.test('[getValidCommandChain](email) Correct build command chain 2', () => {
  assertEquals(
    cli.getValidCommandChain(lex([
      'email',
      'ololo',
    ], cli)).map((cmd) => cmd.name),
    ['email'],
  );
});

Deno.test('[getValidCommandChain](email) Correct build command chain 2', () => {
  assertEquals(
    cli.getValidCommandChain(lex([
      'email',
      'ololo',
    ], cli)).map((cmd) => cmd.name),
    ['email'],
  );
});

Deno.test('[getValidCommandChain](email) No commands detect ', () => {
  assertThrows(() => {
    cli.getValidCommandChain(lex([
      '--to',
      'amail.ru',
      'Hello',
      '--noResponse',
    ], cli));
  }, errors.NoCommandFoundError);
});

Deno.test('[lex](telegram) Correct detect lexemes', () => {
  assertEquals(
    lex([
      'telegram',
      'send',
      '--tgID',
      '12345',
      '--msg',
      'ololo',
    ], cli),
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
