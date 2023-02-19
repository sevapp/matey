type ValidationFunction = (data: string) => boolean;

export class Validator {
  private validators: { [key: string]: ValidationFunction } = {};

  public addValidator(
    type: string,
    validator: ValidationFunction,
  ): void {
    this.validators[type] = validator;
  }

  public validate(type: string, data: string): boolean {
    const validator = this.validators[type];
    if (!validator) {
      throw new Error(`No validator found for type ${type}`);
    }
    return validator(data);
  }
}
