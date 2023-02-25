import { Validator } from '../helpers/validator.ts';

const defaultValidator = new Validator();

defaultValidator.addValidFunc(
  'number',
  (data: string) =>
    !isNaN(Number(data))
      ? [true]
      : [false, `${data} is not a number`],
);

defaultValidator.addValidFunc(
  'email',
  (data: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data) ? [true] : [
      false,
      `${data} is not a valid email.
  Example: example@domain.com
  `,
    ],
);
defaultValidator.addValidFunc('filename', (data: string) => {
  const filenameRegex = /^[a-zA-Z0-9-_\\/]+\.[a-zA-Z0-9]+$/;
  return filenameRegex.test(data) ? [true] : [
    false,
    `${data} is not a valid filename. Example: 
    example.txt
    ./src/temp.file.bin`,
  ];
});

defaultValidator.addValidFunc(
  'uuid',
  (data: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(
          data,
        )
      ? [true]
      : [false, `${data} is not a valid UUID`],
);

defaultValidator.addValidFunc(
  'ip',
  (data: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        .test(
          data,
        )
      ? [true]
      : [false, `${data} is not a valid IP address`],
);

defaultValidator.addValidFunc(
  'url',
  (data: string) =>
    /^(ftp|http|https):\/\/[^ "]+$/.test(data) ? [true] : [
      false,
      `${data} is not a valid URL. URL must start with ftp(/http/https)://...`,
    ],
);

defaultValidator.addValidFunc('data', () => {
  return [true, ''];
});

defaultValidator.addValidFunc(
  'phone',
  (data: string) =>
    /^(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/
        .test(
          data,
        )
      ? [true]
      : [false, `${data} is not a valid phone number`],
);

defaultValidator.addValidFunc(
  'time',
  (data: string) =>
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(data)
      ? [true]
      : [false, `${data} is not a valid time. Example: 15:45`],
);

export { defaultValidator };