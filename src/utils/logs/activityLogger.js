import UserActivityLogs from "../../models/UserActivityLogs.js";

export const createActivityLog = async ({
  req,
  action,
  module,
  description,
  targetId = null,
  targetType = null,
  userData = null, // ✅ NEW
}) => {
  try {
    const user = userData || req.user;
    // console.log(user, "user");
    
    if (!user) return;

    const logAk = await UserActivityLogs.create({
      userId: user._id,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      action,
      module,
      description,
      targetId,
      targetType,
      ipAddress:
        req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
    });
    // console.log(logAk, "logAk")
  } catch (error) {
    console.error("Activity log failed:", error.message);
  }
};