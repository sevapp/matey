# Matey

Matey - модуль для построения консольных команд с субкомандами, аргументами, опциями и флагами.

Две основные сущности: _Cli_ и _ComandBuilder_. _Cli_ - это класс, который хранит все команды, промежуточное программное обеспечение и обработчики ошибок. _CommandBuilder_ - это класс, который позволяет создавать команды, добавлять их в _Cli_ и настраивать их (опции, флаги, аргументы, субкоманды и т.д.).

Команды могут быть вложенными, что позволяет создавать сложные консольные приложения.

---

## Оглавление

- [Matey](#matey)
  - [Оглавление](#оглавление)
  - [Использование (кратко)](#использование-кратко)
  - [Пример](#пример)
  - [Мидлварь](#мидлварь)

## Использование (кратко)

Опишите аргументы в виде
[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&duration=900&pause=20&multiline=true&width=605&height=200&lines=const+argA_1+%3D+%7B;%E3%85%A4%E3%85%A4name%3A+'--argA_1'%2C;%E3%85%A4%E3%85%A4description%3A+'argA_1+description'%2C;%E3%85%A4%E3%85%A4type%3A+ArgumentType.OPTION%2C;%E3%85%A4%E3%85%A4valueValidator%3A+(val%3Astring)+%3D%3E+val.length+%3E+10%2C;%E3%85%A4%E3%85%A4optionNameRequired%3A+true%2C;+%E3%85%A4%E3%85%A4required%3A+false%2C;%7D)](https://git.io/typing-svg)

Опишите команду в виде
[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&duration=900&pause=20&multiline=true&width=605&height=200&lines=const+cmdA+%3D+new+CommandBuilder();%E3%85%A4%E3%85%A4.setName('commandName');%E3%85%A4%E3%85%A4.setDescription('commandDescription');%E3%85%A4%E3%85%A4.addArgument(argA_1);%E3%85%A4%E3%85%A4.addArgument(argA_2);%E3%85%A4%E3%85%A4.setHandler((args%3A+HandlerArgs)+%3D%3E+{;+%E3%85%A4%E3%85%A4console.log(args);%7D);)](https://git.io/typing-svg)

Создайте свой cli и подключите к нему команды и мидлвари
[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&duration=900&pause=20&multiline=true&width=605&height=200&lines=const+cli+%3D+new+Cli();%E3%85%A4%E3%85%A4.addCommand(cmdA);%E3%85%A4%E3%85%A4.addCommand(cmdB);%E3%85%A4%E3%85%A4.use(rexExpA,handlerA);%E3%85%A4%E3%85%A4.use(rexExpA,handlerA);)](https://git.io/typing-svg)

## Пример

Пусть мы хотим получать коммит-сообщение по изменениям в проекте командой вида _commit generate_ _[--maxTokens] \<number\> [--short]_

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
