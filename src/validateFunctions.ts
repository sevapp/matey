// import { Validator } from './mod.ts';

// const defaultValidator = new Validator();

// export enum DefaultValueType {
//   DATA = 'DATA',
//   EMAIL = 'EMAIL',
//   NUMBER = 'NUMBER',
//   UUID = 'UUID',
//   IP = 'IP',
//   URL = 'URL',
//   PHONE = 'PHONE',
//   TIME = 'TIME',
//   FILENAME = 'FILENAME',
// }

function emailValidate(data: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(data);
}

function numberValidate(data: string): boolean {
  return !isNaN(Number(data));
}

function uuidValidate(data: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(data);
}

function ipValidate(data: string): boolean {
  const ipRegex =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(data);
}

function urlValidate(data: string): boolean {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(data);
}

function phoneValidate(data: string): boolean {
  const phoneRegex = /^(\+?)(\d{2})?(\d{3})(\d{3})(\d{2})(\d{2})$/;
  return phoneRegex.test(data);
}

function timeValidate(data: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(data);
}

function filenameValidate(data: string): boolean {
  const filenameRegex = /^[a-zA-Z0-9-_\\/]+\.[a-zA-Z0-9]+$/;
  return filenameRegex.test(data);
}

export const validateFunctions = {
  emailValidate,
  numberValidate,
  uuidValidate,
  ipValidate,
  urlValidate,
  phoneValidate,
  timeValidate,
  filenameValidate,
};
