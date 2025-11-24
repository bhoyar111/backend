import "dotenv/config.js";
import { randomInt } from "crypto";
export const generate4DigitOTP = () => {
  return randomInt(1000, 10000);
};

import { get } from "./Config.js";

const data = get(process.env.NODE_ENV);

export const canSendOtp = (deviceExist, currentTime) => {
  return new Promise((resolve) => {
    const limitExceedWithin1 = new Date(
      currentTime.getTime() + data.OTP_LIMIT_EXCEED_WITHIN * 60000
    );
    let returnData = { status: false, limitExceedWithin: limitExceedWithin1 };
    if (!deviceExist) resolve({ status: true }); // First time sending
    const { send_attempts, limitExceedWithin, isTimestampLocked } = deviceExist;
    const limitExceedTimestamp = new Date(limitExceedWithin);
    if (
      send_attempts <= data.SEND_ATTEMPTS &&
      currentTime > limitExceedTimestamp
    ) {
      resolve({
        status: true,
        limitExceedWithin: limitExceedWithin1,
        send_attempts: 1,
        reset: true,
        isTimestampLocked: false,
      }); // Reset attempts if time has exceeded
    } else if (send_attempts < data.SEND_ATTEMPTS) {
      resolve({ status: true }); // Allow sending if below SEND_ATTEMPTS attempts
    }
    const addMinutes = new Date(
      currentTime.getTime() + data.OTP_TRY_AFTER * 60000
    );
    if (send_attempts == data.SEND_ATTEMPTS && !isTimestampLocked) {
      returnData.limitExceedWithin = addMinutes;
      returnData.isTimestampLocked = true;
    }
    resolve(returnData); // Otherwise, do not allow sending
  });
};
