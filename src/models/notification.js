// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Who will receive the notification
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    recipientRole: {
      type: String,
      enum: ["Patient", "Provider", "Admin"],
      required: true,
    },
    // Notification category/type
    type: {
      type: String,
      enum: [
        "GENERAL", // any other generic notifications
        "REGISTRATION", // e.g., account created, approved
        "APPOINTMENT", // e.g., appointment booked, rescheduled, cancelled
        "CHAT", // e.g., new message
        "TRANSACTION", // e.g., payment success/failure
      ],
      required: true,
    },

    // Notification details
    title: { type: String, required: true },
    message: { type: String, required: true },
    metaData: { type: Object }, // optional extra data (appointmentId, transactionId, etc.)

    // Read status
    isRead: { type: Boolean, default: false },

    // Push/email flags (optional)
    isPushSent: { type: Boolean, default: false },
    isEmailSent: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
