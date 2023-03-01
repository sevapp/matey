export class NoValidatorError extends Error {
  constructor(type: string) {
    super(`No validator found for type ${type}`);
    this.name = 'NoValidatorError';
  }
}
