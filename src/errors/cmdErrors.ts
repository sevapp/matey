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

export class InvalidOptionCreateError extends Error {
  constructor() {
    super('Argument-option must have name if it is not required');
    this.name = 'InvalidOptionCreateError';
  }
}
