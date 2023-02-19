import { CLICommandBuilder, handlerArgs } from '../src/command.ts';
import { CLI } from '../src/matey.ts';

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

const addSuffix = new CLICommandBuilder()
  .setName('suffix')
  .setDescription('Add suffix')
  .addArgument({
    name: 'suffixName',
    description: 'Name of suffix to append',
    required: true,
  })
  .setHandler((args: handlerArgs) => {
    const { suffixName, main } = args;
    console.log(`${main} ${suffixName}`);
  }).build();

const writeToFile = new CLICommandBuilder()
  .setName('write')
  .setDescription('Write to file')
  .addArgument({
    name: 'filename',
    description: 'File to write to',
    required: true,
  })
  .addArgument({
    name: 'message',
    description: 'Message to write',
    required: true,
  })
  .setHandler((args: handlerArgs) => {
    const { filename, message } = args;
    Deno.writeTextFileSync(filename, message);
  }).build();

const echoWithSubcommand = new CLICommandBuilder()
  .setName('echo')
  .setDescription('Echo a message')
  .addArgument({
    name: 'message',
    description: 'Message to echo',
    required: true,
  })
  .addSubcommand(addSuffix)
  .setHandler((args: handlerArgs) => {
    const { message } = args;
    console.log(message);
  }).build();

const writeWithSubcommand = new CLICommandBuilder()
  .setName('write')
  .setDescription('Write to file')
  .addSubcommand(addSuffix)
  .addArgument({
    name: 'filename',
    description: 'File to write to',
    required: true,
  })
  .setHandler((args: handlerArgs) => {
    const { suffixName, filename } = args;
    const message = suffixName || 'Default message';
    Deno.writeTextFileSync(filename, message);
  }).build();

const cli = new CLI();
cli.addCommand(echoWithSubcommand);
cli.addCommand(writeToFile);
// deno run --allow-all examples/cliEcho.ts write ./ololo.txt hahaha
cli.addCommand(addSuffix);

const args = Deno.args;
// const args = ['echo', 'suffix', 'world'];
if (args.length === 0) {
  console.log('Ты че пидор?');
} else {
  cli.parse(args);
}

// Примеры команд с субкомандами
// deno run --allow-all examples/cliEcho.ts echo hello suffix world
// deno run --allow-all examples/cliEcho.ts write ./ololo.txt hahaha
// deno run --allow-all examples/cliEcho.ts write ./ololo.txt suffix world
// deno run --allow-all examples/cliEcho.ts find ./ -name *.ts
// deno run --allow-all examples/cliEcho.ts diff ./ololo.txt ./ololo2.txt
// deno run --allow-all examples/cliEcho.ts diff 5 12
