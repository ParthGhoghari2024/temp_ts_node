import { P } from "pino";
let con = require("../../../config/dbConnection");
import { logger } from "../../../utils/pino";
import { JsonWebTokenError } from "jsonwebtoken";
import {
  showTotalExamList,
  showGivenExamList,
  showOngoingExamList,
  showUpcomingExamList,
  showMissedExamList,
} from "./fetchExamDetails";

const startExam = async (req, res) => {
  try {
    const examid = req.query.exam;
    const userid = req.user.id;

    let access = await accessExam(userid, examid);

    if (!access.success) {
      return res.render("expirePage", {
        message: access?.message,
        image: access?.image,
      });
    } else {
      const data = await getInstructions(examid);
      return res.render("user/exam/examQue", { data });
    }
  } catch (error) {
    logger.fatal(error);
  }
};

const showExam = async (req, res) => {
  try {
    const examid = req.query.exam;
    const userid = req.user.id;

    let access = await accessExam(userid, examid);

    if (!access.success) {
      return res.render("expirePage", {
        message: access?.message,
        examStatus: access?.examStatus,
      });
    } else {
      let sql = `SELECT duration_minute as duration from exam_details where id=?`;
      let duration = [];
      try {
        [duration] = await con.query(sql, [examid]);
      } catch (error) {
        logger.fatal(error);
      }

      let remainingTime = duration[0].duration;
      let savedAnswer = await getSelectedQue(userid, examid);
      let storedAnswer = [];
      if (savedAnswer.result !== null) {
        storedAnswer = savedAnswer.result;
      }
      if (savedAnswer.duration !== null) {
        remainingTime = savedAnswer.duration;
      }

      if (savedAnswer.duration === null) {
        sql = `insert into user_examtimes (user_id,exam_id,starttime) values (?,?,?)`;
        try {
          await con.query(sql, [userid, examid, new Date()]);
        } catch (error) {
          logger.fatal(error);
        }
      }

      sql = `select q.id as que_id,q.questions,e.topic,o.id as opt_id,o.option_value,score from questions as q inner join options as o on q.id=o.question_id inner join exam_topics as e on  e.id=q.topic_id where q.exam_id=? order by e.topic asc`;

      let result = [];
      try {
        [result] = await con.query(sql, [examid]);
      } catch (error) {
        logger.fatal(error);
      }

      const topic = [];
      result.forEach((element) => {
        if (!topic.includes(element.topic)) {
          topic.push(element.topic);
        }
      });

      const examPaper = await getExamPaper(topic, result);

      let time = (remainingTime + 1) * 60 * 1000;

      // console.log(time);

      setTimeout(async () => {
        sql = ` select endtime from user_examtimes where user_id=? and exam_id=?`;
        let data;
        try {
          [data] = await con.query(sql, [userid, examid]);
        } catch (error) {
          logger.fatal(error);
        }
        if (data[0]?.endtime === null) {
          let examEndTime = `update user_examtimes set endtime=? where exam_id=? and user_id=?`;
          await con.query(examEndTime, [new Date(), examid, userid]);
          checkMarks(examid, userid);
        }
        // console.log(new Date().toLocaleString());
      }, time);

      return res.json({
        success: true,
        question: examPaper.question,
        topics: examPaper.topic,
        duration: remainingTime,
        examid: examid,
        savedAnswer: storedAnswer,
      });
    }
  } catch (error) {
    logger.fatal(error.message);
  }
};

const examList = async (req, res) => {
  const id = req.user.id;
  const totalExamData = await showTotalExamList(id);
  const givenExamData = await showGivenExamList(id);
  const ongoingExamData = await showOngoingExamList(id);
  const upcomingExamData = await showUpcomingExamList(id);
  const missedExamData = await showMissedExamList(id);
  if (
    totalExamData.success &&
    givenExamData.success &&
    ongoingExamData.success &&
    upcomingExamData.success &&
    missedExamData.success
  ) {
    const examCounts = {
      totalExamCount: totalExamData.count,
      givenExamCount: givenExamData.count,
      ongoingExamCount: ongoingExamData.count,
      upcomingExamCount: upcomingExamData.count,
      missedExamCount: missedExamData.count,
    };
    const examLists = {
      totalExamList: totalExamData.list,
      upcomingExamList: upcomingExamData.list,
      ongoingExamList: ongoingExamData.list,
      givenExamList: givenExamData.list,
      missedExamList: missedExamData.list,
    };

    res.json({ examCount: examCounts, list: examLists, success: true });
  } else {
    return { success: false };
  }
};

