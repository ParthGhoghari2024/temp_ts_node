import { Request, Response } from "express";
import con from "../../config/dbConnection";
import notifier from "node-notifier";
import { logger } from "../../utils/pino";
import { IReqWithUser } from "../../types/authTypes";
import { FieldPacket, RowDataPacket } from "mysql2";
import { IStudentDetail } from "../../types/interfaces";

const studentDetailsPage = async (req: IReqWithUser, res: Response) => {
  try {
    res.render("admin/studentDetails", { id: req.user.id });
  } catch (err) {
    logger.info((<Error>err).message);
  }
};

const getStudentDetails = async (req: Request, res: Response) => {
  try {
    const getRollName: string = `select id from roles where role = ?`;
    let [rollNameResult]: [[{ id: number }], FieldPacket[]] = await con.query<
      [{ id: number } & RowDataPacket[]]
    >(getRollName, ["Student"]);
    let rollid = rollNameResult[0].id;

    const getStudentDetails = `select fname as FirstName, lname as LastName,phone_no as ContactNumber,email as EmailAddress, date(created_at) as RegistrationDate from users where role_id = ?`;
    let [result]: [IStudentDetail[], FieldPacket[]] = await con.query<
      IStudentDetail[]
    >(getStudentDetails, [rollid]);
    if (result.length == 0) {
      res.json({ msg: "no records" });
    } else {
      res.json(result);
    }
  } catch (err) {
    logger.info((<Error>err).message);
  }
};

const studentResultDetails = (req: IReqWithUser, res: Response) => {
  try {
    res.render("admin/studentResultDetails", { id: req.user.id });
  } catch (error) {
    logger.info((<Error>error).message);
  }
};

const resultDetails = async (req: Request, res: Response) => {
  try {
    const roleSQL: string = `select id from roles  where  role =  ?`;
    let [roleResult]: [[{ id: number }], FieldPacket[]] = await con.query<
      [
        {
          id: number;
        } & RowDataPacket[]
      ]
    >(roleSQL, ["Student"]);
    let role_id: number = roleResult[0].id;

    let getResultDetails: string;
    getResultDetails = `select users.id as uid, users.fname as StudentName, users.email as StudentEmailAddress,exam_details.id as eid, exam_details.title as ExamName, exam_details.start_time as StartTime, exam_details.total_marks as TotalMarks, results.exam_id as ID, results.marks as ObtainedMarks  from exam_details inner join results on exam_details.id = results.exam_id
      inner join users on users.id = results.user_id where users.role_id = ? order by results.id desc `;

    let [result] = await con.query(getResultDetails, [role_id]);
    if (result.length == 0) {
      res.json({ msg: "no result found" });
    } else {
      res.json(result);
    }
  } catch (error) {
    logger.info(error.message);
  }
};

const exams = async (req, res) => {
  try {
    let getExams = `select title from exam_details`;
    let [result] = await con.query(getExams);
    res.json({ result });
  } catch (error) {
    logger.info(error.message);
  }
};

const answerKey = async (req, res) => {
  let examId = req.query.examid;
  let userId = req.query.userid;
  const query = `
  SELECT
  u.fname AS first_name,
  u.lname AS last_name,
  e.title AS exam_title,
  e.start_time AS exam_start_time,
  e.duration_minute AS exam_duration,
  e.total_marks AS total_marks,
  e.passing_marks AS passing_marks,
  q.id AS question_id,
  q.questions AS question,
  q.score AS score,
  GROUP_CONCAT(o.id ORDER BY o.id) AS option_ids,
  GROUP_CONCAT(o.option_value ORDER BY o.id) AS options,
  GROUP_CONCAT(o.isAnswer ORDER BY o.id) AS correct_answers,
  ua.answer_id AS user_answer_id,
  TIMESTAMPDIFF(MINUTE, MIN(ue.starttime), MAX(ue.endtime)) AS duration_minutes
 
FROM
  users u
INNER JOIN
  user_answers ua ON u.id = ua.user_id
INNER JOIN
  exam_details e ON ua.exam_id = e.id
INNER JOIN
  questions q ON ua.question_id = q.id
INNER JOIN
  options o ON q.id = o.question_id
INNER JOIN
  user_examtimes ue ON u.id = ue.user_id AND e.id = ue.exam_id
WHERE
  u.id = ? and e.id = ?
GROUP BY
  u.fname, u.lname, e.title, e.start_time, e.duration_minute, e.total_marks, q.id, q.questions, ua.answer_id, ua.exam_id
`;
  try {
    let [result] = await con.query(query, [userId, examId]);
    if (!result) {
      res.render(" admin/viewStudentsAnswerKey", {
        msg: "No Qustion Answer Key Found",
        id: req.user.id,
      });
    }
    const processedResults = result.map((data) => {
      return {
        passingmarks: data.passing_marks,
        result: data.result,
        duration_minute: data.duration_minutes,
        first_name: data.first_name,
        last_name: data.last_name,
        exam_title: data.exam_title,
        exam_start_time: data.exam_start_time,
        exam_duration: data.exam_duration,
        total_marks: data.total_marks,
        question_id: data.question_id,
        question: data.question,
        score: data.score,
        options_ids: data.option_ids.split(","),
        options: data.options.split(","),
        correct_answers: data.correct_answers.split(",").map(Number),
        user_answer_id: data.user_answer_id,
      };
    });
    let totalScore = 0;
    for (let i = 0; i < processedResults.length; i++) {
      if (
        processedResults[i].user_answer_id ==
        processedResults[i].options_ids[
          processedResults[i].correct_answers.indexOf(1)
        ]
      ) {
        totalScore += processedResults[i].score;
      }
    }
    let resultStatus;
    if (totalScore >= result[0].passing_marks) {
      resultStatus = "Pass";
    } else {
      resultStatus = "Fail";
    }

    res.render("admin/viewStudentsAnswerKey", {
      resultData: processedResults,
      totalScore,
      id: req.user.id,
      resultStatus,
    });
  } catch (error) {
    logger.info(error.message);
  }
};

