import { verifyRole } from "../middleware/ensureAuthorized.js";
import userController from "../controller/userController.js";

export default (router) => {
  router.get("/get-user",userController.getSingleUser);
  router.get("/get-user-list",userController.getUserList);
  router.get("/get-survey-patient-list",userController.getPatientList);
  router.get("/get-provider-list",userController.getProviderList);
  router.post("/add-update-user-profile",userController.addOrUpdateUserProfile);
  router.put("/update-profile-status",verifyRole(["Admin", "Patient"]),userController.updateUserProfileStatus);
  
  router.post("/invite-patient",verifyRole(["Admin"]),userController.invitePatient);
  router.put("/update-onboarding-status",verifyRole(["Patient"]),userController.updateUserOnBoardingStatus);

  return router;
};