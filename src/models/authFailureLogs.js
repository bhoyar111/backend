// models/AuthFailureLogs.js
import mongoose from "mongoose";
const authFailureLogSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  reason: {
    type: String,
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AuthFailureLogs", authFailureLogSchema);