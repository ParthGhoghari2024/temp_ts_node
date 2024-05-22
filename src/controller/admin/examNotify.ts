import { Request, Response } from "express";
import con from "../../config/dbConnection";
import schedule from "node-schedule";
import { checkLogin } from "../authentication/authenticationController";
import { FieldPacket, RowDataPacket } from "mysql2";

// schedule.scheduleJob("*/10 * * * * *", function(){
//   notifyUser();
//   notificationsCount();
// })

const notifyUser = async (req: Request, res: Response) => {
  try {
    let currentDate: Date = new Date();
    let oneHourAfter: Date = new Date(currentDate.getTime() + 60 * 60 * 1000);
    let notifyUserSql: string = `select title ,start_time  from exam_details join questions on exam_details.id = questions.exam_id where date(start_time) = utc_date() AND time(start_time) > utc_time() GROUP BY exam_details.id ;`;
    let [result]: [[{ title: string; start_time: string }], FieldPacket[]] =
      await con.query<
        [{ title: string; start_time: string } & RowDataPacket[]]
      >(notifyUserSql, [currentDate, oneHourAfter]);
    let time: number = currentDate.getTime();
    // res.json({success:1, message:result});
    return result;
  } catch (err) {
    console.log((<Error>err).message);
  }
};

const notificationsCount = async (req: Request, res: Response) => {
  try {
    let currentDate: Date = new Date();
    let oneHourAfter: Date = new Date(currentDate.getTime() + 60 * 60 * 1000);
    let notificationsCount: string = `select count(*) as notifications from exam_details join questions on exam_details.id = questions.exam_id where date(start_time) = utc_date() AND time(start_time) > utc_time() GROUP BY exam_details.id ;`;
    let [notifications]: [[{ notifications: number }], FieldPacket[]] =
      await con.query<[{ notifications: number } & RowDataPacket[]]>(
        notificationsCount,
        [currentDate, oneHourAfter]
      );
    return notifications;
  } catch (err) {
    console.log((<Error>err).message);
  }
};

export { notifyUser, notificationsCount };
