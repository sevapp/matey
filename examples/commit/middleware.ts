import { ILexeme, LexemeType } from '../../src/mod.ts';

export const helpMiddleware = {
  pattern: / help /,
  handler: (lexemes: ILexeme[]) => {
    const toHelpCmds = lexemes.filter((lexeme) => {
      return lexeme.type === LexemeType.COMMAND;
    }).map((cmd) => cmd.content);
    console.log(`Find commands ${toHelpCmds} `);
    return false;
  },
};
