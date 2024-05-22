import con from "../../config/dbConnection";
import { logger } from "../../utils/pino";
import generateUniqueId from "generate-unique-id";
import { Request, Response } from "express";
import { IReqWithUser } from "../../types/authTypes";
import {
  ICreateExamBody,
  IExamDetails,
  IExamDifficulty,
  IExamDifficultyArr,
  IExamTime,
  IExamTopic,
  IExamTopicArr,
  IExamTopicWithId,
  IQuestionId,
} from "../../types/interfaces";
import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";
const createExamPageController = (req: IReqWithUser, res: Response) => {
  try {
    res.render("admin/createExam", { id: req.user.id });
  } catch (error) {
    logger.info((<Error>error).message);
  }
};
const addQuestionsPageController = async (req: IReqWithUser, res: Response) => {
  try {
    // logger.info("addQuestionsPage")
    if (!req.query || !req.query.examid) {
      res.status(404).render("errorPage404");
    }
    const examId: number = Number(req.query.examid);
    const getExamDetailSQL: string =
      "select start_time,timestampdiff(second,utc_timestamp,start_time) as time from exam_details where id=? and isDeleted=0";

    try {
      // let result: IExamTime[];
      let [result]: [IExamTime[], FieldPacket[]] = await con.query<IExamTime[]>(
        getExamDetailSQL,
        examId
      );
      if (
        !result ||
        result.length === 0 ||
        (result[0] && result[0].length === 0)
      ) {
        return res.status(404).render("errorPage404");
      }

      if (result && result[0] && result[0].start_time) {
        if (result[0].time < 0) {
          // return res.json({ success: 0, startingTimeError: 1 });
          return res.render("admin/addQuestions", {
            id: req.user.id,
            examId: examId,
            startingTimeError: 1,
          });
        }
      }
    } catch (error) {
      logger.error(error);
      return res.status(404).render("errorPage404");
    }

    res.render("admin/addQuestions", {
      id: req.user.id,
      examId: examId,
      startingTimeError: 0,
    });
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

const examTopicsController = async (req: IReqWithUser, res: Response) => {
  try {
    let getExamTopicsSql: string = `select topic, id from exam_topics where is_deleted="0"`;
    let [result]: [IExamTopicWithId[], FieldPacket[]] = await con.query<
      IExamTopicWithId[]
    >(getExamTopicsSql);
    res.render("admin/examTopics", {
      category: result,
      categoryName: false,
      id: req.user.id,
    });
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

const addCategoryController = async (req: Request, res: Response) => {
  let category: string = req.query.category as string;
  let namePattern: RegExp = /([a-zA-Z0-9_\s]+)/;
  try {
    let getCategorySql: string = `select * from exam_topics where is_deleted="0"`;
    let [getCategory]: [IExamTopic[], FieldPacket[]] = await con.query<
      IExamTopic[]
    >(getCategorySql);
    let topics: string[] = [];
    getCategory.forEach((element) => {
      topics.push(element.topic.toLowerCase());
    });
    if (topics.includes(category.toLowerCase())) {
      res.json({ success: 0, message: "category already addedd" });
    } else if (category == "") {
      res.json({ success: 0, message: "please enter category" });
    } else if (!namePattern.test(category)) {
      res.json({ success: 0, message: "Please enter valid category" });
    } else {
      let insertTopicsSql: string = `insert into exam_topics(topic) values(?);`;
      let [result]: [QueryResult, FieldPacket[]] = await con.query<QueryResult>(
        insertTopicsSql,
        [category]
      );
      res.json({ success: 1, categoryName: category });
      // res.render("admin/examTopics", { categoryName: category, id: req.user.id });
    }
  } catch (err) {
    logger.info((<Error>err).message);
  }
};

const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    let id: string = req.params.id;

    let deleteTopicsSql: string = `update exam_topics set is_deleted="1" where id=?`;
    let deleteQuestions: string = `update questions set isDeleted="1" where topic_id =?`;
    let [result]: [QueryResult, FieldPacket[]] = await con.query<QueryResult>(
      deleteTopicsSql,
      [id]
    );
    let [result2]: [QueryResult, FieldPacket[]] = await con.query<QueryResult>(
      deleteQuestions,
      [id]
    );
    res.json({ success: 1 });
  } catch (err) {
    logger.info((<Error>err).message);
  }
};

const editCategoryController = async (req: Request, res: Response) => {
  let id: string = req.query.id as string;
  let category: string = req.query.category as string;
  let namePattern: RegExp = /([a-zA-Z0-9_\s]+)/;
  try {
    let getCategorySql = `select * from exam_topics where is_deleted="0"`;
    let [getCategory]: [IExamTopic[], FieldPacket[]] = await con.query<
      IExamTopic[]
    >(getCategorySql);
    let topics: string[] = [];
    getCategory.forEach((element: IExamTopic) => {
      topics.push(element.topic);
    });
    if (topics.includes(category)) {
      res.json({ success: 0, message: "category already addedd" });
    } else if (category == "") {
      res.json({ success: 0, message: "please enter category" });
    } else if (!namePattern.test(category)) {
      res.json({ success: 0, message: "Please enter valid category" });
    } else {
      let editTopicsSql = `update exam_topics set topic="${category}" WHERE id =${id}`;
      let [result]: [QueryResult, FieldPacket[]] = await con.query<QueryResult>(
        editTopicsSql
      );
      res.json({ success: 1 });
    }
  } catch (err) {
    logger.info((<Error>err).message);
  }
};

const getExamTopicsController = async (req: Request, res: Response) => {
  try {
    let getExamTopicsSql: string = `select topic from exam_topics where is_deleted=0`;

    let [result]: [IExamTopic[], FieldPacket[]] = await con.query<IExamTopic[]>(
      getExamTopicsSql
    );

    let modifiedResult: IExamTopicArr = result.reduce<IExamTopicArr>(
      (prev, cur) => {
        prev.topic.push(cur.topic);
        return prev;
      },
      {
        id: result[0].id,
        topic: [],
      }
    );

    res.json({ success: 1, result: modifiedResult });
    // res.render('admin/examTopics')
  } catch (error) {
    logger.info((<Error>error).message);
  }
};
const getExamDifficultiesController = async (req: Request, res: Response) => {
  try {
    let getExamDifficultiesSql: string = `select difficulty from difficulty_levels`;

    let [result]: [IExamDifficulty[], FieldPacket[]] = await con.query<
      IExamDifficulty[]
    >(getExamDifficultiesSql);

    let modifiedResult: IExamDifficultyArr;
    modifiedResult = result.reduce<IExamDifficultyArr>(
      (prev, cur) => {
        prev.difficulty.push(cur.difficulty);
        return prev;
      },
      {
        id: result[0].id,
        difficulty: [],
      }
    );
    res.json({ success: 1, result: modifiedResult });
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

const getDifficultyId = async (difficulty: string) => {
  try {
    let getDifficultyIdSql: string = `select id from difficulty_levels where difficulty=?`;

    let [result]: [[{ id: number }], FieldPacket[]] = await con.query<
      [{ id: number } & RowDataPacket[]]
    >(getDifficultyIdSql, difficulty);

    return result;
  } catch (error: unknown) {
    logger.error(error);
  }
};
const getTopicId = async (topic: string) => {
  try {
    let getTopicIdSql: string = `select id from exam_topics where topic=?`;

    let [result]: [[{ id: number }], FieldPacket[]] = await con.query<
      [{ id: number } & RowDataPacket[]]
    >(getTopicIdSql, topic);
    return result;
  } catch (error: unknown) {
    logger.error(error);
  }
};

interface IResultObj {
  [Key: string]: number;
}
const getDifficulties = async () => {
  try {
    let getDifficultiesSql: string = `select id,difficulty from difficulty_levels `;
    let [result]: [IExamDifficulty[], FieldPacket[]] = await con.query<
      IExamDifficulty[]
    >(getDifficultiesSql);

    let resultObj: IResultObj = {};
    result.forEach((el) => {
      resultObj[el.difficulty] = el.id;
    });

    return resultObj;
  } catch (error: unknown) {
    logger.error(error);
  }
};
const getTopics = async () => {
  try {
    let getTopicsSql: string = `select id,topic from exam_topics `;
    let [result]: [IExamTopic[], FieldPacket[]] = await con.query<IExamTopic[]>(
      getTopicsSql
    );

    let resultObj: IResultObj = {};
    result.forEach((el) => {
      resultObj[el.topic] = el.id;
    });
    return resultObj;
  } catch (error: unknown) {
    logger.error(error);
  }
};

const numberCheck = (num: string) => !isNaN(Number(num));

const insertExamController = async (req: IReqWithUser, res: Response) => {
  try {
    let insertExamSql: string =
      "INSERT INTO  exam_details (creater_id, title, start_time, duration_minute, total_marks, passing_marks, instructions, exam_status, exam_activation_code) VALUES (?);";

    let adminId: number | null = null;
    // testing
    if (req.user && req.user.id) {
      adminId = req.user.id;
    }
    let reqBody: ICreateExamBody = req.body;

    let examStatus: number = 0;

    //todo: generate random uid for exam-code
    let examCode = generateUniqueId({
      length: 6,
      useLetters: false,
      useNumbers: true,
    });

    //temp validations
    reqBody.title = reqBody.title && reqBody.title.trim();
    reqBody.instructions = reqBody.instructions && reqBody.instructions.trim();
    let validationsFailedArray = [];
    if (!reqBody.title) validationsFailedArray.push("title");
    if (!reqBody.startingTime) validationsFailedArray.push("startingTime"); //todo: time validate
    if (!reqBody.duration || !numberCheck(reqBody.duration))
      validationsFailedArray.push("duration");
    if (!reqBody.totalMarks || !numberCheck(reqBody.totalMarks))
      validationsFailedArray.push("totalMarks");
    if (!reqBody.passingMarks || !numberCheck(reqBody.passingMarks))
      validationsFailedArray.push("passingMarks");
    if (!reqBody.instructions) validationsFailedArray.push("instructions");

    if (reqBody.startingTime && isNaN(new Date(reqBody.startingTime).getTime()))
      validationsFailedArray.push("startingTime");
    let validateUpcomingDateAndTime = (date: string) =>
      new Date(date) > new Date();

    if (
      reqBody.startingTime &&
      !validateUpcomingDateAndTime(reqBody.startingTime)
    )
      validationsFailedArray.push("startingTime"); //todo: time validate
    if (
      reqBody.totalMarks &&
      numberCheck(reqBody.totalMarks) &&
      parseInt(reqBody.totalMarks) <= 0
    )
      validationsFailedArray.push("totalMarks");
    if (reqBody.title && reqBody.title.length > 255)
      validationsFailedArray.push("title");
    if (
      reqBody.passingMarks &&
      reqBody.totalMarks &&
      parseInt(reqBody.passingMarks) > parseInt(reqBody.totalMarks)
    )
      validationsFailedArray.push("passingMarks");

    if (
      reqBody.duration &&
      (parseInt(reqBody.duration) > 300 || parseInt(reqBody.duration) <= 0)
    )
      validationsFailedArray.push("duration");

    if (validationsFailedArray.length != 0) {
      return res.json({
        success: 0,
        message: "Fill details properly",
        validationsFailedArray,
      });
    }

    let insertExamSqlParam = [
      adminId,
      reqBody.title,
      new Date(reqBody.startingTime),
      parseInt(reqBody.duration),
      parseInt(reqBody.totalMarks),
      parseFloat(reqBody.passingMarks),
      reqBody.instructions,
      examStatus,
      examCode,
    ];

    let [examInsertResult]: [{ insertId: number }, FieldPacket[]] =
      await con.query<{ insertId: number } & QueryResult>(insertExamSql, [
        insertExamSqlParam,
      ]);

    res.json({ success: 1, examId: examInsertResult.insertId });
  } catch (error) {
    logger.error(error);
  }
};

//DELETE EXAM
const deleteExamController = async (req: Request, res: Response) => {
  try {
    let examID = req.body.examID;
    // console.log(examID);
    let deleteExamSQL1: string,
      deleteExamSQL2: string,
      deleteExamSQL3: string,
      selectQuestionSQL: string;

    selectQuestionSQL = `select id from questions where exam_id = ?`;
    let [selectQuestionResult]: [[IQuestionId], FieldPacket[]] =
      await con.query<[IQuestionId & RowDataPacket[]]>(selectQuestionSQL, [
        examID,
      ]);
    let resultValue = selectQuestionResult.map((row: IQuestionId) => row.id);

    // console.log(resultValue);
    deleteExamSQL1 = `UPDATE exam_details SET isDeleted = ?  WHERE id = ?`;
    let [deleteExamResult1]: [QueryResult, FieldPacket[]] =
      await con.query<QueryResult>(deleteExamSQL1, [1, examID]);

    deleteExamSQL2 = `UPDATE options SET isDeleted = ?  WHERE question_id IN (?)`;
    if (resultValue && resultValue.length > 0) {
      let [deleteExamResult2]: [QueryResult, FieldPacket[]] =
        await con.query<QueryResult>(deleteExamSQL2, [1, resultValue]);
    }

    deleteExamSQL3 = `UPDATE questions SET isDeleted = ?  WHERE exam_id = ?`;
    let [deleteExamResult3]: [QueryResult, FieldPacket[]] =
      await con.query<QueryResult>(deleteExamSQL3, [1, examID]);

    res.json({ success: "yes" });
  } catch (error: unknown) {
    console.log(error);
  }
};

export {
  createExamPageController,
  addQuestionsPageController,
  examTopicsController,
  getExamTopicsController,
  getExamDifficultiesController,
  insertExamController,
  deleteCategoryController,
  addCategoryController,
  editCategoryController,
  deleteExamController,
};
