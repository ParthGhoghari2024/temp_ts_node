import { Request, Response } from "express";
import con from "../../../config/dbConnection";
import { getTopics, getDifficulties } from "./insertQuestionsController";
import { logger } from "../../../utils/pino";
import fs from "fs";
import {
  generateQuestionsCSVByExamId,
  generateQuestionsPdfByExamId,
} from "../../../utils/pdfAndCsvGenerator";
import {
  IOption,
  IOptionObj,
  IQuestion,
  IQuestionReduced,
} from "../../../types/interfaces";
import { FieldPacket, RowDataPacket } from "mysql2";
const exportQuestionsPageController = async (req: Request, res: Response) => {
  try {
    let examId: string = req.query.examid as string;
    if (!examId) {
      res.render("errorPage404");
    }
    let selectQuestionsByExamIdSql: string =
      "SELECT id,exam_id,difficulty_id,topic_id,questions,score,isDeleted,created_at,updated_at FROM questions  WHERE exam_id = ? and isDeleted=false";

    let [selectQuestionsByExamIdResult]: [IQuestion[], FieldPacket[]] =
      await con.query<IQuestion[]>(selectQuestionsByExamIdSql, examId);
    if (selectQuestionsByExamIdResult.length === 0) {
      //this is modified  , no need to do that now
      return res.json({
        message: "exam does not exist or no questions are there ",
      });
    }

    let reducedSelectQuestionsByExamIdResult: IQuestionReduced;
    let firstQuestionByQueId: IQuestionReduced[] = [
      {
        id: [],
        exam_id: [],
        topic_id: [],
        difficulty_id: [],
        questions: [],
        score: [],
      },
    ];
    reducedSelectQuestionsByExamIdResult =
      selectQuestionsByExamIdResult.reduce<IQuestionReduced>((prev, cur) => {
        prev.id.push(cur.id);
        prev.exam_id.push(cur.exam_id);
        prev.difficulty_id.push(cur.difficulty_id);
        prev.topic_id.push(cur.topic_id);
        prev.questions.push(cur.questions);
        prev.score.push(cur.score);

        return prev;
      }, firstQuestionByQueId[0]);

    let selectOptionsByQueIdSql: string =
      "SELECT id,question_id,option_value,isAnswer FROM options  WHERE question_id in (?) and isDeleted=false";

    let selectOptionsByQueIdResult: [IOption[], FieldPacket[]] =
      await con.query<[IOption]>(selectOptionsByQueIdSql, [
        reducedSelectQuestionsByExamIdResult.id,
      ]);

    // console.log(selectOptionsByQueIdResult);

    let optionsObj: IOptionObj = {};
    //optionsObj = {
    //   '1':{ option obj  },
    // '2' : {},..
    // }
    reducedSelectQuestionsByExamIdResult.id.forEach((id) => {
      optionsObj[id] = selectOptionsByQueIdResult[0].filter(
        (obj) => obj.question_id === id
      );
    });

    // console.log(optionsObj);

    let topics = await getTopics(); //TODO: typecast
    // topics = Object.keys(topics);
    let difficulties = await getDifficulties(); //TODO: typecast

    res.render("admin/exportQuestions", {
      data: reducedSelectQuestionsByExamIdResult,
      options: optionsObj,
      topics,
      difficulties,
    });
  } catch (error) {
    logger.error(error);
  }
};

const exportQuestionsControllerAsPdf = async (req: Request, res: Response) => {
  try {
    const examId: string = req.query.examid as string;
    const port: string | undefined = process.env.PORT;
    const token: string = req.cookies.token || "temp";

    if (!examId) {
      return res.render("errorPage404"); //temp
    }

    const examTitleSql: string =
      "select title from exam_details where id=? and isDeleted=0";

    let [examTitle]: [[{ title: string }], FieldPacket[]] = await con.query<
      [{ title: string } & RowDataPacket[]]
    >(examTitleSql, examId);

    if (!examTitle || !examTitle.length || !examTitle[0]) {
      return res.render("errorPage404");
    }

    let selectQuestionsByExamIdSql: string =
      "SELECT id FROM questions  WHERE exam_id = ? and isDeleted=false";

    let [selectQuestionsByExamIdResult]: [[{ id: number }], FieldPacket[]] =
      await con.query<[{ id: number }] & RowDataPacket[]>(
        selectQuestionsByExamIdSql,
        examId
      );
    if (!selectQuestionsByExamIdResult || !selectQuestionsByExamIdResult[0]) {
      return res.render("admin/noQuestionError");
      // return res.json({ success: 0, message: "exam does not exist or no questions are there " })
    }

    let examTitleString: string = examTitle[0].title || "test_exam";

    let dirOfPdf: string = process.env.CONTENT_DIR as string;
    let pathOfPdf: string = `${dirOfPdf}/questionsPdf/${examId}_${examTitleString}.pdf`;
    if (!fs.existsSync(pathOfPdf)) {
      await generateQuestionsPdfByExamId(examId, token);
    }

    res.download(
      `${dirOfPdf}/questionsPdf/${examId}_${examTitleString}.pdf`,
      `exam_${examTitleString}.pdf`
    );
  } catch (error: unknown) {
    logger.error(error);
  }
};
const exportQuestionsControllerAsCSV = async (req: Request, res: Response) => {
  try {
    const examId: number = Number(req.query.examid);
    const token: string = req.cookies.token;

    if (!examId) return res.render("errorPage404");
    const getExamDetailSQL =
      "select start_time from exam_details where id=? and isDeleted=0";

    // to check if exam exist and not deleted
    try {
      const [getExamDetailResult]: [string, FieldPacket[]] = await con.query<
        string & RowDataPacket[]
      >(getExamDetailSQL, examId);
      if (
        !getExamDetailResult ||
        !getExamDetailResult.length ||
        (getExamDetailResult[0] && getExamDetailResult[0].length === 0)
      ) {
        return res.status(404).render("errorPage404");
      }

      let selectQuestionsByExamIdSql =
        "SELECT id  FROM questions  WHERE exam_id = ? and isDeleted=false";

      let [selectQuestionsByExamIdResult]: [[number], FieldPacket[]] =
        await con.query<[number] & RowDataPacket[]>(
          selectQuestionsByExamIdSql,
          examId
        );
      if (
        selectQuestionsByExamIdResult.length ||
        !selectQuestionsByExamIdResult[0]
      ) {
        return res.render("admin/noQuestionError");
        // return res.json({ success: 0, message: "exam does not exist or no questions are there " })
      }
    } catch (error) {
      logger.error(error);
      return res.status(404).render("errorPage404");
    }

    const examTitleSql: string = "select title from exam_details where id=?";

    let [examTitle]: [[{ title: string }], FieldPacket[]] = await con.query<
      [{ title: string }] & RowDataPacket[]
    >(examTitleSql, examId);

    let examTitleString = examTitle[0].title || "test_exam";
    let dirOfCSV: string = process.env.CONTENT_DIR as string;
    let pathOfCSV = `${dirOfCSV}/questionsCSV/${examId}_${examTitleString}.csv`;
    if (!fs.existsSync(pathOfCSV)) {
      await generateQuestionsCSVByExamId(examId, token);
    }

    res.download(
      `${dirOfCSV}/questionsCSV/${examId}_${examTitleString}.csv`,
      `exam_${examTitleString}.csv`
    );
  } catch (error) {
    logger.error(error);
  }
};

export {
  exportQuestionsPageController,
  exportQuestionsControllerAsPdf,
  exportQuestionsControllerAsCSV,
};