//verify examcode
const verifyCode = async (req, res, next) => {
  let data = req.body;

  const sql = `select exam_activation_code as activationCode, duration_minute from exam_details where id = ?`;
  try {
    const [result] = await con.query(sql, [data.id]);
    const resultData = JSON.parse(JSON.stringify(result));
    const activationCode = resultData[0].activationCode;

    if (data.code == activationCode) {
      let examCode = {
        code: activationCode,
        examid: data.id,
      };

      return res
        .cookie("examcode", examCode, {
          maxAge: `${result[0].duration_minute}` * 60 * 1000,
        })
        .json({ success: true, validation: true, examid: data.id });
    } else {
      res.json({ success: true, validation: false });
    }
  } catch (error) {
    logger.fatal(error);
    res.json({ success: false });
  }
};

//submit answer after completion of exam
const submitAnswer = async (req, res) => {
  try {
    const { examId, queAnswer } = req.body;
    const userId = req.user.id;

    queAnswer.forEach(async (element, i) => {
      const obj = {
        user_id: userId,
        exam_id: examId,
      };
      obj.question_id = element.queId;
      obj.answer_id = element.ansId;

      let sql = `select answer_id from user_answers where question_id=? and user_id=? and exam_id=?`;

      let result;

      [result] = await con.query(sql, [obj.question_id, userId, obj.exam_id]);
      if (result.length === 0) {
        if (obj.answer_id !== null || queAnswer.length !== 1) {
          sql = `insert into user_answers set ?`;

          try {
            await con.query(sql, [obj]);
          } catch (error) {
            logger.fatal(error);
          }
        }
      } else {
        sql = `update user_answers set answer_id=? where question_id=? and user_id=? and exam_id=?`;
        try {
          await con.query(sql, [
            obj.answer_id,
            obj.question_id,
            userId,
            obj.exam_id,
          ]);
        } catch (error) {
          logger.fatal(error);
        }
      }
    });

    if (queAnswer.length !== 1) {
      let examEndTime = `update user_examtimes set endtime=? where exam_id=? and user_id=?`;
      await con.query(examEndTime, [new Date(), examId, userId]);
      checkMarks(examId, userId);
    }

    return res.json({ success: true });
  } catch (error) {
    logger.info(error.message);
  }
};

//calculate marks of given exam
const checkMarks = async (exam_id, user_id) => {
  try {
    let userid = user_id,
      examid = exam_id;

    let sql = `select q.id as que_id,o.id as opt_id,score from questions as q inner join options as o on q.id=o.question_id inner join exam_topics as e on  e.id=q.topic_id where q.exam_id =? and isAnswer=1;`;

    let [result] = await con.query(sql, [examid]);

    sql = `select question_id,answer_id from user_answers where user_id=? and exam_id=?;`;

    let [userAns] = await con.query(sql, [userid, examid]);

    let score = 0;
    result.forEach((element) => {
      userAns.forEach((data) => {
        if (
          element.que_id === data.question_id &&
          element.opt_id === data.answer_id
        ) {
          score += element.score;
        }
      });
    });

    sql = `insert into results (exam_id,user_id,marks) values (?)`;

    let array = [examid, userid, score];
    try {
      await con.query(sql, [array]);
    } catch (error) {
      logger.fatal(error);
    }
  } catch (error) {
    logger.fatal(error);
  }
};

//give user of exams
const getInstructions = async (examid) => {
  try {
    let id = examid;

    let sql = `select instructions from exam_details where id = ?`;

    let result;

    [result] = await con.query(sql, [id]);

    let instructions = `<div class="instructions">
      <div class="inst-details"><h2>Instructions</h2>
      <pre>${result[0].instructions}</pre> </div>
      <div>
       <button id="start" data-toggle-fullscreen>Start</button>
      </div>
      </div> `;

    return instructions;
  } catch (error) {
    logger.fatal(error);
  }
};

//check user is already give that exam and access exam before starting or after completion
const accessExam = async (user_id, exam_id) => {
  try {
    let sql = `SELECT TIMESTAMPDIFF(SECOND,utc_timestamp(),start_time) as time ,
    duration_minute*60 as duration,ed.start_time,ue.starttime,ue.endtime,ed.isDeleted from exam_details as ed left join user_examtimes as ue
    on ed.id=ue.exam_id and user_id=? where ed.id=?`;
    let result = [];

    try {
      [result] = await con.query(sql, [user_id, exam_id]);
    } catch (error) {
      logger.fatal(error);
    }

    if (result.length === 0 || result[0].isDeleted === 1) {
      return {
        success: false,
        message: "Link is Invalid.",
        image: "resultnotfound.png",
      };
    } else {
      if (result[0].time > 0) {
        return {
          success: false,
          message: "Exam will Start Soon...",
          image: "examstartsoon.png",
        };
      }
      if (
        result[0].time < -result[0].duration / 3 &&
        result[0].starttime === null
      ) {
        return {
          success: false,
          message: "Link is Expired.",
          image: "expiredImage1.png",
        };
      }
      if (
        result[0].time < -result[0].duration &&
        result[0].starttime !== null &&
        result[0].endtime === null
      ) {
        try {
          await con.query(
            `update user_examtimes set endtime=? where user_id=? and exam_id=?`,
            [new Date(), user_id, exam_id]
          );
        } catch (error) {
          logger.fatal(error);
        }
        return {
          success: false,
          message: "Link is Expired.",
          image: "expiredImage1.png",
        };
      }
    }

    if (result[0].endtime !== null) {
      return {
        success: false,
        message: "Exam Already Given.",
        image: "submittedImage1.webp",
      };
    } else {
      return { success: true };
    }
  } catch (error) {
    logger.fatal(error);
  }
};

