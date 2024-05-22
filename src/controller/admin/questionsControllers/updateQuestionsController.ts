import { Request, Response } from "express";
import con from "../../../config/dbConnection";
import { IReqWithUser } from "../../../types/authTypes";
import {
  generateQuestionsPdfByExamId,
  generateQuestionsCSVByExamId,
} from "../../../utils/pdfAndCsvGenerator";
import { logger } from "../../../utils/pino";
import {
  getTopics,
  getDifficulties,
  getExamTotalMarksFromQuestionsTable,
  getExamMarksFromExamTable,
} from "./insertQuestionsController";
import {
  IExamTime,
  IExamTitleTime,
  IInsertQuestion,
  IOption,
  IOptionObj,
  IQuestion,
  IQuestionReduced,
  IResultObj,
  IUpdateQuestion,
  IValidationFailedObj,
} from "../../../types/interfaces";
import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";

const isNumber = (num: number) => !isNaN(num);
const updateQuestionsPageController = async (
  req: IReqWithUser,
  res: Response
) => {
  try {
    if (!req.query || !req.query.examid) {
      res.status(404).render("errorPage404");
    }
    const getExamDetailSQL: string =
      "select title,start_time,timestampdiff(second,utc_timestamp,start_time) as time from exam_details where id=? and isDeleted=0";

    let examId: string = req.query.examid as string;

    let examTitle: string = "";
    try {
      const [result]: [IExamTitleTime[], FieldPacket[]] = await con.query<
        IExamTitleTime[]
      >(getExamDetailSQL, examId);

      examTitle = result[0].title;
      // console.log(typeof (result));
      if (!result || result.length === 0) {
        return res.status(404).render("errorPage404");
      }
      if (result && result[0] && result[0].start_time) {
        if (result[0].time < 0) {
          // return res.json({ success: 0, startingTimeError: 1 });
          return res.render("admin/updateQuestions", {
            id: req.user.id,
            examId,
            startingTimeError: 1,
          });
        }
      }
    } catch (error: unknown) {
      logger.error(error);
      return res.status(404).render("errorPage404");
    }

    let selectQuestionsByExamIdSql: string =
      "SELECT id,exam_id,difficulty_id,topic_id,questions,score,isDeleted,created_at,updated_at FROM questions  WHERE exam_id = ? and isDeleted=false";

    let [selectQuestionsByExamIdResult]: [IQuestion[], FieldPacket[]] =
      await con.query<IQuestion[]>(selectQuestionsByExamIdSql, examId);

    // console.log(selectQuestionsByExamIdResult);
    let topics = await getTopics();
    let difficulties = await getDifficulties();
    if (selectQuestionsByExamIdResult.length === 0) {
      // selectQuestionsByExamIdResult.id = [];
      return res.render("admin/updateQuestions", {
        data: selectQuestionsByExamIdResult,
        options: {},
        topics,
        difficulties,
        examId,
        id: req.user.id,
        startingTimeError: 0,
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
    reducedSelectQuestionsByExamIdResult = selectQuestionsByExamIdResult.reduce(
      (prev, cur) => {
        prev.id.push(cur.id);
        prev.exam_id.push(cur.exam_id);
        prev.difficulty_id.push(cur.difficulty_id);
        prev.topic_id.push(cur.topic_id);
        prev.questions.push(cur.questions);
        prev.score.push(cur.score);
        return prev;
      },
      firstQuestionByQueId[0]
    );

    let selectOptionsByQueIdSql: string =
      "SELECT id,question_id,option_value,isAnswer FROM options  WHERE question_id in (?) and isDeleted=false";

    let selectOptionsByQueIdResult: [IOption[], FieldPacket[]] =
      await con.query<IOption[]>(selectOptionsByQueIdSql, [
        reducedSelectQuestionsByExamIdResult.id,
      ]);

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

    res.render("admin/updateQuestions", {
      data: reducedSelectQuestionsByExamIdResult,
      options: optionsObj,
      topics,
      difficulties,
      examId,
      id: req.user.id,
      startingTimeError: 0,
    });
  } catch (error) {
    logger.error(error);
  }
};
const updateQuestionsValidations = async (
  req: Request,
  res: Response,
  questionsArray: IInsertQuestion[]
) => {
  try {
    const MAX_LENGTH_QUESTION_TEXT: number = 1000;

    //todo: improve
    //temp validations
    if (!req.body.examId) {
      return res.json({ success: 0, message: "exam Id error" });
    }
    let validationsFailedObj: IValidationFailedObj = {};
    //validations
    questionsArray.forEach(async (que, index) => {
      // console.log(que);
      if (que.id === -1 && que.isDeleted === 1) return;
      let validationsFailedArray: string[] = [];
      let options: string[] = que.options;
      //temp validations
      que.difficulty = que.difficulty.trim();
      que.topic = que.topic.trim();
      que.text = que.text.trim();

      if (!que.difficulty) validationsFailedArray.push("difficulty");
      if (!que.topic) validationsFailedArray.push("topic");
      if (!que.text) validationsFailedArray.push("text");
      if (!que.score) validationsFailedArray.push("score");

      if (!isNumber(que.correctId)) validationsFailedArray.push("correctId");
      if (!isNumber(que.score)) validationsFailedArray.push("score");
      if (isNumber(que.score) && (que.score > 5 || que.score < 1))
        validationsFailedArray.push("score");

      if (que.text && que.text.length > MAX_LENGTH_QUESTION_TEXT)
        validationsFailedArray.push("text");

      options.forEach(async (option, index) => {
        option = option.trim();
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

const updateQuestionsController = async (req: Request, res: Response) => {
  try {
    let questionsArray: IUpdateQuestion[] = req.body.questions;
    let examId: number = req.body.examId;

    let topics: IResultObj | undefined = await getTopics();

    let difficulties: IResultObj | undefined = await getDifficulties();

    let examDetailsSQL: string =
      "select start_time,timestampdiff(second,utc_timestamp,start_time) as time from exam_details where id=?";
    let [examDetails]: [IExamTime[], FieldPacket[]] = await con.query<
      IExamTime[]
    >(examDetailsSQL, examId);

    let startingTime: string = "";
    if (!examDetails || !examDetails[0]) {
      return res.json({ success: 0, examError: 1 });
    }
    if (examDetails && examDetails[0] && examDetails[0].start_time) {
      if (examDetails[0].time < 0) {
        return res.json({ success: 0, startingTimeError: 1 });
      }
    }
    let validationsRes = await updateQuestionsValidations(
      req,
      res,
      questionsArray
    );
    if (validationsRes !== true) {
      return;
    }
    let updateExamTotalMarksFlag: number = req.body.updateExamTotalMarks || 0;
    let examTotalMarksFromQuestionsTable =
      await getExamTotalMarksFromQuestionsTable(examId);
    let updatedQuestionTotalMarks: number = questionsArray.reduce(
      (prev, cur) => {
        if (cur.isDeleted === 0) prev = prev + cur.score;
        else if (cur.id !== -1) {
          //isDeleted=1 for all

          //Temporary removal of the score of deleted questions
          // If the user deletes the question that is in DB, here is updating that count.
          // just to see if it is actually being deleted.
          examTotalMarksFromQuestionsTable =
            examTotalMarksFromQuestionsTable - cur.score;
        }
        return prev;
      },
      0
    );
    // console.log(updatedQuestionTotalMarks);
    if (updatedQuestionTotalMarks === 0) {
      return res.json({ success: 0, totalMarksError: 1 });
    }
    if (updateExamTotalMarksFlag === 0) {
      //if this is 1 then we have to insert questions anyway and update the total marks in exam detail table or else we have to check if marks conflicts or not

      let examMarks:
        | { totalExamMarks: number; currentPassingMarks: number }
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

      if (totalExamMarks != updatedQuestionTotalMarks) {
        return res.json({
          success: 0,
          totalExamMarks,
          newTotalMarks: updatedQuestionTotalMarks,
          currentPassingMarks: currentPassingMarks,
        });
      }
    } else {
      const newTotalMarks: number = updatedQuestionTotalMarks;
      const newPassingMarks: number = req.body.newPassingMarks;
      if (newPassingMarks > newTotalMarks || newPassingMarks < 0) {
        return res.json({ success: 0, passingMarksValidate: 1 });
      }
      if (newPassingMarks != -1) {
        let updateExamSql: string =
          "update exam_details set total_marks = ? , passing_marks = ?  where id=?;";

        let [updateExamResult]: [QueryResult, FieldPacket[]] =
          await con.query<QueryResult>(updateExamSql, [
            newTotalMarks,
            newPassingMarks,
            examId,
          ]);
      }
    }

    questionsArray.forEach(async (que, index) => {
      try {
        if (que.id === -1 && que.isDeleted !== 1) {
          //new insertion needed
          // console.log(que.index);
          insertQuestionHelper(examId, difficulties, topics, que);
        } else {
          updateQuestionHelper(examId, difficulties, topics, que);
        }
      } catch (error) {
        console.log(error);
      }
    });

    //updating exam status to active after questions added
    // in case of 0 questions and insertin comes from update page
    let updateExamStatusSQL: string = `UPDATE  exam_details SET exam_status = ? WHERE id = ?;`;
    let [updateExamStatusResult]: [QueryResult, FieldPacket[]] =
      await con.query<QueryResult>(updateExamStatusSQL, [1, examId]);

    res.json({ success: 1 });

    //GENERATING PDF AND CSV FOR FUTURE DOWNLOAD
    let token: string = req.cookies.token;
    await generateQuestionsPdfByExamId(examId, token);
    await generateQuestionsCSVByExamId(examId, res);
  } catch (error) {
    logger.error(error);
  }
};
const insertQuestionHelper = async (
  examId: number,
  difficulties: IResultObj | undefined,
  topics: IResultObj | undefined,
  que: IInsertQuestion
) => {
  try {
    let insertQuestionSql: string =
      "INSERT INTO questions (`exam_id`, `difficulty_id`, `topic_id`, `questions`, `score`) VALUES (?)";

    let insertOptionSql: string =
      "INSERT INTO options (`question_id`, `option_value`, `isAnswer`) VALUES (?)";

    let options: string[] = que.options;
    let questionSqlParam: [number, number, number, any, number] = [
      examId,
      difficulties![que.difficulty.toLowerCase()],
      topics![que.topic.toLowerCase()],
      que.text,
      que.score,
    ];
    let [questionInsertResult]: [{ insertId: number }, FieldPacket[]] =
      await con.query<{ insertId: number } & RowDataPacket[]>(
        insertQuestionSql,
        [questionSqlParam]
      );

    let questionInsertedId = questionInsertResult.insertId;
    options.forEach(async (option, index) => {
      let isAns = false;
      if (index + 1 === que.correctId) isAns = true;
      let optionSqlParam: [number, string, boolean] = [
        questionInsertedId,
        option,
        isAns,
      ];
      let [optionInsertResult] = await con.query(insertOptionSql, [
        optionSqlParam,
      ]);
    });
  } catch (error) {
    logger.error(error);
  }
};
const updateQuestionHelper = async (
  examId: number,
  difficulties: IResultObj | undefined,
  topics: IResultObj | undefined,
  que: IUpdateQuestion
) => {
  try {
    let updateQuestionSql: string =
      "UPDATE  questions SET  `difficulty_id`=?, `topic_id`=?, `questions`=?, `score`=? WHERE id=?";
    let options: string[] = que.options;
    let optionIds: number[] = que.optionIds;

    let updateOptionSql: string =
      "UPDATE  options SET  `option_value`=?, `isAnswer`=? where id=?";

    let updateDeletedQuestionSql: string =
      "UPDATE  questions SET isDeleted=1 WHERE id=?";

    let updateDeletedOptionSql: string =
      "UPDATE  options SET isDeleted=1 WHERE id=?";

    if (que.isDeleted) {
      let [questionDeleteResult]: [QueryResult, FieldPacket[]] =
        await con.query<QueryResult>(updateDeletedQuestionSql, que.id);

      options.forEach(async (option: string, index: number) => {
        let isAns: boolean = false;
        if (index + 1 === que.correctId) isAns = true;
        let [optionInsertResult]: [QueryResult, FieldPacket[]] =
          await con.query<QueryResult>(
            updateDeletedOptionSql,
            optionIds[index]
          );
      });
    } else {
      let questionSqlParam: [
        number,
        number,
        string,
        number,
        number | undefined
      ] = [
        difficulties![que.difficulty],
        topics![que.topic],
        que.text,
        que.score,
        que.id,
      ];

      let [questionUpdateResult]: [QueryResult, FieldPacket[]] =
        await con.query<QueryResult>(updateQuestionSql, questionSqlParam);

      options.forEach(async (option: string, index: number) => {
        let isAns: boolean = false;
        if (index + 1 === que.correctId) isAns = true;
        let [optionInsertResult]: [QueryResult, FieldPacket[]] =
          await con.query<QueryResult>(updateOptionSql, [
            option,
            isAns,
            optionIds[index],
          ]);
      });
    }
  } catch (error: unknown) {
    logger.error(error);
  }
};
export {
  updateQuestionsController,
  insertQuestionHelper,
  updateQuestionsPageController,
};
