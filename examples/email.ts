import {
  Cli,
  CliCommandBuilder,
  DefaultCommandArgument,
} from '../mod.ts';

const mail: Record<string, string[]> = {};

const sendCmd = new CliCommandBuilder()
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
  .setHandler((args) => {
    if (args) {
      const [to, msg] = [args.to as string, args.msg as string];
      if (mail[to]) {
        mail[to].push(msg);
      } else {
        mail[to] = [msg];
      }
      console.log(`Sent ${msg} to ${to}`);
    }
  }).build();

const listCmd = new CliCommandBuilder()
  .setName('list')
  .setDescription('List emails')
  .addArgument({
    ...DefaultCommandArgument,
    name: 'from',
    description: 'Email from',
    type: 'email',
    prefixName: '--from',
  })
  .setHandler(async (args) => {
    if (args) {
      const from = args.from as string;
      if (mail[from]) {
        console.log(
          `${args.from} emails: \n${mail[from].join('\n')}`,
        );
      } else {
        console.log('No emails');
      }
    }
  }).build();

const emailCmd = new CliCommandBuilder()
  .setName('email')
  .setDescription('Email commands')
  .addSubcommand(sendCmd)
  .addSubcommand(listCmd)
  .setHandler(() => {
    // cli.parse('help email');
  }).build();

try {
  const cli = new Cli();
  cli.addCommand(emailCmd);
  cli.addCommand(listCmd);
  cli.addCommand(sendCmd);

  /*
  cli.on(/ help /, (commands: string[], args: HandlerArgs) => {
    // тут что-то делаем
  }));
  */

  cli.parse('email send help --to alice@domain.xyz --msg Hello');
  cli.parse('email send --to alice@domain.xyz --msg "Hello again"');
  cli.parse(
    'email send --to bob@domain.xyz --msg "Good morning, Bob!"',
  );
  cli.parse(
    'email list alice@domain.xyz',
  );
} catch (e) {
  console.log((e as Error).message);
}
