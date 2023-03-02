export class NoCommandNameError extends Error {
  constructor() {
    super('Command name is required');
    this.name = 'NoCommandName';
  }
}

export class NoCommandHandlerError extends Error {
  constructor(cmdName: string) {
    super(`No handler for command ${cmdName}}`);
    this.name = 'NoCommandHandler';
  }
}

export class NoCommandPrefixError extends Error {
  constructor() {
    super('Argument must have prefixName if it is not required');
    this.name = 'NoCommandName';
  }
}
