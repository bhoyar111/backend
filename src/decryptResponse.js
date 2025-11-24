import { decryption_Data } from "./utils/cryptoUtils.js";

const viewDecryptRes = async (req, res) => {
  try {
    const { encryptData } = req.body;

    if (!encryptData) {
      return res.status(400).json({ error: "Missing 'encryptData' in request body" });
    }

    const decryptedJsonString = decryption_Data(encryptData);
    const decryptedData = JSON.parse(decryptedJsonString);

    return res.status(200).json(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error.message);
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
};

export default {
  viewDecryptRes,
};
