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
exports.viewAdminFeedbackPostController = exports.updateExamsRecord = exports.examsRecord = exports.selectFeedback = exports.adminFeedbackPostController = exports.getExamRecords = exports.allExams = exports.allExamsPage = exports.answerKey = exports.exams = exports.resultDetails = exports.studentResultDetails = exports.getStudentDetails = exports.studentDetailsPage = void 0;
const dbConnection_1 = __importDefault(require("../../config/dbConnection"));
const node_notifier_1 = __importDefault(require("node-notifier"));
const pino_1 = require("../../utils/pino");
const studentDetailsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render("admin/studentDetails", { id: req.user.id });
    }
    catch (err) {
        pino_1.logger.info(error.message);
    }
});
exports.studentDetailsPage = studentDetailsPage;
const getStudentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getRollName = `select id from roles where role = ?`;
        let [rollNameResult] = yield dbConnection_1.default.query(getRollName, ["Student"]);
        let rollid = rollNameResult[0].id;
        const getStudentDetails = `select fname as FirstName, lname as LastName,phone_no as ContactNumber,email as EmailAddress, date(created_at) as RegistrationDate from users where role_id = ?`;
        let [result] = yield dbConnection_1.default.query(getStudentDetails, [rollid]);
        if (result.length == 0) {
            res.json({ msg: "no records" });
        }
        else {
            res.json(result);
        }
    }
    catch (err) {
        pino_1.logger.info(err.message);
    }
});
exports.getStudentDetails = getStudentDetails;
const studentResultDetails = (req, res) => {
    try {
        res.render("admin/studentResultDetails", { id: req.user.id });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
};
exports.studentResultDetails = studentResultDetails;
const resultDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleSQL = `select id from roles  where  role =  ?`;
        let [roleResult] = yield dbConnection_1.default.query(roleSQL, ["Student"]);
        let role_id = roleResult[0].id;
        let getResultDetails;
        getResultDetails = `select users.id as uid, users.fname as StudentName, users.email as StudentEmailAddress,exam_details.id as eid, exam_details.title as ExamName, exam_details.start_time as StartTime, exam_details.total_marks as TotalMarks, results.exam_id as ID, results.marks as ObtainedMarks  from exam_details inner join results on exam_details.id = results.exam_id
      inner join users on users.id = results.user_id where users.role_id = ? order by results.id desc `;
        let [result] = yield dbConnection_1.default.query(getResultDetails, [role_id]);
        if (result.length == 0) {
            res.json({ msg: "no result found" });
        }
        else {
            res.json(result);
        }
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.resultDetails = resultDetails;
const exams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getExams = `select title from exam_details`;
        let [result] = yield dbConnection_1.default.query(getExams);
        res.json({ result });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.exams = exams;
const answerKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let examId = req.query.examid;
    let userId = req.query.userid;
    const query = `
  SELECT
  u.fname AS first_name,
  u.lname AS last_name,
  e.title AS exam_title,
  e.start_time AS exam_start_time,
  e.duration_minute AS exam_duration,
  e.total_marks AS total_marks,
  e.passing_marks AS passing_marks,
  q.id AS question_id,
  q.questions AS question,
  q.score AS score,
  GROUP_CONCAT(o.id ORDER BY o.id) AS option_ids,
  GROUP_CONCAT(o.option_value ORDER BY o.id) AS options,
  GROUP_CONCAT(o.isAnswer ORDER BY o.id) AS correct_answers,
  ua.answer_id AS user_answer_id,
  TIMESTAMPDIFF(MINUTE, MIN(ue.starttime), MAX(ue.endtime)) AS duration_minutes
 
FROM
  users u
INNER JOIN
  user_answers ua ON u.id = ua.user_id
INNER JOIN
  exam_details e ON ua.exam_id = e.id
INNER JOIN
  questions q ON ua.question_id = q.id
INNER JOIN
  options o ON q.id = o.question_id
INNER JOIN
  user_examtimes ue ON u.id = ue.user_id AND e.id = ue.exam_id
WHERE
  u.id = ? and e.id = ?
GROUP BY
  u.fname, u.lname, e.title, e.start_time, e.duration_minute, e.total_marks, q.id, q.questions, ua.answer_id, ua.exam_id
`;
    try {
        let [result] = yield dbConnection_1.default.query(query, [userId, examId]);
        if (!result) {
            res.render(" admin/viewStudentsAnswerKey", {
                msg: "No Qustion Answer Key Found",
                id: req.user.id,
            });
        }
        const processedResults = result.map((data) => {
            return {
                passingmarks: data.passing_marks,
                result: data.result,
                duration_minute: data.duration_minutes,
                first_name: data.first_name,
                last_name: data.last_name,
                exam_title: data.exam_title,
                exam_start_time: data.exam_start_time,
                exam_duration: data.exam_duration,
                total_marks: data.total_marks,
                question_id: data.question_id,
                question: data.question,
                score: data.score,
                options_ids: data.option_ids.split(","),
                options: data.options.split(","),
                correct_answers: data.correct_answers.split(",").map(Number),
                user_answer_id: data.user_answer_id,
            };
        });
        let totalScore = 0;
        for (let i = 0; i < processedResults.length; i++) {
            if (processedResults[i].user_answer_id ==
                processedResults[i].options_ids[processedResults[i].correct_answers.indexOf(1)]) {
                totalScore += processedResults[i].score;
            }
        }
        let resultStatus;
        if (totalScore >= result[0].passing_marks) {
            resultStatus = "Pass";
        }
        else {
            resultStatus = "Fail";
        }
        res.render("admin/viewStudentsAnswerKey", {
            resultData: processedResults,
            totalScore,
            id: req.user.id,
            resultStatus,
        });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.answerKey = answerKey;
const allExamsPage = (req, res) => {
    try {
        res.render("admin/viewAllExams", { id: req.user.id });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
};
exports.allExamsPage = allExamsPage;
const allExams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let getAllExams = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions, exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())<1 AND isDeleted = 0 order by id desc`;
        let [result] = yield dbConnection_1.default.query(getAllExams);
        // console.log(result);
        res.json(result);
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.allExams = allExams;
const getExamRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let examTitle = req.body.status;
        let getExamRecords;
        if (!examTitle) {
            getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate,
       time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,
       passing_marks as PassingMarks,instructions , exam_activation_code as Exam_Code
        from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())<1 AND isDeleted = 0 order by id desc`;
        }
        else if (examTitle == "upcoming") {
            getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions, exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())<1 AND isDeleted = 0 order by id desc`;
        }
        else if (examTitle == "ongoing") {
            getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions,exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())>=0 and TIMESTAMPDIFF(MINUTE,start_time,utc_timestamp()) < duration_minute AND isDeleted = 0 order by id desc`;
        }
        else if (examTitle == "completed") {
            getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions, exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())>= duration_minute AND isDeleted = 0 order by id desc`;
        }
        let [result] = yield dbConnection_1.default.query(getExamRecords, [0]);
        if (result.length == 0) {
            res.json({ msg: "no result found", examTitle });
        }
        else {
            res.json({ result, examTitle });
        }
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.getExamRecords = getExamRecords;
const adminFeedbackPostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let feedback = req.body.feedback.trim();
        let uid = req.body.uid;
        let eid = req.body.eid;
        let id = req.user.id;
        let insertSQL;
        insertSQL = `INSERT INTO instructor_feedbacks (student_id,exam_id,instructor_id,feedback)
    VALUES (?,?,?,?);`;
        let [insertSQLResult] = yield dbConnection_1.default.query(insertSQL, [
            uid,
            eid,
            id,
            `'${feedback}'`,
        ]);
        res.json({ success: "success" });
        node_notifier_1.default.notify("Feedback sent successfully");
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.adminFeedbackPostController = adminFeedbackPostController;
const viewAdminFeedbackPostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let uid = req.body.uid;
        let eid = req.body.eid;
        let showFeedbackSQL = `select feedback from instructor_feedbacks where student_id = ? AND  exam_id = ?`;
        let [showFeedbackResult] = yield dbConnection_1.default.query(showFeedbackSQL, [uid, eid]);
        if (showFeedbackResult.length == 0) {
            res.json({ success: "fail" });
        }
        else {
            let feedbackVAL = showFeedbackResult[0].feedback;
            res.json({ success: "success", feedbackVAL: feedbackVAL });
        }
    }
    catch (error) {
        console.log(error);
    }
});
exports.viewAdminFeedbackPostController = viewAdminFeedbackPostController;
const selectFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let uid = req.body.uid;
        let eid = req.body.eid;
        let selectFeedbacks = `select * from instructor_feedbacks where student_id = ? AND exam_id = ?`;
        let resultDetails = yield dbConnection_1.default.query(selectFeedbacks, [uid, eid]);
        res.json(resultDetails);
    }
    catch (err) {
        console.log(err);
    }
});
exports.selectFeedback = selectFeedback;
const examsRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let examid = req.query.examid;
    try {
        let exams = "select title,start_time,duration_minute,total_marks,passing_marks,instructions,exam_status from exam_details where id =? AND isDeleted = ?";
        let [result] = yield dbConnection_1.default.query(exams, [examid, 0]);
        let examdetails = result;
        res.json(examdetails);
    }
    catch (error) {
        pino_1.logger.info(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.examsRecord = examsRecord;
const updateExamsRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title, start_time, duration_minute, passingmarks, instructions, } = req.body;
        let updateExamDetails = `update exam_details set title = ?,start_time = ?,duration_minute = ?, passing_marks = ?, instructions = ? where id = ? AND isDeleted = ?`;
        if (new Date() < new Date(start_time)) {
            let [result] = yield dbConnection_1.default.query(updateExamDetails, [
                title,
                new Date(start_time),
                duration_minute,
                passingmarks,
                instructions,
                id,
                0,
            ]);
            node_notifier_1.default.notify("Data Updated Successfully");
            res.json({ success: true });
        }
        else {
            node_notifier_1.default.notify("cannot update exam details (ongoing)");
            res.json({ success: timeexceeding });
        }
    }
    catch (error) {
        pino_1.logger.info(error.message);
        res.json({ success: false });
    }
});
exports.updateExamsRecord = updateExamsRecord;
