import { ILexeme } from './../src/Lexer.ts';

import { ArgumentType, defaultValueType } from './../src/Argument.ts';
import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { CliCommandBuilder } from '../src/CliCommandBuilder.ts';
import { Cli, IMiddleware } from '../src/Tool.ts';

import * as cliErrors from '../src/errors/cliErrors.ts';
import { lex, LexemeType } from '../src/Lexer.ts';

enum myValueTypes {
  myUUID,
  myEmail,
  myPassword,
}

const cli = new Cli<defaultValueType>();

cli.addCommand(
  new CliCommandBuilder<defaultValueType>()
    .setName('email')
    .setDescription('Email commands')
    .addSubcommand(
      new CliCommandBuilder<defaultValueType>()
        .setName('send')
        .setDescription('Send @msg to @to')
        .addArgument({
          name: '--to',
          description: 'Recipient email',
          type: ArgumentType.OPTION,
          valueType: defaultValueType.EMAIL,
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
          name: '--noResponse',
          description: 'Write  if you don\'t want to get response',
          type: ArgumentType.FLAG,
          required: false,
        })
        .setHandler((args) => {})
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
  cli
    .execute`email send --to --msg Hello`;
} catch (e) {
  console.log(e);
}
