import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { CLICommandBuilder, handlerArgs } from '../src/command.ts';
import { CLI } from '../src/matey.ts';
import { defaultValidator } from '../examples/myValidators.ts';
import { DefaultCommandArgument } from '../src/command.ts';

const sendCmd = new CLICommandBuilder()
  .setName('send')
  .setDescription('Send email')
  .addArgument({
    ...DefaultCommandArgument,
    name: 'to',
    description: 'Email to send to',
    prefixName: '--to',
  })
  .addArgument({
    ...DefaultCommandArgument,
    name: 'subject',
    description: 'Subject of email',
    prefixName: '--subject',
  })
  .setHandler(() => {}).build();

const cli = new CLI(defaultValidator);
cli.addCommand(sendCmd);
Deno.test('with prefix two arguments', async () => {
  const result = cli.parseTest([
    'send',
    'a@mail.ru',
    '--subject',
    'ololo',
  ]);
  assertEquals(result, { to: 'a@mail.ru', subject: 'ololo' });
});
