"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const exportQueMiddleware_1 = require("../../middlewares/exportQueMiddleware");
const fetchUser_1 = require("../../controller/user/userDatas/fetchUser");
router.route("/userScoreEJS").get(exportQueMiddleware_1.exportQueMiddleware, fetchUser_1.userScoreRenderEJS);
exports.default = router;
