"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfileImageMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const node_notifier_1 = __importDefault(require("node-notifier"));
const maxSize = 2 * 1024 * 1024; // 2MB
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var profileImageDir = `uploads/profileImages`;
let storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (!fs_1.default.existsSync(profileImageDir + "/" + req.body.id)) {
            fs_1.default.mkdirSync(profileImageDir + "/" + req.body.id, { recursive: true }); //mkdir if not exist
        }
        cb(null, profileImageDir + "/" + req.body.id);
    },
    filename: (req, file, cb) => {
        let newFileName = "profileImage_" +
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
let upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        let fileExtention = path_1.default.extname(file.originalname).toLowerCase();
        if (!whitelistExtentions.includes(fileExtention)) {
            req.fileValidationError = "File type Error";
            return cb(null, false);
        }
        cb(null, true);
    },
}).single("image");
const uploadProfileImageMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                node_notifier_1.default.notify(`Please upload valid file size must be less than 2MB`);
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
exports.uploadProfileImageMiddleware = uploadProfileImageMiddleware;
