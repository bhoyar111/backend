import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import User from "../models/users.js";
import Otp2FA from "../models/otp2FA.js";
import { get } from "../../config/Config.js";

import { sendError, sendSuccess } from "../utils/customeResponse.js";
import { sendEmail } from "../utils/emailSend/sendMail.js";
import { canSendOtp, generate4DigitOTP } from "../../config/Constant.js";
import {
  saveDetails,
  getSingleDocument,
  matchPassword,
  recordExists,
  generateToken,
  verifyToken,
  getHashedPassword,
  updateDataById,
  updateDocument,
  getSingleDataByQuery,
} from "../utils/customeFunction.js";
import {
  generateJWT,
  formatUserResponse,
  verifyAppleToken,
} from "../utils/formatters.js";
import {
  forgotPasswordMobile,
  forgotPasswordWeb,
  sentOtpMail,
} from "../utils/emailSend/emailTemplate.js";
import { getMessage } from "../utils/locale.js";

const configData = get(process.env.NODE_ENV);
const CLIENT_ID = configData.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(CLIENT_ID);

/**
 * Function is used for user sign-up.
 * @access public
 * @return json
 */
const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, role, registerFrom } =
      req.body;

    if (!email || !firstName || !password || !lastName || !role) {
      return sendError(res, 400, getMessage(req, "REQUIRED_FIELDS"));
    }

    // Check if email or mobile already exists
    const isUserExists = await recordExists(User, {
      $or: [{ email, isDeleted: false }],
    });
    if (isUserExists) {
      return sendError(res, 200, getMessage(req, "EMAIL_ALREADY_EXISTS"));
    }
    // Add new user to database
    const savedUser = await saveDetails(User, {
      firstName,
      lastName,
      email,
      mobile,
      password: bcrypt.hashSync(password, 8),
      role,
      registerFrom,
      isOnBoarding: false,
    });

    if (savedUser) {
      // await logUserAction({ user: savedUser, action: "REGISTERED" });
      return sendSuccess(
        res,
        200,
        getMessage(req, "REGISTER_SUCCESS"),
        savedUser
      );
    } else {
      return sendError(res, 404, getMessage(req, "INTERNAL_SERVER_ERROR"));
    }
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Function is used for user login.
 */
const logIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const checkStatus = await getSingleDocument(User, {
      email: email,
      isDeleted: false,
    });

    if (checkStatus?.email !== email) {
      return sendError(res, 206, getMessage(req, "INVALID_EMAIL"));
    }

    if (checkStatus && !checkStatus?.isActive) {
      return sendError(res, 206, getMessage(req, "ACCOUNT_INACTIVE"));
    }

    if (checkStatus?.role !== role) {
      return sendError(res, 200, getMessage(req, "UNAUTHORIZED_ROLE"));
    }

    // Check password
    if (!email || !password) {
      return sendError(res, 206, getMessage(req, "REQUIRED_FIELDS"));
    }

    if (!checkStatus?.password) {
      return sendError(res, 200, getMessage(req, "SET_YOUR_PASS"));
    }

    const isMatch = await matchPassword({ email: email, password: password });

    if (isMatch) {
      let userInfo = isMatch?.userData;

      if (userInfo?.verified === false) {
        let body = {
          userData: {
            email: userInfo?.email,
            mobile: userInfo?.mobile,
            role: userInfo?.role,
            verified: userInfo?.verified,
            fullName: userInfo?.fullName,
            firstName: userInfo?.firstName,
            lastName: userInfo?.lastName,
            _id: userInfo?._id,
          },
        };

        return sendSuccess(res, 200, getMessage(req, "VERIFY_ACCOUNT"), body);
      } else {
        if (role === "Patient") {
          if (req.body.fcmToken != "" || req.body.fcmToken != undefined) {
            const fcmToken = req.body.fcmToken;
            // Step 1: Remove the token from ALL users where it exists
            await User.updateMany(
              { fcmToken: fcmToken }, // any user where the array contains this token
              { $pull: { fcmToken: fcmToken } }
            );

            // Step 2: Add it to the current user (replace or add as single-element array)
            await User.findByIdAndUpdate(
              checkStatus._id,
              { $set: { fcmToken: [fcmToken] } },
              { new: true }
            );
          }
        }
        return sendSuccess(res, 200, getMessage(req, "LOGIN_SUCCESS"), isMatch);
      }
    } else {
      return sendError(res, 206, getMessage(req, "INVALID_PASSWORD"));
    }
  } catch (error) {
    console.log(error, "error");
    return sendError(res, 500, error.message);
  }
};

