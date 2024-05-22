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
exports.notificationsCount = exports.notifyUser = void 0;
const dbConnection_1 = __importDefault(require("../../config/dbConnection"));
// schedule.scheduleJob("*/10 * * * * *", function(){
//   notifyUser();
//   notificationsCount();
// })
const notifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let currentDate = new Date();
        let oneHourAfter = new Date(currentDate.getTime() + 60 * 60 * 1000);
        let notifyUserSql = `select title ,start_time  from exam_details join questions on exam_details.id = questions.exam_id where date(start_time) = utc_date() AND time(start_time) > utc_time() GROUP BY exam_details.id ;`;
        let [result] = yield dbConnection_1.default.query(notifyUserSql, [currentDate, oneHourAfter]);
        let time = currentDate.getTime();
        // res.json({success:1, message:result});
        return result;
    }
    catch (err) {
        console.log(err.message);
    }
});
exports.notifyUser = notifyUser;
const notificationsCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let currentDate = new Date();
        let oneHourAfter = new Date(currentDate.getTime() + 60 * 60 * 1000);
        let notificationsCount = `select count(*) as notifications from exam_details join questions on exam_details.id = questions.exam_id where date(start_time) = utc_date() AND time(start_time) > utc_time() GROUP BY exam_details.id ;`;
        let [notifications] = yield dbConnection_1.default.query(notificationsCount, [
            currentDate,
            oneHourAfter,
        ]);
        return notifications;
    }
    catch (err) {
        console.log(err.message);
    }
});
exports.notificationsCount = notificationsCount;
