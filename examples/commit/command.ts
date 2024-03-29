import { shelly } from 'https://deno.land/x/shelly/mod.ts';
import {
  ArgumentType,
  CliCommandBuilder,
  HandlerArgs,
  ICommandArgument,
  validateFunctions,
} from '../../src/mod.ts';
import { generateCommit } from './generateCommit.ts';

const tokenArgument: ICommandArgument = {
  name: '--maxTokens',
  description: 'Maximum number of tokens to generate',
  type: ArgumentType.OPTION,
  valueValidator: validateFunctions.numberValidate,
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
  let {
    '--maxTokens': maxTokens,
    '--short': short,
  } = args;
  const diff = await (await shelly('git diff')).stdout;
  maxTokens = short ? '20' : maxTokens || '50';
  const commitMessage = await generateCommit(
    diff,
    parseInt(maxTokens as string, 10)!,
  );
  console.log(commitMessage);
};

export const generate = new CliCommandBuilder()
  .setName('generate')
  .setDescription('Generate commit message based on git diff')
  .addArgument(tokenArgument)
  .addArgument(shortArgument)
  .setHandler(generateHandler).build();

export const commit = new CliCommandBuilder()
  .setName('commit')
  .setDescription('Commit commands')
  .addSubcommand(generate)
  .setHandler((args) => {}).build();
