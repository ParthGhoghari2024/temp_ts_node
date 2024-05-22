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
exports.deleteExamController = exports.editCategoryController = exports.addCategoryController = exports.deleteCategoryController = exports.insertExamController = exports.getExamDifficultiesController = exports.getExamTopicsController = exports.examTopicsController = exports.addQuestionsPageController = exports.createExamPageController = void 0;
const dbConnection_1 = __importDefault(require("../../config/dbConnection"));
const pino_1 = require("../../utils/pino");
const generate_unique_id_1 = __importDefault(require("generate-unique-id"));
const createExamPageController = (req, res) => {
    try {
        res.render("admin/createExam", { id: req.user.id });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
};
exports.createExamPageController = createExamPageController;
const addQuestionsPageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // logger.info("addQuestionsPage")
        if (!req.query || !req.query.examid) {
            res.status(404).render("errorPage404");
        }
        const examId = Number(req.query.examid);
        const getExamDetailSQL = "select start_time,timestampdiff(second,utc_timestamp,start_time) as time from exam_details where id=? and isDeleted=0";
        try {
            // let result: IExamTime[];
            let [result] = yield dbConnection_1.default.query(getExamDetailSQL, examId);
            if (!result ||
                result.length === 0 ||
                (result[0] && result[0].length === 0)) {
                return res.status(404).render("errorPage404");
            }
            if (result && result[0] && result[0].start_time) {
                if (result[0].time < 0) {
                    // return res.json({ success: 0, startingTimeError: 1 });
                    return res.render("admin/addQuestions", {
                        id: req.user.id,
                        examId: examId,
                        startingTimeError: 1,
                    });
                }
            }
        }
        catch (error) {
            pino_1.logger.error(error);
            return res.status(404).render("errorPage404");
        }
        res.render("admin/addQuestions", {
            id: req.user.id,
            examId: examId,
            startingTimeError: 0,
        });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.addQuestionsPageController = addQuestionsPageController;
const examTopicsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getExamTopicsSql = `select topic, id from exam_topics where is_deleted="0"`;
        let [result] = yield dbConnection_1.default.query(getExamTopicsSql);
        res.render("admin/examTopics", {
            category: result,
            categoryName: false,
            id: req.user.id,
        });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.examTopicsController = examTopicsController;
const addCategoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let category = req.query.category;
    let namePattern = /([a-zA-Z0-9_\s]+)/;
    try {
        let getCategorySql = `select * from exam_topics where is_deleted="0"`;
        let [getCategory] = yield dbConnection_1.default.query(getCategorySql);
        let topics = [];
        getCategory.forEach((element) => {
            topics.push(element.topic.toLowerCase());
        });
        if (topics.includes(category.toLowerCase())) {
            res.json({ success: 0, message: "category already addedd" });
        }
        else if (category == "") {
            res.json({ success: 0, message: "please enter category" });
        }
        else if (!namePattern.test(category)) {
            res.json({ success: 0, message: "Please enter valid category" });
        }
        else {
            let insertTopicsSql = `insert into exam_topics(topic) values(?);`;
            let [result] = yield dbConnection_1.default.query(insertTopicsSql, [category]);
            res.json({ success: 1, categoryName: category });
            // res.render("admin/examTopics", { categoryName: category, id: req.user.id });
        }
    }
    catch (err) {
        pino_1.logger.info(err.message);
    }
});
exports.addCategoryController = addCategoryController;
const deleteCategoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let id = req.params.id;
        let deleteTopicsSql = `update exam_topics set is_deleted="1" where id=?`;
        let deleteQuestions = `update questions set isDeleted="1" where topic_id =?`;
        let [result] = yield dbConnection_1.default.query(deleteTopicsSql, [id]);
        let [result2] = yield dbConnection_1.default.query(deleteQuestions, [id]);
        res.json({ success: 1 });
    }
    catch (err) {
        pino_1.logger.info(err.message);
    }
});
exports.deleteCategoryController = deleteCategoryController;
const editCategoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query.id;
    let category = req.query.category;
    let namePattern = /([a-zA-Z0-9_\s]+)/;
    try {
        let getCategorySql = `select * from exam_topics where is_deleted="0"`;
        let [getCategory] = yield dbConnection_1.default.query(getCategorySql);
        let topics = [];
        getCategory.forEach((element) => {
            topics.push(element.topic);
        });
        if (topics.includes(category)) {
            res.json({ success: 0, message: "category already addedd" });
        }
        else if (category == "") {
            res.json({ success: 0, message: "please enter category" });
        }
        else if (!namePattern.test(category)) {
            res.json({ success: 0, message: "Please enter valid category" });
        }
        else {
            let editTopicsSql = `update exam_topics set topic="${category}" WHERE id =${id}`;
            let [result] = yield dbConnection_1.default.query(editTopicsSql);
            res.json({ success: 1 });
        }
    }
    catch (err) {
        pino_1.logger.info(err.message);
    }
});
exports.editCategoryController = editCategoryController;
const getExamTopicsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getExamTopicsSql = `select topic from exam_topics where is_deleted=0`;
        let [result] = yield dbConnection_1.default.query(getExamTopicsSql);
        let modifiedResult = result.reduce((prev, cur) => {
            prev.topic.push(cur.topic);
            return prev;
        }, {
            id: result[0].id,
            topic: [],
        });
        res.json({ success: 1, result: modifiedResult });
        // res.render('admin/examTopics')
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.getExamTopicsController = getExamTopicsController;
const getExamDifficultiesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getExamDifficultiesSql = `select difficulty from difficulty_levels`;
        let [result] = yield dbConnection_1.default.query(getExamDifficultiesSql);
        let modifiedResult;
        modifiedResult = result.reduce((prev, cur) => {
            prev.difficulty.push(cur.difficulty);
            return prev;
        }, {
            id: result[0].id,
            difficulty: [],
        });
        res.json({ success: 1, result: modifiedResult });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.getExamDifficultiesController = getExamDifficultiesController;
