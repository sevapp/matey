type ValidationFunction = (data: string) => [boolean, string?];
import { ArgumentValidError } from '../src/errors.ts';
export class Validator {
  private validators: { [key: string]: ValidationFunction } = {};

  public addValidFunc(
    type: string,
    validator: ValidationFunction,
  ): void {
    this.validators[type] = validator;
  }

  public validate(
    type: string | undefined,
    data: string,
  ): [boolean, string?] {
    if (!type) {
      throw new ArgumentValidError(
        `No validator found for type ${type}`,
      );
    }
    const validator = this.validators[type];
    if (!validator) {
      throw new Error(`No validator found for type ${type}`);
    }
    return validator(data);
  }
}
