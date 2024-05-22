import { Request, Response } from "express";
import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";
import con from "../../../config/dbConnection";
import {
  IExamDifficulty,
  IExamTime,
  IExamTopic,
  IInsertQuestion,
  IQuestion,
  IResultObj,
  IValidationFailedObj,
} from "../../../types/interfaces";
import {
  generateQuestionsPdfByExamId,
  generateQuestionsCSVByExamId,
} from "../../../utils/pdfAndCsvGenerator";
import { logger } from "../../../utils/pino";
const getDifficulties: () => Promise<IResultObj | undefined> = async () => {
  try {
    let getDifficultiesSql: string = `select id,difficulty from difficulty_levels `;
    let [result]: [IExamDifficulty[], FieldPacket[]] = await con.query<
      IExamDifficulty[]
    >(getDifficultiesSql);

    let resultObj: IResultObj = {};
    result.forEach((el: IExamDifficulty) => {
      resultObj[el.difficulty.toLowerCase()] = el.id;
    });

    return resultObj;
  } catch (error) {
    logger.error(error);
  }
};
const getTopics: () => Promise<IResultObj | undefined> = async () => {
  try {
    let getTopicsSql: string = `select id,topic from exam_topics where is_deleted=0`;
    let [result]: [IExamTopic[], FieldPacket[]] = await con.query<IExamTopic[]>(
      getTopicsSql
    );

    let resultObj: IResultObj = {};
    result.forEach((el: IExamTopic) => {
      resultObj[el.topic.toLowerCase()] = el.id;
    });
    return resultObj;
  } catch (error: unknown) {
    logger.error(error);
  }
};
const isNumber: (num: number) => boolean = (num: number) => !isNaN(num);

const insertQuestionsValidations = async (
  req: Request,
  res: Response,
  questionsArray: IInsertQuestion[]
) => {
  try {
    let validationsFailedObj: IValidationFailedObj = {};
    const MAX_LENGTH_QUESTION_TEXT = 1000;

    //temp validations
    if (!req.body.examId) {
      return res.json({ success: 0, message: "exam Id error" });
    }
    //validations
    const tempDifficulty = await getDifficulties();
    let difficultiesArrray = Object.keys(tempDifficulty!);

    const tempTopic = await getTopics();
    let topicsArrray = Object.keys(tempTopic!);
    questionsArray.forEach(async (que: IInsertQuestion, index: number) => {
      let validationsFailedArray: string[] = [];
      let options = que.options;

      que.text = que.text && que.text.trim();
      que.difficulty = que.difficulty && que.difficulty.trim().toUpperCase();
      que.topic = que.topic && que.topic.trim().toUpperCase();
      que.topic = que.topic && que.topic.trim().toUpperCase();

      if (!que.difficulty) validationsFailedArray.push("difficulty");
      if (!que.topic) validationsFailedArray.push("topic");
      if (!que.text) validationsFailedArray.push("text");
      if (!que.score) validationsFailedArray.push("score");
      if (!que.correctId) validationsFailedArray.push("correctId");

      if (!isNumber(que.correctId)) validationsFailedArray.push("correctId");
      if (!isNumber(que.score)) validationsFailedArray.push("score");
      if (isNumber(que.score) && (que.score > 5 || que.score < 1))
        validationsFailedArray.push("score");

      if (que.text && que.text.length > MAX_LENGTH_QUESTION_TEXT)
        validationsFailedArray.push("text");

      if (que.correctId > 4 || que.correctId < 1)
        validationsFailedArray.push("correctId");

      if (!difficultiesArrray.includes(que.difficulty.toLowerCase()))
        validationsFailedArray.push("difficulty");
      if (!topicsArrray.includes(que.topic.toLowerCase()))
        validationsFailedArray.push("topic");

      options.forEach(async (option, index) => {
        option = option && option.trim();
        if (!option) validationsFailedArray.push(`option-${index + 1}`);
        else if (option.length > 255)
          validationsFailedArray.push(`option-${index + 1}`);
      });
      if (validationsFailedArray.length != 0)
        validationsFailedObj[index + 1] = validationsFailedArray;
    });
    if (Object.keys(validationsFailedObj).length !== 0) {
      return res.json({ success: 0, validationsFailedObj });
    }

    return true;
  } catch (error) {
    logger.error(error);
  }
};
const getExamMarksFromExamTable: (
  examId: number
) => Promise<
  { totalExamMarks: number; currentPassingMarks: number } | number