const getExamPaper = async (topic, result) => {
  const questiondetails = Object.values(
    result.reduce(
      (acc, { que_id, questions, topic, opt_id, option_value, score }) => {
        acc[que_id] ??= {
          que_id,
          questions,
          score,
          opt_id: [],
          option_value: [],
        };

        if (topic.split(" ").length > 1) {
          acc[que_id].topic = topic.split(" ").join("");
        } else {
          acc[que_id].topic = topic;
        }
        acc[que_id].opt_id.push(opt_id);

        acc[que_id].option_value.push(option_value);

        return acc;
      },
      {}
    )
  );

  //give arrays of question by topics
  const questions = [];
  topic.forEach((element) => {
    let topicname = element;
    if (topicname.split(" ").length > 1) {
      topicname = topicname.split(" ").join("");
    }

    let arr = questiondetails.filter((data) => {
      return data.topic == topicname;
    });

    questions.push(arr);
  });

  //convert multiple topicwise array into single question array
  const quetopicwise = [];

  questions.forEach((element) => {
    element.forEach((data) => {
      quetopicwise.push(data);
    });
  });
  let randomOrder = [];
  while (randomOrder.length < 4) {
    let index = Math.floor(Math.random() * 4);
    if (!randomOrder.includes(index)) {
      randomOrder.push(index);
    }
  }

  //generates questions
  let question = "";
  quetopicwise.forEach((element, i) => {
    question += ` <div class="queans">
    <div class="quedetails">
      <input type="hidden" id="${element.que_id}" name="que[]" value="${
      element.que_id
    }">
      <input type="hidden" class="topicname" value="${element.topic}">
      <p class="question"> <span id="queno">${i + 1}</span>.${
      element.questions
    }</p>
      <p> (<span id="quescore">${element.score}</span> ${
      element.score == 1 ? "mark" : "marks"
    })</p>
    </div>
    <div class="answer">
      <div class="opts"> `;

    randomOrder.forEach((data) => {
      question += `  <div>
        <input type="radio" name="opt${i + 1}"  value="${
        element.opt_id[data]
      }" id="opt${data}-${i + 1}"><label for="opt${data}-${i + 1}">${
        element.option_value[data]
      }</label>
      </div>`;
    });

    question += ` </div>
    </div>
       <div>
          <button id="opt${
            i + 1
          }" class="clear-response">Clear Response</button>
       </div>
    </div>`;
  });

  //generates topics
  let topics = "";
  topic.forEach((element) => {
    let topicname = element;
    if (topicname.split(" ").length > 1) {
      topicname = topicname.split(" ").join("");
    }
    topics += `<p id="${topicname}" class="topic" name="${topicname}">${element}</p>`;
  });

  return { question: question, topic: topics };
};

const getSelectedQue = async (user_id, exam_id) => {
  let sql = `select starttime,timestampdiff(minute,utc_timestamp(),starttime) + duration_minute as 
  time from user_examtimes as u left join exam_details as e on e.id=u.exam_id
   where user_id=? and exam_id=? `;
  let result;
  try {
    [result] = await con.query(sql, [user_id, exam_id]);
  } catch (error) {
    logger.fatal(error);
  }

  if (result[0]) {
    if (result[0].starttime !== null) {
      sql = `select question_id,answer_id from user_answers where user_id=? and exam_id=?`;

      try {
        [savedAnswer] = await con.query(sql, [user_id, exam_id]);
      } catch (error) {
        logger.fatal(error);
      }

      if (savedAnswer.length === 0) {
        return { result: null, duration: result[0].time };
      } else {
        return { result: savedAnswer, duration: result[0].time };
      }
    }
  } else {
    return { result: null, duration: null };
  }
};

export { startExam, showExam, examList, submitAnswer, checkMarks, verifyCode };
