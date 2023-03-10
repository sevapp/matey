export class TooManySpecError extends Error {
  constructor(specCmd: string[]) {
    super(
      `Only one spec command is allowed. Found: ${
        specCmd.join(', ')
      }`,
    );
    this.name = 'TooManySpecError';
  }
}
