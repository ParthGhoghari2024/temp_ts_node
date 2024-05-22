"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
const permission_1 = __importDefault(require("../../middlewares/permission"));
const uploadProfileImageMiddleware_1 = require("../../middlewares/uploadProfileImageMiddleware");
const exportPDF_1 = require("../../controller/user/userDatas/exportPDF");
const authValidation_1 = require("../../middlewares/authValidation");
// rendering routes
const userProfile_1 = require("../../controller/user/userComponent/userProfile");
const fetchUser_1 = require("../../controller/user/userDatas/fetchUser");
router.use(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), permission_1.default);
router.route("/userDashboard").get(authValidation_1.cacheControl, userProfile_1.userDashboard);
router.route("/userProfile").get(authValidation_1.cacheControl, userProfile_1.userProfile);
router.route("/userProfile/update").get(authValidation_1.cacheControl, userProfile_1.updateUserRender);
router.route("/userScore").get(authValidation_1.cacheControl, userProfile_1.userScoreRender);
router.route("/results").get(authValidation_1.cacheControl, userProfile_1.resultsRender);
// data transaction routes
router.route("/").get(authValidation_1.cacheControl, fetchUser_1.dbUsers);
router.route("/profileImage").get(authValidation_1.cacheControl, fetchUser_1.sendFile);
router
    .route("/userProfile/update")
    .post(uploadProfileImageMiddleware_1.uploadProfileImageMiddleware, fetchUser_1.updateUser);
router.route("/getScores").get(authValidation_1.cacheControl, fetchUser_1.getScores);
router.route("/removeProfile").post(fetchUser_1.removeProfile);
router.route("/getresults").get(authValidation_1.cacheControl, fetchUser_1.results);
// search Route
router.route("/searchResult").get(authValidation_1.cacheControl, fetchUser_1.resultSearch);
// pdf route
router
    .route("/generateScoreCardPDF")
    .get(authValidation_1.cacheControl, exportPDF_1.exportExamResultScoreAsPDF);
exports.default = router;
