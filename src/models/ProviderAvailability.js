// models/ProviderAvailability.js
import mongoose from "mongoose";

const ProviderAvailabilitySchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    slot_interval: {
      type: String
    },
    week_days: [
      {
        day: {
          type: String,
          enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
          required: true
        },
        is_available: {
          type: Boolean,
          default: false
        },
        start_time: {
          type: String
        },
        end_time: {
          type: String
        }
      }
    ],
    monthly_availability: [
      {
        date: {
          type: Date,
          required: true,
        }, // specific calendar date
        is_available: {
          type: Boolean,
          default: false,
        },
        slots: [{
          start_time: {
            type: String
          },
          end_time: {
            type: String
          }
        }]
        
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ProviderAvailability", ProviderAvailabilitySchema);