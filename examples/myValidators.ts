import { Validator } from '../helpers/validator.ts';

const defaultValidator = new Validator();

// defaultValidator.addValidFunc(
//   'number',
//   (data: string) => !isNaN(Number(data)),
// );
// defaultValidator.addValidFunc(
//   'email',
//   (data: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data),
// );
// defaultValidator.addValidFunc('filename', (data: string) => {
//   const filenameRegex = /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9]+$/;
//   return filenameRegex.test(data);
// });

export { defaultValidator };
