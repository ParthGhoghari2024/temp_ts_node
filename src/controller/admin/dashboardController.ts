import { Request, Response } from "express";
import db from "../../config/dbConnection";
import notifier from "node-notifier";
import { logger } from "../../utils/pino";

const dashboardPageController = async (req: IReqWithUser, res: Response) => {
  try {
    const query: string = `select id from roles  where  role =  ?`;
    let [result]: [[{ id: number }], FieldPacket[]] = await db.query<
      [{ id: number } & RowDataPacket[]]
    >(query, ["Student"]);
    let role_id = result[0].id;

    const query1: string = `select count(*) as total_students from users where role_id = ?`;
    const query2: string = `select count(*) as total_topics from exam_topics`;
    const query3: string = `select count(*) as total_exams from exam_details`;

    let [result1]: [[{ total_students: number }], FieldPacket[]] =
      await db.query<[{ total_students: number } & RowDataPacket[]]>(query1, [
        role_id,
      ]);
    let [result2]: [[{ total_topics: number }], FieldPacket[]] = await db.query<
      [{ total_topics: number } & RowDataPacket[]]
    >(query2);
    let [result3]: [[{ total_exams: number }], FieldPacket[]] = await db.query<
      [{ total_exams: number } & RowDataPacket[]]
    >(query3);

    let total_students: number = result1[0].total_students;

    let total_topics: number = result2[0].total_topics;

    let total_exams: number = result3[0].total_exams;
    res.render("admin/dashboard", {
      total_students,
      total_topics,
      total_exams,
      id: req.user.id,
    });
  } catch (error: unknown) {
    logger.info((<Error>error).message);
  }
};

const examTableController = async (req: IReqWithUser, res: Response) => {
  try {
    let examStatus: string = req.body.status;

    let query: string;
    let id: number = req.user.id;

    if (examStatus == "upcoming") {
      query = `select title,total_marks,passing_marks,start_time,duration_minute,exam_activation_code from exam_details where 
      TIMESTAMPDIFF(MINUTE,start_time,utc_timestamp())<1 AND creater_id = ? AND isDeleted = ?`;
    } else if (examStatus == "ongoing") {
      query = `select title,total_marks,passing_marks,start_time,duration_minute,exam_activation_code from exam_details where 
       TIMESTAMPDIFF(MINUTE,start_time,utc_timestamp())>=0 AND  TIMESTAMPDIFF(MINUTE,start_time,utc_timestamp())< duration_minute AND creater_id = ? AND isDeleted = ? `;
    } else if (examStatus == "completed") {
      query = `select title,total_marks,passing_marks,start_time,duration_minute,exam_activation_code from exam_details where 
      TIMESTAMPDIFF(MINUTE,start_time,utc_timestamp())>= duration_minute AND creater_id = ? AND isDeleted = ?`;
    } else {
      query = `select title,total_marks,passing_marks,start_time,duration_minute,exam_activation_code from exam_details where 
      TIMESTAMPDIFF(MINUTE,start_time,utc_timestamp())<1 AND creater_id = ? AND isDeleted = ?`;
    }

    let [result]: [IExamDetailsNecessary[], FieldPacket[]] = await db.query<
      IExamDetailsNecessary[]
    >(query, [id, 0]);

    if (result.length == 0) {
      res.json({ msg: "No record found" });
    } else {
      res.json(result);
    }
  } catch (error: unknown) {
    logger.info((<Error>error).message);
  }
};