> = async (examId: number) => {
  try {
    let getExamTotalMarksSql: string = `select total_marks,passing_marks from exam_details where id=${examId} AND isDeleted=0;`;

    let [res]: [
      [{ total_marks: string; passing_marks: string }],
      FieldPacket[]
    ] = await con.query<
      [{ total_marks: string; passing_marks: string } & RowDataPacket[]]
    >(getExamTotalMarksSql, examId);
    if (!res || res.length < 1 || !res[0].total_marks) return -1;
    return {
      totalExamMarks: parseInt(res[0].total_marks),
      currentPassingMarks: parseInt(res[0].passing_marks),
    };
  } catch (error: unknown) {
    logger.error(error);
    return -1;
  }
};
const getExamTotalMarksFromQuestionsTable: (
  examId: number
) => Promise<number> = async (examId: number) => {
  try {
    let sql: string = `select sum(score) as total_marks from questions where exam_id=${examId} && isDeleted=0;
    `;

    let [res]: [[{ total_marks: string }], FieldPacket[]] = await con.query<
      [{ total_marks: string } & RowDataPacket[]]
    >(sql, examId);
    if (!res || res.length < 1 || !res[0].total_marks) return -1;
    return parseInt(res[0].total_marks);
  } catch (error: unknown) {
    logger.error(error);
    return -1;
  }
};
const insertQuestionsController = async (req: Request, res: Response) => {
  try {
    let questionsArray: IInsertQuestion[] = req.body.questions;
    let examId: number = req.body.examId;

    let examDetailsSQL: string =
      "select start_time,timestampdiff(minute,utc_timestamp,start_time) as time from exam_details where id=? AND isDeleted=0";
    let [examDetails]: [IExamTime[], FieldPacket[]] = await con.query<
      IExamTime[]
    >(examDetailsSQL, examId);

    if (!examDetails || !examDetails[0]) {
      return res.json({ success: 0 });
    }

    if (examDetails && examDetails[0] && examDetails[0].start_time) {
      if (examDetails[0].time < 0) {
        return res.json({ success: 0, startingTimeError: 1 });
      }
    }
    let topics: IResultObj | undefined = await getTopics();

    let difficulties: IResultObj | undefined = await getDifficulties();

    let updateExamTotalMarksFlag: number = req.body.updateExamTotalMarks || 0;

    let insertQuestionSql: string =
      "INSERT INTO questions (`exam_id`, `difficulty_id`, `topic_id`, `questions`, `score`) VALUES (?)";

    let insertOptionSql: string =
      "INSERT INTO options (`question_id`, `option_value`, `isAnswer`) VALUES (?)";

    let validationsRes = await insertQuestionsValidations(
      req,
      res,
      questionsArray
    );
    // console.log(validationsRes);
    if (validationsRes !== true) {
      return;
    }

    let examTotalMarksFromQuestionsTable =
      await getExamTotalMarksFromQuestionsTable(examId);
    let insertedQuestionTotalMarks = questionsArray.reduce(
      (prev, cur) => (prev = prev + cur.score),
      0
    );

    // console.log(insertedQuestionTotalMarks);
    if (insertedQuestionTotalMarks === 0) {
      return res.json({ success: 0, totalMarksError: 1 });
    }
    if (updateExamTotalMarksFlag === 0) {
      //if this is 1 then we have to insert questions anyway and update the total marks in exam detail table or else we have to check if marks conflicts or not
      // console.log(updateExamTotalMarksFlag);

      let examMarks:
        | {
            totalExamMarks: number;
            currentPassingMarks: number;
          }
        | number = await getExamMarksFromExamTable(examId);
      let totalExamMarks =
        typeof examMarks !== "number" && examMarks.totalExamMarks;
      let currentPassingMarks =
        typeof examMarks !== "number" && examMarks.currentPassingMarks;
      if (examMarks === -1) {
        totalExamMarks = 0;
        currentPassingMarks = 0;
      }

      if (examTotalMarksFromQuestionsTable === -1)
        examTotalMarksFromQuestionsTable = 0;

      // console.log(examTotalMarksFromQuestionsTable, totalExamMarks, insertedQuestionTotalMarks);
      if (
        totalExamMarks !=
        examTotalMarksFromQuestionsTable + insertedQuestionTotalMarks
      ) {
        return res.json({
          success: 0,
          totalExamMarks,
          newTotalMarks:
            examTotalMarksFromQuestionsTable + insertedQuestionTotalMarks,
          currentPassingMarks: currentPassingMarks,
        });
      }
    } else {
      // console.log(totalExamMarks, examTotalMarksFromQuestionsTable, insertedQuestionTotalMarks);

      let newTotalMarks =
        examTotalMarksFromQuestionsTable + insertedQuestionTotalMarks;
      if (examTotalMarksFromQuestionsTable === -1) {
        newTotalMarks = insertedQuestionTotalMarks;
      }
      const newPassingMarks = parseInt(req.body.newPassingMarks);

      // console.log(newTotalMarks, newPassingMarks);
      if (newPassingMarks > newTotalMarks || newPassingMarks < 0) {
        return res.json({ success: 0, passingMarksValidate: 1 });
      }
      if (newPassingMarks != -1) {
        let updateExamSql =
          "update exam_details set total_marks = ? , passing_marks = ?  where id=? ;";

        let [updateExamResult] = await con.query(updateExamSql, [
          newTotalMarks,
          newPassingMarks,
          examId,
        ]);
      }
    }

    //inserting
    questionsArray.forEach(async (que: IInsertQuestion, index: number) => {
      que.score = Number(que.score);
      que.correctId = Number(que.correctId);
      let questionSqlParam = [
        examId,
        difficulties![que.difficulty.toLowerCase()],
        topics![que.topic.toLowerCase()],
        que.text,
        que.score,
      ];
      let options = que.options;

      try {
        let [questionInsertResult]: [{ insertId: number }, FieldPacket[]] =
          await con.query<{ insertId: number } & RowDataPacket[]>(
            insertQuestionSql,
            [questionSqlParam]
          );

        let questionInsertedId = questionInsertResult.insertId;
        options.forEach(async (option, index) => {
          let isAns = false;
          if (index + 1 === que.correctId) isAns = true;
          let optionSqlParam = [questionInsertedId, option, isAns];
          let [optionInsertResult] = await con.query(insertOptionSql, [
            optionSqlParam,
          ]);
        });
      } catch (error: unknown) {
        console.log(error);
      }
    });

    //updating exam status to active after questions added
    let updateExamStatusSQL: string = `UPDATE  exam_details SET exam_status = ? WHERE id = ?;`;
    let [updateExamStatusResult]: [QueryResult, FieldPacket[]] =
      await con.query<QueryResult>(updateExamStatusSQL, [1, examId]);

    res.json({ success: 1 });

    //generating questions pdf,csv for future downloads
    let token: string = req.cookies.token;
    await generateQuestionsPdfByExamId(examId, token);
    await generateQuestionsCSVByExamId(examId, res);
  } catch (error) {
    console.log(error);
    logger.error(error);
  }
};

export {
  insertQuestionsController,
  getDifficulties,
  getTopics,
  getExamMarksFromExamTable,
  getExamTotalMarksFromQuestionsTable,
};
