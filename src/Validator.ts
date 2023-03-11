import { defaultValueType } from './Argument.ts';
import * as errors from './errors/validationErrors.ts';

type ValidatorsMap<valueType> = {
  [key in keyof valueType]: ValidationFunction<valueType>;
};

type ValidationFunction<valueType> = (
  data: keyof valueType,
) => boolean;

export class Validator<
  valueType extends Record<string, any> = typeof defaultValueType,
> {
  private validators: ValidatorsMap<valueType> = {} as ValidatorsMap<
    valueType
  >;

  constructor(enumType?: valueType) {
    if (enumType) {
      this.validators = {} as ValidatorsMap<valueType>;
      for (const key in enumType) {
        this.validators[enumType[key]] = () => true;
      }
    }
  }

  public addValidator(
    type: keyof valueType,
    validator: ValidationFunction<valueType>,
  ): void {
    this.validators[type] = validator;
  }

  public validate(
    type: valueType[keyof valueType],
    data: string,
  ): boolean {
    const typeKey = Object.keys(this.validators).find(
      (key) => this.validators[key as keyof valueType] === type,
    );

    if (!typeKey) {
      throw new errors.NoValidatorError(
        `No validator found for type ${type}`,
      );
    }

    const validFunc = this.validators[typeKey];

    return validFunc(data);
  }
}
