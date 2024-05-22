import express from "express";
import passport from "passport";
import {
  registrationController,
  loginController,
  forgotPasswordController,
  setPasswordController,
  forgotPasswordVarifyEmail,
  activationLinkController,
  forgotPasswordVarifyLink,
  forgotPasswordNewPassword,
  postRegistrationController,
  checkLogin,
  registrationLinkController,
  logout,
  currentUser,
  registrationVerifyLink,
} from "../../controller/authentication/authenticationController";
import {
  loginValidation,
  registrationValidation,
} from "../../middlewares/authValidation";
const router = express.Router();

router
  .route("/registration")
  .get(registrationController)
  .post(registrationValidation, postRegistrationController);

router
  .route("/registration/activationlink/:id")
  .get(registrationLinkController);

router.route("/registration/verifylink").post(registrationVerifyLink);

router.route("/").get(loginController).post(loginValidation, checkLogin);

router.route("/forgotPassword").get(forgotPasswordController);

router.route("/setpassword/:id").get(setPasswordController);

router.route("/activationLink/:id").get(activationLinkController);

router.route("/forgotPassword/varify").post(forgotPasswordVarifyEmail);

router.route("/forgotPassword/varifyLink").post(forgotPasswordVarifyLink);

router.route("/forgotPassword/newPassword/").post(forgotPasswordNewPassword);

router
  .route("/logout")
  .get(
    passport.authenticate("jwt", { session: false, failureRedirect: "/" }),
    logout
  );

router
  .route("/currentuser")
  .get(
    passport.authenticate("jwt", { session: false, failureRedirect: "/" }),
    currentUser
  );

export default router;
