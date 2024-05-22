"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
const permission_1 = __importDefault(require("../../middlewares/permission"));
// rendering routes
const userAnswerKey_1 = require("../../controller/user/userAnswerKey");
router.use(passport_1.default.authenticate("jwt", { session: false, failureRedirect: "/" }), permission_1.default);
router.route("/").get(userAnswerKey_1.userAnswerReview);
exports.default = router;
