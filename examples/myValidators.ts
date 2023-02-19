import { Validator } from '../helpers/validator.ts';

const validator = new Validator();

validator.addValidator(
  'number',
  (data: string) => !isNaN(Number(data)),
);
validator.addValidator(
  'email',
  (data: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data),
);
validator.addValidator('filename', (data: string) => {
  const filenameRegex = /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9]+$/;
  return filenameRegex.test(data);
});

export { validator };
