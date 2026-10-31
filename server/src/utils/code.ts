import { JOIN_CODE_ALPHABET } from '../config/constants';

export function generateJoinCode(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * JOIN_CODE_ALPHABET.length);
    result += JOIN_CODE_ALPHABET[randomIndex];
  }
  return result;
}
