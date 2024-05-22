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
exports.exportQuestionsControllerAsCSV = exports.exportQuestionsControllerAsPdf = exports.exportQuestionsPageController = void 0;
const dbConnection_1 = __importDefault(require("../../../config/dbConnection"));
const insertQuestionsController_1 = require("./insertQuestionsController");
const pino_1 = require("../../../utils/pino");
const fs_1 = __importDefault(require("fs"));
const pdfAndCsvGenerator_1 = require("../../../utils/pdfAndCsvGenerator");
const exportQuestionsPageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let examId = req.query.examid;
        if (!examId) {
            res.render("errorPage404");
        }
        let selectQuestionsByExamIdSql = "SELECT id,exam_id,difficulty_id,topic_id,questions,score,isDeleted,created_at,updated_at FROM questions  WHERE exam_id = ? and isDeleted=false";
        let [selectQuestionsByExamIdResult] = yield dbConnection_1.default.query(selectQuestionsByExamIdSql, examId);
        if (selectQuestionsByExamIdResult.length === 0) {
            //this is modified  , no need to do that now
            return res.json({
                message: "exam does not exist or no questions are there ",
            });
        }
        let reducedSelectQuestionsByExamIdResult;
        let firstQuestionByQueId = [
            {
                id: [],
                exam_id: [],
                topic_id: [],
                difficulty_id: [],
                questions: [],
                score: [],
            },
        ];
        reducedSelectQuestionsByExamIdResult =
            selectQuestionsByExamIdResult.reduce((prev, cur) => {
                prev.id.push(cur.id);
                prev.exam_id.push(cur.exam_id);
                prev.difficulty_id.push(cur.difficulty_id);
                prev.topic_id.push(cur.topic_id);
                prev.questions.push(cur.questions);
                prev.score.push(cur.score);
                return prev;
            }, firstQuestionByQueId[0]);
        let selectOptionsByQueIdSql = "SELECT id,question_id,option_value,isAnswer FROM options  WHERE question_id in (?) and isDeleted=false";
        let selectOptionsByQueIdResult = yield dbConnection_1.default.query(selectOptionsByQueIdSql, [
            reducedSelectQuestionsByExamIdResult.id,
        ]);
        // console.log(selectOptionsByQueIdResult);
        let optionsObj = {};
        //optionsObj = {
        //   '1':{ option obj  },
        // '2' : {},..
        // }
        reducedSelectQuestionsByExamIdResult.id.forEach((id) => {
            optionsObj[id] = selectOptionsByQueIdResult[0].filter((obj) => obj.question_id === id);
        });
        // console.log(optionsObj);
        let topics = yield (0, insertQuestionsController_1.getTopics)(); //TODO: typecast
        // topics = Object.keys(topics);
        let difficulties = yield (0, insertQuestionsController_1.getDifficulties)(); //TODO: typecast
        res.render("admin/exportQuestions", {
            data: reducedSelectQuestionsByExamIdResult,
            options: optionsObj,
            topics,
            difficulties,
        });
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
exports.exportQuestionsPageController = exportQuestionsPageController;
const exportQuestionsControllerAsPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examId = req.query.examid;
        const port = process.env.PORT;
        const token = req.cookies.token || "temp";
        if (!examId) {
            return res.render("errorPage404"); //temp
        }
        const examTitleSql = "select title from exam_details where id=? and isDeleted=0";
        let [examTitle] = yield dbConnection_1.default.query(examTitleSql, examId);
        if (!examTitle || !examTitle.length || !examTitle[0]) {
            return res.render("errorPage404");
        }
        let selectQuestionsByExamIdSql = "SELECT id FROM questions  WHERE exam_id = ? and isDeleted=false";
        let [selectQuestionsByExamIdResult] = yield dbConnection_1.default.query(selectQuestionsByExamIdSql, examId);
        if (!selectQuestionsByExamIdResult || !selectQuestionsByExamIdResult[0]) {
            return res.render("admin/noQuestionError");
            // return res.json({ success: 0, message: "exam does not exist or no questions are there " })
        }
        let examTitleString = examTitle[0].title || "test_exam";
        let dirOfPdf = process.env.CONTENT_DIR;
        let pathOfPdf = `${dirOfPdf}/questionsPdf/${examId}_${examTitleString}.pdf`;
        if (!fs_1.default.existsSync(pathOfPdf)) {
            yield (0, pdfAndCsvGenerator_1.generateQuestionsPdfByExamId)(examId, token);
        }
        res.download(`${dirOfPdf}/questionsPdf/${examId}_${examTitleString}.pdf`, `exam_${examTitleString}.pdf`);
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
exports.exportQuestionsControllerAsPdf = exportQuestionsControllerAsPdf;
const exportQuestionsControllerAsCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examId = Number(req.query.examid);
        const token = req.cookies.token;
        if (!examId)
            return res.render("errorPage404");
        const getExamDetailSQL = "select start_time from exam_details where id=? and isDeleted=0";
        // to check if exam exist and not deleted
        try {
            const [getExamDetailResult] = yield dbConnection_1.default.query(getExamDetailSQL, examId);
            if (!getExamDetailResult ||
                !getExamDetailResult.length ||
                (getExamDetailResult[0] && getExamDetailResult[0].length === 0)) {
                return res.status(404).render("errorPage404");
            }
            let selectQuestionsByExamIdSql = "SELECT id  FROM questions  WHERE exam_id = ? and isDeleted=false";
            let [selectQuestionsByExamIdResult] = yield dbConnection_1.default.query(selectQuestionsByExamIdSql, examId);
            if (selectQuestionsByExamIdResult.length ||
                !selectQuestionsByExamIdResult[0]) {
                return res.render("admin/noQuestionError");
                // return res.json({ success: 0, message: "exam does not exist or no questions are there " })
            }
        }
        catch (error) {
            pino_1.logger.error(error);
            return res.status(404).render("errorPage404");
        }
        const examTitleSql = "select title from exam_details where id=?";
        let [examTitle] = yield dbConnection_1.default.query(examTitleSql, examId);
        let examTitleString = examTitle[0].title || "test_exam";
        let dirOfCSV = process.env.CONTENT_DIR;
        let pathOfCSV = `${dirOfCSV}/questionsCSV/${examId}_${examTitleString}.csv`;
        if (!fs_1.default.existsSync(pathOfCSV)) {
            yield (0, pdfAndCsvGenerator_1.generateQuestionsCSVByExamId)(examId, token);
        }
        res.download(`${dirOfCSV}/questionsCSV/${examId}_${examTitleString}.csv`, `exam_${examTitleString}.csv`);
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
exports.exportQuestionsControllerAsCSV = exportQuestionsControllerAsCSV;
