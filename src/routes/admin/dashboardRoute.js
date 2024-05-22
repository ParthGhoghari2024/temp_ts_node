import express from "express";
import {
  dashboardPageController,
  adminProfilePageController,
  examTableController,
  adminProfileUpdateController,
  adminProfileUpdatePageController,
  adminProfilePhotoUpload,
  setPhotoController,
  removePhotoController,
} from "../../controller/admin/dashboardController";
import { uploadProfileImageMiddleware } from "../../middlewares/uploadProfileImageMiddleware";
import { analysisPageContoller } from "../../controller/admin/analysisController";
import passport from "passport";
import userHasPermission from "../../middlewares/permission";
let router = express.Router();

router.use(
  passport.authenticate("jwt", { session: false, failureRedirect: "/" }),
  userHasPermission
);

import { cacheControl } from "../../middlewares/authValidation";

router.route("/").get(cacheControl, dashboardPageController);

router.route("/examTable").all(cacheControl, examTableController);

router.route("/adminProfile").get(cacheControl, adminProfilePageController);

router
  .route("/adminProfileUpdate")
  .get(cacheControl, adminProfileUpdateController);

router.route("/adminProfileUpdatePage").post(adminProfileUpdatePageController);

router
  .route("/adminProfilePhotoUpload")
  .post(uploadProfileImageMiddleware, adminProfilePhotoUpload);

router.route("/setPhoto/:id").get(cacheControl, setPhotoController);

router.route("/removePhoto").post(removePhotoController);

router.route("/analysis").get(cacheControl, analysisPageContoller);

export default router;
