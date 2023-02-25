import { CLICommandBuilder, handlerArgs } from '../src/command.ts';
import { CLI } from '../src/simpleMatey.ts';
import { defaultValidator } from '../examples/myValidators.ts';
import { DefaultCommandArgument } from '../src/command.ts';
// const addSuffix = new CLICommandBuilder()
//   .setName('suffix')
//   .setDescription('Add suffix')
//   .addArgument({
//     name: 'suffixName',
//     description: 'Name of suffix to append',
//     required: true,
//   })
//   .addArgument({
//     name: 'main',
//     description: 'Main message to append to',
//     required: true,
//   })
//   .setHandler((args: handlerArgs) => {
//     const { suffixName, main } = args;
//     console.log(`${main} ${suffixName}`);
//   }).build();

// const cli = new CLI();
// // cli.addCommand(cmd);
// // cli.parse(Deno.args);

// const echoWithSubcommand = new CLICommandBuilder()
//   .setName('echo')
//   .setDescription('Echo a message')
//   .addArgument({
//     name: 'message',
//     description: 'Message to echo',
//     required: true,
//   })
//   .addSubcommand(addSuffix)
//   .setHandler((args: handlerArgs) => {
//     const { message, subcommand } = args;
//     new CLI().parse([subcommand, message]);
//   }).build();

// cli.addCommand(echoWithSubcommand);
// // console.log(Deno.args);
// cli.parse(['echo', 'hello', 'suffix', 'world']);

// const addSuffix = new CLICommandBuilder()
//   .setName('suffix')
//   .setDescription('Add suffix')
//   .addArgument({
//     name: 'suffixName',
//     description: 'Name of suffix to append',
//     required: true,
//   })
//   .setHandler((args: handlerArgs) => {
//     const { suffixName, main } = args;
//     console.log(`${main} ${suffixName}`);
//   }).build();

// const writeToFile = new CLICommandBuilder()
//   .setName('write')
//   .setDescription('Write to file')
//   .addArgument({
//     name: 'filename',
//     description: 'File to write to',
//     required: true,
//   })
//   .addArgument({
//     name: 'message',
//     description: 'Message to write',
//     required: true,
//   })
//   .setHandler((args: handlerArgs) => {
//     const { filename, message } = args;
//     Deno.writeTextFileSync(filename, message);
//   }).build();

// const echoWithSubcommand = new CLICommandBuilder()
//   .setName('echo')
//   .setDescription('Echo a message')
//   .addArgument({
//     name: 'message',
//     description: 'Message to echo',
//     required: true,
//   })
//   .addSubcommand(addSuffix)
//   .setHandler((args: handlerArgs) => {
//     const { message } = args;
//     console.log(message);
//   }).build();

// const writeWithSubcommand = new CLICommandBuilder()
//   .setName('write')
//   .setDescription('Write to file')
//   .addSubcommand(addSuffix)
//   .addArgument({
//     name: 'filename',
//     description: 'File to write to',
//     required: true,
//   })
//   .setHandler((args: handlerArgs) => {
//     const { suffixName, filename } = args;
//     const message = suffixName || 'Default message';
//     Deno.writeTextFileSync(filename, message);
//   }).build();

// const cli = new CLI();
// cli.addCommand(echoWithSubcommand);
// cli.addCommand(writeToFile);
// // deno run --allow-all examples/cliEcho.ts write ./ololo.txt hahaha
// cli.addCommand(addSuffix);

// const args = Deno.args;
// // const args = ['echo', 'suffix', 'world'];
// if (args.length === 0) {
//   console.log('Ты че пидор?');
// } else {
//   cli.parse(args);
// }

// Примеры команд с субкомандами
// deno run --allow-all examples/cliEcho.ts echo hello suffix world
// deno run --allow-all examples/cliEcho.ts write ./ololo.txt hahaha
// deno run --allow-all examples/cliEcho.ts write ./ololo.txt textForWrite suffix world
// deno run --allow-all examples/cliEcho.ts find ./ -name *.ts
// deno run --allow-all examples/cliEcho.ts diff ./ololo.txt ./ololo2.txt
// deno run --allow-all examples/cliEcho.ts diff 5 12
// deno run --allow-all examples/cliEcho.ts diff --help
// deno run --allow-all examples/cliEcho.ts write suffix --help
// const writeCmd = new CLICommandBuilder()
//   .setName('write')
//   .setDescription('Write to file (write <filename> <message>))')
//   .addArgument({
//     name: 'filename',
//     description: 'File to write to',
//     required: true,
//     type: 'filename',
//     side: 'left',
//   })
//   .addArgument({
//     name: 'message',
//     description: 'Message to write',
//     required: true,
//     type: 'data',
//     side: 'right',
//   })
//   .addArgument({
//     name: 'email',
//     description: 'email of writer',
//     required: true,
//     type: 'email',
//     side: 'right',
//   })
//   .setHandler((args: handlerArgs) => {
//     const { filename, message } = args;
//     Deno.writeTextFileSync(filename, message);
//   }).build();

// // const args = ['./ololo.txt', 'write', 'hahaha', 'artp80@gmail.com'];
// const cli = new CLI(defaultValidator);
// cli.addCommand(writeCmd);

// cli.parse(Deno.args);
//email send --to john.doe@example.com --subject "Test email"
// const sendCmd = new CLICommandBuilder()
//   .setName('send')
//   .setDescription('Send email')
//   .addArgument({
//     ...DefaultCommandArgument,
//     name: 'to',
//     description: 'Email to send to',
//     prefixName: '--to',
//     type: 'email',
//   })
//   .addArgument({
//     ...DefaultCommandArgument,
//     name: 'subject',
//     description: 'Subject of email',
//     prefixName: '--subject',
//   })
//   .setHandler(() => {}).build();

// const listCmd = new CLICommandBuilder()
//   .setName('list')
//   .setDescription('List emails')
//   .addArgument({
//     ...DefaultCommandArgument,
//     name: 'from',
//     description: 'Email from',
//     prefixName: '--from',
//   })
//   .setHandler(() => {})
//   .build();

// const cli = new CLI(defaultValidator);
// cli.addCommand(sendCmd);
// cli.addCommand(listCmd);

// let massages: Record<string, string> = {};

// try {
//   cli.parse([
//     'send',
//     '--to',
//     'q@mail.ru',
//     '--subject',
//     'Hello',
//     'list',
//     'b@gmail.com',
//   ]);
//   console.log('------------------');
//   cli.parse([
//     'send',
//     'help',
//   ]);
//   // cli.parse(['list', 'a@mail.ru']);
// } catch (e) {
//   console.log((e as Error).message);
// }

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
const args = ['email', 'send', 'Hello'];
try {
  console.log(cli.parse(args));
} catch (e) {
  console.log((e as Error).message);
}
