import { Request, Response, NextFunction, RequestHandler } from "express";
import { logger } from "../utils/pino";
import con from "../config/dbConnection";
import { IExamDetails, ITotalMarks } from "../types/interfaces";

const updateExamDetailsValidation: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      id,
      title,
      start_time,
      duration_minute,
      passingmarks,
      instructions,
    }: IExamDetails = req.body;
    let getTotalMarks: string = `select total_marks from exam_details where id = ?`;
    let result: ITotalMarks[] = [];
    [result] = await con.query<ITotalMarks[]>(getTotalMarks, [id]);
    let totalmarks: number = result[0].total_marks;
    let validateUpcomingDateAndTime = (date: string): boolean =>
      new Date(date) > new Date();
    if (
      title.length >= 255 ||
      !validateUpcomingDateAndTime(start_time) ||
      duration_minute > 300 ||
      passingmarks >= totalmarks ||
      instructions.length > 65535
    ) {
      return res.json({ incorrect: true });
    } else {
      next();
    }
  } catch (error) {
    logger.info(error);
  }
};

export { updateExamDetailsValidation };