const adminProfilePageController = async (req: IReqWithUser, res: Response) => {
  try {
    const query_role: string = `select id from roles  where  role =  ?`;
    let [result_role]: [[{ id: number }], FieldPacket[]] = await db.query<
      [{ id: number } & RowDataPacket[]]
    >(query_role, ["Admin"]);
    let role_id: number = result_role[0].id;

    const sql: string = `select  fname, lname, phone_no, email, dob, address, city, state, zipcode,about from users where role_id = ? and id = ?`;
    const [result]: [IUserDetail[], FieldPacket[]] = await db.query<
      IUserDetail[]
    >(sql, [role_id, req.user.id]);

    let id: number = req.user.id;
    let full_name: string = result[0].fname + " " + result[0].lname;
    let phone_no: string = result[0].phone_no;
    let email: string = result[0].email;
    let dob: Date = result[0].dob;
    let address: string = result[0].address;
    let city: string = result[0].city;
    let state: string = result[0].state;
    let zipcode: string = result[0].zipcode;
    let about: string = result[0].about;

    res.render("admin/adminProfile", {
      id,
      full_name,
      phone_no,
      email,
      dob,
      address,
      city,
      zipcode,
      state,
      about,
    });
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

const adminProfileUpdateController = async (
  req: IReqWithUser,
  res: Response
) => {
  try {
    const query_role: string = `select id from roles  where  role =  ?`;
    let [result_role]: [[{ id: number }], FieldPacket[]] = await db.query<
      [{ id: number } & RowDataPacket[]]
    >(query_role, ["Admin"]);
    let role_id: number = result_role[0].id;

    const sql: string = `select  fname, lname, phone_no, email, dob, address, city, state, zipcode,about from users where role_id = ? and id = ?`;
    const [result]: [IUserDetail[], FieldPacket[]] = await db.query<
      IUserDetail[]
    >(sql, [role_id, req.user.id]);

    let id: number = req.user.id;
    let full_name: string = result[0].fname + " " + result[0].lname;
    let fname: string = result[0].fname;
    let lname: string = result[0].lname;
    let phone_no: string = result[0].phone_no;
    let email: string = result[0].email;
    let dob: Date = result[0].dob;
    let address: string = result[0].address;
    let city: string = result[0].city;
    let state: string = result[0].state;
    let zipcode: string = result[0].zipcode;
    let about: string = result[0].about;

    res.render("admin/adminProfileUpdate", {
      id,
      full_name,
      fname,
      lname,
      phone_no,
      email,
      dob,
      address,
      city,
      zipcode,
      state,
      about,
    });
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

const adminProfileUpdatePageController = async (
  req: IReqWithUser,
  res: Response
) => {
  try {
    const id: number = req.body.id;
    const fname: string = req.body.fname;
    const lname: string = req.body.lname;
    const phone_no: string = req.body.phone_no;
    const email: string = req.body.email;
    const dob: Date = req.body.dob;
    const address: string = req.body.address;
    const city: string = req.body.city;
    const state: string = req.body.state;
    const zipcode: string = req.body.zipcode;
    const about: string = req.body.about;

    const query_role = `select id from roles  where  role =  ?`;
    let [result_role]: [[{ id: number }], FieldPacket[]] = await db.query<
      [
        {
          id: number;
        } & RowDataPacket[]
      ]
    >(query_role, ["Admin"]);
    let role_id: number = result_role[0].id;

    if (fname && lname && email) {
      const sql: string = `update users set fname = ?, lname = ?, phone_no = ?, email = ?, dob = ?, address = ?, city = ?, state = ?, zipcode = ? ,about = ? 
      where role_id = ? and id = ?`;
      try {
        const [result]: [QueryResult, FieldPacket[]] =
          await db.query<QueryResult>(sql, [
            fname,
            lname,
            phone_no,
            email,
            dob,
            address,
            city,
            state,
            zipcode,
            about,
            role_id,
            id,
          ]);
        notifier.notify("Profile Updated Successfully");
        res.redirect("/admin/adminProfile");
      } catch (error) {
        logger.info((<Error>error).message);
      }
    }
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

const adminProfilePhotoUpload = async (req: Request, res: Response) => {
  try {
    var id: string = req.body.id;
    var file: Express.Multer.File | undefined = req.file;
    var size: number | undefined = req.file && req.file.size;
    if (id && file) {
      if (size && size < 2097152) {
        try {
          let updateSql: string, insertSql: string, selectSql: string;
          updateSql = `update user_profile_images set active_profile = ? where user_id = ?`;
          let [updateResult]: [QueryResult, FieldPacket[]] =
            await db.query<QueryResult>(updateSql, [0, id]);

          insertSql = `insert into user_profile_images (user_id, image_path, actual_name, current_name, active_profile) values (?,?,?,?,?)`;
          let [insertResult]: [QueryResult, FieldPacket[]] =
            await db.query<QueryResult>(insertSql, [
              id,
              req.file && req.file.path,
              req.file && req.file.originalname,
              req.file && req.file.filename,
              1,
            ]);

          notifier.notify("Photo Uploaded Successfully!");
          res.json({ success: "Success" });
        } catch (error) {
          notifier.notify(
            `Please upload valid file type '.jpg','.jpeg','.png' and file size size must be less than 2MB`
          );
          res.json({ success: "Fail" });
          logger.info((<Error>error).message);
        }
      }
    }
  } catch (error) {
    notifier.notify(`Please upload valid file type '.jpg','.jpeg','.png'`);
    res.json({ success: "Fail" });
    logger.info((<Error>error).message);
  }
};

import path from "path";
import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";
import { IReqWithUser, IUser } from "../../types/authTypes";
import { IExamDetailsNecessary, IUserDetail } from "../../types/interfaces";
const setPhotoController = async (req: Request, res: Response) => {
  let id: string = req.params.id;
  let error_path: string = "public/assets/defaultAdmin.png";

  try {
    const sql: string = `select image_path from user_profile_images where user_id = ? and active_profile = ?`;
    const [result]: [[{ image_path: string }], FieldPacket[]] = await db.query<
      [
        {
          image_path: string;
        } & RowDataPacket[]
      ]
    >(sql, [id, 1]);

    if (!result || (result[0] && result[0].image_path === "")) {
      res.sendFile(path.join(__dirname, "../../", error_path));
    } else {
      let imagePath: string = result[0].image_path;
      res.sendFile(path.join(__dirname, "../../", imagePath));
    }
  } catch (error) {
    logger.info((<Error>error).message);
    res.sendFile(path.join(__dirname, "../../", error_path));
  }
};

const removePhotoController = async (req: IReqWithUser, res: Response) => {
  try {
    const updateSQL: string = `UPDATE user_profile_images SET active_profile = ?  WHERE user_id = ?`;
    let id: number = req.user.id;
    const [updateResult]: [QueryResult, FieldPacket[]] =
      await db.query<QueryResult>(updateSQL, [0, id]);

    res.json({ success: "success" });
    notifier.notify("Photo removed Successfully!");
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

export {
  dashboardPageController,
  adminProfilePageController,
  examTableController,
  adminProfileUpdateController,
  adminProfileUpdatePageController,
  adminProfilePhotoUpload,
  setPhotoController,
  removePhotoController,
};
