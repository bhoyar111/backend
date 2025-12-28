import mongoose from "mongoose";

const SpecialitySchema = new mongoose.Schema(
  {
    specialityName: {
      type: String,
    },
    description: {
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

export default mongoose.model("Speciality", SpecialitySchema);