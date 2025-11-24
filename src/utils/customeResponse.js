import { encryptData, isCryptoEnabled } from "./cryptoUtils.js";

export const sendSuccess = (res, code, message, data = null) => {
  const responsePayload = {
    success: true,
    status: code,
    message,
    data,
  };

  if (isCryptoEnabled()) {
    try {
      const encrypted = encryptData(responsePayload);
      return res.status(code).json({ encryptData: encrypted });
    } catch (err) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: err.message,
      });
    }
  } else {
    return res.status(code).json(responsePayload);
  }
};

export const sendError = (res, code, message, error = null) => {
  const responsePayload = {
    success: false,
    statusCode: code,
    message,
    error, // Optional: Include detailed error info if needed
  };

  try {
    if (isCryptoEnabled()) {
      const encrypted = encryptData(responsePayload);
      return res.status(code).json({ encryptData: encrypted });
    } else {
      return res.status(code).json(responsePayload);
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message,
    });
  }
};
