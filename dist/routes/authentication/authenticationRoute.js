"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const authenticationController_1 = require("../../controller/authentication/authenticationController");
const authValidation_1 = require("../../middlewares/authValidation");
const router = express_1.default.Router();
router
    .route("/registration")
    .get(authenticationController_1.registrationController)
    .post(authValidation_1.registrationValidation, authenticationController_1.postRegistrationController);
router
    .route("/registration/activationlink/:id")
    .get(authenticationController_1.registrationLinkController);
router.route("/registration/verifylink").post(authenticationController_1.registrationVerifyLink);
router.route("/").get(authenticationController_1.loginController).post(authValidation_1.loginValidation, authenticationController_1.checkLogin);
router.route("/forgotPassword").get(authenticationController_1.forgotPasswordController);
router.route("/setpassword/:id").get(authenticationController_1.setPasswordController);
router.route("/activationLink/:id").get(authenticationController_1.activationLinkController);
router.route("/forgotPassword/varify").post(authenticationController_1.forgotPasswordVarifyEmail);
router.route("/forgotPassword/varifyLink").post(authenticationController_1.forgotPasswordVarifyLink);
router.route("/forgotPassword/newPassword/").post(authenticationController_1.forgotPasswordNewPassword);
router
    .route("/logout")
    .get(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), authenticationController_1.logout);
router
    .route("/currentuser")
    .get(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), authenticationController_1.currentUser);
exports.default = router;
