import authController from "../controller/authController.js";

export default (router) => {
  // Authentication routes for Sign Up, Log In, and Log Out.
  router.post("/sign-up", authController.signUp);
  router.post("/login", authController.logIn);
  router.post("/logout", authController.logOut);

  // Authentication routes for sendOtpFor2fa, verifyOtpFor2fa
  router.post("/sent-otp", authController.sendOtpFor2fa);
  router.post("/vertify-otp", authController.verifyOtpFor2fa);

  // Authentication routes for forgetPassword, forgetPassword
  router.post("/forgot-password", authController.forgetPassword);
  router.post("/reset-password", authController.resetPassword);

  // Authentication for mobile forgetPasswordForMobile, forgetPassword
  router.post("/forgot-password-otp", authController.forgetPasswordForMobile);
  router.post("/verify-forgotpassword-otp", authController.verifyOtpForForgotpassword);
  router.post("/reset-password-otp", authController.resetPasswordForMobile);

  // Social Media routes for loginWithGoogle, loginWithApple
  router.post("/login-with-google", authController.loginWithGoogle);
  router.post("/login-with-apple", authController.loginWithApple);
  
  return router;
};