const allExamsPage = (req, res) => {
  try {
    res.render("admin/viewAllExams", { id: req.user.id });
  } catch (error) {
    logger.info(error.message);
  }
};

const allExams = async (req, res) => {
  try {
    let getAllExams = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions, exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())<1 AND isDeleted = 0 order by id desc`;
    let [result] = await con.query(getAllExams);
    // console.log(result);
    res.json(result);
  } catch (error) {
    logger.info(error.message);
  }
};

const getExamRecords = async (req, res) => {
  try {
    let examTitle = req.body.status;
    let getExamRecords;
    if (!examTitle) {
      getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate,
       time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,
       passing_marks as PassingMarks,instructions , exam_activation_code as Exam_Code
        from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())<1 AND isDeleted = 0 order by id desc`;
    } else if (examTitle == "upcoming") {
      getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions, exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())<1 AND isDeleted = 0 order by id desc`;
    } else if (examTitle == "ongoing") {
      getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions,exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())>=0 and TIMESTAMPDIFF(MINUTE,start_time,utc_timestamp()) < duration_minute AND isDeleted = 0 order by id desc`;
    } else if (examTitle == "completed") {
      getExamRecords = `select id as ID, title as ExamName, date(start_time) as ExamDate, time(start_time) as StartTime, duration_minute as Duration,total_marks as TotalMarks,passing_marks as PassingMarks,instructions, exam_activation_code as Exam_Code from exam_details where TIMESTAMPDIFF(SECOND,start_time,utc_timestamp())>= duration_minute AND isDeleted = 0 order by id desc`;
    }
    let [result] = await con.query(getExamRecords, [0]);

    if (result.length == 0) {
      res.json({ msg: "no result found", examTitle });
    } else {
      res.json({ result, examTitle });
    }
  } catch (error) {
    logger.info(error.message);
  }
};

const adminFeedbackPostController = async (req, res) => {
  try {
    let feedback = req.body.feedback.trim();
    let uid = req.body.uid;
    let eid = req.body.eid;
    let id = req.user.id;
    let insertSQL;
    insertSQL = `INSERT INTO instructor_feedbacks (student_id,exam_id,instructor_id,feedback)
    VALUES (?,?,?,?);`;

    let [insertSQLResult] = await con.query(insertSQL, [
      uid,
      eid,
      id,
      `'${feedback}'`,
    ]);

    res.json({ success: "success" });
    notifier.notify("Feedback sent successfully");
  } catch (error) {
    logger.info(error.message);
  }
};

const viewAdminFeedbackPostController = async (req, res) => {
  try {
    let uid = req.body.uid;
    let eid = req.body.eid;

    let showFeedbackSQL = `select feedback from instructor_feedbacks where student_id = ? AND  exam_id = ?`;

    let [showFeedbackResult] = await con.query(showFeedbackSQL, [uid, eid]);

    if (showFeedbackResult.length == 0) {
      res.json({ success: "fail" });
    } else {
      let feedbackVAL = showFeedbackResult[0].feedback;
      res.json({ success: "success", feedbackVAL: feedbackVAL });
    }
  } catch (error) {
    console.log(error);
  }
};
const selectFeedback = async (req, res) => {
  try {
    let uid = req.body.uid;
    let eid = req.body.eid;
    let selectFeedbacks = `select * from instructor_feedbacks where student_id = ? AND exam_id = ?`;
    let resultDetails = await con.query(selectFeedbacks, [uid, eid]);
    res.json(resultDetails);
  } catch (err) {
    console.log(err);
  }
};

const examsRecord = async (req, res) => {
  let examid = req.query.examid;
  try {
    let exams =
      "select title,start_time,duration_minute,total_marks,passing_marks,instructions,exam_status from exam_details where id =? AND isDeleted = ?";
    let [result] = await con.query(exams, [examid, 0]);
    let examdetails = result;
    res.json(examdetails);
  } catch (error) {
    logger.info(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateExamsRecord = async (req, res) => {
  try {
    const {
      id,
      title,
      start_time,
      duration_minute,
      passingmarks,
      instructions,
    } = req.body;
    let updateExamDetails = `update exam_details set title = ?,start_time = ?,duration_minute = ?, passing_marks = ?, instructions = ? where id = ? AND isDeleted = ?`;
    if (new Date() < new Date(start_time)) {
      let [result] = await con.query(updateExamDetails, [
        title,
        new Date(start_time),
        duration_minute,
        passingmarks,
        instructions,
        id,
        0,
      ]);
      notifier.notify("Data Updated Successfully");
      res.json({ success: true });
    } else {
      notifier.notify("cannot update exam details (ongoing)");
      res.json({ success: timeexceeding });
    }
  } catch (error) {
    logger.info(error.message);
    res.json({ success: false });
  }
};

export {
  studentDetailsPage,
  getStudentDetails,
  studentResultDetails,
  resultDetails,
  exams,
  answerKey,
  allExamsPage,
  allExams,
  getExamRecords,
  adminFeedbackPostController,
  selectFeedback,
  examsRecord,
  updateExamsRecord,
  viewAdminFeedbackPostController,
};
