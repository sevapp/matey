import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { CLICommandBuilder, handlerArgs } from '../src/command.ts';
import { CLI } from '../src/cli.ts';
import defaultValidator from '../helpers/standartValidators.ts';
import { DefaultCommandArgument } from '../src/command.ts';

import * as cliErrors from '../errors/cliErrors.ts';
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
  .setHandler(() => {
  }).build();

const listCmd = new CLICommandBuilder()
  .setName('list')
  .setDescription('List emails')
  .addArgument({
    ...DefaultCommandArgument,
    name: 'from',
    description: 'Email from',
  })
  .setHandler(() => {
  }).build();

const emailCmd = new CLICommandBuilder()
  .setName('email')
  .setDescription('Email commands')
  .addSubcommand(sendCmd)
  .addSubcommand(listCmd)
  .setHandler(() => {
  }).build();

cli.addCommand(emailCmd);

Deno.test('[Stable work] required args have no prefix', () => {
  assertEquals(
    cli.parse(['email', 'send', 'a@mail.ru', 'Hello']),
    void 0,
  );
});

Deno.test('[Stable work] only one required of two args has prefix', () => {
  assertEquals(
    cli.parse(['email', 'send', '--to', 'a@mail.ru', 'Hello']),
    void 0,
  );
});

Deno.test('[Stable work] all requierd args have prefix', () => {
  assertEquals(
    cli.parse([
      'email',
      'send',
      '--to',
      'a@mail.ru',
      '--msg',
      'Hello',
    ]),
    void 0,
  );
});

Deno.test('[Catch error] Missing argument ', () => {
  assertThrows(() => {
    cli.parse(['email', 'send', 'Hello']);
  }, cliErrors.ArgumentValidError);
});

Deno.test('[Catch error] No arguments, but command have required ', () => {
  assertThrows(() => {
    cli.parse(['email', 'send']);
  }, cliErrors.MissingRequiredArgsError);
});

Deno.test('[Stable work] with flag', () => {
  assertEquals(
    cli.parse([
      'email',
      'send',
      '--to',
      'a@mail.ru',
      'Hello',
      '--noResponse',
    ]),
    void 0,
  );
});

Deno.test('[Catch error] No command ', () => {
  assertThrows(() => {
    cli.parse(['send']);
  }, cliErrors.NoCommandError);
});

Deno.test('[Catch error] Invalid validation ', () => {
  assertThrows(() => {
    cli.parse([
      'email',
      'send',
      '--to',
      'amail.ru',
      'Hello',
      '--noResponse',
    ]);
  }, cliErrors.ArgumentValidError);
});

Deno.test('[Catch error] Extra arguments error handling', () => {
  assertThrows(() => {
    cli.parse([
      'email',
      'send',
      '--to',
      'a@mail.ru',
      'Hello',
      '--noResponse',
      'extra',
    ]);
  }, cliErrors.ExtraOptionalArgumentError);
});
