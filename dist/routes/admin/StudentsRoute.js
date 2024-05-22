"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const updateExamValidation_1 = require("../../middlewares/updateExamValidation");
const studentController_1 = require("../../controller/admin/studentController");
const authValidation_1 = require("../../middlewares/authValidation");
const passport_1 = __importDefault(require("passport"));
const permission_1 = __importDefault(require("../../middlewares/permission"));
var router = express_1.default.Router();
router.use(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), permission_1.default);
router.route("/studentdetailspage").get(authValidation_1.cacheControl, studentController_1.studentDetailsPage);
router.route("/getstudentdetails").get(authValidation_1.cacheControl, studentController_1.getStudentDetails);
router.route("/resultdetails").get(authValidation_1.cacheControl, studentController_1.studentResultDetails);
router.route("/getrecords").all(studentController_1.resultDetails);
router.route("/getallexams").get(authValidation_1.cacheControl, studentController_1.exams);
router.route("/answerkey").get(authValidation_1.cacheControl, studentController_1.answerKey);
router.route("/allexamspage").get(authValidation_1.cacheControl, studentController_1.allExamsPage);
router.route("/allexams").get(authValidation_1.cacheControl, studentController_1.allExams);
router.route("/getexamrecords").all(studentController_1.getExamRecords);
//ADMIN  FEEDBACK
router.route("/adminFeedbackPost").post(studentController_1.adminFeedbackPostController);
router.route("/viewAdminFeedback").post(studentController_1.viewAdminFeedbackPostController);
router.route("/selectFeedback").post(studentController_1.selectFeedback);
router.route("/selectFeedback").post(studentController_1.selectFeedback);
router.route("/examsrecord").get(authValidation_1.cacheControl, studentController_1.examsRecord);
router
    .route("/updateexamsrecord")
    .post(updateExamValidation_1.updateExamDetailsValidation, studentController_1.updateExamsRecord);
exports.default = router;
