import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
  error: T | null;
}

export function responseCreator<T>(
  status: number,
  message: string,
  data: T | null = null,
  error: T | null = null,
): ApiResponse<T> {
  return {
    status,
    message,
    data,
    error,
  };
}

export function convertTimezone(date: Date) {
  const expirationDate = new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
  const timezoneName = 'Western Indonesia Time';
  const formattedDate =
    expirationDate.replace(/, /g, ' ').replace(/\./g, ':') +
    ` (${timezoneName})`;

  return formattedDate;
}

export function generateRandomString(length: number) {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export function encryptData(data: string) {
  const alg = 'aes-256-ctr';
  let key = process.env.ENCRYPT_KEY;
  key = createHash('sha256').update(String(key)).digest('base64').substring(0, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(alg, key, iv);
  const result = Buffer.concat([iv, cipher.update(data), cipher.final()]);
  return result.toString('base64');
}

export function decryptData(encryptedData: string) {
  const alg = 'aes-256-ctr';
  let key = process.env.ENCRYPT_KEY;
  key = createHash('sha256').update(String(key)).digest('base64').substring(0, 32);
  const data = Buffer.from(encryptedData, 'base64');
  const iv = data.subarray(0, 16);
  const encryptedText = data.subarray(16);
  const decipher = createDecipheriv(alg, key, iv);
  let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}