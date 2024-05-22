import express from "express";
import {
  createExamPageController,
  addQuestionsPageController,
  examTopicsController,
  getExamTopicsController,
  getExamDifficultiesController,
  addCategoryController,
  deleteCategoryController,
  insertExamController,
  editCategoryController,
  deleteExamController,
} from "../../controller/admin/examController";

import {
  updateQuestionsController,
  updateQuestionsPageController,
} from "../../controller/admin/questionsControllers/updateQuestionsController";
import { insertQuestionsController } from "../../controller/admin/questionsControllers/insertQuestionsController";
import {
  insertCSVController,
  downloadSampleCSV,
} from "../../controller/admin/questionsControllers/insertCSVController";
import { uploadCSVMiddleware } from "../../middlewares/uploadCSVMiddleware";
import {
  questionDetailsController,
  viewQuestionsPageController,
} from "../../controller/admin/questionsControllers/questionsController";
import {
  exportQuestionsPageController,
  exportQuestionsControllerAsPdf,
  exportQuestionsControllerAsCSV,
} from "../../controller/admin/questionsControllers/exportQuestionsController";
import { cacheControl } from "../../middlewares/authValidation";
import passport from "passport";
import userHasPermission from "../../middlewares/permission";

let router = express.Router();

router.use(
  passport.authenticate("jwt", { session: false, failureRedirect: "/" }),
  userHasPermission
);

router.route("/create").get(cacheControl, createExamPageController);
router.route("/addQuestions").get(cacheControl, addQuestionsPageController);
router
  .route("/updateQuestions")
  .get(cacheControl, updateQuestionsPageController);
router.route("/insertCSV").post(uploadCSVMiddleware, insertCSVController);
router.route("/sampleCSV").get(cacheControl, downloadSampleCSV);

router
  .route("/questions/export/pdf")
  .get(cacheControl, exportQuestionsControllerAsPdf);
router
  .route("/questions/export/csv")
  .get(cacheControl, exportQuestionsControllerAsCSV);

router.route("/questions/view").get(cacheControl, viewQuestionsPageController);

router.route("/topics").get(cacheControl, examTopicsController);

router.route("/api/topics").get(cacheControl, getExamTopicsController);

router
  .route("/api/difficulties")
  .get(cacheControl, getExamDifficultiesController);

router.route("/api/questions").post(insertQuestionsController);

router.route("/api/create").post(insertExamController);

router.route("/api/questions/update").post(updateQuestionsController);

router.route("/api/questions/details").post(questionDetailsController);

router.route("/topics").post(addCategoryController);

router.route("/topics/deleteCategory/:id").post(deleteCategoryController);

router.route("/topics/editCategory").post(editCategoryController);

router.route("/deleteExam").post(deleteExamController);

export default router;
