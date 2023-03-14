export type IValidationFunction = (data: string) => boolean;

export class Validator {
  validators: Map<string, (data: string) => boolean>;

  constructor() {
    this.validators = new Map<string, IValidationFunction>();
  }

  addValidator(type: string, validator: IValidationFunction) {
    this.validators.set(type, validator);
  }

  getValidator(type: string): IValidationFunction {
    const validator = this.validators.get(type);
    if (validator) {
      return validator;
    } else {
      throw new Error(`Validator not found for type ${type}`);
    }
  }
}
