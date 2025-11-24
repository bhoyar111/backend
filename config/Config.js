import dotenv from "dotenv";
import path from "path";

const currentEnv = process.env.NODE_ENV;
const envFile = path.resolve(process.cwd(), `env/.env.${currentEnv}`);
dotenv.config({ path: envFile });

const config = {
  development: {
    DB: {
      HOST: process.env.DB_HOST,
      PORT: process.env.DB_PORT,
      DATABASE: process.env.DB_DATABASE,
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
    },
    PORT: process.env.PORT,
    BASE_PATH: process.env.BASE_PATH,
    CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY,
    OTP_EXPIRATION: process.env.OTP_EXPIRATION,
    SEND_ATTEMPTS: process.env.SEND_ATTEMPTS,
    OTP_TRY_AFTER: process.env.OTP_TRY_AFTER,
    OTP_LIMIT_EXCEED_WITHIN: process.env.OTP_LIMIT_EXCEED_WITHIN,
    SENDEMAIL: {
      HOST: process.env.EMAIL_HOST,
      PORT: parseInt(process.env.EMAIL_PORT),
      SECURE: process.env.EMAIL_PORT === "465",
      AUTH: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      FROM: process.env.EMAIL_FROM,
    },
    CLIENT_BASE_PATH: process.env.CLIENT_BASE_PATH,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    MAXIMUM_ATTEMPTS: process.env.MAXIMUM_ATTEMPTS,
  },
  staging: {
    DB: {
      HOST: process.env.DB_HOST,
      PORT: process.env.DB_PORT,
      DATABASE: process.env.DB_DATABASE,
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
    },
    PORT: process.env.PORT,
    BASE_PATH: process.env.BASE_PATH,
    CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY,
    OTP_EXPIRATION: process.env.OTP_EXPIRATION,
    SEND_ATTEMPTS: process.env.SEND_ATTEMPTS,
    OTP_TRY_AFTER: process.env.OTP_TRY_AFTER,
    OTP_LIMIT_EXCEED_WITHIN: process.env.OTP_LIMIT_EXCEED_WITHIN,
    SENDEMAIL: {
      HOST: process.env.EMAIL_HOST,
      PORT: parseInt(process.env.EMAIL_PORT),
      SECURE: process.env.EMAIL_PORT === "465",
      AUTH: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      FROM: process.env.EMAIL_FROM,
    },
    CLIENT_BASE_PATH: process.env.CLIENT_BASE_PATH,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    MAXIMUM_ATTEMPTS: process.env.MAXIMUM_ATTEMPTS,
  },
  production: {
    DB: {
      HOST: process.env.DB_HOST,
      PORT: process.env.DB_PORT,
      DATABASE: process.env.DB_DATABASE,
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
      SENDEMAIL: {
        HOST: process.env.EMAIL_HOST,
        PORT: parseInt(process.env.EMAIL_PORT),
        SECURE: process.env.EMAIL_PORT === "465",
        AUTH: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        FROM: process.env.EMAIL_FROM,
      },
      CLIENT_BASE_PATH: process.env.CLIENT_BASE_PATH,
    },
    PORT: process.env.PORT,
    BASE_PATH: process.env.BASE_PATH,
    CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY,
    OTP_EXPIRATION: process.env.OTP_EXPIRATION,
    SEND_ATTEMPTS: process.env.SEND_ATTEMPTS,
    OTP_TRY_AFTER: process.env.OTP_TRY_AFTER,
    OTP_LIMIT_EXCEED_WITHIN: process.env.OTP_LIMIT_EXCEED_WITHIN,
    SENDEMAIL: {
      HOST: process.env.EMAIL_HOST,
      PORT: parseInt(process.env.EMAIL_PORT),
      SECURE: process.env.EMAIL_PORT === "465",
      AUTH: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      FROM: process.env.EMAIL_FROM,
    },
    CLIENT_BASE_PATH: process.env.CLIENT_BASE_PATH,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    MAXIMUM_ATTEMPTS: process.env.MAXIMUM_ATTEMPTS,
  },
};

export const get = (env) => config[env];
