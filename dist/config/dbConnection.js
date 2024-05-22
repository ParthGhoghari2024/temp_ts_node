"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const pino_1 = require("../utils/pino");
const conOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings: true,
    timezone: "+00:00",
};
const con = mysql2_1.default.createConnection(conOptions).promise();
con
    .connect()
    .then(() => pino_1.logger.info("db Connected"))
    .catch((error) => pino_1.logger.info(error.message));
exports.default = con;
