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
exports.resultSearch = exports.userScoreRenderEJS = exports.results = exports.removeProfile = exports.getScores = exports.sendFile = exports.updateUser = exports.dbUsers = void 0;
const dbConnection_1 = __importDefault(require("../../../config/dbConnection"));
const pino_1 = require("pino");
const logger = (0, pino_1.pino)();
const path_1 = __importDefault(require("path"));
const dbConnection_2 = __importDefault(require("../../../config/dbConnection"));
let id = 0;
const dbUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const sql = "select id, fname, lname, phone_no, email, dob, address, city, state, zipcode, about from users where id = ?"; //
    // const sql2 = "select u.id, u.fname, u.lname, u.phone_no, u.email, u.dob, u.address, u.city, u.state, u.zipcode, u.about, i.image_path from users as u join user_profile_images as i on u.id = i.user_id";
    try {
        const [result] = yield dbConnection_1.default.query(sql, [id]);
        if (result.length == 0) {
            return res.json({ success: false });
        }
        else {
            let userInfo = result[0];
            if (result[0].image_path == null) {
                res.status(200).json({
                    message: "data fetched Successfully",
                    result: userInfo,
                    profileImage: "/assets/profileDefaultImage.jpg",
                });
            }
            else {
                res.status(200).json({
                    message: "data fetched Successfully",
                    result: userInfo,
                    profileImage: result[0].image_path,
                });
            }
        }
    }
    catch (error) {
        logger.error(error);
    }
});
exports.dbUsers = dbUsers;
const sendFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const sql = "select image_path from user_profile_images where user_id = ? and active_profile = 1";
    try {
        const [result] = yield dbConnection_1.default.query(sql, [userId]);
        if (result.length === 0) {
            return res.sendFile(path_1.default.join(__dirname, "../../../../", "public/assets/profileDefaultImage.jpg"));
        }
        else {
            let imagePath = result[0].image_path;
            res.sendFile(path_1.default.join(__dirname, "../../../", imagePath));
        }
    }
    catch (error) {
        logger.error(error);
    }
});
exports.sendFile = sendFile;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    let imageFlag = 0;
    if (req.fileValidationError) {
        return res.json({ success: 0, message: "Invalid File type" });
    }
    if (req.body.id) {
        if (req.file) {
            try {
                const uSql = "update user_profile_images set active_profile = ? where user_id = ?";
                const [uResult] = yield dbConnection_1.default.query(uSql, [0, req.body.id]);
                const isql = "insert into user_profile_images (user_id, image_path, actual_name, current_name, active_profile) values (?,?,?,?,?)";
                const [result] = yield dbConnection_1.default.query(isql, [
                    req.body.id,
                    req.file.path,
                    req.file.originalname,
                    req.file.filename,
                    1,
                ]);
                imageFlag = 1;
            }
            catch (error) {
                logger.error(error);
                res
                    .status(502)
                    .json({ message: "error while updating the profile image" });
            }
        }
        else {
            imageFlag = 1;
        }
    }
    const fname = req.body.fname;
    const lname = req.body.lname;
    const phone = req.body.phone_no;
    const email = req.body.email;
    const dob = req.body.dob;
    const address = req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const zipcode = req.body.zipcode;
    const about = req.body.about;
    if (fname && lname && phone && email && dob && req.body.id) {
        const sql = "update users set fname = ?, lname = ?, phone_no = ?, email = ?, dob = ?, address = ?, city = ?, state = ?, zipcode = ?, about = ? where id = ?";
        try {
            const [result] = yield dbConnection_1.default.query(sql, [
                fname,
                lname,
                phone,
                email,
                dob,
                address,
                city,
                state,
                zipcode,
                about,
                req.body.id,
            ]);
            if (imageFlag == 1) {
                res.status(200).json({
                    success: true,
                    message: "user profile updated",
                    result: result[0],
                });
            }
        }
        catch (error) {
            logger.error(error);
            res.status(501).json({
                success: false,
                message: "error while updating the profile",
                error: error,
            });
        }
    }
    else {
        res.status(300).json({ success: false, message: "empty field/field" });
    }
});
exports.updateUser = updateUser;
const getScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const examSql = "SELECT r.exam_id, r.marks, u.fname, u.lname, e.id, e.title, timestampdiff(second,starttime,endtime) as duration_minute, e.total_marks, e.passing_marks, date(e.start_time) as exam_date from results as r inner join user_examtimes as ue on r.exam_id=ue.exam_id inner JOIN users AS u ON r.user_id = u.id LEFT JOIN exam_details AS e ON r.exam_id = e.id  where e.id = ? and r.user_id = ?";
    const detailedScore = "SELECT DISTINCT q.topic_id, sum(q.score) as score, t.topic FROM user_answers as u JOIN questions AS q on u.exam_id = q.exam_id JOIN options as o ON q.id = o.question_id JOIN exam_topics as t on t.id = q.topic_id where u.exam_id = ? and u.user_id = ? and o.isAnswer = 1 and o.id = u.answer_id group by topic_id";
    const topicWiseTotalScore = "SELECT q.topic_id, t.topic, sum(q.score) as total from questions as q join exam_topics as t where q.exam_id = ? and q.topic_id = t.id group by q.topic_id";
    try {
        const userId = req.user.id;
        const examId = req.query.examid;
        const [result] = yield dbConnection_1.default.query(examSql, [examId, userId]);
        dbConnection_1.default.query("SET sql_mode = (SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''))"); // disable ONLY_FULL_GROUP_BY
        let [result2] = yield dbConnection_1.default.query(detailedScore, [examId, userId]);
        const [result3] = yield dbConnection_1.default.query(topicWiseTotalScore, [examId]);
        if (result.length != 0 && result3 != 0) {
            if (result2.length == 0) {
                result2 = [{ score: 0 }];
            }
            res.json({
                success: true,
                message: "detailed fetched",
                result: result,
                result2: result2,
                result3: result3,
            });
        }
        else {
            res.json({ success: false, message: "no records found :(" });
        }
    }
    catch (error) {
        logger.fatal(error);
    }
});
exports.getScores = getScores;
const userScoreRenderEJS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examResultSql = "SELECT r.exam_id, r.marks, u.fname, u.lname, e.id, e.title, TIMEDIFF(TIME(r.created_at),TIME(e.start_time)) as duration_minute, e.total_marks, e.passing_marks, date(e.start_time) as exam_date FROM results AS r JOIN users AS u ON r.user_id = u.id LEFT JOIN exam_details AS e ON r.exam_id = e.id  where e.id = ? and r.user_id = ?";
        const detailedScore = "SELECT DISTINCT q.topic_id, sum(q.score) as score, t.topic FROM user_answers as u JOIN questions AS q on u.exam_id = q.exam_id JOIN options as o ON q.id = o.question_id JOIN exam_topics as t on t.id = q.topic_id where u.exam_id = ? and u.user_id = ? and o.isAnswer = 1 and o.id = u.answer_id group by topic_id";
        const topicWiseTotalScore = "SELECT q.topic_id, t.topic, sum(q.score) as total from questions as q join exam_topics as t where q.exam_id = ? and q.topic_id = t.id group by q.topic_id";
        const userId = req.query.userid;
        const examId = req.query.examid;
        const [result] = yield dbConnection_1.default.query(examResultSql, [examId, userId]);
        dbConnection_1.default.query("SET sql_mode = (SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''))"); // disable ONLY_FULL_GROUP_BY
        const [result2] = yield dbConnection_1.default.query(detailedScore, [examId, userId]);
        const [result3] = yield dbConnection_1.default.query(topicWiseTotalScore, [examId]);
        res.render("./user/userComponent/scoreCardEJS.ejs", {
            result: result,
            result2: result2,
            result3: result3,
        });
    }
    catch (error) {
        res.render("./user/userComponent/scoreCardEJS.ejs", { error: error });
        logger.error(error);
    }
});
exports.userScoreRenderEJS = userScoreRenderEJS;
const removeProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.id;
    const sqlRemove = "UPDATE user_profile_images set active_profile = 0 where user_id = ?";
    try {
        const [result] = yield dbConnection_2.default.query(sqlRemove, [userId]);
        // console.log("removed");
        res.json({ success: true, message: "profile picture remvoed" });
    }
    catch (error) {
        logger.error(error);
        res.json({ success: true, message: "unable to remove profile picture" });
    }
});
exports.removeProfile = removeProfile;
const results = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const examSql = "SELECT r.exam_id, r.marks, e.id, e.title, e.duration_minute, e.total_marks, e.passing_marks, e.start_time as exam_date FROM results AS r JOIN users AS u ON r.user_id = u.id LEFT JOIN exam_details AS e ON r.exam_id = e.id where r.user_id = ?  order by exam_date desc";
    try {
        const [result] = yield dbConnection_2.default.query(examSql, [id]);
        if (result.length === 0) {
            res.json({ success: false, message: "No record found" });
        }
        else {
            res.json({ success: true, message: "record found", result: result });
        }
    }
    catch (error) {
        logger.error(error);
    }
});
exports.results = results;
const resultSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const examId = req.body.examId;
    const examTitle = req.body.examTitle;
    const examDate = req.body.examDate;
    const searchResult = "SELECT r.exam_id, r.marks, e.id, e.title, e.duration_minute, e.total_marks, e.passing_marks, date(e.start_time) as exam_date FROM results AS r JOIN users AS u ON r.user_id = u.id LEFT JOIN exam_details AS e ON r.exam_id = e.id where r.user_id = ? and %e.title% or %e.id% or %date(e.start_time)%";
    try {
        const [result] = yield dbConnection_2.default.query(examSql, [id]);
        if (result.length === 0) {
            res.json({ success: false, message: "No record found" });
        }
        else {
            res.json({ success: true, message: "record found", result: result });
        }
    }
    catch (error) {
        logger.error(error);
    }
});
exports.resultSearch = resultSearch;
