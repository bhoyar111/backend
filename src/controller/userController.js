import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import User from "../models/users.js";

import { getSingleDataByQuery } from "../utils/customeFunction.js";
import { sendError, sendSuccess } from "../utils/customeResponse.js";
import { sendEmail } from "../utils/emailSend/sendMail.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import {
  adminRegisterTemplate,
  sentInvite,
} from "../utils/emailSend/emailTemplate.js";
import { getMessage } from "../utils/locale.js";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
/**
 * Function is used get single user data.
 */
const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return sendError(res, 400, getMessage(req, "USER_ID_REQUIRED"));
    }

    const user = await getSingleDataByQuery(User, { _id: userId });
    if (!user) {
      return sendError(res, 200, getMessage(req, "USER_NOT_FOUND"));
    }

    // Common fields for both roles
    const data = {
      _id: user?._id,
      email: user?.email,
      mobile: user?.mobile,
      role: user?.role,
      isDeleted: user?.isDeleted,
      isActive: user?.isActive,
      verified: user?.verified,
      gender: user?.gender,
      fullName: user?.fullName,
      address: user?.address,
      profile_pic: user?.profile_pic,
      dob: user?.dob,
      firstName: user?.firstName,
      lastName: user?.lastName,
    };

    // Role-specific fields
    if (user?.role === "Provider") {
      data.experience = user?.experience;
      data.speciality = user?.speciality;
      data.about = user?.about;
      data.licenseDetails = user?.licenseDetails;

      const slot = await getSingleDataByQuery(ProviderAvailability, {
        providerId: userId,
      });
      if (slot) {
        data.availableSlot = {
          slot_interval: slot.slot_interval,
          week_days: slot.week_days,
        };
      } else {
        data.availableSlot = null;
      }
    }

    if (user.role === "Patient") {
      data.subscription_id = user?.subscription_id ? user?.subscription_id : "";
      data.isOnBoarding = user?.isOnBoarding;
    }

    return sendSuccess(res, 200, getMessage(req, "USER_FETCH_SUCCESS"), data);
  } catch (error) {
    console.error("Error fetching user:", error);
    return sendError(res, 500, "Unable to fetch user", error.message);
  }
};

/**
 * User List on our application
 */
const getUserList = async (req, res) => {
  try {
    let { limit, page, role, searchText, isActive } = req.query;

    limit = Number(limit);
    page = Number(page);

    let filter = { isDeleted: false };

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (searchText) {
      filter.$or = [
        { fullName: { $regex: searchText, $options: "i" } },
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { mobile: { $regex: searchText, $options: "i" } },
      ];
    }

    // Base projection (fields common to both)
    let projection = {
      role: 1,
      isActive: 1,
      isDeleted: 1,
      verified: 1,
      fullName: 1,
      address: 1,
      email: 1,
      mobile: 1,
      gender: 1,
      profile_pic: 1,
      dob: 1,
      firstName: 1,
      lastName: 1,
      createdAt: 1,
    };
    // Role-specific fields
    if (role === "Provider") {
      Object.assign(projection, {
        experience: 1,
        speciality: 1,
        about: 1,
        licenseDetails: 1,
        assignedToPatient: 1,
        assignedCount: 1,
      });
    }

    const query = User.find(filter, projection).sort({ createdAt: -1 });

    if (limit > 0) {
      query.skip((page - 1) * limit).limit(limit);
    }

    const users = await query.exec();
    const count = await User.countDocuments(filter);

    const response = {
      totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
      currentPage: limit > 0 ? page : 1,
      totalRecords: count,
      result: users,
    };

    return sendSuccess(
      res,
      200,
      getMessage(req, "USER_FETCH_SUCCESS"),
      response
    );
  } catch (error) {
    console.error("Error fetching user list:", error);
    return sendError(
      res,
      500,
      getMessage(req, "INTERNAL_SERVER_ERROR"),
      error.message
    );
  }
};

