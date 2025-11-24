import { HTTP_MESSAGES } from "../locales/message.js";

const DEFAULT_LANG = "EN";

const getLangFromHeaders = (req) => {
  return req?.headers?.["accept-language"]?.toUpperCase() || DEFAULT_LANG;
};

export const getMessage = (req, key) => {
  const lang = getLangFromHeaders(req);
  return (
    HTTP_MESSAGES[lang]?.[key] ||
    HTTP_MESSAGES[DEFAULT_LANG]?.[key] ||
    "Message not defined"
  );
};
