import twilio from "twilio";
import { get } from "../../../config/Config.js";

const configData = get(process.env.NODE_ENV);
const client = twilio(configData?.TWILIO_ACCOUNT_SID, configData?.TWILIO_AUTH_TOKEN);

export const sendSms = async (to, body) => {
  return client.messages.create({
    body,
    to, // recipient mobile number
    from: configData.TWILIO_PHONE_NUMBER, // your Twilio number
  });
};
