import { QueryResult, RowDataPacket } from "mysql2";
import e, { Request } from "express";
import { IReqWithUser } from "./authTypes";
export interface IExamDetails extends RowDataPacket {
  id?: number;
  creater_id: number;
  title: string;
  start_time: string;
  duration_minute: number;
  total_marks: number;
  passing_marks: number;
  instructions: string;
  exam_status: boolean;
  exam_activation_code: string;
  isDeleted: boolean;
}

export interface IJwtStrategyOptions {
  jwtFromRequest?: (req: Request) => string | void;
  secretOrKey?: string | undefined;
}
export interface ReqBodyRegistration {
  fname: string;
  lname: string;
  email: string;
  dob: string;
  password: string;
  confirmpassword: string;
}
export interface ReqBodyLogin {
  email: string;
  password: string;
}
export interface ITotalMarks extends RowDataPacket {
  total_marks: number;
}
export interface IReqWithFileValidationError extends IReqWithUser {
  fileValidationError: string;
}

export interface IExamTime extends RowDataPacket {
  start_time: string;
  time: number;
}

export interface IExamTopicWithId extends RowDataPacket {
  topic: string;
  id?: number;
}

export interface IExamTopic extends RowDataPacket {
  id: number;
  topic: string;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IExamTopicArr {
  id: number;
  topic: string[];
}

export interface IExamDifficulty extends RowDataPacket {
  id: number;
  difficulty: string;
  created_at?: string;
  updated_at?: string;
}

export interface IExamDifficultyArr {
  id: number;
  difficulty: string[];
}

export interface ICreateExamBody {
  title: string;
  instructions: string;
  startingTime: string;
  duration: string;
  totalMarks: string;
  passingMarks: string;
}
export interface IQuestionId {
  id: number;
}
export interface IQuestion extends RowDataPacket {
  id: number;
  exam_id: number;
  difficulty_id: number;
  topic_id: number;
  questions: string;
  score: number;
  isDeleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IQuestionReduced {
  id: number[];
  exam_id: number[];
  difficulty_id: number[];
  topic_id: number[];
  questions: string[];
  score: number[];
}
export interface IOption extends RowDataPacket {
  id: number;
  question_id: number;
  option_value: string;
  isAnswer: boolean;
}
export interface IOptionObj {
  [id: number]: IOption[];
}
export interface ICSVQue {
  text: string;
  difficulty: string;
  topic: string;
  score: number;
  options: string[];
  correctId: number;
}
export interface IResultObj {
  [Key: string]: number;
}
export interface IInsertQuestion {
  id?: number;
  index: number;
  text: string;
  topic: string;
  difficulty: string;
  options: string[];
  correctId: number;
  score: number;
  isDeleted?: number;
}

export interface IUpdateQuestion extends IInsertQuestion {
  optionIds: number[];
}

export interface IQueCount extends RowDataPacket {
  totalQuestions: string;
  totalScore: string;
}
export interface IExamTitleTime extends RowDataPacket {
  title: string;
  start_time: string;
  time: number;
}
export interface IValidationFailedObj {
  [Key: string | number]: string[];
}

export interface IExamDetailsNecessary extends RowDataPacket {
  title: string;
  total_marks: number;
  passing_marks: number;
  start_time: string;
  duration_minute: number;
  exam_activation_code: string;
}
export interface IUserDetail extends RowDataPacket {
  id?: number;
  role_id?: number;
  fname: string;
  lname: string;
  phone_no: string;
  email: string;
  dob: Date;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  about: string;
}

export interface IStudentDetail extends RowDataPacket {
  FirstName: string;
  LastName: string;
  ContactNumber: string;
  EmailAddress: string;
  RegistrationDate: string;
}

export interface IResultDetail extends RowDataPacket {
  uid: number;
}
