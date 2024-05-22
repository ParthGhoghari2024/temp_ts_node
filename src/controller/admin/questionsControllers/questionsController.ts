import { Request, Response } from "express";
import con from "../../../config/dbConnection";
import { logger } from "../../../utils/pino";
import { getTopics, getDifficulties } from "./insertQuestionsController";
import {
  IExamDetails,
  IOption,
  IOptionObj,
  IQueCount,
  IQuestion,
  IQuestionReduced,
  IResultObj,
} from "../../../types/interfaces";
import { FieldPacket, RowDataPacket } from "mysql2";
import { IReqWithUser } from "../../../types/authTypes";

const questionDetailsController = async (req: Request, res: Response) => {
  try {
    let examId: number = req.body.examId;

    let getQuestionsDetails: string =
      "select count(id) as totalQuestions,sum(score) as totalScore from questions where exam_id=? && isDeleted=0";

    let [getQuestionsDetailsResult]: [IQueCount[], FieldPacket[]] =
      await con.query<IQueCount[]>(getQuestionsDetails, examId);

    let totalQuestions: number =
      parseInt(getQuestionsDetailsResult[0].totalQuestions) || 0;
    let totalScore: number =
      parseInt(getQuestionsDetailsResult[0].totalScore) || 0;
    res.json({ success: 1, totalQuestions, totalScore });
  } catch (error: unknown) {
    console.log(error);
  }
};
const viewQuestionsPageController = async (
  req: IReqWithUser,
  res: Response
) => {
  try {
    if (!req.query || !req.query.examid) {
      res.status(404).render("errorPage404");
    }
    const getExamDetailSQL: string =
      "select id,creater_id,title,start_time,duration_minute,total_marks,passing_marks,instructions,exam_status,exam_activation_code,isDeleted from exam_details left join users on users.id=exam_details.creater_id where exam_details.id=? AND exam_details.isDeleted=0";

    let examId: string = req.query.examid as string;

    let examData: IExamDetails[] = [];
    try {
      [examData] = await con.query<IExamDetails[]>(getExamDetailSQL, examId);
      if (
        !examData ||
        examData.length < 1 ||
        (examData[0] && examData[0].length === 0)
      ) {
        return res.status(404).render("errorPage404");
      }
    } catch (error) {
      logger.error(error);
      return res.status(404).render("errorPage404");
    }

    examData = examData[0][0];
    // console.log(examData);

    let selectQuestionsByExamIdSql: string =
      "SELECT id,exam_id,difficulty_id,topic_id,questions,score,isDeleted,created_at,updated_at FROM questions FROM questions  WHERE exam_id = ? and isDeleted=false";

    let [selectQuestionsByExamIdResult]: [IQuestion[], FieldPacket[]] =
      await con.query<IQuestion[]>(selectQuestionsByExamIdSql, examId);
    if (selectQuestionsByExamIdResult.length === 0) {
      // return res.json({ success: 0, message: "exam does not exist or no questions are there " })
      return res.render("admin/viewQuestions", {
        data: { id: [] },
        options: {},
        topics: {},
        difficulties: {},
        examId: examId,
        id: req.user.id,
        examData,
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

    let selectOptionsByQueIdSql =
      "SELECT id,question_id,option_value,isAnswer FROM options  WHERE question_id in (?) and isDeleted=false";

    let selectOptionsByQueIdResult: [IOption[], FieldPacket[]] =
      await con.query<IOption[]>(selectOptionsByQueIdSql, [
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

    let topics: IResultObj | undefined = await getTopics();
    // topics = Object.keys(topics);
    let difficulties: IResultObj | undefined = await getDifficulties();

    res.render("admin/viewQuestions", {
      data: reducedSelectQuestionsByExamIdResult,
      options: optionsObj,
      topics,
      difficulties,
      examId: examId,
      id: req.user.id,
      examData,
    });
  } catch (error) {
    logger.error((<Error>error).message);
  }
};
export { questionDetailsController, viewQuestionsPageController };
