"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = require("../../controller/admin/dashboardController");
const uploadProfileImageMiddleware_1 = require("../../middlewares/uploadProfileImageMiddleware");
const analysisController_1 = require("../../controller/admin/analysisController");
const passport_1 = __importDefault(require("passport"));
const permission_1 = __importDefault(require("../../middlewares/permission"));
let router = express_1.default.Router();
router.use(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), permission_1.default);
const authValidation_1 = require("../../middlewares/authValidation");
router.route("/").get(authValidation_1.cacheControl, dashboardController_1.dashboardPageController);
router.route("/examTable").all(authValidation_1.cacheControl, dashboardController_1.examTableController);
router.route("/adminProfile").get(authValidation_1.cacheControl, dashboardController_1.adminProfilePageController);
router
    .route("/adminProfileUpdate")
    .get(authValidation_1.cacheControl, dashboardController_1.adminProfileUpdateController);
router.route("/adminProfileUpdatePage").post(dashboardController_1.adminProfileUpdatePageController);
router
    .route("/adminProfilePhotoUpload")
    .post(uploadProfileImageMiddleware_1.uploadProfileImageMiddleware, dashboardController_1.adminProfilePhotoUpload);
router.route("/setPhoto/:id").get(authValidation_1.cacheControl, dashboardController_1.setPhotoController);
router.route("/removePhoto").post(dashboardController_1.removePhotoController);
router.route("/analysis").get(authValidation_1.cacheControl, analysisController_1.analysisPageContoller);
exports.default = router;
