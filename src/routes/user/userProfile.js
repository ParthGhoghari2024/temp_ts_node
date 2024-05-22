import express from "express";
import path from "path";
const router = express.Router();
import passport from "passport";
import userHasPermission from "../../middlewares/permission";
import { uploadProfileImageMiddleware } from "../../middlewares/uploadProfileImageMiddleware";
import { exportExamResultScoreAsPDF } from "../../controller/user/userDatas/exportPDF";
import { cacheControl } from "../../middlewares/authValidation";

// rendering routes
import {
  userDashboard,
  userProfile,
  updateUserRender,
  userScoreRender,
  resultsRender,
} from "../../controller/user/userComponent/userProfile";
import {
  updateUser,
  sendFile,
  getScores,
  dbUsers,
  removeProfile,
  results,
  resultSearch,
} from "../../controller/user/userDatas/fetchUser";

router.use(
  passport.authenticate("jwt", { session: false, failureRedirect: "/" }),
  userHasPermission
);

router.route("/userDashboard").get(cacheControl, userDashboard);

router.route("/userProfile").get(cacheControl, userProfile);

router.route("/userProfile/update").get(cacheControl, updateUserRender);

router.route("/userScore").get(cacheControl, userScoreRender);

router.route("/results").get(cacheControl, resultsRender);

// data transaction routes

router.route("/").get(cacheControl, dbUsers);

router.route("/profileImage").get(cacheControl, sendFile);

router
  .route("/userProfile/update")
  .post(uploadProfileImageMiddleware, updateUser);

router.route("/getScores").get(cacheControl, getScores);

router.route("/removeProfile").post(removeProfile);

router.route("/getresults").get(cacheControl, results);

// search Route
router.route("/searchResult").get(cacheControl, resultSearch);

// pdf route
router
  .route("/generateScoreCardPDF")
  .get(cacheControl, exportExamResultScoreAsPDF);

export default router;
