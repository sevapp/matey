import { Validator } from '../helpers/validator.ts';

const defaultValidator = new Validator();

defaultValidator.addValidator(
  'number',
  (data: string) => !isNaN(Number(data)),
);

defaultValidator.addValidator(
  'email',
  (data: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data),
  ['ololo@gmail.com', 'trololo@gmail.com'],
);
defaultValidator.addValidator('filename', (data: string) => {
  const filenameRegex = /^[a-zA-Z0-9-_\\/]+\.[a-zA-Z0-9]+$/;
  return filenameRegex.test(data);
});

defaultValidator.addValidator(
  'uuid',
  (data: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(
        data,
      ),
);

defaultValidator.addValidator(
  'ip',
  (data: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      .test(
        data,
      ),
);

defaultValidator.addValidator(
  'url',
  (data: string) => /^(ftp|http|https):\/\/[^ "]+$/.test(data),
);

defaultValidator.addValidator('data', () => {
  return true;
});

defaultValidator.addValidator(
  'phone',
  (data: string) =>
    /^(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/
      .test(
        data,
      ),
);

defaultValidator.addValidator(
  'time',
  (data: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(data),
);

export { defaultValidator };
