import puppeteer from "puppeteer"; //important: use 12.0.0 version only
import con from "../../../config/dbConnection";
import { logger } from "../../../utils/pino";

const exportExamResultScoreAsPDF = async (req, res) => {
  try {
    const examId = req.query.examid;
    const port = process.env.PORT;
    const token = req.cookies.token || "temp";
    let URL = `http://localhost:${port}/user/userScoreEJS?examid=${examId}&token=${token}&userid=${req.user.id}`;

    // console.log("check 2", URL);

    let cookies = req.cookies;

    let cookiesString = "";

    for (const [name, value] of Object.entries(cookies)) {
      cookiesString += `${name}=${value};`;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(URL, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4" });

    await browser.close();
    res.setHeader("Content-Disposition", `attachment; filename=ExamResult.pdf`); // to set the filename
    res.send(pdf);
  } catch (error) {
    logger.error(error);
  }
};

export { exportExamResultScoreAsPDF };
