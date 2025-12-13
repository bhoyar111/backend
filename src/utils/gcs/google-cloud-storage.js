import { Storage, TransferManager } from "@google-cloud/storage";
const serviceAccount = JSON.parse(process.env.GCS_KEYFILE_JSON);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const BUCKET_NAME = process.env.BUCKET_NAME;
const PROJECT_ID = process.env.PROJECT_ID;

const storage = new Storage({
  credentials: serviceAccount,
  projectId: PROJECT_ID,
});
const transferManager = new TransferManager(storage.bucket(BUCKET_NAME));

export { storage, transferManager };
