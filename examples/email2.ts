import { Option } from '../src/Argument.ts';
import { CliCommandBuilder } from '../src/CliCommandBuilder.ts';
import { ArgumentType, ValueType } from '../src/Argument.ts';
const mail: Record<string, string[]> = {};

const sendCmd = new CliCommandBuilder()
  .setName('send')
  .setDescription('Send @msg to @to')
  .addArgument({
    name: 'to',
    description: 'Recipient email',
    type: ArgumentType.OPTION,
    optionNameRequired: true,
    required: true,
  })
  .addArgument({
    name: 'msg',
    description: 'Message to send',
    type: ArgumentType.OPTION,
    required: true,
  })
  .addArgument({
    name: 'noResponse',
    description: 'Write  if you don\'t want to get response',
    type: ArgumentType.FLAG,
    required: false,
  })
  .build();
