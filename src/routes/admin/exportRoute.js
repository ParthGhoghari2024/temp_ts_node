import express from "express";
import { exportQuestionsPageController } from "../../controller/admin/questionsControllers/exportQuestionsController";
import { exportQueMiddleware } from "../../middlewares/exportQueMiddleware";
import { cacheControl } from "../../middlewares/authValidation";

let router = express.Router();
// router.use(exportQueMiddleware);
router
  .route("/questions/exportPage")
  .get(cacheControl, exportQueMiddleware, exportQuestionsPageController);

export default router;
