require("dotenv").config();
import { Request, Response, NextFunction, RequestHandler } from "express";
import { logger } from "../utils/pino";
import con from "../config/dbConnection";
import { IReqWithUser, IRole, IUser } from "../types/authTypes";
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";
import { IExamDetails, IJwtStrategyOptions } from "../types/interfaces";

const getToken = (req: Request): string | void => {
  const token: string | undefined =
    req.body.token ||
    req.cookies.token ||
    req.headers.authorization?.split(" ")[1];

  if (token) {
    return token;
  }
};

const opts: IJwtStrategyOptions = {
  jwtFromRequest: getToken,
  secretOrKey: process.env.TOKEN_SECRET,
};

const passportAuth = (passport: { use: (arg0: unknown) => void }): void => {
  console.log("passport Auth");

  passport.use(
    new JwtStrategy(
      opts,
      async (
        payload: { userid: number },
        next: (arg0: unknown, arg1: boolean | RowDataPacket) => void
      ) => {
        let userid: number = payload.userid;

        let result: IUser[];
        try {
          [result] = await con.query<IUser[]>(
            `select id,role_id,fname,lname,email,dob,phone_no,address,city,state,zipcode,password,about,activation_code,activation_status,token_created_at from users where id=?`,
            [userid]
          );
        } catch (err) {
          return next(err, false);
        }

        if (result.length > 0) {
          return next(null, result[0]);
        } else {
          return next(null, false);
        }
      }
    )
  );
};

const isAdmin = async (
  req: IReqWithUser,
  res: Response,
  next: (arg0: unknown, arg1: boolean | RowDataPacket) => void
): Promise<void> => {
  let userid: number = req.user.id;

  let sql: string = `select id,role_id,fname,lname,email,dob,phone_no,address,city,state,zipcode,password,about,activation_code,activation_status,token_created_at from users where id=?`;

  let result: IUser[] = [];
  try {
    [result] = await con.query<IUser[]>(sql, [userid]);
  } catch (error) {
    logger.info((<Error>error).message);
    next(error, false);
  }

  sql = `select role from roles where id=?`;
  let role: IRole[];
  [role] = await con.query<IRole[]>(sql, [result[0].role_id]);
  if (role[0].role === "Admin") {
    next(null, result[0]);
  } else {
    return res.redirect("/auth/login");
  }
};

const isStudent = async (
  req: IReqWithUser,
  res: Response,
  next: (arg0: unknown, arg1: boolean | IUser) => void
): Promise<void> => {
  let userid: number = req.user.id;

  let sql: string = `select id,role_id,fname,lname,email,dob,phone_no,address,city,state,zipcode,password,about,activation_code,activation_status,token_created_at from users where id=?`;

  let result: IUser[] = [];

  try {
    [result] = await con.query<IUser[]>(sql, [userid]);
  } catch (error: unknown) {
    logger.info((<Error>error).message);
    next(null, false);
  }

  sql = `select role from roles where id=?`;
  let role: IRole[] = [];
  [role] = await con.query<IRole[]>(sql, [result[0].role_id]);

  if (role[0].role === "Student") {
    next(null, result[0]);
  } else {
    return res.redirect("/auth/login");
  }
};

const hasExamCode = async (
  req: IReqWithUser,
  res: Response,
  next: (arg0?: unknown, arg1?: boolean | IExamDetails[]) => void
): Promise<void> => {
  try {
    let examcode = req.cookies.examcode?.code;
    let examid = req.query.exam;

    if (examcode === undefined || examid === undefined) {
      return res.redirect("/user/userDashboard");
    }

    let sql: string = `select id,creater_id,title,start_time,duration_minute,total_marks,passing_marks,instructions,exam_status,exam_activation_code,isDeleted from exam_details where id = ? and exam_activation_code=?`;

    let result: IExamDetails[] = [];
    try {
      [result] = await con.query<IExamDetails[]>(sql, [examid, examcode]);
    } catch (error: unknown) {
      logger.info((<Error>error).message);
    }
    if (result.length === 0) {
      res.redirect("/user/userDashboard");
    } else {
      next();
    }
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

export { passportAuth, isAdmin, isStudent, hasExamCode };
