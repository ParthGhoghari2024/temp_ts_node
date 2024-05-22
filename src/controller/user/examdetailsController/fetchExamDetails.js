import con from "../../../config/dbConnection";
import { logger } from "../../../utils/pino";

const executeSqlQuerry = async (sql, id) => {
  const totalCount = `select count(*) as total  from ( ${sql} ) as totals;`;
  try {
    const querryList = await con.query(sql, [id, id, id, id]);
    const querryCount = await con.query(totalCount, [id, id, id, id]);
    return {
      list: querryList[0],
      count: querryCount[0][0].total,
      success: true,
    };
  } catch (error) {
    logger.fatal(error);
    console.log(error);
    return { list: null, success: false };
  }
};

const showTotalExamList = async (id) => {
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
  const result = await executeSqlQuerry(sql, id);
  if (result.success) {
    return { list: result.list, count: result.count, success: true };
  } else {
    return { success: false };
  }
};

const showUpcomingExamList = async () => {
  const sql = `select title,date(start_time) as dateString, time(start_time) as timeString, duration_minute,  id,
  (case when TIMESTAMPDIFF(second,utc_timestamp(),start_time) > 0 then 1 end) as isUpcoming
  from exam_details where TIMESTAMPDIFF(second,utc_timestamp(),start_time) >  0 and isDeleted = 0 and exam_status =1
   order by dateString,timeString asc`;

  const result = await executeSqlQuerry(sql);
  if (result.success) {
    return { list: result.list, count: result.count, success: true };
  } else {
    return { success: false };
  }
};

const showGivenExamList = async (id) => {
  const sql = `select exam_details.title,date(exam_details.start_time) as dateString, time(exam_details.start_time) as timeString, exam_details.duration_minute, exam_details.id,
  (case when  user_examtimes.user_id = ? then 1 else 0 end) as isGiven 
   from exam_details left join user_examtimes on exam_details.id = user_examtimes.exam_id  where user_id = ? and not user_examtimes.endtime 
   is null and isDeleted = 0 and exam_status =1  order by dateString desc,timeString desc`;

  const result = await executeSqlQuerry(sql, id);
  if (result.success) {
    return { list: result.list, count: result.count, success: true };
  } else {
    return { success: false };
  }
};

const showOngoingExamList = async (id) => {
  const sql = `select  title,date(start_time) as dateString, time(start_time) as timeString, duration_minute, exam_details.id,user_id,
    (case when TIMESTAMPDIFF(second,start_time,utc_timestamp()) < round(duration_minute/3,1)*60 and TIMESTAMPDIFF(second,start_time,utc_timestamp()) > 0 then 1 end) as isOngoing
     from exam_details left join user_examtimes on exam_details.id = user_examtimes.exam_id
     where TIMESTAMPDIFF(second,start_time,utc_timestamp()) < round(duration_minute/3,1)*60 and TIMESTAMPDIFF(second,start_time,utc_timestamp()) > 0 and exam_details.id not in(
     select exam_details.id from exam_details left join user_examtimes on exam_details.id = exam_id where user_id =? and not  user_examtimes.endtime is null) and isDeleted = 0 and exam_status =1
     order by dateString desc, timeString desc`;
  const result = await executeSqlQuerry(sql, id);
  if (result.success) {
    return { list: result.list, count: result.count, success: true };
  } else {
    return { success: false };
  }
};

const showMissedExamList = async (id) => {
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
  const result = await executeSqlQuerry(sql, id);
  if (result.success) {
    return { list: result.list, count: result.count, success: true };
  } else {
    return { success: false };
  }
};
export {
  showTotalExamList,
  showUpcomingExamList,
  showGivenExamList,
  showOngoingExamList,
  showMissedExamList,
  executeSqlQuerry,
};
