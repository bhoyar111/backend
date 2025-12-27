import mongoose from "mongoose";

const userActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fullName: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Provider", "Patient"],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "VIEW"],
      required: true,
    },

    module: {
      type: String,
      enum: [
        "PATIENT_PROFILE",
        "ADMIN_PROFILE",
        "PROVIDER_PROFILE",
        "DEMOGRAPHIC_INFO",
        "ASSIGNED_PATIENT",
        "APPOINTMENT",
        "ARTICLE",
        "GENERAL",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    targetType: {
      type: String, // Patient, Provider, Article, Appointment
      required: false,
    },

    ipAddress: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserActivityLogs = mongoose.model(
  "UserActivityLogs",
  userActivityLogSchema
);

export default UserActivityLogs;