import { NoValidatorError } from '../errors/validationErrors.ts';

type ValidationFunction = (data: string) => boolean;
export type valueExamples = string[];

export class Validator {
  private validators: {
    [key: string]: ValidationFunction | [
      ValidationFunction,
      valueExamples,
    ];
  } = {};

  public addValidator(
    type: string,
    validator: ValidationFunction,
    examples?: valueExamples,
  ): void {
    if (!examples) {
      this.validators[type] = validator, examples;
    } else this.validators[type] = [validator, examples];
  }

  public validate(
    type: string,
    data: string,
  ): boolean {
    if (!(type in this.validators)) {
      throw new NoValidatorError(
        `No validator found for type ${type}`,
      );
    }
    const validator = this.validators[type];
    if (Array.isArray(validator)) {
      return validator[0](data);
    }
    return validator(data);
  }

  public getExamples(type: string): valueExamples | null {
    if (!(type in this.validators)) {
      throw new NoValidatorError(type);
    }
    const validator = this.validators[type];
    if (Array.isArray(validator)) {
      return validator[1];
    }
    return null;
  }
}