/**
 * Function is used for user logout.
 */
const logOut = async (req, res) => {
  try {
    return sendSuccess(res, 200, getMessage(req, "LOGOUT_SUCCESS"));
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Function is used for user forget password.
 */
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const userDetails = await getSingleDocument(User, { email });

    if (!userDetails) {
      return sendError(res, 404, getMessage(req, "USER_NOT_FOUND"));
    }
    const CLIENT_BASE_PATH = process.env.CLIENT_BASE_PATH;
    const RESET_PASS_PAGE = "/reset-password";
    const TOKEN = await generateToken(email);
    const resetLink = `${CLIENT_BASE_PATH}${RESET_PASS_PAGE}?token=${TOKEN}`;
    let data = {
      userEmail: userDetails.email,
      fullName: userDetails.fullName,
      resetLink: resetLink,
    };
    const sendmail = await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: forgotPasswordWeb({
        fullName: data?.fullName,
        resetLink: resetLink,
      }),
    });

    if (sendmail?.response) {
      return sendSuccess(res, 200, getMessage(req, "EMAIL_SENT_RESET_PASS"));
    }
  } catch (error) {
    return sendError(
      res,
      500,
      error.message || getMessage(req, "INTERNAL_SERVER_ERROR")
    );
  }
};

/**
 * Function is used for user reset password by token verification.
 */
const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return sendError(res, 206, getMessage(req, "PASSWORDS_DO_NOT_MATCH"));
    }
    // Handle token verification and check for errors
    const checkVerification = await verifyToken(token);
    if (checkVerification.error) {
      return sendError(res, 206, checkVerification.error); // Send error message if token is invalid or expired
    }
    const hashedPassword = await getHashedPassword(password);
    if (hashedPassword) {
      let data = {
        _id: checkVerification?.user?._id,
        jsonData: {
          password: hashedPassword,
        },
      };

      const userDetailsUpdated = await updateDataById(User, data);

      if (userDetailsUpdated) {
        let sendData = {
          email: userDetailsUpdated?.email,
          role: userDetailsUpdated?.role,
          fullName: userDetailsUpdated?.fullName,
          userId: userDetailsUpdated?._id,
        };
        return sendSuccess(
          res,
          200,
          getMessage(req, "PASSWORD_RESET_SUCCESS"),
          sendData
        );
      } else {
        return sendError(res, 206, getMessage(req, "INTERNAL_SERVER_ERROR"));
      }
    }
  } catch (error) {
    return sendError(
      res,
      500,
      error.message || getMessage(req, "INTERNAL_SERVER_ERROR")
    );
  }
};

/**
 * Function is used send otp for 2FA.
 */
