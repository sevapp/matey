import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { CLICommandBuilder, handlerArgs } from '../src/command.ts';
import { CLI } from '../src/simpleMatey.ts';
import { defaultValidator } from '../examples/myValidators.ts';
import { DefaultCommandArgument } from '../src/command.ts';

import * as Errors from '../src/errors.ts';
const cli = new CLI(defaultValidator);
const sendCmd = new CLICommandBuilder()
  .setName('send')
  .setDescription('Send @msg to @to')
  .addArgument({
    ...DefaultCommandArgument,
    name: 'to',
    description: 'Recipient email',
    prefixName: '--to',
    type: 'email',
  })
  .addArgument({
    ...DefaultCommandArgument,
    name: 'noResponse',
    description: 'Write  if you don\'t want to get response',
    prefixName: '--noResponse',
    type: 'flag',
    required: false,
  })
  .addArgument({
    ...DefaultCommandArgument,
    name: 'msg',
    description: 'Message to send',
    prefixName: '--msg',
  })
  .setHandler((args: handlerArgs) => {
    console.log(`Sent ${args.msg} to ${args.to}`);
  }).build();

const listCmd = new CLICommandBuilder()
  .setName('list')
  .setDescription('List emails')
  .addArgument({
    ...DefaultCommandArgument,
    name: 'from',
    description: 'Email from',
  })
  .setHandler((args: handlerArgs) => {
    console.log(`Listed emails from ${args.from}`);
  }).build();

const emailCmd = new CLICommandBuilder()
  .setName('email')
  .setDescription('Email commands')
  .addSubcommand(sendCmd)
  .addSubcommand(listCmd)
  .setHandler(() => {
    // this.help()
  }).build();

cli.addCommand(emailCmd);

Deno.test('Stable work required args have no prefix', () => {
  assertEquals(
    cli.parse(['email', 'send', 'a@mail.ru', 'Hello']),
    { 'to': 'a@mail.ru', 'msg': 'Hello' },
  );
});

Deno.test('Stable work only one required of two args has prefix', () => {
  assertEquals(
    cli.parse(['email', 'send', '--to', 'a@mail.ru', 'Hello']),
    { 'to': 'a@mail.ru', 'msg': 'Hello' },
  );
});

Deno.test('Stable work all requierd args have prefix', () => {
  assertEquals(
    cli.parse([
      'email',
      'send',
      '--to',
      'a@mail.ru',
      '--msg',
      'Hello',
    ]),
    { 'to': 'a@mail.ru', 'msg': 'Hello' },
  );
});

Deno.test('Missing argument ', () => {
  assertThrows(() => {
    cli.parse(['email', 'send', 'Hello']);
  }, Errors.MissingArgumentError);
});

Deno.test('No arguments, but command have required ', () => {
  assertThrows(() => {
    cli.parse(['email', 'send']);
  }, Errors.MissingArgumentError);
});

Deno.test('Stable work with flag', () => {
  assertEquals(
    cli.parse([
      'email',
      'send',
      '--to',
      'a@mail.ru',
      'Hello',
      '--noResponse',
    ]),
    { 'to': 'a@mail.ru', 'msg': 'Hello', 'noResponse': true },
  );
});
