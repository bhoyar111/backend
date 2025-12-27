import AuthFailureLogs from "../../models/authFailureLogs.js";

export const logAuthFailure = async ({ req, email = null, reason }) => {
  try {
    await AuthFailureLogs.create({
      email: email ? email.toLowerCase() : null,
      reason,
      ipAddress:
        req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    // ❗ Never break login flow because of logging
    console.error("Auth failure log error:", error.message);
  }
};