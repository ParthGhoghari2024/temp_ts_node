"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportExamResultScoreAsPDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer")); //important: use 12.0.0 version only
const pino_1 = require("../../../utils/pino");
const exportExamResultScoreAsPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const browser = yield puppeteer_1.default.launch({ headless: true });
        const page = yield browser.newPage();
        yield page.goto(URL, { waitUntil: "networkidle0" });
        const pdf = yield page.pdf({ format: "A4" });
        yield browser.close();
        res.setHeader("Content-Disposition", `attachment; filename=ExamResult.pdf`); // to set the filename
        res.send(pdf);
    }
    catch (error) {
        pino_1.logger.error(error);
    }
});
exports.exportExamResultScoreAsPDF = exportExamResultScoreAsPDF;
