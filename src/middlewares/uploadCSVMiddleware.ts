import multer from "multer";
import { Request, Response, NextFunction, RequestHandler } from "express";
const maxSize = 1 * 1024 * 1024; // 1MB

import fs from "fs";
import path from "path";
import { IReqWithFileValidationError } from "../types/interfaces";
let csvDir: string | undefined = process.env.CSV_UPLOAD_PATH;
let storage: multer.StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    if (!fs.existsSync(csvDir + "/" + req.body.examid)) {
      fs.mkdirSync(csvDir + "/" + req.body.examid, { recursive: true }); //mkdir if not exist
    }
    cb(null, csvDir + "/" + req.body.examid);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    let newFileName: string =
      "exam_" + req.body.examid + "_" + Date.now() + "_" + file.originalname;
    req.body.newFileName = newFileName;
    req.body.filePath = `/${req.body.examid}/${newFileName}`;
    cb(null, newFileName);
  },
});

const whitelistMimeType: string[] = ["text/csv"];
const whitelistExtentions: string[] = [".csv"];
let upload: RequestHandler = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (
    req: IReqWithFileValidationError,
    file: Express.Multer.File,
    cb: (error: null, acceptFile: boolean) => void
  ) {
    let fileExtention = path.extname(file.originalname).toLowerCase();
    if (
      !whitelistMimeType.includes(file.mimetype) ||
      !whitelistExtentions.includes(fileExtention)
    ) {
      req.fileValidationError = "File type Error";
      return cb(null, false);
    }
    cb(null, true);
  },
}).single("csv");

const uploadCSVMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.json({
          success: 0,
          message: "File limit error",
          fileLimitError: 1,
        });
      }
    }
    next();
  });
};
export { uploadCSVMiddleware };
