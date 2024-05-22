import con from "../config/dbConnection";
import puppeteer from "puppeteer"; //important: use 12.0.0 version only
import { logger } from "./pino";
import fs from "fs";
import papaparse from "papaparse";
const generateQuestionsPdfByExamId = async (examId, token) => {
  try {
    let port = process.env.PORT;

    let URL = `http://localhost:${port}/admin/exams/questions/exportPage?examid=${examId}&token=${token}`;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(URL, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A3" });

    await browser.close();
    const examTitleSql = "select title from exam_details where id=?";

    let [examTitle] = await con.query(examTitleSql, examId);
    examTitle = examTitle[0].title || "test_exam";

    let dirOfPdf = process.env.CONTENT_DIR;

    if (!fs.existsSync(`${dirOfPdf}/questionsPdf/`)) {
      fs.mkdirSync(`${dirOfPdf}/questionsPdf/`, { recursive: true });
    }
    fs.writeFileSync(
      `${dirOfPdf}/questionsPdf/${examId}_${examTitle}.pdf`,
      pdf,
      "binary"
    );
  } catch (error) {
    logger.error(error);
  }
};
const generateQuestionsCSVByExamId = async (examId, res) => {
  try {
    const getQuestionsDetailsSql =
      "select o.id,o.question_id,q.exam_id,q.questions,o.option_value,dl.difficulty,et.topic,o.isAnswer,q.score  from questions q left join options o on o.question_id=q.id left join difficulty_levels dl on dl.id=q.difficulty_id left join exam_topics et on et.id=q.topic_id  where q.exam_id=? and q.isDeleted=0; ";

    let [getQuestionsResult] = await con.query(getQuestionsDetailsSql, examId);
    if (
      (getQuestionsResult && getQuestionsResult.length === 0) ||
      (getQuestionsResult[0] && getQuestionsResult[0].length === 0)
    ) {
      return res.render("errorPage404");
    }
    getQuestionsResult = getQuestionsResult.reduce((prev, cur) => {
      if (typeof prev.id === "number") prev.id = [prev.id];
      else prev.id.push(cur.id);
      if (typeof prev.question_id === "number")
        prev.question_id = [prev.question_id];
      else prev.question_id.push(cur.question_id);
      if (typeof prev.exam_id === "number") prev.exam_id = [prev.exam_id];
      else prev.exam_id.push(cur.exam_id);

      if (typeof prev.questions === "string") prev.questions = [prev.questions];
      else prev.questions.push(cur.questions);

      if (typeof prev.option_value === "string")
        prev.option_value = [prev.option_value];
      else prev.option_value.push(cur.option_value);

      if (typeof prev.difficulty === "string")
        prev.difficulty = [prev.difficulty];
      else prev.difficulty.push(cur.difficulty);

      if (typeof prev.topic === "string") prev.topic = [prev.topic];
      else prev.topic.push(cur.topic);

      if (typeof prev.isAnswer === "number") prev.isAnswer = [prev.isAnswer];
      else prev.isAnswer.push(cur.isAnswer);
      if (typeof prev.score === "number") prev.score = [prev.score];
      else prev.score.push(cur.score);

      return prev;
    }, getQuestionsResult[0]);

    let csvArray: string[][] = [];

    let row = [
      "#",
      "QUESTION TEXT",
      "DIFFICULTY",
      "TOPIC",
      "OPTION_1",
      "OPTION_2",
      "OPTION_3",
      "OPTION_4",
      "RIGHT_OPTION_NUMBER",
      "SCORE",
    ];
    csvArray.push(row);
    let ans = 0;
    for (let i = 0; i < getQuestionsResult.id.length; i = i + 4) {
      if (getQuestionsResult.isAnswer[i] === 1) ans = 1;
      else if (getQuestionsResult.isAnswer[i + 1] === 1) ans = 2;
      else if (getQuestionsResult.isAnswer[i + 2] === 1) ans = 3;
      else if (getQuestionsResult.isAnswer[i + 3] === 1) ans = 4;

      row = [
        i + 1,
        getQuestionsResult.questions[i],
        getQuestionsResult.difficulty[i],
        getQuestionsResult.topic[i],
        getQuestionsResult.option_value[i],
        getQuestionsResult.option_value[i + 1],
        getQuestionsResult.option_value[i + 2],
        getQuestionsResult.option_value[i + 3],
        ans,
        getQuestionsResult.score[i],
      ];

      csvArray.push(row);
    }

    let csvData = papaparse.unparse(csvArray);

    const examTitleSql =
      "select title from exam_details where id=? AND isDeleted=0";

    let [examTitle] = await con.query(examTitleSql, examId);
    examTitle = examTitle[0].title || "test_exam";

    let dirOfCSV = process.env.CONTENT_DIR;

    if (!fs.existsSync(`${dirOfCSV}/questionsCSV/`)) {
      fs.mkdirSync(`${dirOfCSV}/questionsCSV/`, { recursive: true });
    }
    fs.writeFileSync(
      `${dirOfCSV}/questionsCSV/${examId}_${examTitle}.csv`,
      csvData,
      "utf-8"
    );
  } catch (error) {
    logger.error(error);
  }
};

export { generateQuestionsPdfByExamId, generateQuestionsCSVByExamId };