const getPatientList = async (req, res) => {
  try {
    let { limit, page, role, searchText, isActive } = req.query;

    limit = Number(limit) || 0;
    page = Number(page) || 1;

    let filter = { isDeleted: false, isSurvey: true, };

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (searchText) {
      filter.$or = [
        { fullName: { $regex: searchText, $options: "i" } },
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { mobile: { $regex: searchText, $options: "i" } },
      ];
    }

    // Only show Patients who have isSurvey === true
    if (role === "Patient") {
      filter.$and = [
        { role: "Patient" },
        { $or: [{ isSurvey: true }, { isSurvey: "true" }] }, // handles both boolean and string
      ];
    }

    let projection = {
      role: 1,
      isActive: 1,
      isDeleted: 1,
      verified: 1,
      fullName: 1,
      address: 1,
      email: 1,
      mobile: 1,
      gender: 1,
      profile_pic: 1,
      dob: 1,
      firstName: 1,
      lastName: 1,
      createdAt: 1,
    };

    const query = User.find(filter, projection).sort({ createdAt: -1 });

    if (limit > 0) {
      query.skip((page - 1) * limit).limit(limit);
    }

    const users = await query.exec();
    const count = await User.countDocuments(filter);

    const response = {
      totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
      currentPage: limit > 0 ? page : 1,
      totalRecords: count,
      result: users,
    };

    return sendSuccess(
      res,
      200,
      getMessage(req, "USER_FETCH_SUCCESS"),
      response
    );
  } catch (error) {
    console.error("Error fetching user list:", error);
    return sendError(
      res,
      500,
      getMessage(req, "INTERNAL_SERVER_ERROR"),
      error.message
    );
  }
};

const getProviderList = async (req, res) => {
  try {
    let { limit, page, searchText, isActive } = req.query;

    limit = Number(limit) || 0;
    page = Number(page) || 1;

    // Always filter only providers
    let filter = {
      isDeleted: false,
      role: "Provider",
    };

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (searchText) {
      filter.$or = [
        { fullName: { $regex: searchText, $options: "i" } },
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { mobile: { $regex: searchText, $options: "i" } },
      ];
    }

    // Fields to return
    const projection = {
      role: 1,
      isActive: 1,
      verified: 1,
      fullName: 1,
      address: 1,
      email: 1,
      mobile: 1,
      gender: 1,
      profile_pic: 1,
      dob: 1,
      firstName: 1,
      lastName: 1,
      createdAt: 1,
      experience: 1,
      speciality: 1,
      about: 1,
      licenseDetails: 1,
      assignedToPatient: 1,
      assignedCount: 1,
    };

    const query = User.find(filter, projection).sort({ createdAt: -1 });

    if (limit > 0) {
      query.skip((page - 1) * limit).limit(limit);
    }

    const users = await query.exec();
    const count = await User.countDocuments(filter);

    const response = {
      totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
      currentPage: limit > 0 ? page : 1,
      totalRecords: count,
      result: users,
    };

    return sendSuccess(
      res,
      200,
      getMessage(req, "USER_FETCH_SUCCESS"),
      response
    );
  } catch (error) {
    console.error("Error fetching provider list:", error);
    return sendError(
      res,
      500,
      getMessage(req, "INTERNAL_SERVER_ERROR"),
      error.message
    );
  }
};

/**
 * addOrUpdateUserProfile
 */
