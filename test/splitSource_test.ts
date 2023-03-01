import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import { CLI } from '../src/cli.ts';
import { defaultValidator } from '../examples/myValidators.ts';

const cli = new CLI(defaultValidator);

Deno.test('[Stable work] 1', () => {
  assertEquals(
    cli.splitSource(['help', 'email', 'send', 'a@mail.ru', 'Hello'])
      .specCommand,
    'help',
  );
});

// Deno.test('[Catch error] No command ', () => {
//   assertThrows(() => {
//     cli.parse(['send']);
//   }, Errors.NoCommandError);
// });
