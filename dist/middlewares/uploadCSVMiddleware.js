"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCSVMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const maxSize = 1 * 1024 * 1024; // 1MB
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let csvDir = process.env.CSV_UPLOAD_PATH;
let storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (!fs_1.default.existsSync(csvDir + "/" + req.body.examid)) {
            fs_1.default.mkdirSync(csvDir + "/" + req.body.examid, { recursive: true }); //mkdir if not exist
        }
        cb(null, csvDir + "/" + req.body.examid);
    },
    filename: (req, file, cb) => {
        let newFileName = "exam_" + req.body.examid + "_" + Date.now() + "_" + file.originalname;
        req.body.newFileName = newFileName;
        req.body.filePath = `/${req.body.examid}/${newFileName}`;
        cb(null, newFileName);
    },
});
const whitelistMimeType = ["text/csv"];
const whitelistExtentions = [".csv"];
let upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        let fileExtention = path_1.default.extname(file.originalname).toLowerCase();
        if (!whitelistMimeType.includes(file.mimetype) ||
            !whitelistExtentions.includes(fileExtention)) {
            req.fileValidationError = "File type Error";
            return cb(null, false);
        }
        cb(null, true);
    },
}).single("csv");
const uploadCSVMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
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
exports.uploadCSVMiddleware = uploadCSVMiddleware;
