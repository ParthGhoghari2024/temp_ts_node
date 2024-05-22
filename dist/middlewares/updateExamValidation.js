"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamDetailsValidation = void 0;
const pino_1 = require("../utils/pino");
const dbConnection_1 = __importDefault(require("../config/dbConnection"));
const updateExamDetailsValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title, start_time, duration_minute, passingmarks, instructions, } = req.body;
        let getTotalMarks = `select total_marks from exam_details where id = ?`;
        let result = [];
        [result] = yield dbConnection_1.default.query(getTotalMarks, [id]);
        let totalmarks = result[0].total_marks;
        let validateUpcomingDateAndTime = (date) => new Date(date) > new Date();
        if (title.length >= 255 ||
            !validateUpcomingDateAndTime(start_time) ||
            duration_minute > 300 ||
            passingmarks >= totalmarks ||
            instructions.length > 65535) {
            return res.json({ incorrect: true });
        }
        else {
            next();
        }
    }
    catch (error) {
        pino_1.logger.info(error);
    }
});
exports.updateExamDetailsValidation = updateExamDetailsValidation;
