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
exports.analysisPageContoller = void 0;
const dbConnection_1 = __importDefault(require("../../config/dbConnection"));
const analysisPageContoller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let rolesSql = `select id from roles where role="Student"`;
        let [roles] = yield dbConnection_1.default.query(rolesSql);
        const examTopicsCount = `select count(*) as total_topics from exam_topics where is_deleted=0`;
        let studentCount = `select count(*) as total_students from users where role_id=${roles[0].id}`;
        let examCount = `select count(*) as total_exams from exam_details where exam_status=1 and isDeleted=0`;
        let questionsTopicsCount = `select exam_topics.topic , count(exam_topics.topic) as count from exam_topics join questions on exam_topics.id = questions.topic_id where exam_topics.is_deleted=0 group by exam_topics.id;`;
        let questionsDifficultyCount = `select difficulty_levels.difficulty, count(difficulty_levels.difficulty) as count from difficulty_levels join questions on difficulty_levels.id = questions.difficulty_id group by difficulty_levels.id;`;
        let passingStudetnsSql = `select exam_details.title, exam_details.passing_marks, count(results.marks) as passing_students from exam_details join results on exam_details.id = results.exam_id  where results.marks>exam_details.passing_marks group by exam_details.id;`;
        let [topicsResult] = yield dbConnection_1.default.query(examTopicsCount);
        let [studentResult] = yield dbConnection_1.default.query(studentCount);
        let [examResult] = yield dbConnection_1.default.query(examCount);
        let [questionstTopicsResult] = yield dbConnection_1.default.query(questionsTopicsCount);
        let [passingStudentsResult] = yield dbConnection_1.default.query(passingStudetnsSql);
        let [questionsDifficultyResult] = yield dbConnection_1.default.query(questionsDifficultyCount);
        res.render("admin/analysis.ejs", {
            topic: topicsResult[0].total_topics,
            students: studentResult[0].total_students,
            exams: examResult[0].total_exams,
            questionsTopics: questionstTopicsResult,
            passingStudents: passingStudentsResult,
            id: req.user.id,
            questionsDifficulty: questionsDifficultyResult,
        });
    }
    catch (err) {
        console.log(err.message);
    }
});
exports.analysisPageContoller = analysisPageContoller;
