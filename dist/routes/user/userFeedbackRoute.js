"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
let express = require("express");
let router = express.Router();
const authValidation_1 = require("../../middlewares/authValidation");
const userFeedbackController_1 = require("../../controller/user/userFeedback/userFeedbackController");
const passport_1 = __importDefault(require("passport"));
const permission_1 = __importDefault(require("../../middlewares/permission"));
router.use(passport_1.default.authenticate("jwt", {
    session: false,
    failureRedirect: "/",
}), permission_1.default);
router.route("/").get(authValidation_1.cacheControl, userFeedbackController_1.userFeedbackController);
router.route("/getAllFeedbacks").get(authValidation_1.cacheControl, userFeedbackController_1.getFeedbacks);
exports.default = router;
