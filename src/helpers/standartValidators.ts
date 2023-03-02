import { Validator } from './validator.ts';

const defaultValidator = new Validator();

defaultValidator.addValidator(
  'number',
  (data: string) => !isNaN(Number(data)),
);

defaultValidator.addValidator(
  'email',
  (data: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data),
  ['person@domain.com', 'deno@deno.com'],
);
defaultValidator.addValidator('filename', (data: string) => {
  const filenameRegex = /^[a-zA-Z0-9-_\\/]+\.[a-zA-Z0-9]+$/;
  return filenameRegex.test(data);
}, ['example.txt', 'user/folder/image.jpg']);

defaultValidator.addValidator(
  'uuid',
  (data: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(
        data,
      ),
  [
    'd41d8cd9-8f00-3204-a980-0998ecf8427e',
    '57daa80e-51d4-4e24-8e4c-94a4a960e0a1',
  ],
);

defaultValidator.addValidator(
  'ip',
  (data: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      .test(
        data,
      ),
  ['192.168.0.1', '127.0.0.1'],
);

defaultValidator.addValidator(
  'url',
  (data: string) => /^(ftp|http|https):\/\/[^ "]+$/.test(data),
  ['http://www.example.com', 'https://www.example.com'],
);

defaultValidator.addValidator('data', () => {
  return true;
}, ['2022-03-01', '2022-03-02']);

defaultValidator.addValidator(
  'phone',
  (data: string) =>
    /^(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/
      .test(
        data,
      ),
  ['+1-202-555-0123', '555-1234'],
);

defaultValidator.addValidator(
  'time',
  (data: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(data),
  ['12:00', '23:59'],
);

export default defaultValidator;