const getDifficultyId = (difficulty) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getDifficultyIdSql = `select id from difficulty_levels where difficulty=?`;
        let [result] = yield dbConnection_1.default.query(getDifficultyIdSql, difficulty);
        return result;
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
const getTopicId = (topic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getTopicIdSql = `select id from exam_topics where topic=?`;
        let [result] = yield dbConnection_1.default.query(getTopicIdSql, topic);
        return result;
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
const getDifficulties = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getDifficultiesSql = `select id,difficulty from difficulty_levels `;
        let [result] = yield dbConnection_1.default.query(getDifficultiesSql);
        let resultObj = {};
        result.forEach((el) => {
            resultObj[el.difficulty] = el.id;
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
            resultObj[el.topic] = el.id;
        });
        return resultObj;
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
const numberCheck = (num) => !isNaN(Number(num));
const insertExamController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let insertExamSql = "INSERT INTO  exam_details (creater_id, title, start_time, duration_minute, total_marks, passing_marks, instructions, exam_status, exam_activation_code) VALUES (?);";
        let adminId = null;
        // testing
        if (req.user && req.user.id) {
            adminId = req.user.id;
        }
        let reqBody = req.body;
        let examStatus = 0;
        //todo: generate random uid for exam-code
        let examCode = (0, generate_unique_id_1.default)({
            length: 6,
            useLetters: false,
            useNumbers: true,
        });
        //temp validations
        reqBody.title = reqBody.title && reqBody.title.trim();
        reqBody.instructions = reqBody.instructions && reqBody.instructions.trim();
        let validationsFailedArray = [];
        if (!reqBody.title)
            validationsFailedArray.push("title");
        if (!reqBody.startingTime)
            validationsFailedArray.push("startingTime"); //todo: time validate
        if (!reqBody.duration || !numberCheck(reqBody.duration))
            validationsFailedArray.push("duration");
        if (!reqBody.totalMarks || !numberCheck(reqBody.totalMarks))
            validationsFailedArray.push("totalMarks");
        if (!reqBody.passingMarks || !numberCheck(reqBody.passingMarks))
            validationsFailedArray.push("passingMarks");
        if (!reqBody.instructions)
            validationsFailedArray.push("instructions");
        if (reqBody.startingTime && isNaN(new Date(reqBody.startingTime).getTime()))
            validationsFailedArray.push("startingTime");
        let validateUpcomingDateAndTime = (date) => new Date(date) > new Date();
        if (reqBody.startingTime &&
            !validateUpcomingDateAndTime(reqBody.startingTime))
            validationsFailedArray.push("startingTime"); //todo: time validate
        if (reqBody.totalMarks &&
            numberCheck(reqBody.totalMarks) &&
            parseInt(reqBody.totalMarks) <= 0)
            validationsFailedArray.push("totalMarks");
        if (reqBody.title && reqBody.title.length > 255)
            validationsFailedArray.push("title");
        if (reqBody.passingMarks &&
            reqBody.totalMarks &&
            parseInt(reqBody.passingMarks) > parseInt(reqBody.totalMarks))
            validationsFailedArray.push("passingMarks");
        if (reqBody.duration &&
            (parseInt(reqBody.duration) > 300 || parseInt(reqBody.duration) <= 0))
            validationsFailedArray.push("duration");
        if (validationsFailedArray.length != 0) {
            return res.json({
                success: 0,
                message: "Fill details properly",
                validationsFailedArray,
            });
        }
        let insertExamSqlParam = [
            adminId,
            reqBody.title,
            new Date(reqBody.startingTime),
            parseInt(reqBody.duration),
            parseInt(reqBody.totalMarks),
            parseFloat(reqBody.passingMarks),
            reqBody.instructions,
            examStatus,
            examCode,
        ];
        let [examInsertResult] = yield dbConnection_1.default.query(insertExamSql, [
            insertExamSqlParam,
        ]);
        res.json({ success: 1, examId: examInsertResult.insertId });
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
exports.insertExamController = insertExamController;
//DELETE EXAM
const deleteExamController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let examID = req.body.examID;
        // console.log(examID);
        let deleteExamSQL1, deleteExamSQL2, deleteExamSQL3, selectQuestionSQL;
        selectQuestionSQL = `select id from questions where exam_id = ?`;
        let [selectQuestionResult] = yield dbConnection_1.default.query(selectQuestionSQL, [
            examID,
        ]);
        let resultValue = selectQuestionResult.map((row) => row.id);
        // console.log(resultValue);
        deleteExamSQL1 = `UPDATE exam_details SET isDeleted = ?  WHERE id = ?`;
        let [deleteExamResult1] = yield dbConnection_1.default.query(deleteExamSQL1, [1, examID]);
        deleteExamSQL2 = `UPDATE options SET isDeleted = ?  WHERE question_id IN (?)`;
        if (resultValue && resultValue.length > 0) {
            let [deleteExamResult2] = yield dbConnection_1.default.query(deleteExamSQL2, [1, resultValue]);
        }
        deleteExamSQL3 = `UPDATE questions SET isDeleted = ?  WHERE exam_id = ?`;
        let [deleteExamResult3] = yield dbConnection_1.default.query(deleteExamSQL3, [1, examID]);
        res.json({ success: "yes" });
    }
    catch (error) {
        console.log(error);
    }
});
exports.deleteExamController = deleteExamController;
