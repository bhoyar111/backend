import convert from "heic-convert";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./google-cloud-storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localDestination = path.join(__dirname, "../uploads");

export const generateRandomString = (length = 12) => {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  );
  const randomString = randomArray.join("");
  return randomString;
};

export const uploadSingleOrMultipleDocuments = (req) => {
  return new Promise(async (resolve) => {
    try {
      const { userId, docType } = req.body;

      const files = req.files.files;
      let keysArray = [];
      // Convert single file to an array for uniform processing
      const fileArray = Array.isArray(files) ? files : [files];

      let uploadArray = [];
      let tempPathArray = [];

      for (const file of fileArray) {
        let fileExtension = file?.mimetype.split("/").pop();
        let fileBuffer = file?.data; // Access file data from buffer
        let tmpPath;

        if (fileExtension === "heic" || fileExtension === "heif") {
          fileExtension = "jpeg";
          fileBuffer = await convert({
            buffer: fileBuffer,
            format: "JPEG",
          });

          tmpPath = `${localDestination}/_file-${Date.now()}.jpeg`;
          await fs.writeFile(tmpPath, fileBuffer);
          tempPathArray.push(tmpPath);
        } else {
          tmpPath = `${localDestination}/_file-${Date.now()}.${fileExtension}`;
          await fs.writeFile(tmpPath, fileBuffer);
          tempPathArray.push(tmpPath);
        }

        const fileName = `_file-${Date.now()}-${generateRandomString(
          10
        )}.${fileExtension}`;
        const options = {
          destination: `${userId}/${docType}/${fileName}`,
        };

        uploadArray.push(
          storage
            .bucket(process.env.BUCKET_NAME)
            .upload(tmpPath, options)
            .then(() => tmpPath)
        ); // Return file path after upload
        keysArray.push(options?.destination);
      }

      // Wait for all uploads to complete
      const uploadedFilePaths = await Promise.all(uploadArray);

      // Clean up temp files after successful upload
      for (const path of uploadedFilePaths) {
        await fs.unlink(path);
      }

      resolve(keysArray);
    } catch (error) {
      console.error("Error while uploading documents", error);
      resolve("");
    }
  });
};

export const generateSignedUrl = (fileName) => {
  return new Promise(async (resolve) => {
    try {
      const options = {
        version: "v4", // Signed URL version
        action: "read", // Allow read access
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes from now
      };

      const [url] = await storage
        .bucket(process.env.BUCKET_NAME)
        .file(fileName)
        .getSignedUrl(options);

      resolve(url);
    } catch (error) {
      console.error("An error occurred:", error);
      resolve("");
    }
  });
};
