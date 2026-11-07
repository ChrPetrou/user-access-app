import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  if (expected.length !== KEY_LENGTH) return false;

  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), KEY_LENGTH);

  return timingSafeEqual(actual, expected);
};
