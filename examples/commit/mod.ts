import { Cli } from '../../mod.ts';
import { commit, generate } from './command.ts';
import { helpMiddleware } from './middleware.ts';

const cli = new Cli();
cli
  .addCommand(commit)
  .addCommand(generate)
  .use(helpMiddleware.pattern, helpMiddleware.handler);

try {
  await cli
    .execute`commit generate  --short`;
} catch (e) {
  console.log(e);
}
