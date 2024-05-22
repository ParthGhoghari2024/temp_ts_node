import con from "../../config/dbConnection";
import notifier from "node-notifier";
import { logger } from "../../utils/pino";

const userAnswerReview = async (req, res) => {
  let examId = req.query.examid;
  let userId = req.user.id;
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
  u.id = ? and e.id = ${examId}
GROUP BY
  u.fname, u.lname, e.title, e.start_time, e.duration_minute, e.total_marks, q.id, q.questions, ua.answer_id, ua.exam_id
`;
  try {
    let [result] = await con.query(query, userId);
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

    res.render("user/StudentAnswerKey", {
      resultData: processedResults,
      totalScore,
      id: req.user.id,
      resultStatus,
    });
  } catch (error) {
    console.log(error);
  }
};

export { userAnswerReview };
