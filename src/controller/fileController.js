import { sendError, sendSuccess } from "../utils/customeResponse.js";
import {
  generateSignedUrl,
  uploadSingleOrMultipleDocuments,
} from "../utils/gcs/gcs.js";

const uploadDocuments = async (req, res) => {
  try {
    if (!req?.files) {
      
      return sendError(res, 501, "Please select file first.");
    }
    const key = await uploadSingleOrMultipleDocuments(req);

    return sendSuccess(res, 200, `File uploaded successfully`, { data: key });
  } catch (err) {
    return sendError(res, 500, "Internal server error", err.message);
  }
};

const getSignedUrl = async (req, res) => {
  try {
    if (!req?.body?.path) {
      return sendError(res, 200, "Path not added.");
    }
    const key = await generateSignedUrl(req?.body?.path);
    if (key) {
      return sendSuccess(res, 200, `Signed URL genearted!`, { data: key });
    }
  } catch (err) {
    return sendError(res, 500, "Internal server error", err.message);
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "No file uploaded");
    }

    // Build file URL
    const fileUrl = `${process.env.BASE_PATH}/uploads/${req.file.filename}`;

    return sendSuccess(res, 200, "File uploaded successfully", {
      url: fileUrl,
      file: req.file,
    });
  } catch (err) {
    console.log("Error uploading file:", err);
    return sendError(res, 500, "Internal server error", err.message);
  }
};

const uploadMultiFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, "No files uploaded");
    }

    // Create array of file URLs
    const fileUrls = req.files.map((file) => ({
      url: `${process.env.BASE_PATH}/uploads/${file.filename}`,
      file,
    }));

    return sendSuccess(res, 200, "Files uploaded successfully", fileUrls);
  } catch (err) {
    console.log("Error uploading files:", err);
    return sendError(res, 500, "Internal server error", err.message);
  }
};

export default {
  uploadDocuments,
  getSignedUrl,
  uploadFile,
  uploadMultiFiles,
};
