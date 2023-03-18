<!-- # Matey

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
``` -->

# Matey

Matey - модуль для построения обработчиков консольных команд с субкомандами, аргументами, опциями и флагами.

Matey содержит две основные сущности: _Cli_ и _ComandBuilder_. _Cli_ - это класс, который хранит все команды, промежуточное программное обеспечение. _CommandBuilder_ - это класс, который позволяет создавать команды, добавлять их в _Cli_ и настраивать их (опции, флаги, аргументы, субкоманды и т.д.).

Команды могут быть вложенными, что позволяет создавать сложные консольные приложения.

> Планируется поддержка диалогового ввода-вывода.

---

## Оглавление

- [Matey](#matey)
  - [Оглавление](#оглавление)
  - [Использование](#использование)
    - [Схематичный пример](#схематичный-пример)
    - [Пример использования (отправка email)](#пример-использования-отправка-email)
    - [Пример практический](#пример-практический)
  - [Middleware](#middleware)

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

### Пример использования (отправка email)

- Опишем команду и ее аргументы
  ```ts
  import {
    ArgumentType,
    Cli,
    CliCommandBuilder,
    HandlerArgs,
    validateFunctions,
  } from '../mod.ts';

  const emailCommand = new CliCommandBuilder()
    .setName('email')
    .setDescription('Send an email to a specified email address')
    .addArgument({
      name: '--email',
      description: 'The email address to send the email to',
      type: ArgumentType.OPTION,
      valueValidator: validateFunctions.emailValidate,
      required: true,
    })
    .addArgument({
      name: '--msg',
      description: 'The message to include in the email',
      type: ArgumentType.OPTION,
      required: true,
    })
    .setHandler(emailHandler)
    .build();
  ```

- Далее продумаем обработку полученных аргументов

  Пусть это будет "отправка" сообщения по адресу, указанному в аргументе _--email_

  **Описать обработчик лучше в отдельном файле или до определения команды**
  ```ts
  const emailHandler = (options: HandlerArgs) => {
    console.log(
      `Email sent to ${options['--email']} with message: ${
        options['--msg']
      }`,
    );
  };
  ```
- Создадим экземпляр _Cli_ и добавим в него команду
  ```ts
  const cli = new Cli();
  cli.addCommand(emailCommand);

  await cli.execute`email example@example.com "Hello, World!"`;
  // Выведет в консоль: Email sent to example@example.com with message: "Hello, World!"
  ```

### Пример практический

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

## Middleware

Если перед срабатыванием обработчика команды нужно дополнительно обработать запрос, используйте middleware. Если нужно выполнить только middleware и не выполнять команду, верните _false_ из обработчика middleware.

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
