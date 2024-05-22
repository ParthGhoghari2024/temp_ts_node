import { Request, Response } from "express";
import con from "../../config/dbConnection";
import { logger } from "../../utils/pino";
import { FieldPacket, RowDataPacket } from "mysql2";
import { IReqWithUser } from "../../types/authTypes";

const analysisPageContoller = async (req: IReqWithUser, res: Response) => {
  try {
    let rolesSql: string = `select id from roles where role="Student"`;
    let [roles]: [[{ id: number }], FieldPacket[]] = await con.query<
      [
        {
          id: number;
        } & RowDataPacket[]
      ]
    >(rolesSql);
    const examTopicsCount: string = `select count(*) as total_topics from exam_topics where is_deleted=0`;
    let studentCount: string = `select count(*) as total_students from users where role_id=${roles[0].id}`;
    let examCount: string = `select count(*) as total_exams from exam_details where exam_status=1 and isDeleted=0`;

    let questionsTopicsCount: string = `select exam_topics.topic , count(exam_topics.topic) as count from exam_topics join questions on exam_topics.id = questions.topic_id where exam_topics.is_deleted=0 group by exam_topics.id;`;
    let questionsDifficultyCount: string = `select difficulty_levels.difficulty, count(difficulty_levels.difficulty) as count from difficulty_levels join questions on difficulty_levels.id = questions.difficulty_id group by difficulty_levels.id;`;

    let passingStudetnsSql: string = `select exam_details.title, exam_details.passing_marks, count(results.marks) as passing_students from exam_details join results on exam_details.id = results.exam_id  where results.marks>exam_details.passing_marks group by exam_details.id;`;

    let [topicsResult]: [[{ total_topics: number }], FieldPacket[]] =
      await con.query<[{ total_topics: number } & RowDataPacket[]]>(
        examTopicsCount
      );
    let [studentResult]: [[{ total_students: number }], FieldPacket[]] =
      await con.query<[{ total_students: number } & RowDataPacket[]]>(
        studentCount
      );
    let [examResult]: [[{ total_exams: number }], FieldPacket[]] =
      await con.query<[{ total_exams: number } & RowDataPacket[]]>(examCount);
    let [questionstTopicsResult]: [
      [{ topic: string; count: number }],
      FieldPacket[]
    ] = await con.query<[{ topic: string; count: number } & RowDataPacket[]]>(
      questionsTopicsCount
    );
    let [questionsDifficultyResult]: [
      [{ difficulty: string; count: number }],
      FieldPacket[]
    ] = await con.query<
      [{ difficulty: string; count: number } & RowDataPacket[]]
    >(questionsDifficultyCount);
    let [passingStudentsResult]: [
      [{ difficulty: string; count: number }],
      FieldPacket[]
    ] = await con.query<
      [{ difficulty: string; count: number } & RowDataPacket[]]
    >(passingStudetnsSql);

    res.render("admin/analysis.ejs", {
      topic: topicsResult[0].total_topics,
      students: studentResult[0].total_students,
      exams: examResult[0].total_exams,
      questionsTopics: questionstTopicsResult,
      passingStudents: passingStudentsResult,
      id: req.user.id,
      questionsDifficulty: questionsDifficultyResult,
    });
  } catch (err) {
    console.log((<Error>err).message);
  }
};

export { analysisPageContoller };
