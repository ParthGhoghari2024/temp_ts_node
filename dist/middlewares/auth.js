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
exports.hasExamCode = exports.isStudent = exports.isAdmin = exports.passportAuth = void 0;
require("dotenv").config();
const pino_1 = require("../utils/pino");
const dbConnection_1 = __importDefault(require("../config/dbConnection"));
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const getToken = (req) => {
    var _a;
    const token = req.body.token ||
        req.cookies.token ||
        ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
    if (token) {
        return token;
    }
};
const opts = {
    jwtFromRequest: getToken,
    secretOrKey: process.env.TOKEN_SECRET,
};
const passportAuth = (passport) => {
    console.log("passport Auth");
    passport.use(new JwtStrategy(opts, (payload, next) => __awaiter(void 0, void 0, void 0, function* () {
        let userid = payload.userid;
        let result;
        try {
            [result] = yield dbConnection_1.default.query(`select id,role_id,fname,lname,email,dob,phone_no,address,city,state,zipcode,password,about,activation_code,activation_status,token_created_at from users where id=?`, [userid]);
        }
        catch (err) {
            return next(err, false);
        }
        if (result.length > 0) {
            return next(null, result[0]);
        }
        else {
            return next(null, false);
        }
    })));
};
exports.passportAuth = passportAuth;
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = req.user.id;
    let sql = `select id,role_id,fname,lname,email,dob,phone_no,address,city,state,zipcode,password,about,activation_code,activation_status,token_created_at from users where id=?`;
    let result = [];
    try {
        [result] = yield dbConnection_1.default.query(sql, [userid]);
    }
    catch (error) {
        pino_1.logger.info(error.message);
        next(error, false);
    }
    sql = `select role from roles where id=?`;
    let role;
    [role] = yield dbConnection_1.default.query(sql, [result[0].role_id]);
    if (role[0].role === "Admin") {
        next(null, result[0]);
    }
    else {
        return res.redirect("/auth/login");
    }
});
exports.isAdmin = isAdmin;
const isStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = req.user.id;
    let sql = `select id,role_id,fname,lname,email,dob,phone_no,address,city,state,zipcode,password,about,activation_code,activation_status,token_created_at from users where id=?`;
    let result = [];
    try {
        [result] = yield dbConnection_1.default.query(sql, [userid]);
    }
    catch (error) {
        pino_1.logger.info(error.message);
        next(null, false);
    }
    sql = `select role from roles where id=?`;
    let role = [];
    [role] = yield dbConnection_1.default.query(sql, [result[0].role_id]);
    if (role[0].role === "Student") {
        next(null, result[0]);
    }
    else {
        return res.redirect("/auth/login");
    }
});
exports.isStudent = isStudent;
const hasExamCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let examcode = (_a = req.cookies.examcode) === null || _a === void 0 ? void 0 : _a.code;
        let examid = req.query.exam;
        if (examcode === undefined || examid === undefined) {
            return res.redirect("/user/userDashboard");
        }
        let sql = `select id,creater_id,title,start_time,duration_minute,total_marks,passing_marks,instructions,exam_status,exam_activation_code,isDeleted from exam_details where id = ? and exam_activation_code=?`;
        let result = [];
        try {
            [result] = yield dbConnection_1.default.query(sql, [examid, examcode]);
        }
        catch (error) {
            pino_1.logger.info(error.message);
        }
        if (result.length === 0) {
            res.redirect("/user/userDashboard");
        }
        else {
            next();
        }
    }
    catch (error) {
        pino_1.logger.info(error.message);
    }
});
exports.hasExamCode = hasExamCode;