const sendOtpFor2fa = async (req, res) => {
  try {
    const { email } = req.body;
    const { uuid } = req.headers;

    const userData = await getSingleDataByQuery(User, {
      email,
      isDeleted: false,
    });
    if (!userData) {
      return sendError(res, 404, getMessage(req, "USER_NOT_FOUND"));
    }
    const deviceExist = await getSingleDataByQuery(Otp2FA, {
      uuid,
      userId: userData._id,
      verified: false,
    });

    if (
      deviceExist &&
      deviceExist?.send_attempts >= configData.MAXIMUM_ATTEMPTS
    ) {
      return sendError(res, 200, getMessage(req, "MAX_ATTEMPT_EXCEEDED"));
    }
    const currentTime = new Date();
    const canOtpSend = await canSendOtp(deviceExist, currentTime);
    // Check if the OTP can be sent
    if (!canOtpSend.status) {
      const timeLeft =
        new Date(
          deviceExist.isTimestampLocked
            ? deviceExist.limitExceedWithin
            : canOtpSend.limitExceedWithin
        ) - currentTime;
      if (!deviceExist.isTimestampLocked) {
        await Otp2FA.findOneAndUpdate(
          { uuid, userId: userData._id },
          {
            $set: {
              limitExceedWithin: canOtpSend.limitExceedWithin,
              isTimestampLocked: canOtpSend.isTimestampLocked,
            },
          }
        );
      }
      return sendError(
        res,
        200,
        `Maximum limit exceeded. Try again after ${Math.ceil(
          timeLeft / 60000
        )} minutes.`
      );
    }

    const otp = generate4DigitOTP();

    const otpExpiration = new Date(
      currentTime.getTime() + configData.OTP_EXPIRATION * 60000
    );
    /* Email send logic willl come here*/
    let updateObject = {
      otp,
      otpExpiration,
      send_attempts: (deviceExist ? deviceExist.send_attempts : 0) + 1,
    };
    let result = null;
    if (deviceExist) {
      updateObject.limitExceedWithin = canOtpSend.limitExceedWithin;
      if (canOtpSend?.reset) {
        updateObject.send_attempts = 1;
        updateObject.isTimestampLocked = false;
        updateObject.limitExceedWithin = canOtpSend.limitExceedWithin;
      }
      result = await updateDocument(
        Otp2FA,
        { email, uuid, userId: userData._id, verified: false },
        { $set: updateObject }
      );
    } else {
      result = await saveDetails(Otp2FA, {
        email,
        otp,
        otpExpiration,
        limitExceedWithin: canOtpSend.limitExceedWithin,
        uuid,
        userId: userData._id,
        send_attempts: 1,
      });
    }
    const sendmail = await sendEmail({
      to: email,
      subject: "Your Verification Code",
      html: sentOtpMail({
        fullName: userData?.fullName,
        otp: result?.otp,
      }),
    });
    let sendData = {
      userId: userData?._id,
      email: email,
      fullName: userData?.fullName,
    };
    if (sendmail.response) {
      return sendSuccess(
        res,
        200,
        getMessage(req, "VERIFY_CODE_SUCCESS"),
        sendData
      );
    }
  } catch (error) {
    return sendError(
      res,
      500,
      error.message || getMessage(req, "INTERNAL_SERVER_ERROR")
    );
  }
};

/**
 * Function is used verifyotp for 2FA verification.
 */
const verifyOtpFor2fa = async (req, res) => {
  try {
    const { email, otp, userId } = req.body;
    const { uuid } = req.headers;

    const otpResult = await getSingleDataByQuery(Otp2FA, {
      userId: userId,
      verified: false,
    });

    if (otpResult) {
      const isUserExists = await getSingleDataByQuery(User, {
        $or: [{ _id: userId }],
      });

      if (!isUserExists) {
        return sendError(res, 409, getMessage(req, "USER_NOT_FOUND"));
      }
      const timestamp1 = new Date(); // First timestamp
      const timestamp2 = new Date(otpResult?.otpExpiration); // Second timestamp

      if (timestamp2.getTime() < timestamp1.getTime()) {
        return sendError(res, 200, getMessage(req, "OTP_EXPIRED"));
      }
      if (otpResult.otp == otp) {
        const updateVerified = await updateDocument(
          User,
          { _id: userId },
          { $set: { verified: true } }
        );

        const updateVerifiedUUID = await updateDocument(
          Otp2FA,
          { uuid, email, userId: userId, verified: false },
          { $set: { verified: true } }
        );

        let activeToken = await generateToken(email);

        let body = {
          token: activeToken,
          userData: {
            uuid: updateVerifiedUUID?._id,
            _id: userId,
            fullName: isUserExists?.fullName,
            firstName: isUserExists?.firstName,
            lastName: isUserExists?.lastName,
            email: isUserExists?.email,
            mobile: isUserExists?.mobile,
            role: isUserExists?.role,
          },
        };
        if (isUserExists?.role === "Patient") {
          if (req.body.fcmToken != "" || req.body.fcmToken != undefined) {
            const fcmToken = req.body.fcmToken;
            // Step 1: Remove the token from ALL users where it exists
            await User.updateMany(
              { fcmToken: fcmToken }, // any user where the array contains this token
              { $pull: { fcmToken: fcmToken } }
            );

            // Step 2: Add it to the current user (replace or add as single-element array)
            await User.findByIdAndUpdate(
              userId,
              { $set: { fcmToken: [fcmToken] } },
              { new: true }
            );
          }
        }
        return sendSuccess(
          res,
          200,
          getMessage(req, "OTP_VERIFIED_SUCCESS"),
          body
        );
      } else {
        return sendError(res, 200, getMessage(req, "OTP_INCORRECT"));
      }
    } else {
      return sendError(res, 200, getMessage(req, "OTP_DOES_NOT_EXIST"));
    }
  } catch (error) {
    return sendError(
      res,
      500,
      error.message || getMessage(req, "INTERNAL_SERVER_ERROR")
    );
  }
};

