import mongoose from "mongoose";

const StateSchema = new mongoose.Schema(
  {
    stateName: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActivated: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("States", StateSchema);