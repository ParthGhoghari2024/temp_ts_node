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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationVerifyLink = exports.logout = exports.currentUser = exports.registrationLinkController = exports.checkLogin = exports.postRegistrationController = exports.setPasswordController = exports.forgotPasswordNewPassword = exports.forgotPasswordVarifyLink = exports.activationLinkController = exports.forgotPasswordVarifyEmail = exports.forgotPasswordController = exports.loginController = exports.registrationController = void 0;
const dbConnection_1 = __importDefault(require("../../config/dbConnection"));
const generate_unique_id_1 = __importDefault(require("generate-unique-id"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pino_1 = require("../../utils/pino");
const crypto_1 = __importDefault(require("crypto"));
require("dotenv").config();
// registration
const registrationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render("authentication/registrationPage");
    }
    catch (error) {
        pino_1.logger.info(error);
    }
});
exports.registrationController = registrationController;
const postRegistrationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { fname, lname, email, contactno, dob, password } = req.body;
    const saltRounds = 5;
    let activationCode = crypto_1.default.randomBytes(12).toString("hex");
    const salt = bcrypt_1.default.genSaltSync(saltRounds);
    const hash = bcrypt_1.default.hashSync(password, salt);
    try {
        let getUsersSql = `select email,activation_status,token_created_at from users where email = ? `;
        let [result] = yield dbConnection_1.default.query(getUsersSql, [email]);
        if (result.length == 1) {
            if (result[0].activation_status == 0) {
                const currentTime = new Date();
                let token_created_at = new Date(result[0].token_created_at);
                let ms = currentTime - token_created_at;
                let expiresIn = 1 * 60 * 60 * 1000;
                if (ms > expiresIn) {
                    let deleteUserSql = `delete from  users where email = ?`;
                    let deleteUser = yield dbConnection_1.default.query(deleteUserSql, [email]);
                }
                else {
                    return res.json({
                        success: false,
                        message: "user is already registered",
                    });
                }
            }
            else {
                return res.json({
                    success: false,
                    message: "user is already registered",
                });
            }
        }
        let rolesSql = `select id from roles where role="Student"`;
        let [roles] = yield dbConnection_1.default.query(rolesSql);
        let insertUserSql = `insert into users(role_id,fname,lname,email,phone_no,dob,password,activation_code)values(?,?,?,?,?,?,?,?)`;
        let insertUser = yield dbConnection_1.default.query(insertUserSql, [
            roles[0].id,
            fname,
            lname,
            email,
            contactno,
            dob,
            hash,
            activationCode,
        ]);
        res.json({
            success: true,
            message: "Succesfully registered",
            activation_code: activationCode,
        });
    }
    catch (err) {
        console.log(err.message);
    }
});
exports.postRegistrationController = postRegistrationController;
const registrationLinkController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render("authentication/activationSuccess");
    }
    catch (err) {
        console.log(err.message);
    }
});
exports.registrationLinkController = registrationLinkController;
const registrationVerifyLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const activation_code = req.body.activationLink;
    if (activation_code) {
        try {
            const checkActivationSql = "select activation_status,timestampdiff(second,token_created_at,utc_timestamp) as diff from users where activation_code = ?";
            const [result] = yield dbConnection_1.default.query(checkActivationSql, [activation_code]);
            console.log(result);
            if (result.length == 0) {
                res.json({ success: false, message: "Invalid user" });
            }
            else if (result[0].activation_status == 1) {
                res.json({ success: false, message: "user already activated" });
            }
            else {
                let expiresIn = 1 * 60 * 60;
                if (result[0].diff > expiresIn) {
                    res.json({ success: false, message: "activation link expires" });
                }
                else {
                    let activateUser = `update users set activation_status='1' where activation_code=?`;
                    let ans = yield dbConnection_1.default.query(activateUser, [activation_code]);
                    res.json({ success: true });
                }
            }
        }
        catch (error) {
            res.json({ success: false, message: "something went wrong! :(" });
        }
    }
    else {
        res.json({
            success: false,
            errorMessage: "empty activation link or email",
        });
    }
});
exports.registrationVerifyLink = registrationVerifyLink;
const loginController = (req, res) => {
    try {
        res.render("authentication/loginPage");
    }
    catch (err) {
        console.log(err);
    }
};
exports.loginController = loginController;
const checkLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, password } = req.body;
        let sql = `select * from users where email=? and activation_status=1`;
        let result = [];
        try {
            [result] = yield dbConnection_1.default.query(sql, [email]);
        }
        catch (error) {
            pino_1.logger.fatal(error.message);
        }
        if (result.length === 0) {
            return res.json({
                success: false,
                message: "email and password not match",
            });
        }
        const hashedpassword = result[0].password;
        const match = yield bcrypt_1.default.compare(password, hashedpassword);
        if (match) {
            sql = `insert into login_logs (user_id,is_success) values(?,?)`;
            try {
                yield dbConnection_1.default.query(sql, [result[0].id, 1]);
            }
            catch (error) {
                pino_1.logger.fatal(error.message);
            }
            let payload = {
                userid: result[0].id,
                name: result[0].fname,
                email: result[0].email,
                roleid: result[0].role_id,
            };
            let token = jsonwebtoken_1.default.sign(payload, process.env.TOKEN_SECRET);
            let _a = result[0], { password, activation_code, activation_status, token_created_at } = _a, newObj = __rest(_a, ["password", "activation_code", "activation_status", "token_created_at"]);
            newObj.token = token;
            sql = `select role from roles where id=?`;
            let [role] = yield dbConnection_1.default.query(sql, [result[0].role_id]);
            let location;
            if (role[0].role === "Admin") {
                location = "/admin";
            }
            else {
                location = "/user/userDashboard";
            }
            return res
                .cookie("token", token, {
                maxAge: 3 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            })
                .json({ success: true, newObj: newObj, location: location });
        }
        else {
            sql = `insert into login_logs (user_id,is_success) values (?,?)`;
            try {
                yield dbConnection_1.default.query(sql, [result[0].id, 0]);
            }
            catch (error) {
                pino_1.logger.fatal(error.message);
            }
            return res.json({
                success: false,
                message: "email and password not match",
            });
        }
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
});
exports.checkLogin = checkLogin;
// forget Password page render
const forgotPasswordController = (req, res) => {
    try {
        res.render("authentication/forgotPasswordPage");
    }
    catch (err) {
        console.log(err);
    }
};
exports.forgotPasswordController = forgotPasswordController;
// email check
function varifyEmail(email) {
    let filter = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return filter.test(email);
}
// varify email and regenerate activationkey
const forgotPasswordVarifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let emailReq = req.body.email;
        if (emailReq.trim() === "") {
            return res.json({ success: false, message: "Please enter email" });
        }
        if (emailReq.trim() !== "" && !varifyEmail(emailReq)) {
            return res.json({ success: false, message: "Enter Valid email" });
        }
        emailReq = emailReq.trim().toLowerCase();
        const sql = "SELECT email FROM users WHERE email = ? and activation_status = 1";
        const [result] = yield dbConnection_1.default.query(sql, [emailReq]);
        if (result.length === 0) {
            return res.json({ success: false, message: "user doesn't exists" });
        }
        const activationKey = (0, generate_unique_id_1.default)({ length: 32 });
        const updateLinkTimeSql = "UPDATE users SET activation_code = ?, token_created_at = ? where email = ?";
        console.log(new Date(), emailReq, activationKey);
        try {
            yield dbConnection_1.default.query(updateLinkTimeSql, [activationKey, new Date(), emailReq]);
        }
        catch (error) {
            pino_1.logger.info(error);
        }
        res.json({
            success: true,
            message: "successful",
            activationKey: activationKey,
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.forgotPasswordVarifyEmail = forgotPasswordVarifyEmail;
const activationLinkController = (req, res) => {
    try {
        res.render("authentication/activationLinkPage");
    }
    catch (error) {
        pino_1.logger.info(error);
    }
};
exports.activationLinkController = activationLinkController;
const forgotPasswordVarifyLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const alink = req.body.activeLink;
    if (alink) {
        try {
            const sqlLink = "select timestampdiff(second,token_created_at,utc_timestamp) as diff from users where activation_code = ?";
            const [result] = yield dbConnection_1.default.query(sqlLink, [alink]);
            if (result.length === 0) {
                return res.json({ success: false, message: "user doesn't exists" });
            }
            else {
                if (result[0].diff > 900) {
                    res.json({ success: false, message: "activation link expired" });
                }
                else {
                    res.json({
                        success: true,
                        message: "user varified",
                        activationKey: alink,
                    }); // where the finally got the success
                }
            }
        }
        catch (error) {
            res.json({ success: false, message: "something went wrong! :(" });
        }
    }
    else {
        res.json({
            success: false,
            errorMessage: "empty activation link or email",
        });
    }
});
exports.forgotPasswordVarifyLink = forgotPasswordVarifyLink;
const setPasswordController = (req, res) => {
    try {
        res.render("authentication/setPasswordPage");
    }
    catch (error) {
        pino_1.logger.info(error);
    }
};
exports.setPasswordController = setPasswordController;
const forgotPasswordNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const aKey = req.body.aKey;
        let password = req.body.password;
        let rePassword = req.body.repassword;
        if (password && rePassword) {
            password = password.trim();
            rePassword = rePassword.trim();
            if (password.length < 8) {
                return res.json({
                    success: false,
                    message: "password should have atleast 8 character",
                });
            }
            if (password === rePassword) {
                try {
                    const saltRounds = 5;
                    const salted = bcrypt_1.default.genSaltSync(saltRounds);
                    const hashPassword = bcrypt_1.default.hashSync(password, salted);
                    const passSql = "update users set password = ? where activation_code = ?";
                    const result = yield dbConnection_1.default.query(passSql, [hashPassword, aKey]);
                    res.json({ success: true, message: "password updated" });
                }
                catch (error) {
                    res.json({
                        success: false,
                        message: "error while updating password",
                    });
                    pino_1.logger.error(error);
                }
            }
            else {
                res.json({ success: false, message: "password must be same!" });
            }
        }
        else {
            res.json({ success: false, message: "password should not be empty" });
        }
    }
    catch (error) {
        res.json({ success: false, message: "something went wrong!" });
        pino_1.logger.error(error);
    }
});
exports.forgotPasswordNewPassword = forgotPasswordNewPassword;
// log out
const logout = (req, res) => {
    try {
        res.clearCookie("token").redirect(`http://localhost:${process.env.PORT}/`);
    }
    catch (error) {
        res.json({ success: false, message: "unable to logout" });
        pino_1.logger.error(error);
    }
};
exports.logout = logout;
const currentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        sql = `select role from roles where id=?`;
        [role] = yield dbConnection_1.default.query(sql, [req.user.role_id]);
        let location;
        if (role[0].role === "Student") {
            location = "/user/userDashboard";
        }
        else {
            location = "/admin";
        }
        return res.json({ success: true, location: location });
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
});
exports.currentUser = currentUser;