/**
 * Function is used for forget password for mobile
 */
const forgetPasswordForMobile = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getSingleDocument(User, { email });

    if (!user) {
      return sendError(res, 404, getMessage(req, "USER_NOT_FOUND"));
    }

    // Generate 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP and expiry to user record or a separate collection
    user.resetOtp = otp;
    user.otpExpiresAt = new Date(
      Date.now() + configData.OTP_EXPIRATION * 60 * 1000
    );
    const emailData = await user.save();

    const sendmail = await sendEmail({
      to: email,
      subject: "Forgot Password - OTP Code",
      html: forgotPasswordMobile({
        fullName: user?.fullName,
        otp: emailData?.resetOtp,
      }),
    });

    if (sendmail?.response) {
      return sendSuccess(res, 200, getMessage(req, "OTP_SENT_SUCCESS"));
    }
  } catch (error) {
    return sendError(
      res,
      500,
      error.message || getMessage(req, "INTERNAL_SERVER_ERROR")
    );
  }
};

/**
 * Function is used for forget password for otp verication
 */
const verifyOtpForForgotpassword = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, getMessage(req, "EMAIL_OTP_REQUIRE"));
    }

    const user = await getSingleDocument(User, { email });

    if (!user) {
      return sendError(res, 404, getMessage(req, "USER_NOT_FOUND"));
    }

    const now = new Date();

    if (
      user.resetOtp !== otp ||
      !user.otpExpiresAt ||
      new Date(user.otpExpiresAt) < now
    ) {
      return sendError(res, 401, getMessage(req, "INVALID_OTP"));
    }

    // Update: Mark OTP as verified and clear the OTP fields
    await updateDocument(
      User,
      { email },
      {
        resetOtp: null,
        otpExpiresAt: null,
        isOtpVerified: true,
      }
    );

    return sendSuccess(res, 200, getMessage(req, "OTP_VERIFIED_SUCCESS"));
  } catch (error) {
    return sendError(
      res,
      500,
      error.message || getMessage(req, "INTERNAL_SERVER_ERROR")
    );
  }
};

/**
 * Function is used for reset password for otp verication
 */
const resetPasswordForMobile = async (req, res) => {
  try {
    const { email, password, confirmPassword, fcmToken } = req.body;

    if (!email || !password || !confirmPassword) {
      return sendError(res, 400, getMessage(req, "REQUIRED_FIELDS"));
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, getMessage(req, "PASSWORDS_DO_NOT_MATCH"));
    }

    const user = await getSingleDocument(User, { email });

    if (!user) {
      return sendError(res, 404, getMessage(req, "USER_NOT_FOUND"));
    }

    if (!user.isOtpVerified) {
      return sendError(res, 401, getMessage(req, "OTP_VERIFICATION_REQUIRED"));
    }

    // Hash new password
    const hashedPassword = await getHashedPassword(password);

    // Update user's password and clear OTP verification flag
    const updatedUser = await updateDataById(User, {
      _id: user?._id,
      jsonData: {
        password: hashedPassword,
        isOtpVerified: false,
      },
    });

    if (!updatedUser) {
      return sendError(res, 500, getMessage(req, "UNABLE_RESET_PASS"));
    }

    // Handle FCM Token (if provided)
    if (fcmToken) {
      // Remove this token from all other users (to avoid duplicates)
      await User.updateMany(
        { _id: { $ne: updatedUser?._id } },
        { $pull: { fcmToken: fcmToken } }
      );

      // Add or update token in current user's fcmToken array
      await User.updateOne(
        { _id: updatedUser?._id },
        { $addToSet: { fcmToken: fcmToken } }
      );
    }

    // Generate login token
    const authToken = await generateToken(email);

    // Send final response
    return sendSuccess(res, 200, getMessage(req, "PASSWORD_RESET_SUCCESS"), {
      token: authToken,
      userData: {
        _id: updatedUser?._id,
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        mobile: updatedUser?.mobile,
        role: updatedUser?.role,
      },
    });
  } catch (error) {
    return sendError(
      res,
      500,
      error.message || getMessage(req, "USER_NOT_FOUND")
    );
  }
};

