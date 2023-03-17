# Matey

Matey - модуль для построения консольных команд с субкомандами, аргументами, опциями и флагами.

Две основные сущности: _Cli_ и _ComandBuilder_. _Cli_ - это класс, который хранит все команды, промежуточное программное обеспечение. _CommandBuilder_ - это класс, который позволяет создавать команды, добавлять их в _Cli_ и настраивать их (опции, флаги, аргументы, субкоманды и т.д.).

Команды могут быть вложенными, что позволяет создавать сложные консольные приложения.

> Планируется поддержка диалогового интерфейса.

---

## Оглавление

- [Matey](#matey)
  - [Оглавление](#оглавление)
  - [Использование](#использование)
    - [Схематичный пример](#схематичный-пример)
    - [Рабочий простой пример](#рабочий-простой-пример)
  - [Пример](#пример)
  - [Мидлварь](#мидлварь)

## Использование

### Схематичный пример

> 🔧 Описывайте аргументы-**опции**(которые хранят какое-то полезное значение) каждой команды в виде

```ts
const argA_1: ICommandArgument = {
  name: 'argA_1',
  description: 'argA_1 description',
  type: ArgumentType.OPTION,
  valueValidator: (val: string) => val.length > 0,
  optionNameRequired: true,
  required: true,
};
```

> 🚩 Описывайте аргументы-**флаги**(наличие которых само по себе влияет на логику обработчика) каждой команды в виде

```ts
const argA_2: ICommandArgument = {
  name: 'argA_2',
  description: 'argA_2 description',
  type: ArgumentType.FLAG,
  required: false,
};
```

> ⚡ Описывайте команду в виде

```ts
const cmdA = new CliCommandBuilder()
  .setName('cmdA')
  .setDescription('cmdA description')
  .addArgument(argA_1)
  .addArgument(argA_2)
  .addSubcommand(subA)
  .setHandler(handlerA)
  .build();
```

> 🛡️ Создайте свой cli и подключите к нему команды и мидлвари

```ts
const cli = new Cli();
cli
  .addCommand(cmdA)
  .addCommand(cmdB)
  .addCommand(cmdC)
  .use(rexExpA, handlerA)
  .use(rexExpB, handlerB);
```

> 🚀 Выполните команду

```ts
cli.execute`cmdA --argA_1 "Hello" --argA_2 150`;
```

### Рабочий простой пример

## Пример

Пусть мы хотим получать коммит-сообщение по изменениям в проекте командой вида _commit generate_ _[--maxTokens] \<number\> [--short]_

```ts
// main.ts
//ТУТ ПРОПИСАТЬ НОРМАЛЬНЫЙ ИМПОРТ
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
import {
  ArgumentType,
  CliCommandBuilder,
  HandlerArgs,
  ICommandArgument,
} from 'https://deno.land/x/matey/mod.ts';
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
