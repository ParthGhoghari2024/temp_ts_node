"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
let express = require("express");
const examController_1 = require("../../controller/user/examdetailsController/examController");
const passport_1 = __importDefault(require("passport"));
const auth_1 = require("../../middlewares/auth");
const permission_1 = __importDefault(require("../../middlewares/permission"));
const examNotify_1 = require("../../controller/admin/examNotify");
let router = express.Router();
router.use(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), permission_1.default);
router.route("/startexam").get(auth_1.hasExamCode, examController_1.startExam);
router.route("/showexam").get(auth_1.hasExamCode, examController_1.showExam);
router.route("/examList").get(examController_1.examList);
router.route("/examList").post(examController_1.verifyCode);
router.route("/submitexam").post(examController_1.submitAnswer);
router.route("/checkmark").get(examController_1.checkMarks);
router.route("/expired").get((req, res) => {
    res.render("expirePage");
});
router.route("/examnotifications").get(examNotify_1.notifyUser);
exports.default = router;
