import { verifyRole } from "../middleware/ensureAuthorized.js";
import userController from "../controller/userController.js";
import fileController from "../controller/fileController.js";

export default (router) => {
  // Users
  router.get("/get-user", userController.getSingleUser);
  router.get("/get-user-list", userController.getUserList);
  router.get("/get-survey-patient-list",  userController.getPatientList);
  router.get("/get-provider-list", userController.getProviderList);
  router.post("/add-update-user-profile", userController.addOrUpdateUserProfile);
  router.put("/update-profile-status",verifyRole(["Admin", "Patient"]), userController.updateUserProfileStatus);
  router.post("/invite-patient", verifyRole(["Admin"]),userController.invitePatient);
  router.put("/update-onboarding-status", verifyRole(["Patient"]), userController.updateUserOnBoardingStatus);

  // Activity logs
  router.post("/login-logs", userController.logUserAction);
  router.get("/activity-logs", verifyRole(["Admin"]), userController.getActivityLogs);

  // Image or file uploading on GCS.
  router.post("/upload-documents", fileController.uploadDocuments);
  router.post("/get-signed-url", fileController.getSignedUrl);
  
  // //file upload-in folder
  // router.post("/upload-file", upload.single("file"), fileController.uploadFile);
  // router.post("/upload-multi-files", upload.array("files", 10), fileController.uploadMultiF

  return router;
};