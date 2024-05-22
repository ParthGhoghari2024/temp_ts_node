"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const exportQuestionsController_1 = require("../../controller/admin/questionsControllers/exportQuestionsController");
const exportQueMiddleware_1 = require("../../middlewares/exportQueMiddleware");
const authValidation_1 = require("../../middlewares/authValidation");
let router = express_1.default.Router();
// router.use(exportQueMiddleware);
router
    .route("/questions/exportPage")
    .get(authValidation_1.cacheControl, exportQueMiddleware_1.exportQueMiddleware, exportQuestionsController_1.exportQuestionsPageController);
exports.default = router;
