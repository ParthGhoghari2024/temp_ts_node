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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCode = exports.checkMarks = exports.submitAnswer = exports.examList = exports.showExam = exports.startExam = void 0;
let con = require("../../../config/dbConnection");
const pino_1 = require("../../../utils/pino");
const fetchExamDetails_1 = require("./fetchExamDetails");
const startExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examid = req.query.exam;
        const userid = req.user.id;
        let access = yield accessExam(userid, examid);
        if (!access.success) {
            return res.render("expirePage", {
                message: access === null || access === void 0 ? void 0 : access.message,
                image: access === null || access === void 0 ? void 0 : access.image,
            });
        }
        else {
            const data = yield getInstructions(examid);
            return res.render("user/exam/examQue", { data });
        }
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
});
exports.startExam = startExam;
const showExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examid = req.query.exam;
        const userid = req.user.id;
        let access = yield accessExam(userid, examid);
        if (!access.success) {
            return res.render("expirePage", {
                message: access === null || access === void 0 ? void 0 : access.message,
                examStatus: access === null || access === void 0 ? void 0 : access.examStatus,
            });
        }
        else {
            let sql = `SELECT duration_minute as duration from exam_details where id=?`;
            let duration = [];
            try {
                [duration] = yield con.query(sql, [examid]);
            }
            catch (error) {
                pino_1.logger.fatal(error);
            }
            let remainingTime = duration[0].duration;
            let savedAnswer = yield getSelectedQue(userid, examid);
            let storedAnswer = [];
            if (savedAnswer.result !== null) {
                storedAnswer = savedAnswer.result;
            }
            if (savedAnswer.duration !== null) {
                remainingTime = savedAnswer.duration;
            }
            if (savedAnswer.duration === null) {
                sql = `insert into user_examtimes (user_id,exam_id,starttime) values (?,?,?)`;
                try {
                    yield con.query(sql, [userid, examid, new Date()]);
                }
                catch (error) {
                    pino_1.logger.fatal(error);
                }
            }
            sql = `select q.id as que_id,q.questions,e.topic,o.id as opt_id,o.option_value,score from questions as q inner join options as o on q.id=o.question_id inner join exam_topics as e on  e.id=q.topic_id where q.exam_id=? order by e.topic asc`;
            let result = [];
            try {
                [result] = yield con.query(sql, [examid]);
            }
            catch (error) {
                pino_1.logger.fatal(error);
            }
            const topic = [];
            result.forEach((element) => {
                if (!topic.includes(element.topic)) {
                    topic.push(element.topic);
                }
            });
            const examPaper = yield getExamPaper(topic, result);
            let time = (remainingTime + 1) * 60 * 1000;
            // console.log(time);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                sql = ` select endtime from user_examtimes where user_id=? and exam_id=?`;
                let data;
                try {
                    [data] = yield con.query(sql, [userid, examid]);
                }
                catch (error) {
                    pino_1.logger.fatal(error);
                }
                if (((_a = data[0]) === null || _a === void 0 ? void 0 : _a.endtime) === null) {
                    let examEndTime = `update user_examtimes set endtime=? where exam_id=? and user_id=?`;
                    yield con.query(examEndTime, [new Date(), examid, userid]);
                    checkMarks(examid, userid);
                }
                // console.log(new Date().toLocaleString());
            }), time);
            return res.json({
                success: true,
                question: examPaper.question,
                topics: examPaper.topic,
                duration: remainingTime,
                examid: examid,
                savedAnswer: storedAnswer,
            });
        }
    }
    catch (error) {
        pino_1.logger.fatal(error.message);
    }
});
exports.showExam = showExam;
const examList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const totalExamData = yield (0, fetchExamDetails_1.showTotalExamList)(id);
    const givenExamData = yield (0, fetchExamDetails_1.showGivenExamList)(id);
    const ongoingExamData = yield (0, fetchExamDetails_1.showOngoingExamList)(id);
    const upcomingExamData = yield (0, fetchExamDetails_1.showUpcomingExamList)(id);
    const missedExamData = yield (0, fetchExamDetails_1.showMissedExamList)(id);
    if (totalExamData.success &&
        givenExamData.success &&
        ongoingExamData.success &&
        upcomingExamData.success &&
        missedExamData.success) {
        const examCounts = {
            totalExamCount: totalExamData.count,
            givenExamCount: givenExamData.count,
            ongoingExamCount: ongoingExamData.count,
            upcomingExamCount: upcomingExamData.count,
            missedExamCount: missedExamData.count,
        };
        const examLists = {
            totalExamList: totalExamData.list,
            upcomingExamList: upcomingExamData.list,
            ongoingExamList: ongoingExamData.list,
            givenExamList: givenExamData.list,
            missedExamList: missedExamData.list,
        };
        res.json({ examCount: examCounts, list: examLists, success: true });
    }
    else {
        return { success: false };
    }
});
exports.examList = examList;
//verify examcode
const verifyCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body;
    const sql = `select exam_activation_code as activationCode, duration_minute from exam_details where id = ?`;
    try {
        const [result] = yield con.query(sql, [data.id]);
        const resultData = JSON.parse(JSON.stringify(result));
        const activationCode = resultData[0].activationCode;
        if (data.code == activationCode) {
            let examCode = {
                code: activationCode,
                examid: data.id,
            };
            return res
                .cookie("examcode", examCode, {
                maxAge: `${result[0].duration_minute}` * 60 * 1000,
            })
                .json({ success: true, validation: true, examid: data.id });
        }
        else {
            res.json({ success: true, validation: false });
        }
    }
    catch (error) {
        pino_1.logger.fatal(error);
        res.json({ success: false });
    }
});
exports.verifyCode = verifyCode;
//submit answer after completion of exam
const submitAnswer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { examId, queAnswer } = req.body;
        const userId = req.user.id;
        queAnswer.forEach((element, i) => __awaiter(void 0, void 0, void 0, function* () {
            const obj = {
                user_id: userId,
                exam_id: examId,
            };
            obj.question_id = element.queId;
            obj.answer_id = element.ansId;
            let sql = `select answer_id from user_answers where question_id=? and user_id=? and exam_id=?`;
            let result;
            [result] = yield con.query(sql, [obj.question_id, userId, obj.exam_id]);
            if (result.length === 0) {
                if (obj.answer_id !== null || queAnswer.length !== 1) {
                    sql = `insert into user_answers set ?`;
                    try {
                        yield con.query(sql, [obj]);
                    }
                    catch (error) {
                        pino_1.logger.fatal(error);
                    }
                }
            }
            else {
                sql = `update user_answers set answer_id=? where question_id=? and user_id=? and exam_id=?`;
                try {
                    yield con.query(sql, [
                        obj.answer_id,
                        obj.question_id,
                        userId,
                        obj.exam_id,
                    ]);
                }
                catch (error) {
                    pino_1.logger.fatal(error);
                }
            }
        }));
        if (queAnswer.length !== 1) {
            let examEndTime = `update user_examtimes set endtime=? where exam_id=? and user_id=?`;
            yield con.query(examEndTime, [new Date(), examId, userId]);
            checkMarks(examId, userId);
        }
        return res.json({ success: true });
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.submitAnswer = submitAnswer;
//calculate marks of given exam
const checkMarks = (exam_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = user_id, examid = exam_id;
        let sql = `select q.id as que_id,o.id as opt_id,score from questions as q inner join options as o on q.id=o.question_id inner join exam_topics as e on  e.id=q.topic_id where q.exam_id =? and isAnswer=1;`;
        let [result] = yield con.query(sql, [examid]);
        sql = `select question_id,answer_id from user_answers where user_id=? and exam_id=?;`;
        let [userAns] = yield con.query(sql, [userid, examid]);
        let score = 0;
        result.forEach((element) => {
            userAns.forEach((data) => {
                if (element.que_id === data.question_id &&
                    element.opt_id === data.answer_id) {
                    score += element.score;
                }
            });
        });
        sql = `insert into results (exam_id,user_id,marks) values (?)`;
        let array = [examid, userid, score];
        try {
            yield con.query(sql, [array]);
        }
        catch (error) {
            pino_1.logger.fatal(error);
        }
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
});
exports.checkMarks = checkMarks;
//give user of exams
const getInstructions = (examid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let id = examid;
        let sql = `select instructions from exam_details where id = ?`;
        let result;
        [result] = yield con.query(sql, [id]);
        let instructions = `<div class="instructions">
      <div class="inst-details"><h2>Instructions</h2>
      <pre>${result[0].instructions}</pre> </div>
      <div>
       <button id="start" data-toggle-fullscreen>Start</button>
      </div>
      </div> `;
        return instructions;
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
});
//check user is already give that exam and access exam before starting or after completion
const accessExam = (user_id, exam_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let sql = `SELECT TIMESTAMPDIFF(SECOND,utc_timestamp(),start_time) as time ,
    duration_minute*60 as duration,ed.start_time,ue.starttime,ue.endtime,ed.isDeleted from exam_details as ed left join user_examtimes as ue
    on ed.id=ue.exam_id and user_id=? where ed.id=?`;
        let result = [];
        try {
            [result] = yield con.query(sql, [user_id, exam_id]);
        }
        catch (error) {
            pino_1.logger.fatal(error);
        }
        if (result.length === 0 || result[0].isDeleted === 1) {
            return {
                success: false,
                message: "Link is Invalid.",
                image: "resultnotfound.png",
            };
        }
        else {
            if (result[0].time > 0) {
                return {
                    success: false,
                    message: "Exam will Start Soon...",
                    image: "examstartsoon.png",
                };
            }
            if (result[0].time < -result[0].duration / 3 &&
                result[0].starttime === null) {
                return {
                    success: false,
                    message: "Link is Expired.",
                    image: "expiredImage1.png",
                };
            }
            if (result[0].time < -result[0].duration &&
                result[0].starttime !== null &&
                result[0].endtime === null) {
                try {
                    yield con.query(`update user_examtimes set endtime=? where user_id=? and exam_id=?`, [new Date(), user_id, exam_id]);
                }
                catch (error) {
                    pino_1.logger.fatal(error);
                }
                return {
                    success: false,
                    message: "Link is Expired.",
                    image: "expiredImage1.png",
                };
            }
        }
        if (result[0].endtime !== null) {
            return {
                success: false,
                message: "Exam Already Given.",
                image: "submittedImage1.webp",
            };
        }
        else {
            return { success: true };
        }
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
});
const getExamPaper = (topic, result) => __awaiter(void 0, void 0, void 0, function* () {
    const questiondetails = Object.values(result.reduce((acc, { que_id, questions, topic, opt_id, option_value, score }) => {
        var _a;
        (_a = acc[que_id]) !== null && _a !== void 0 ? _a : (acc[que_id] = {
            que_id,
            questions,
            score,
            opt_id: [],
            option_value: [],
        });
        if (topic.split(" ").length > 1) {
            acc[que_id].topic = topic.split(" ").join("");
        }
        else {
            acc[que_id].topic = topic;
        }
        acc[que_id].opt_id.push(opt_id);
        acc[que_id].option_value.push(option_value);
        return acc;
    }, {}));
    //give arrays of question by topics
    const questions = [];
    topic.forEach((element) => {
        let topicname = element;
        if (topicname.split(" ").length > 1) {
            topicname = topicname.split(" ").join("");
        }
        let arr = questiondetails.filter((data) => {
            return data.topic == topicname;
        });
        questions.push(arr);
    });
    //convert multiple topicwise array into single question array
    const quetopicwise = [];
    questions.forEach((element) => {
        element.forEach((data) => {
            quetopicwise.push(data);
        });
    });
    let randomOrder = [];
    while (randomOrder.length < 4) {
        let index = Math.floor(Math.random() * 4);
        if (!randomOrder.includes(index)) {
            randomOrder.push(index);
        }
    }
    //generates questions
    let question = "";
    quetopicwise.forEach((element, i) => {
        question += ` <div class="queans">
    <div class="quedetails">
      <input type="hidden" id="${element.que_id}" name="que[]" value="${element.que_id}">
      <input type="hidden" class="topicname" value="${element.topic}">
      <p class="question"> <span id="queno">${i + 1}</span>.${element.questions}</p>
      <p> (<span id="quescore">${element.score}</span> ${element.score == 1 ? "mark" : "marks"})</p>
    </div>
    <div class="answer">
      <div class="opts"> `;
        randomOrder.forEach((data) => {
            question += `  <div>
        <input type="radio" name="opt${i + 1}"  value="${element.opt_id[data]}" id="opt${data}-${i + 1}"><label for="opt${data}-${i + 1}">${element.option_value[data]}</label>
      </div>`;
        });
        question += ` </div>
    </div>
       <div>
          <button id="opt${i + 1}" class="clear-response">Clear Response</button>
       </div>
    </div>`;
    });
    //generates topics
    let topics = "";
    topic.forEach((element) => {
        let topicname = element;
        if (topicname.split(" ").length > 1) {
            topicname = topicname.split(" ").join("");
        }
        topics += `<p id="${topicname}" class="topic" name="${topicname}">${element}</p>`;
    });
    return { question: question, topic: topics };
});
const getSelectedQue = (user_id, exam_id) => __awaiter(void 0, void 0, void 0, function* () {
    let sql = `select starttime,timestampdiff(minute,utc_timestamp(),starttime) + duration_minute as 
  time from user_examtimes as u left join exam_details as e on e.id=u.exam_id
   where user_id=? and exam_id=? `;
    let result;
    try {
        [result] = yield con.query(sql, [user_id, exam_id]);
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
    if (result[0]) {
        if (result[0].starttime !== null) {
            sql = `select question_id,answer_id from user_answers where user_id=? and exam_id=?`;
            try {
                [savedAnswer] = yield con.query(sql, [user_id, exam_id]);
            }
            catch (error) {
                pino_1.logger.fatal(error);
            }
            if (savedAnswer.length === 0) {
                return { result: null, duration: result[0].time };
            }
            else {
                return { result: savedAnswer, duration: result[0].time };
            }
        }
    }
    else {
        return { result: null, duration: null };
    }
});
