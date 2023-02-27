import { CLICommandBuilder, handlerArgs } from '../src/command.ts';
import { CLI } from '../src/cli.ts';
import { defaultValidator } from '../examples/myValidators.ts';
import { DefaultCommandArgument } from '../src/command.ts';

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
    name: 'msg',
    description: 'Message to send',
    prefixName: '--msg',
  })
  .addArgument({
    ...DefaultCommandArgument,
    name: 'noResponse',
    description: 'Write  if you don\'t want to get response',
    prefixName: '--subject',
    type: 'flag',
    required: false,
  })
  .addArgument({
    ...DefaultCommandArgument,
    name: 'noResponse',
    description: 'Write  if you don\'t want to get response',
    prefixName: '--noResponse',
    type: 'flag',
    required: false,
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
  }).build();

cli.addCommand(emailCmd);
const args = ['help', 'email', 'send', 'a@mail.ru', 'Hello'];

try {
  console.log(cli.parse(args));
  // cli.cmdService.handleSpecCommand('help', sendCmd);
} catch (e) {
  console.log((e as Error).message);
}
