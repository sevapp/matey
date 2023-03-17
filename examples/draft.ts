// const cli = new Cli();
// cli
//   .addCommand(cmdA)
//   .addCommand(cmdB)
//   .addCommand(cmdC)
//   .use(rexExpA, handlerA)
//   .use(rexExpB, handlerB);

// const cmdA = new CliCommandBuilder()
//   .setName('cmdA')
//   .setDescription('cmdA description')
//   .addArgument(argA_1)
//   .addArgument(argA_2)
//   .addSubcommand(subA)
//   .setHandler(handlerA)
//   .build();

// const argA_1 = {
//   name: '--argA_1',
//   description: 'argA_1 description',
//   type: ArgumentType.OPTION,
//   valueValidator: val:string => val.length > 0,
//   optionNameRequired: true,
//   required: false,
// };

// main.ts
import {
  ArgumentType,
  Cli,
  CliCommandBuilder,
  HandlerArgs,
  lex,
} from '../mod.ts';
import validateFunctions from '../src/validateFunctions.ts';

const emailHandler = (options: HandlerArgs) => {
  console.log(
    `Email sent to ${options['--email']} with message: ${
      options['--msg']
    }`,
  );
};

const emailCommand = new CliCommandBuilder()
  .setName('email')
  .setDescription('Send an email to a specified email address')
  .addArgument({
    name: '--email',
    description: 'The email address to send the email to',
    type: ArgumentType.OPTION,
    valueValidator: validateFunctions.emailValidate,
    required: true,
  })
  .addArgument({
    name: '--msg',
    description: 'The message to include in the email',
    type: ArgumentType.OPTION,
    required: true,
  })
  .setHandler(emailHandler)
  .build();

const cli = new Cli();
cli.addCommand(emailCommand);

// console.log(lex('email example@example.com "Hello, World!"', cli));
await cli.execute`email example@example.com "Hello, World!"`;
