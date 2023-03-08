import { defaultValueType } from './../src/Argument.ts';
import { CliCommandBuilder } from '../src/CliCommandBuilder.ts';
import { ArgumentType } from '../src/Argument.ts';
const mail: Record<string, string[]> = {};

enum myValueTypes {
  aaa,
  bbb,
  ccc,
}

const sendCmd = new CliCommandBuilder<myValueTypes>()
  .setName('send')
  .setDescription('Send @msg to @to')
  .addArgument({
    name: 'to',
    description: 'Recipient email',
    type: ArgumentType.OPTION,
    valueType: myValueTypes.aaa,
    optionNameRequired: true,
    required: true,
  })
  .addArgument({
    name: 'msg',
    description: 'Message to send',
    type: ArgumentType.OPTION,
    valueType: defaultValueType.DATA,
    required: true,
  })
  .addArgument({
    name: 'noResponse',
    description: 'Write  if you don\'t want to get response',
    type: ArgumentType.FLAG,
    required: false,
  })
  .build();