/**
 * This function to handle login or registration via Google Sign-In.
 */
const loginWithGoogle = async (req, res) => {
  const { token, role, registerFrom, fcmToken } = req.body;
  try {
    // Validate token presence
    if (!token)
      return sendError(res, 400, getMessage(req, "GOOGLE_TOKEN_MISSING"));

    // Verify Google token and decode user info
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const {
      email,
      name: firstName,
      family_name: lastName,
      picture: profile_pic,
      sub: socialId,
    } = payload;

    if (!email)
      return sendError(res, 400, getMessage(req, "GOOGLE_EMAIL_NOT_FOUND"));

    // Check if user already exists
    let user = await User.findOne({ email, isDeleted: false });

    // Register the user if not found
    if (!user) {
      user = new User({
        email,
        firstName,
        lastName,
        profile_pic,
        verified: true,
        isActive: true,
        registerFrom: registerFrom || "google",
        role: role || "Patient",
        socialId,
        password: bcrypt.hashSync(socialId, 8), // hashed Google user ID
      });

      await user.save();
    } else {
      // If exists, ensure account is active
      if (!user.isActive)
        return sendError(res, 403, getMessage(req, "ACCOUNT_INACTIVE"));

      // Ensure role matches if role is provided
      if (role && user.role !== role) {
        return sendError(res, 403, getMessage(req, "UNAUTHORIZED_ROLE"));
      }
    }

    // Update FCM token if provided
    if (fcmToken) {
      await User.updateMany({ fcmToken }, { $pull: { fcmToken } });

      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { fcmToken } },
        { new: true }
      );
    }

    // Generate JWT token for session authentication
    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const jwtToken = generateJWT(tokenPayload);

    // Return success response with token and user info
    return sendSuccess(res, 200, getMessage(req, "GOGGLE_LOGIN_SUCCESS"), {
      token: jwtToken,
      userData: formatUserResponse(user),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * This function to handle login or registration via Apple Sign-In.
 */
const loginWithApple = async (req, res) => {
  const { identityToken, role, registerFrom, fcmToken } = req.body;
  try {
    // Validate presence of token
    if (!identityToken)
      return sendError(res, 400, getMessage(req, "APPLE_TOKEN_MISSING"));

    // Decode and verify Apple token
    const payload = await verifyAppleToken(identityToken);
    const { email, iat: firstName, iat: lastName, sub: socialId } = payload;

    if (!email)
      return sendError(res, 400, getMessage(req, "APPLE_EMAIL_NOT_FOUND"));

    // Check if user already exists
    let user = await User.findOne({ email, isDeleted: false });

    // Register the user if not found
    if (!user) {
      user = new User({
        email,
        firstName, // Apple does not send name on future logins
        lastName,
        profile_pic: "", // No profile picture from Apple
        verified: true,
        isActive: true,
        registerFrom: registerFrom || "apple",
        role: role || "Patient",
        socialId,
        password: bcrypt.hashSync(socialId, 8), // hashed Apple user ID
      });

      await user.save();
    } else {
      if (!user.isActive)
        return sendError(res, 403, getMessage(req, "ACCOUNT_INACTIVE"));
      if (role && user.role !== role) {
        return sendError(res, 403, getMessage(req, "UNAUTHORIZED_ROLE"));
      }
    }

    // Update FCM token if provided
    if (fcmToken) {
      await User.updateMany({ fcmToken }, { $pull: { fcmToken } });
      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { fcmToken } },
        { new: true }
      );
    }

    // Generate JWT token for your app
    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const jwtToken = generateJWT(tokenPayload);

    return sendSuccess(res, 200, getMessage(req, "APPLY_LOGIN_SUCCESS"), {
      token: jwtToken,
      userData: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Apple login error:", error);
    return sendError(
      res,
      500,
      error.message || getMessage(req, "INTERNAL_SERVER_ERROR")
    );
  }
};

export default {
  signUp,
  logIn,
  logOut,
  forgetPassword,
  resetPassword,
  sendOtpFor2fa,
  verifyOtpFor2fa,
  forgetPasswordForMobile,
  resetPasswordForMobile,
  verifyOtpForForgotpassword,
  loginWithApple,
  loginWithGoogle,
};
