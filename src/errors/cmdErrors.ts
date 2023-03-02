export class NoCommandName extends Error {
  constructor() {
    super('Command name is required');
    this.name = 'NoCommandName';
  }
}

export class NoCommandHandler extends Error {
  constructor(cmdName: string) {
    super(`No handler for command ${cmdName}}`);
    this.name = 'NoCommandHandler';
  }
}

export class NoCommandPrefix extends Error {
  constructor() {
    super('Argument must have prefixName if it is not required');
    this.name = 'NoCommandName';
  }
}
