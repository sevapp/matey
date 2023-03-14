import { Validator } from './mod.ts';

const defaultValidator = new Validator();

export enum defaultValueType {
  DATA = 'DATA',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER',
  UUID = 'UUID',
  IP = 'IP',
  URL = 'URL',
  PHONE = 'PHONE',
  TIME = 'TIME',
  FILENAME = 'FILENAME',
}

defaultValidator.addValidator(
  defaultValueType.NUMBER,
  (data: string) => !isNaN(Number(data)),
);

defaultValidator.addValidator(
  defaultValueType.EMAIL,
  (data: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data),
);

defaultValidator.addValidator(
  defaultValueType.FILENAME,
  (data: string) => {
    const filenameRegex = /^[a-zA-Z0-9-_\\/]+\.[a-zA-Z0-9]+$/;
    return filenameRegex.test(data);
  },
);

defaultValidator.addValidator(
  defaultValueType.UUID,
  (data: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(
        data,
      ),
);

defaultValidator.addValidator(
  defaultValueType.IP,
  (data: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      .test(
        data,
      ),
);

defaultValidator.addValidator(
  defaultValueType.URL,
  (data: string) => /^(ftp|http|https):\/\/[^ "]+$/.test(data),
);

defaultValidator.addValidator(defaultValueType.DATA, () => {
  return true;
});

defaultValidator.addValidator(
  defaultValueType.PHONE,
  (data: string) =>
    /^(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/
      .test(
        data,
      ),
);

defaultValidator.addValidator(
  defaultValueType.TIME,
  (data: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(data),
);

export default defaultValidator;
