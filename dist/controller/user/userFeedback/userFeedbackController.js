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
exports.getFeedbacks = exports.userFeedbackController = void 0;
const dbConnection_1 = __importDefault(require("../../../config/dbConnection"));
const pino_1 = require("../../../utils/pino");
const userFeedbackController = (req, res) => {
    try {
        res.render("./user/userFeedbacks.ejs");
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
};
exports.userFeedbackController = userFeedbackController;
const getFeedbacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId = req.user.id;
        let getAllFeedbacks = `select instructor_feedbacks.id as id,users.fname,users.lname,exam_details.title,exam_details.start_time as date,instructor_feedbacks.feedback from users inner join instructor_feedbacks on users.id = instructor_feedbacks.instructor_id inner join  exam_details on exam_details.id = instructor_feedbacks.exam_id where instructor_feedbacks.student_id = ? order by id desc`;
        let resultdetails = yield dbConnection_1.default.query(getAllFeedbacks, [userId]);
        res.json(resultdetails);
    }
    catch (err) {
        console.log(err);
    }
});
exports.getFeedbacks = getFeedbacks;
