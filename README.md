# Matey

Matey - модуль для построения консольных команд с субкомандами, аргументами, опциями и флагами.

Две основные сущности: _Cli_ и _ComandBuilder_. _Cli_ - это класс, который хранит все команды, промежуточное программное обеспечение и обработчики ошибок. _CommandBuilder_ - это класс, который позволяет создавать команды, добавлять их в _Cli_ и настраивать их (опции, флаги, аргументы, субкоманды и т.д.).

Команды могут быть вложенными, что позволяет создавать сложные консольные приложения.

---

## Оглавление

- [Matey](#matey)
- [Оглавление](#оглавление)
- [Использование](#использование)

## Использование

```ts
// main.ts
import { Cli } from '../../mod.ts';
import { commit, generate } from './command.ts';
import { helpMiddleware } from './middleware.ts';

const cli = new Cli();
cli
  .addCommand(commit)
  .addCommand(generate)
  .use(helpMiddleware.pattern, helpMiddleware.handler);

await cli.execute`commit generate --short`;
```

Выглядит классно, верно?
Посмотрим, как устроен _./command.ts_
>Мы используем [shelly](https://deno.land/x/shelly@v0.1.1/mod.ts) для получения результата _git diff_
>А реализацию _generateCommit_ приводить не будем

```ts
// command.ts
// Тут прописать нормальный импорт
import {
  ArgumentType,
  CliCommandBuilder,
  HandlerArgs,
  ICommandArgument,
} from '../../src/mod.ts';
import { generateCommit } from './generateCommit.ts';
import validateFunctions from '../../src/validateFunctions.ts';

// Опишем аргумент-опцию, отвечающую за количество токенов в ответе
const tokenArgument: ICommandArgument = {
  name: '--maxTokens',
  description: 'Maximum number of tokens to generate',
  type: ArgumentType.OPTION,
  valueValidator: validateFunctions.numberValidate,
  optionNameRequired: true,
  required: false,
};

// Аргумент-флаг, если нужен короткий коммит
const shortArgument: ICommandArgument = {
  name: '--short',
  description: 'Generate short commit message',
  type: ArgumentType.FLAG,
  required: false,
};

// Описываем логику работы команды
const generateHandler = async (args: HandlerArgs) => {
  let { '--maxTokens': maxTokens, '--short': short } = args;
  const diff = await (await shelly('git diff')).stdout;
  maxTokens = short ? '20' : maxTokens || '50';
  const commitMessage = await generateCommit(
    diff,
    parseInt(maxTokens as string, 10)!,
  );
  console.log(commitMessage);
};

// Собираем нашу generate команду
export const generate = new CliCommandBuilder()
  .setName('generate')
  .setDescription('Generate commit message based on git diff')
  .addArgument(tokenArgument)
  .addArgument(shortArgument)
  .setHandler(generateHandler)
  .build();

// Пусть generate явялется субкомандой какой-то главной
// команды commit
export const commit = new CliCommandBuilder()
  .setName('commit')
  .setDescription('Commit commands')
  .addSubcommand(generate)
  .setHandler((args) => {})
  .build();
```

Вместо _validateFunctions.numberValidate_ можно использовать свою стрелочную функцию вида _string => boolean_

## Мидлварь

Если перед срабатыванием обработчика команды нужно дополнительно обработать запрос, используйте мидлварь. Если нужно выполнить только мидлварь и не выполнять команду, верните _false_ из обработчика мидлвари.

```ts
//middleware.ts
const helpMiddleware = {
  pattern: / help /,
  handler: (lexemes: ILexeme[]) => {
    const toHelpCmds = lexemes.filter((lexeme) => {
      return lexeme.type === LexemeType.COMMAND;
    }).map((cmd) => cmd.content);
    console.log(`Find commands ${toHelpCmds} `);
    return false;
  },
};
```
