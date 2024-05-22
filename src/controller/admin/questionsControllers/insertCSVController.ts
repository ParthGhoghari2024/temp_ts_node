import { Request, Response } from "express";
import con from "../../../config/dbConnection";
import fs from "fs";
import { insertQuestionHelper } from "./updateQuestionsController";
import {
  getExamTotalMarksFromQuestionsTable,
  getExamMarksFromExamTable,
} from "./insertQuestionsController";
import { logger } from "../../../utils/pino";
import path from "path";
import papaparse from "papaparse";
import {
  generateQuestionsPdfByExamId,
  generateQuestionsCSVByExamId,
} from "../../../utils/pdfAndCsvGenerator";
import {
  ICSVQue,
  IExamDifficulty,
  IExamTime,
  IExamTopic,
  IReqWithFileValidationError,
  IResultObj,
} from "../../../types/interfaces";
import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";
const insertCSVController = async (
  req: IReqWithFileValidationError,
  res: Response
) => {
  try {
    if (req.fileValidationError) {
      return res.json({ success: 0, message: "Invalid File type" });
    }
    if (!req.file) {
      return res.json({ success: 0, message: "No file selected", noFiles: 1 });
    }
    let insertCSVFileDetailSQL = `INSERT INTO CSVFiles (exam_id, admin_id, original_filename,new_filename, path) VALUES (?);`;
    let adminId: null | number = null; //temp todo:
    if (req.user && req.user.id) {
      adminId = req.user.id;
    }
    let examId: number = parseInt(req.body.examid);
    let newFileName: string = req.body.newFileName; //set from middleware
    let filePath: string = req.body.filePath; // set from middleware

    let examDetailsSQL: string =
      "select start_time,timestampdiff(second,utc_timestamp,start_time) as time from exam_details where id=?";
    let [examDetails]: [IExamTime[], FieldPacket[]] = await con.query<
      IExamTime[]
    >(examDetailsSQL, examId);

    if (examDetails && examDetails[0] && examDetails[0].start_time) {
      if (examDetails[0].time < 0) {
        return res.json({ success: 0, startingTimeError: 1 });
      }
      // console.log(startingTime);
    }
    let insertCSVFileDetailParams: [
      number,
      number | null,
      string,
      string,
      string
    ] = [examId, adminId, req.file.originalname, newFileName, filePath];
    let [insertCSVFileDetailResult]: [QueryResult, FieldPacket[]] =
      await con.query<QueryResult>(insertCSVFileDetailSQL, [
        insertCSVFileDetailParams,
      ]);

    let csvDir: string = process.env.CSV_UPLOAD_PATH as string;

    let csvFileData: string = fs.readFileSync(`${csvDir}/${filePath}`, {
      encoding: "utf8",
      flag: "r",
    });

    let csvParsed: papaparse.ParseResult<string[]> =
      papaparse.parse(csvFileData);

    let csvArray: string[][] = csvParsed.data;
    let difficulties: IResultObj | undefined = await getDifficulties();
    let difficultiesArrray: string[] = Object.keys(difficulties!); //TODO: TYPECAST THIS
    let topics: IResultObj | undefined = await getTopics();
    let topicsArrray: string[] = Object.keys(topics!); //TODO: TYPECAST THIS
    let validateCSVStatus: number | undefined = validateCSV(
      csvArray,
      difficultiesArrray,
      topicsArrray
    ); //todo:
    if (validateCSVStatus != -1) {
      return res.json({
        success: 0,
        CSVParseError: 1,
        errorAt: validateCSVStatus,
      });
    }

    let updateExamTotalMarksFlag: number =
      Number(req.body.updateExamTotalMarks) ||
      Number(req.query.updateExamTotalMarks) ||
      0;
    if (updateExamTotalMarksFlag !== 1 && updateExamTotalMarksFlag !== 0) {
      return res.json({ temp: 1 });
    }

    // console.log(csvArray);

    const csvArrayWithoutHeader: string[][] = csvArray.slice(1);
    let examTotalMarksFromQuestionsTable: number =
      await getExamTotalMarksFromQuestionsTable(examId);
    let insertedQuestionTotalMarks: number = 0;
    csvArrayWithoutHeader.forEach((arr: string[], index: number) => {
      if (arr.length === 10) {
        insertedQuestionTotalMarks += Number(arr[9]);
      }
    });

    if (insertedQuestionTotalMarks === 0) {
      return res.json({ success: 0, totalMarksError: 1 });
    }
    if (updateExamTotalMarksFlag === 0) {
      //if this is 1 then we have to insert questions anyway and update the total marks in exam detail table or else we have to check if marks conflicts or not
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

      if (examTotalMarksFromQuestionsTable === -1)
        examTotalMarksFromQuestionsTable = 0;

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
      if (examTotalMarksFromQuestionsTable === -1)
        examTotalMarksFromQuestionsTable = 0;

      const newTotalMarks: number =
        examTotalMarksFromQuestionsTable + insertedQuestionTotalMarks;
      if (!isNumber(Number(req.query.newPassingMarks))) {
        return res.json({ success: 0, error: " Query String error " });
      }
      const newPassingMarks: number = Number(req.query.newPassingMarks);
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

    insertQuestionsFromCSV(examId, csvArray);

    //updating exam status to active after questions added
    let updateExamStatusSQL = `UPDATE  exam_details SET exam_status = ? WHERE id = ?;`;
    let [updateExamStatusResult]: [QueryResult, FieldPacket[]] =
      await con.query<QueryResult>(updateExamStatusSQL, [1, examId]);

    // send json after validation only
    res.json({ success: 1, message: "CSV stored" });

    //GENERATING PDF AND CSV FOR FUTURE DOWNLOAD
    let token: string = req.cookies.token;
    await generateQuestionsPdfByExamId(examId, token);
    await generateQuestionsCSVByExamId(examId, res);
  } catch (error) {
    logger.error(error);
  }
};
const isNumber = (num: number): boolean => !isNaN(num);

const validateCSV = (
  csvArray: string[][],
  difficultiesArrray: string[],
  topicsArrray: string[]
) => {
  try {
    let flag: number = 0;

    const MAX_LENGTH_QUESTION_TEXT: number = 1000;
    csvArray.forEach(async (row: string[], index: number) => {
      if (flag != 0) return;

      if (index != 0 && row.length === 10) {
        let que: ICSVQue = {
          text: row[1] && row[1].trim(),
          difficulty: row[2] && row[2].trim(),
          topic: row[3] && row[3].trim(),
          score: parseInt(row[9]),
          options: [
            row[4] && row[4].trim(),
            row[5] && row[5].trim(),
            row[6] && row[6].trim(),
            row[7] && row[7].trim(),
          ],
          correctId: parseInt(row[8]),
        };
        if (
          !que.text ||
          !que.difficulty ||
          !que.topic ||
          !que.score ||
          !que.options[0] ||
          !que.options[1] ||
          !que.options[2] ||
          !que.options[3]
        ) {
          flag = index;
        }
        if (!isNumber(que.score) || !isNumber(que.correctId)) {
          flag = index;
        }
        if (
          !difficultiesArrray.includes(que.difficulty.toLowerCase()) ||
          !topicsArrray.includes(que.topic.toLowerCase())
        ) {
          flag = index;
        }

        if (que.correctId > 4 || que.correctId < 1) {
          flag = index;
        }

        if (que.score > 5 || que.score < 1) {
          flag = index;
        }
        if (
          que.text.length > MAX_LENGTH_QUESTION_TEXT ||
          que.text.length === 0 ||
          que.options[0].length > 255 ||
          que.options[0].length === 0 ||
          que.options[1].length > 255 ||
          que.options[1].length === 0 ||
          que.options[2].length > 255 ||
          que.options[2].length === 0 ||
          que.options[3].length > 255 ||
          que.options[3].length === 0
        ) {
          flag = index;
        }
      } else {
        // to check if whole row is empty then its fine for last row only
        row.forEach((cell) => {
          if (cell) {
            flag = index;
          }
        });
      }
    });
    if (flag != 0) return flag;
    else return -1;
  } catch (error: unknown) {
    logger.error(error);
  }
};
const insertQuestionsFromCSV = (examId: number, csvArray: string[][]) => {
  try {
    csvArray.forEach(async (row: string[], index: number) => {
      if (index != 0 && row.length === 10) {
        let que: ICSVQue = {
          text: row[1] && row[1].trim(),
          difficulty: row[2] && row[2].trim(),
          topic: row[3] && row[3].trim(),
          score: parseInt(row[9]),
          options: [
            row[4] && row[4].trim(),
            row[5] && row[5].trim(),
            row[6] && row[6].trim(),
            row[7] && row[7].trim(),
          ],
          correctId: parseInt(row[8]),
        };
        await insertQuestion(examId, que);
      }
    });

    // console.log(csvFileData);
    // console.log(csvArray);
  } catch (error: unknown) {
    logger.error(error);
  }
};

// const insertQuestionHelper
// not in use currenly , replaced by package
const csvToArrray = (data: string) => {
  try {
    let rows = data.split("\n");
    let arr = rows.map((row: string) => {
      return row.split(",");
    });

    return arr;
  } catch (error: unknown) {
    logger.error(error);
  }
};

const getDifficulties = async (): Promise<IResultObj | undefined> => {
  try {
    let getDifficultiesSql = `select id,difficulty from difficulty_levels `;
    let [result]: [IExamDifficulty[], FieldPacket[]] = await con.query<
      IExamDifficulty[]
    >(getDifficultiesSql);

    let resultObj: { [Key: string]: number } = {};
    result.forEach((el: IExamDifficulty) => {
      resultObj[el.difficulty.toLowerCase()] = el.id;
    });
    return resultObj;
  } catch (error: unknown) {
    logger.error(error);
  }
};
const getTopics = async (): Promise<IResultObj | undefined> => {
  try {
    let getTopicsSql: string = `select id,topic from exam_topics `;
    let [result]: [IExamTopic[], FieldPacket[]] = await con.query<IExamTopic[]>(
      getTopicsSql
    );

    let resultObj: { [Key: string]: number } = {};
    result.forEach((el) => {
      resultObj[el.topic.toLowerCase()] = el.id;
    });
    return resultObj;
  } catch (error: unknown) {
    logger.error(error);
  }
};
const insertQuestion = async (examId: number, que: ICSVQue): Promise<void> => {
  try {
    let difficulties: IResultObj | undefined = await getDifficulties();
    let topics: IResultObj | undefined = await getTopics();

    // console.log(topics)

    // console.log(difficulties);

    let insertQuestionSql =
      "INSERT INTO questions (`exam_id`, `difficulty_id`, `topic_id`, `questions`, `score`) VALUES (?)";

    let insertOptionSql =
      "INSERT INTO options (`question_id`, `option_value`, `isAnswer`) VALUES (?)";

    let options: string[] = que.options;
    let questionSqlParam = [
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

    // console.log(questionInsertResult);

    let questionInsertedId: number = questionInsertResult.insertId;
    options.forEach(async (option: string, index: number) => {
      let isAns: boolean = false;
      if (index + 1 === que.correctId) isAns = true;
      let optionSqlParam: [number, string, boolean] = [
        questionInsertedId,
        option,
        isAns,
      ];
      let [optionInsertResult]: [QueryResult, FieldPacket[]] =
        await con.query<QueryResult>(insertOptionSql, [
          optionSqlParam,
          // console.log(optionInsertResult);
        ]);
    });
  } catch (error: unknown) {
    logger.error(error);
  }
};

const downloadSampleCSV = async (req: Request, res: Response) => {
  try {
    const sampleCSVPath: string = "../../../../uploads/questionCSV/sample.csv";

    res.sendFile(path.join(__dirname + sampleCSVPath));
  } catch (error: unknown) {
    logger.error(error);
  }
};

export = { insertCSVController, downloadSampleCSV };
