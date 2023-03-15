export type IValidationFunction = (data: string) => boolean;

export class Validator {
  validators: Map<string, (data: string) => boolean>;

  constructor() {
    this.validators = new Map<string, IValidationFunction>();
  }

  /**
   * Добавляет функцию валидации для указанного типа данных.
   * @param type Тип данных (Может быть элементом перечисления defaultValueType)
   * @param validator Функция валидации данных.
   */
  addValidator(type: string, validator: IValidationFunction) {
    this.validators.set(type, validator);
  }

  /**
   * Возвращает функцию валидации для указанного типа данных.
   * @param type Тип данных (Может быть элементом перечисления defaultValueType)
   * @returns Функция валидации данных.
   * @throws Ошибка, если не найдена функция валидации для указанного типа данных.
   */
  getValidator(type: string): IValidationFunction {
    const validator = this.validators.get(type);
    if (validator) {
      return validator;
    } else {
      throw new Error(`Validator not found for type ${type}`);
    }
  }
}
