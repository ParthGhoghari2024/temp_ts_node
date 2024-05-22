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
const dbConnection_1 = __importDefault(require("../../../config/dbConnection"));
const fs_1 = __importDefault(require("fs"));
const insertQuestionsController_1 = require("./insertQuestionsController");
const pino_1 = require("../../../utils/pino");
const path_1 = __importDefault(require("path"));
const papaparse_1 = __importDefault(require("papaparse"));
const pdfAndCsvGenerator_1 = require("../../../utils/pdfAndCsvGenerator");
const insertCSVController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.fileValidationError) {
            return res.json({ success: 0, message: "Invalid File type" });
        }
        if (!req.file) {
            return res.json({ success: 0, message: "No file selected", noFiles: 1 });
        }
        let insertCSVFileDetailSQL = `INSERT INTO CSVFiles (exam_id, admin_id, original_filename,new_filename, path) VALUES (?);`;
        let adminId = null; //temp todo:
        if (req.user && req.user.id) {
            adminId = req.user.id;
        }
        let examId = parseInt(req.body.examid);
        let newFileName = req.body.newFileName; //set from middleware
        let filePath = req.body.filePath; // set from middleware
        let examDetailsSQL = "select start_time,timestampdiff(second,utc_timestamp,start_time) as time from exam_details where id=?";
        let [examDetails] = yield dbConnection_1.default.query(examDetailsSQL, examId);
        // console.log(examDetails);
        let startingTime = "";
        // console.log(examDetails[0]);
        if (examDetails && examDetails[0] && examDetails[0].start_time) {
            if (examDetails[0].time < 0) {
                return res.json({ success: 0, startingTimeError: 1 });
            }
            // console.log(startingTime);
        }
        let insertCSVFileDetailParams = [
            examId,
            adminId,
            req.file.originalname,
            newFileName,
            filePath,
        ];
        let [insertCSVFileDetailResult] = yield dbConnection_1.default.query(insertCSVFileDetailSQL, [
            insertCSVFileDetailParams,
        ]);
        let csvDir = process.env.CSV_UPLOAD_PATH;
        let csvFileData = fs_1.default.readFileSync(`${csvDir}/${filePath}`, {
            encoding: "utf8",
            flag: "r",
        });
        let csvParsed = papaparse_1.default.parse(csvFileData);
        let csvArray = csvParsed.data;
        let difficulties = yield getDifficulties();
        let difficultiesArrray = Object.keys(difficulties); //TODO: TYPECAST THIS
        let topics = yield getTopics();
        let topicsArrray = Object.keys(topics); //TODO: TYPECAST THIS
        let validateCSVStatus = validateCSV(csvArray, difficultiesArrray, topicsArrray); //todo:
        if (validateCSVStatus != -1) {
            return res.json({
                success: 0,
                CSVParseError: 1,
                errorAt: validateCSVStatus,
            });
        }
        let updateExamTotalMarksFlag = Number(req.body.updateExamTotalMarks) ||
            Number(req.query.updateExamTotalMarks) ||
            0;
        if (updateExamTotalMarksFlag !== 1 && updateExamTotalMarksFlag !== 0) {
            return res.json({ temp: 1 });
        }
        // console.log(csvArray);
        const csvArrayWithoutHeader = csvArray.slice(1);
        let examTotalMarksFromQuestionsTable = yield (0, insertQuestionsController_1.getExamTotalMarksFromQuestionsTable)(examId);
        let insertedQuestionTotalMarks = 0;
        csvArrayWithoutHeader.forEach((arr, index) => {
            if (arr.length === 10) {
                insertedQuestionTotalMarks += parseInt(arr[9]);
            }
        });
        if (insertedQuestionTotalMarks === 0) {
            return res.json({ success: 0, totalMarksError: 1 });
        }
        if (updateExamTotalMarksFlag === 0) {
            //if this is 1 then we have to insert questions anyway and update the total marks in exam detail table or else we have to check if marks conflicts or not
            let examMarks = yield (0, insertQuestionsController_1.getExamMarksFromExamTable)(examId);
            let totalExamMarks = examMarks.totalExamMarks;
            let currentPassingMarks = examMarks.currentPassingMarks;
            if (examTotalMarksFromQuestionsTable === -1)
                examTotalMarksFromQuestionsTable = 0;
            if (totalExamMarks !=
                examTotalMarksFromQuestionsTable + insertedQuestionTotalMarks) {
                return res.json({
                    success: 0,
                    totalExamMarks,
                    newTotalMarks: examTotalMarksFromQuestionsTable + insertedQuestionTotalMarks,
                    currentPassingMarks: currentPassingMarks,
                });
            }
        }
        else {
            if (examTotalMarksFromQuestionsTable === -1)
                examTotalMarksFromQuestionsTable = 0;
            const newTotalMarks = examTotalMarksFromQuestionsTable + insertedQuestionTotalMarks;
            const newPassingMarks = req.query.newPassingMarks;
            if (newPassingMarks > newTotalMarks || newPassingMarks < 0) {
                return res.json({ success: 0, passingMarksValidate: 1 });
            }
            if (newPassingMarks != -1) {
                let updateExamSql = "update exam_details set total_marks = ? , passing_marks = ?  where id=?;";
                let [updateExamResult] = yield dbConnection_1.default.query(updateExamSql, [
                    newTotalMarks,
                    newPassingMarks,
                    examId,
                ]);
            }
        }
        insertQuestionsFromCSV(examId, csvArray);
        //updating exam status to active after questions added
        let updateExamStatusSQL = `UPDATE  exam_details SET exam_status = ? WHERE id = ?;`;
        let [updateExamStatusResult] = yield dbConnection_1.default.query(updateExamStatusSQL, [
            1,
            examId,
        ]);
        // send json after validation only
        res.json({ success: 1, message: "CSV stored" });
        //GENERATING PDF AND CSV FOR FUTURE DOWNLOAD
        let token = req.cookies.token;
        yield (0, pdfAndCsvGenerator_1.generateQuestionsPdfByExamId)(examId, token);
        yield (0, pdfAndCsvGenerator_1.generateQuestionsCSVByExamId)(examId);
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
const isNumber = (num) => !isNaN(num);
const validateCSV = (csvArray, difficultiesArrray, topicsArrray) => {
    try {
        let flag = 0;
        const MAX_LENGTH_QUESTION_TEXT = 1000;
        csvArray.forEach((row, index) => __awaiter(void 0, void 0, void 0, function* () {
            if (flag != 0)
                return;
            if (index != 0 && row.length === 10) {
                let que = {
                    text: row[1] && row[1].trim(),
                    difficulty: row[2] && row[2].trim(),
                    topic: row[3] && row[3].trim(),
                    score: parseInt(row[9]),
                    options: [
                        row[4] && row[4].trim(),
                        row[5] && row[5].trim(),
                        row[6] && row[6].trim(),
                        row[7] && row[7].trim(),
                    ],
                    correctId: parseInt(row[8]),
                };
                if (!que.text ||
                    !que.difficulty ||
                    !que.topic ||
                    !que.score ||
                    !que.options[0] ||
                    !que.options[1] ||
                    !que.options[2] ||
                    !que.options[3]) {
                    flag = index;
                }
                if (!isNumber(que.score) || !isNumber(que.correctId)) {
                    flag = index;
                }
                if (!difficultiesArrray.includes(que.difficulty.toLowerCase()) ||
                    !topicsArrray.includes(que.topic.toLowerCase())) {
                    flag = index;
                }
                if (que.correctId > 4 || que.correctId < 1) {
                    flag = index;
                }
                if (que.score > 5 || que.score < 1) {
                    flag = index;
                }
                if (que.text.length > MAX_LENGTH_QUESTION_TEXT ||
                    que.text.length === 0 ||
                    que.options[0].length > 255 ||
                    que.options[0].length === 0 ||
                    que.options[1].length > 255 ||
                    que.options[1].length === 0 ||
                    que.options[2].length > 255 ||
                    que.options[2].length === 0 ||
                    que.options[3].length > 255 ||
                    que.options[3].length === 0) {
                    flag = index;
                }
            }
            else {
                // to check if whole row is empty then its fine for last row only
                row.forEach((cell) => {
                    if (cell) {
                        flag = index;
                    }
                });
            }
        }));
        if (flag != 0)
            return flag;
        else
            return -1;
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
const insertQuestionsFromCSV = (examId, csvArray) => {
    try {
        csvArray.forEach((row, index) => __awaiter(void 0, void 0, void 0, function* () {
            if (index != 0 && row.length === 10) {
                let que = {
                    text: row[1] && row[1].trim(),
                    difficulty: row[2] && row[2].trim(),
                    topic: row[3] && row[3].trim(),
                    score: parseInt(row[9]),
                    options: [
                        row[4] && row[4].trim(),
                        row[5] && row[5].trim(),
                        row[6] && row[6].trim(),
                        row[7] && row[7].trim(),
                    ],
                    correctId: parseInt(row[8]),
                };
                yield insertQuestion(examId, que);
            }
        }));
        // console.log(csvFileData);
        // console.log(csvArray);
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
// const insertQuestionHelper
// not in use currenly , replaced by package
const csvToArrray = (data) => {
    try {
        let rows = data.split("\n");
        let arr = rows.map((row) => {
            return row.split(",");
        });
        return arr;
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
const getDifficulties = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getDifficultiesSql = `select id,difficulty from difficulty_levels `;
        let [result] = yield dbConnection_1.default.query(getDifficultiesSql);
        let resultObj = {};
        result.forEach((el) => {
            resultObj[el.difficulty.toLowerCase()] = el.id;
        });
        return resultObj;
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
const getTopics = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getTopicsSql = `select id,topic from exam_topics `;
        let [result] = yield dbConnection_1.default.query(getTopicsSql);
        let resultObj = {};
        result.forEach((el) => {
            resultObj[el.topic.toLowerCase()] = el.id;
        });
        return resultObj;
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
const insertQuestion = (examId, que) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let difficulties = yield getDifficulties();
        let topics = yield getTopics();
        // console.log(topics)
        // console.log(difficulties);
        let insertQuestionSql = "INSERT INTO questions (`exam_id`, `difficulty_id`, `topic_id`, `questions`, `score`) VALUES (?)";
        let insertOptionSql = "INSERT INTO options (`question_id`, `option_value`, `isAnswer`) VALUES (?)";
        let options = que.options;
        let questionSqlParam = [
            examId,
            difficulties[que.difficulty.toLowerCase()],
            topics[que.topic.toLowerCase()],
            que.text,
            que.score,
        ];
        let [questionInsertResult] = yield dbConnection_1.default.query(insertQuestionSql, [
            questionSqlParam,
        ]);
        // console.log(questionInsertResult);
        let questionInsertedId = questionInsertResult.insertId;
        options.forEach((option, index) => __awaiter(void 0, void 0, void 0, function* () {
            let isAns = false;
            if (index + 1 === que.correctId)
                isAns = true;
            let optionSqlParam = [questionInsertedId, option, isAns];
            let [optionInsertResult] = yield dbConnection_1.default.query(insertOptionSql, [
                optionSqlParam,
                // console.log(optionInsertResult);
            ]);
        }));
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
const downloadSampleCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sampleCSVPath = "../../../../uploads/questionCSV/sample.csv";
        res.sendFile(path_1.default.join(__dirname + sampleCSVPath));
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
module.exports = { insertCSVController, downloadSampleCSV };
