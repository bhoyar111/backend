// models/UserLog.js
import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    action: {
      type: String,
      enum: ["Login", "Logout"],
      required: true,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    loginAt: {
      type: Date,
    },
    logoutAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const LoginLogs = mongoose.model("LoginLogs", userLogSchema);
export default LoginLogs;