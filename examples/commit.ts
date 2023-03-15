import {
  ArgumentType,
  Cli,
  CliCommandBuilder,
  ILexeme,
  IMiddleware,
  LexemeType,
} from '../src/mod.ts';
import { shelly } from 'https://deno.land/x/shelly/mod.ts';
import { generateCommit } from './generateCommit.ts';
const cli = new Cli();

cli.addCommand(
  new CliCommandBuilder()
    .setName('commit')
    .setDescription('Commit commands')
    .addSubcommand(
      new CliCommandBuilder()
        .setName('generate')
        .setDescription('Generate commit message based on git diff')
        .addArgument({
          name: '--model',
          description:
            'OpenAI model to use for generating commit message',
          type: ArgumentType.OPTION,
          valueValidator: (data: string) =>
            ['gpt-3.5-turbo'].includes(data),
          optionNameRequired: true,
          required: true,
        })
        .addArgument({
          name: '--maxTokens',
          description: 'Maximum number of tokens to generate',
          type: ArgumentType.OPTION,
          valueValidator: (data: string) => !isNaN(Number(data)),
          optionNameRequired: true,
          required: true,
        })
        .addArgument({
          name: '--short',
          description: 'Generate short commit message',
          type: ArgumentType.FLAG,
          required: false,
        })
        .setHandler(async (args) => {
          if (
            args !== null && args['--model'] && args['--maxTokens']
          ) {
            let {
              '--model': model,
              '--maxTokens': maxTokens,
              '--short': short,
            } = args;
            const diff = await (await shelly('git diff')).stdout;
            if (short) {
              maxTokens = '10';
            }
            const commitMessage = await generateCommit(
              diff,
              model as string,
              parseInt(maxTokens as string, 10)!,
            );
            console.log(commitMessage);
          }
        })
        .build(),
    )
    .setHandler((args) => {})
    .build(),
);

const middleware: IMiddleware = {
  pattern: / help /,
  handler: (lexemes: ILexeme[]) => {
    const toHelpCmds = lexemes.filter((lexeme) => {
      return lexeme.type === LexemeType.COMMAND;
    }).map((cmd) => cmd.content);
    console.log(`Find commands ${toHelpCmds} `);
    return false;
  },
};

cli.use(middleware);

try {
  // await cli
  //   .execute`commit generate  --model gpt-3.5-turbo --maxTokens 50 --short`;
  // cli.execute`commit generate help`;
  await cli
    .execute`commit generate  --model gpt-3.5-turbo --maxTokens 50 --short`;
} catch (e) {
  console.log(e);
}