const addOrUpdateUserProfile = async (req, res) => {
  try {
    const { role, userId } = req.body;

    if (!role || !["Patient", "Provider"].includes(role)) {
      return sendError(res, 200, getMessage(req, "INVALID_ROLE"));
    }

    // Define base fields for both roles
    const baseFields = [
      "fullName",
      "address",
      "email",
      "mobile",
      "gender",
      "profile_pic",
      "dob",
      "firstName",
      "lastName",
    ];

    let allowedFields = [...baseFields];

    // Add role-specific fields
    if (role === "Provider") {
      allowedFields.push("experience", "speciality", "about", "licenseDetails");
    }

    // Filter input to only allowed fields
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Normalize and check email uniqueness
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();

      const existingUser = await User.findOne({
        email: updateData.email,
        isDeleted: false,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return sendError(res, 400, getMessage(req, "EMAIL_ALREADY_EXISTS"));
      }
    }

    updateData.role = role;

    let user;
    let message;

    if (userId) {
      // Update existing user
      user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return sendError(res, 404, getMessage(req, "USER_NOT_FOUND"));
      }
      message = getMessage(req, "PROFILE_UPDATE_SUCCESS");
    } else {
      // Create new user
      user = new User(updateData);
      await user.save();
      message = getMessage(req, "PROFILE_CREATE_SUCCESS");

      await sendEmail({
        to: updateData?.email,
        subject: getMessage(req, "WELCOME_TO_IMRIA_HEALTH"),
        html: adminRegisterTemplate({
          fullName: user?.fullName,
        }),
      });
    }

    return sendSuccess(res, 200, message, user);
  } catch (error) {
    console.error("Error saving user profile:", error);
    return sendError(
      res,
      500,
      getMessage(req, "INTERNAL_SERVER_ERROR"),
      error.message
    );
  }
};

/**
 * update User Profile Status
 */
const updateUserProfileStatus = async (req, res) => {
  try {
    const { userId, action_name, action_value } = req.body;

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          [action_name]: action_value,
        },
      }
    );

    return sendSuccess(
      res,
      200,
      action_name == "isDeleted"
        ? getMessage(req, "USER_DELETE_SUCCESS")
        : getMessage(req, "USER_STATUS_UPDATE_SUCCESS")
    );
  } catch (err) {
    return sendError(
      res,
      500,
      getMessage(req, "INTERNAL_SERVER_ERROR"),
      err.message
    );
  }
};

/**
 * Invite patient to register on our application
 */
const invitePatient = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const mailSent = await sendEmail({
      to: email,
      subject: getMessage(req, "INVITATION_IMRIA_HEALTH"),
      html: sentInvite({ fullName }),
    });

    if (mailSent) {
      return sendSuccess(res, 200, getMessage(req, "INVITE_SEND_SUCCESS"));
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
    return sendError(
      res,
      500,
      getMessage(req, "INTERNAL_SERVER_ERROR"),
      error.message
    );
  }
};

/**
 * Generate provider availablity slots
 */
const generateTimeRanges = (start, end, intervalMins) => {
  const slots = [];
  // Parse time with format support
  let startTime = dayjs(start, "HH:mm");
  let endTime = dayjs(end, "HH:mm");

  if (!startTime.isValid() || !endTime.isValid()) {
    return [];
  }

  while (startTime.add(intervalMins, "minute").isSameOrBefore(endTime)) {
    const endTimeSlot = startTime.add(intervalMins, "minute");
    slots.push(`${startTime.format("HH:mm")}-${endTimeSlot.format("HH:mm")}`);
    startTime = endTimeSlot;
  }

  return slots;
};

// Main API generate provider slots
const updateUserOnBoardingStatus = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, 200, getMessage(req, "USER_ID_REQUIRED"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isOnBoarding: true } },
      { new: true }
    );

    if (!updatedUser) {
      return sendError(res, 404, getMessage(req, "USER_NOT_FOUND"));
    }

    return sendSuccess(res, 200, getMessage(req, "ONBOARDING_STATUS_UPDATED"));
  } catch (err) {
    return sendError(
      res,
      500,
      getMessage(req, "INTERNAL_SERVER_ERROR"),
      err.message
    );
  }
};



export default {
  getSingleUser,
  getUserList,
  getPatientList,
  getProviderList,
  addOrUpdateUserProfile,
  updateUserProfileStatus,
  invitePatient,
  updateUserOnBoardingStatus
};
