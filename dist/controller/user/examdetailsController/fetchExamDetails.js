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
exports.executeSqlQuerry = exports.showMissedExamList = exports.showOngoingExamList = exports.showGivenExamList = exports.showUpcomingExamList = exports.showTotalExamList = void 0;
const dbConnection_1 = __importDefault(require("../../../config/dbConnection"));
const pino_1 = require("../../../utils/pino");
const executeSqlQuerry = (sql, id) => __awaiter(void 0, void 0, void 0, function* () {
    const totalCount = `select count(*) as total  from ( ${sql} ) as totals;`;
    try {
        const querryList = yield dbConnection_1.default.query(sql, [id, id, id, id]);
        const querryCount = yield dbConnection_1.default.query(totalCount, [id, id, id, id]);
        return {
            list: querryList[0],
            count: querryCount[0][0].total,
            success: true,
        };
    }
    catch (error) {
        pino_1.logger.fatal(error);
        console.log(error);
        return { list: null, success: false };
    }
});
exports.executeSqlQuerry = executeSqlQuerry;
const showTotalExamList = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = ` select  title,date(start_time) as dateString, time(start_time) as timeString, duration_minute,  exam_details.id,
  (case when TIMESTAMPDIFF(second,utc_timestamp(),start_time) > 0 then 1 end) as isUpcoming,
  (case when TIMESTAMPDIFF(second,start_time,utc_timestamp()) < round(duration_minute/3,1)*60 and TIMESTAMPDIFF(second,start_time,utc_timestamp()) > 0 
  and
  exam_details.id not in(
    select exam_details.id from exam_details left join user_examtimes on exam_details.id = exam_id where user_id = ? )
  then 1  end) as isOngoing,
  (case when user_examtimes.user_id = ? and not user_examtimes.endtime is null  then 1 else 0 end) as isGiven,
  (case when exam_details.id not in (  select exam_details.id
  from exam_details left join user_examtimes on exam_details.id = user_examtimes.exam_id  where user_id = ?
 ) and timestampdiff(second,start_time,utc_timestamp()) > round(duration_minute/3,1)*60 then 1 else 0 end) isMissed
   from exam_details left join user_examtimes on exam_details.id  = exam_id and (user_id = ? or user_id is null) where  isDeleted = 0 and exam_status =1 order by dateString desc,timeString desc`;
    const result = yield executeSqlQuerry(sql, id);
    if (result.success) {
        return { list: result.list, count: result.count, success: true };
    }
    else {
        return { success: false };
    }
});
exports.showTotalExamList = showTotalExamList;
const showUpcomingExamList = () => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `select title,date(start_time) as dateString, time(start_time) as timeString, duration_minute,  id,
  (case when TIMESTAMPDIFF(second,utc_timestamp(),start_time) > 0 then 1 end) as isUpcoming
  from exam_details where TIMESTAMPDIFF(second,utc_timestamp(),start_time) >  0 and isDeleted = 0 and exam_status =1
   order by dateString,timeString asc`;
    const result = yield executeSqlQuerry(sql);
    if (result.success) {
        return { list: result.list, count: result.count, success: true };
    }
    else {
        return { success: false };
    }
});
exports.showUpcomingExamList = showUpcomingExamList;
const showGivenExamList = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `select exam_details.title,date(exam_details.start_time) as dateString, time(exam_details.start_time) as timeString, exam_details.duration_minute, exam_details.id,
  (case when  user_examtimes.user_id = ? then 1 else 0 end) as isGiven 
   from exam_details left join user_examtimes on exam_details.id = user_examtimes.exam_id  where user_id = ? and not user_examtimes.endtime 
   is null and isDeleted = 0 and exam_status =1  order by dateString desc,timeString desc`;
    const result = yield executeSqlQuerry(sql, id);
    if (result.success) {
        return { list: result.list, count: result.count, success: true };
    }
    else {
        return { success: false };
    }
});
exports.showGivenExamList = showGivenExamList;
const showOngoingExamList = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `select  title,date(start_time) as dateString, time(start_time) as timeString, duration_minute, exam_details.id,user_id,
    (case when TIMESTAMPDIFF(second,start_time,utc_timestamp()) < round(duration_minute/3,1)*60 and TIMESTAMPDIFF(second,start_time,utc_timestamp()) > 0 then 1 end) as isOngoing
     from exam_details left join user_examtimes on exam_details.id = user_examtimes.exam_id
     where TIMESTAMPDIFF(second,start_time,utc_timestamp()) < round(duration_minute/3,1)*60 and TIMESTAMPDIFF(second,start_time,utc_timestamp()) > 0 and exam_details.id not in(
     select exam_details.id from exam_details left join user_examtimes on exam_details.id = exam_id where user_id =? and not  user_examtimes.endtime is null) and isDeleted = 0 and exam_status =1
     order by dateString desc, timeString desc`;
    const result = yield executeSqlQuerry(sql, id);
    if (result.success) {
        return { list: result.list, count: result.count, success: true };
    }
    else {
        return { success: false };
    }
});
exports.showOngoingExamList = showOngoingExamList;
const showMissedExamList = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
  select  distinct title,date(start_time) as dateString, time(start_time) as timeString, duration_minute, 
  exam_details.id,
   (case when  user_examtimes.user_id = ? then 0 else 1 end)  isMissed
  from exam_details left join user_examtimes on exam_details.id = exam_id where exam_details.id not in (
  select exam_details.id
    from exam_details left join user_examtimes on exam_details.id = user_examtimes.exam_id  where user_id =?  
   ) and timestampdiff(second,start_time,utc_timestamp()) > round(duration_minute/3,1)*60
   and isDeleted = 0 and exam_status =1
     order by dateString desc,timeString desc `;
    const result = yield executeSqlQuerry(sql, id);
    if (result.success) {
        return { list: result.list, count: result.count, success: true };
    }
    else {
        return { success: false };
    }
});
exports.showMissedExamList = showMissedExamList;
