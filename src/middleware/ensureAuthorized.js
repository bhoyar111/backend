import jwt from "jsonwebtoken";
import { decryptData, isCryptoEnabled } from "../utils/cryptoUtils.js";
import { sendError } from "../utils/customeResponse.js";

const jwtKey = process.env.JWT_KEY;

function handleDecryption(fieldName, section, sectionName, res) {
  try {
    const decrypted = decryptData(section[fieldName]);
    if (!decrypted || typeof decrypted !== "object") {
      return sendError(res, 400, `Invalid encrypted ${sectionName} format`);
    }
    return decrypted;
  } catch (err) {
    return sendError(res, 400, err);
  }
}

export const ensureAuthorized = (req, res, next) => {
  try {
    if (isCryptoEnabled()) {
      // Decrypt Body
      if (req.body?.encryptData) {
        if (Object.keys(req.body).length > 1) {
          return sendError(res, 400, "Send only 'encryptData' key in body");
        }
        const decrypted = handleDecryption(
          "encryptData",
          req.body,
          "body",
          res
        );
        if (!decrypted) return;
        req.body = decrypted;
      }

      // Decrypt Query
      if (req.query?.encryptData) {
        const decrypted = handleDecryption(
          "encryptData",
          req.query,
          "query",
          res
        );
        if (!decrypted) return;
        req.query = decrypted;
      }

      // Decrypt Params
      if (req.params?.encryptData) {
        const decrypted = handleDecryption(
          "encryptData",
          req.params,
          "params",
          res
        );
        if (!decrypted) return;
        req.params = decrypted;
      }
    }

    // Skip token check for public routes
    const allowedPaths = [
      "/auth/sign-up",
      "/auth/login",
      "/auth/logout",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/sent-otp",
      "/auth/vertify-otp",
      "/auth/forgot-password-otp",
      "/auth/reset-password-otp",
      "/auth/verify-forgotpassword-otp",
      "/auth/login-with-google",
      "/auth/login-with-apple",

    ];
    if (allowedPaths.includes(req.path)) return next();

    // Check JWT Token
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
      return sendError(res, 403, "Token is missing or malformed");
    }

    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) return sendError(res, 401, "Unauthorized: Invalid token");
      req.user = decoded?.user;
      next();
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


export const verifyRole = (validRoles) => {
  return (req, res, next) => {
      const role = req?.user?.role
      if (validRoles.includes(role)) {
          next()
      } else {
          return sendError(res, 401, "Not authorized for this route.");
      }
  }
}