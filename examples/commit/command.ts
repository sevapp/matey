import { shelly } from 'https://deno.land/x/shelly/mod.ts';
import {
  ArgumentType,
  CliCommandBuilder,
  HandlerArgs,
  ICommandArgument,
} from '../../src/mod.ts';
import { generateCommit } from './generateCommit.ts';

const modelArgument: ICommandArgument = {
  name: '--model',
  description: 'OpenAI model to use for generating commit message',
  type: ArgumentType.OPTION,
  valueValidator: (data: string) => ['gpt-3.5-turbo'].includes(data),
  optionNameRequired: true,
  required: false,
};

const tokenArgument: ICommandArgument = {
  name: '--maxTokens',
  description: 'Maximum number of tokens to generate',
  type: ArgumentType.OPTION,
  valueValidator: (data: string) => !isNaN(Number(data)),
  optionNameRequired: true,
  required: false,
};

const shortArgument: ICommandArgument = {
  name: '--short',
  description: 'Generate short commit message',
  type: ArgumentType.FLAG,
  required: false,
};

const generateHandler = async (args: HandlerArgs) => {
  if (
    args !== null
  ) {
    let {
      '--model': model,
      '--maxTokens': maxTokens,
      '--short': short,
    } = args;
    const diff = await (await shelly('git diff')).stdout;
    maxTokens = short ? '20' : maxTokens || '50';
    model = model ? model : 'gpt-3.5-turbo';
    const commitMessage = await generateCommit(
      diff,
      model as string,
      parseInt(maxTokens as string, 10)!,
    );
    console.log(commitMessage);
  }
};

export const generate = new CliCommandBuilder()
  .setName('generate')
  .setDescription('Generate commit message based on git diff')
  .addArgument(modelArgument)
  .addArgument(tokenArgument)
  .addArgument(shortArgument)
  .setHandler(generateHandler).build();

export const commit = new CliCommandBuilder()
  .setName('commit')
  .setDescription('Commit commands')
  .addSubcommand(generate)
  .setHandler((args) => {}).build();
