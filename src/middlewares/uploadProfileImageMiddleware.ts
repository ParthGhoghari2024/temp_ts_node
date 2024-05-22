import multer, { Multer } from "multer";
import notifier from "node-notifier";
import { Request, Response, NextFunction } from "express";
const maxSize = 2 * 1024 * 1024; // 2MB
import fs from "fs";
import path from "path";
import { IReqWithFileValidationError } from "../types/interfaces";
var profileImageDir: string = `uploads/profileImages`;
let storage: multer.StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    if (!fs.existsSync(profileImageDir + "/" + req.body.id)) {
      fs.mkdirSync(profileImageDir + "/" + req.body.id, { recursive: true }); //mkdir if not exist
    }
    cb(null, profileImageDir + "/" + req.body.id);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    let newFileName: string =
      "profileImage_" +
      req.body.id +
      "_" +
      Date.now() +
      "_" +
      file.originalname;
    req.body.newFileName = newFileName;
    req.body.filePath = `/${req.body.id}/${newFileName}`;
    cb(null, newFileName);
  },
});

const whitelistExtentions = [".jpg", ".jpeg", ".png"];
let upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (
    req: IReqWithFileValidationError,
    file: Express.Multer.File,
    cb: (error: null, acceptFile: boolean) => void
  ) {
    let fileExtention = path.extname(file.originalname).toLowerCase();
    if (!whitelistExtentions.includes(fileExtention)) {
      req.fileValidationError = "File type Error";
      return cb(null, false);
    }
    cb(null, true);
  },
}).single("image");

const uploadProfileImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        notifier.notify(`Please upload valid file size must be less than 2MB`);
        return res.json({
          success: 0,
          message: "File limit error",
          fileLimitError: 1,
        });
      }
    }
    next();
  });
};

export { uploadProfileImageMiddleware };
