"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const examController_1 = require("../../controller/admin/examController");
const updateQuestionsController_1 = require("../../controller/admin/questionsControllers/updateQuestionsController");
const insertQuestionsController_1 = require("../../controller/admin/questionsControllers/insertQuestionsController");
const insertCSVController_1 = require("../../controller/admin/questionsControllers/insertCSVController");
const uploadCSVMiddleware_1 = require("../../middlewares/uploadCSVMiddleware");
const questionsController_1 = require("../../controller/admin/questionsControllers/questionsController");
const exportQuestionsController_1 = require("../../controller/admin/questionsControllers/exportQuestionsController");
const authValidation_1 = require("../../middlewares/authValidation");
const passport_1 = __importDefault(require("passport"));
const permission_1 = __importDefault(require("../../middlewares/permission"));
let router = express_1.default.Router();
router.use(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), permission_1.default);
router.route("/create").get(authValidation_1.cacheControl, examController_1.createExamPageController);
router.route("/addQuestions").get(authValidation_1.cacheControl, examController_1.addQuestionsPageController);
router
    .route("/updateQuestions")
    .get(authValidation_1.cacheControl, updateQuestionsController_1.updateQuestionsPageController);
router.route("/insertCSV").post(uploadCSVMiddleware_1.uploadCSVMiddleware, insertCSVController_1.insertCSVController);
router.route("/sampleCSV").get(authValidation_1.cacheControl, insertCSVController_1.downloadSampleCSV);
router
    .route("/questions/export/pdf")
    .get(authValidation_1.cacheControl, exportQuestionsController_1.exportQuestionsControllerAsPdf);
router
    .route("/questions/export/csv")
    .get(authValidation_1.cacheControl, exportQuestionsController_1.exportQuestionsControllerAsCSV);
router.route("/questions/view").get(authValidation_1.cacheControl, questionsController_1.viewQuestionsPageController);
router.route("/topics").get(authValidation_1.cacheControl, examController_1.examTopicsController);
router.route("/api/topics").get(authValidation_1.cacheControl, examController_1.getExamTopicsController);
router
    .route("/api/difficulties")
    .get(authValidation_1.cacheControl, examController_1.getExamDifficultiesController);
router.route("/api/questions").post(insertQuestionsController_1.insertQuestionsController);
router.route("/api/create").post(examController_1.insertExamController);
router.route("/api/questions/update").post(updateQuestionsController_1.updateQuestionsController);
router.route("/api/questions/details").post(questionsController_1.questionDetailsController);
router.route("/topics").post(examController_1.addCategoryController);
router.route("/topics/deleteCategory/:id").post(examController_1.deleteCategoryController);
router.route("/topics/editCategory").post(examController_1.editCategoryController);
router.route("/deleteExam").post(examController_1.deleteExamController);
exports.default = router;
