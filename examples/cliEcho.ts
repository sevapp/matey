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
    args
      ? console.log(
        `Sent ${args.msg} to ${args.to} ${
          args.noResponse ? 'without response' : ''
        }`,
      )
      : console.log('Oops');
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
    args
      ? console.log(`Listed emails from ${args.from}`)
      : console.log('Oops');
  }).build();

const emailCmd = new CLICommandBuilder()
  .setName('email')
  .setDescription('Email commands')
  .addSubcommand(sendCmd)
  .addSubcommand(listCmd)
  .setHandler(() => {
  }).build();

cli.addCommand(emailCmd);
// const args = [
//   'email',
//   'send',
//   '--noResponse',
//   '--to',
//   'a@mail.ru',
//   '--msg',
//   'Hello',
// ];
// const args = ['help', 'help'];
// const args = ['email', 'hhh', 'a@mail.ru', 'Hello'];
// const args = ['send', 'send', 'a@mail.ru', 'Hello'];
// const args = [];
const args = ['email', 'help'];

try {
  // console.log(cli.splitSource(args));
  cli.parse(args);
  // cli.cmdService.handleSpecCommand('help', sendCmd);
} catch (e) {
  console.log((e as Error).message);
}
