import mongoose from "mongoose";

const otp2faSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    send_attempts: {
      type: Number,
      default: 1,
    },
    otpExpiration: {
      type: Number,
    },
    limitExceedWithin: {
      type: Number,
    },
    isTimestampLocked: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Otp2fa", otp2faSchema);
