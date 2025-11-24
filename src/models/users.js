import mongoose from "mongoose";

const licenseDetailsSchema = new mongoose.Schema(
  {
    state: { type: String, trim: true, required: true },
    license_number: { type: String, trim: true },
    expiry_date: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
      index: true,
      minlength: [2, "First name must be at least 2 characters."],
      maxlength: [50, "First name must be less than 50 characters."],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
      index: true,
      minlength: [2, "Last name must be at least 2 characters."],
      maxlength: [50, "Last name must be less than 50 characters."],
    },

    fullName: {
      type: String,
      trim: true,
      index: true,
    },

    address: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format.",
      ],
    },

    mobile: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits."],
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ["Admin", "Provider", "Patient"],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
    },

    fcmToken: [
      {
        type: String,
        trim: true,
      },
    ],
    registerFrom: {
      type: String,
      enum: ["manual", "google", "apple"],
      default: "manual",
    },

    profile_pic: {
      type: String,
    },

    dob: {
      type: String,
    },

    resetOtp: {
      type: String,
    },

    otpExpiresAt: {
      type: Date,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    speciality: {
      type: [String],
      default: undefined, // won’t auto-create []
    },
    licenseDetails: {
      type: [licenseDetailsSchema],
      default: undefined, // won’t auto-create []
    },

    experience: {
      type: String,
    },

    about: {
      type: String,
    },

    socialId: {
      type: String,
    },

    stripe_customer_id: {
      type: String,
    },

    assignedToPatient: {
      type: Boolean,
    },

    assignedCount: {
      type: Number,
    },
    
    isOnBoarding: {
      type: Boolean,
    },

    isSurvey: {
      type: Boolean,
      default: false,
    },

    subscription_id: {
      type: String,
      ref: "SubcriptionPurchase",
    },
  },
  {
    timestamps: true,
  }
);
//user full name save
userSchema.pre("save", function (next) {
  this.fullName = [this.firstName, this.lastName].filter(Boolean).join(" ");
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
