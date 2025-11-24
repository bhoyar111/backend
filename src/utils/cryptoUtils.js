import CryptoJS from "crypto-js";
import { get } from "../../config/Config.js";

const SECRET_KEY = get(process.env.NODE_ENV).CRYPTO_SECRET_KEY;
const ADD_CRYPTO = process.env.ADD_CRYPTO === "true";

export const encryptData = (data) => {
  if (!ADD_CRYPTO) return data; // No encryption
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
  return ciphertext;
};

export const decryptData = (ciphertext) => {
  if (!ADD_CRYPTO) return ciphertext; // No decryption
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

export const isCryptoEnabled = () => ADD_CRYPTO;

export const decryption_Data = (data) => {
  if (data) {
    const decPassword = SECRET_KEY;
    const conversionDecryptOutput = CryptoJS.AES.decrypt(
      data.trim(),
      decPassword.trim()
    ).toString(CryptoJS.enc.Utf8);
    return conversionDecryptOutput;
  }
};
