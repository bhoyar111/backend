import jwt from "jsonwebtoken";
import axios from "axios";
import jwkToPem from "jwk-to-pem";

//  Generate JWT token
export const generateJWT = (payload, expiresIn = "6h") => {
  return jwt.sign(payload, process.env.GOOGLE_SECRET_ID, { expiresIn });
};

// Format user response object
export const formatUserResponse = (user) => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    socialId: user.socialId,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    profile_pic: user.profile_pic,
    verified: user.verified,
  };
};

export const verifyAppleToken = async (identityToken) => {
  const appleKeysUrl = process.env.APPLE_KEY_URL;

  const { data } = await axios.get(appleKeysUrl);
  const keys = data.keys;

  const decodedHeader = jwt.decode(identityToken, { complete: true });

  if (!decodedHeader) throw new Error("Invalid token");

  const key = keys.find((k) => k.kid === decodedHeader.header.kid);

  if (!key) throw new Error("Unable to find matching Apple public key");

  const pem = jwkToPem(key);
  return jwt.verify(identityToken, pem, { algorithms: ["RS256"] });
};
