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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheControl = exports.registrationValidation = exports.loginValidation = void 0;
const loginValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password } = req.body;
    const validRegexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    if (email.trim() == "") {
        return res.json({ success: false, message: "Please Enter Email." });
    }
    if (email.trim() !== "" && !email.match(validRegexEmail)) {
        return res.json({ success: false, message: "Email is not Valid." });
    }
    if (password.trim() === "") {
        return res.json({ success: false, message: "Please Enter Password." });
    }
    if (password.trim() !== "" && password.trim().length < 8) {
        return res.json({
            success: false,
            message: "Password should be minimum 8 Character.",
        });
    }
    next();
});
exports.loginValidation = loginValidation;
const registrationValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var namePattern = /^[a-zA-Z\s-]+$/;
    var validRegexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var regxDate = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g;
    let { fname, lname, email, dob, password, confirmpassword, } = req.body;
    if (fname.trim() == "") {
        return res.json({ success: false, message: "Please Enter Name" });
    }
    if (fname.trim() !== "" && !fname.match(namePattern)) {
        return res.json({ success: false, message: "Invalid Name" });
    }
    if (lname.trim() == "") {
        return res.json({ success: false, message: "Please Enter Surname" });
    }
    if (lname.trim() !== "" && !lname.match(namePattern)) {
        return res.json({ success: false, message: "Invalid Surname" });
    }
    if (email.trim() == "") {
        return res.json({ success: false, message: "Please Enter Email" });
    }
    if (email.trim() !== "" && !email.match(validRegexEmail)) {
        return res.json({ success: false, message: "Invalid Email" });
    }
    if (dob.trim() == "") {
        return res.json({ success: false, message: "Please Enter Date" });
    }
    if (dob.trim() !== "" && !dob.match(regxDate)) {
        return res.json({ success: false, message: "Invalid Date" });
    }
    if (password.trim() === "") {
        return res.json({ success: false, message: "Please Enter Password." });
    }
    if (password.trim() !== "" && password.trim().length < 8) {
        return res.json({
            success: false,
            message: "Password should be minimum 8 Character and Number.",
        });
    }
    if (confirmpassword.trim() === "") {
        return res.json({
            success: false,
            message: "Please Enter Confirm Password.",
        });
    }
    if (password.trim() !== confirmpassword.trim()) {
        return res.json({
            success: false,
            message: "Password And Confirm Password Are Not Same..",
        });
    }
    next();
});
exports.registrationValidation = registrationValidation;
const cacheControl = (req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
};
exports.cacheControl = cacheControl;
