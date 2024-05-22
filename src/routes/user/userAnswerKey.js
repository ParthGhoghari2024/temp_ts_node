import express from "express";
import path from "path";
const router = express.Router();
import passport from "passport";
import userHasPermission from "../../middlewares/permission";
import { exportQueMiddleware } from "../../middlewares/exportQueMiddleware";
import { uploadProfileImageMiddleware } from "../../middlewares/uploadProfileImageMiddleware";
import { exportExamResultScoreAsPDF } from "../../controller/user/userDatas/exportPDF";

// rendering routes
import { userAnswerReview } from "../../controller/user/userAnswerKey";

router.use(
  passport.authenticate("jwt", { session: false, failureRedirect: "/" }),
  userHasPermission
);

router.route("/").get(userAnswerReview);

export default router;
