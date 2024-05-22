import { NextFunction, Request, Response } from "express";
import { ReqBodyLogin, ReqBodyRegistration } from "../types/interfaces";

const loginValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { email, password }: ReqBodyLogin = req.body;

  const validRegexEmail: RegExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

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
};

const registrationValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  var namePattern: RegExp = /^[a-zA-Z\s-]+$/;
  var validRegexEmail: RegExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  var regxDate: RegExp = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g;

  let {
    fname,
    lname,
    email,
    dob,
    password,
    confirmpassword,
  }: ReqBodyRegistration = req.body;
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
};

const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

export { loginValidation, registrationValidation, cacheControl };
