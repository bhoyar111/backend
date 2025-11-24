import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Checks if a record exists in the database based on given fields.
 * @access private
 * @return json
 *
 */
export const recordExists = async (model, criteria) => {
  try {
    const exists = await model.exists(criteria);
    return !!exists;
  } catch (error) {
    throw error;
  }
};

/**
 * To create function to save data dynamically.
 * @access private
 * @return json
 *
 */
export const saveDetails = async (model, data) => {
  try {
    let addNewData = new model(data);
    let saveRecord = await addNewData.save();
    if (saveRecord) {
      return saveRecord;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * We use this function to check users password, we verify users provided password with encrypted password.
 * @access private
 * @return json
 *
 */
export const matchPassword = async (data) => {
  try {
    let user = await User.findOne({ email: data.email });
    if (user) {
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (isMatch) {
        const { password, ...userWithoutPassword } = user.toObject();
        let token = jwt.sign(
          { user: userWithoutPassword },
          process.env.JWT_KEY,
          {
            expiresIn: "8h",
          }
        );
        return { token: token, userData: user };
      } else {
        return false;
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Verify provided token with reset password parameters
 * @access private
 * @return json
 **/
export const verifyToken = async (token) => {
  let jwtKey = process.env.JWT_KEY;
  return new Promise((resolve) => {
    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        let errorMessage = "";
        if (err.name === "TokenExpiredError") {
          errorMessage = "Token expired";
        } else {
          errorMessage = "Invalid token";
        }
        return resolve({ error: errorMessage }); // Resolve with the error message
      }
      resolve({ user: decoded }); // Resolve with the user data if token is valid
    });
  });
};

/**
 * Generate temporary token for forgetPassword.
 * @access public
 * @return json
 **/

export const generateToken = async (data) => {
  try {
    let user = await User.findOne({ email: data });
    if (user) {
      let token = jwt.sign(
        { email: user?.email, _id: user?._id, role: user?.role },
        process.env.JWT_KEY,
        {
          expiresIn: "15m",
        }
      );
      return token;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Generate hashed password.
 * @access public
 * @return json
 **/
export const getHashedPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hashSync(password, 8);
    if (hashedPassword) {
      return hashedPassword;
    } else {
      return false;
    }
  } catch (error) {
    return error.message;
  }
};

/**
 * Get single document.
 * @access private
 * @return json
 *
 */
export const getSingleDocument = async (model, criteria) => {
  try {
    criteria.isDeleted = false;
    const document = await model.findOne(criteria);
    if (document) {
      return document;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Used to update data in the collection we provide model and data which need to be udpated
 * for user specific.
 * @access private
 * @return json
 */
export const updateDataById = async (model, data) => {
  try {
    const updatedData = await model.findByIdAndUpdate(data._id, data.jsonData, {
      new: true,
    });
    if (updatedData) {
      return updatedData;
    }
  } catch (error) {
    throw error;
  }
};
/**
 * To update data in the collection we provide model and data which need to be udpated
 * for details.
 * @access private
 * @return json
 */
export const updateDocument = async (
  model,
  filter,
  updateObject,
  options = { new: true }
) => {
  try {
    const result = await model
      .findOneAndUpdate(filter, updateObject, options)
      .exec();
    return result;
  } catch (error) {
    console.error("Error in updateDocument:", error);
    throw error;
  }
};

export const getSingleDataByQuery = async (model, query) => {
  try {
    return await model.findOne(query);
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
