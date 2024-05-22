import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";

export interface IReqWithUser extends Request {
  user: {
    id: number;
    role_id: number;
  };
}

export interface IUser extends RowDataPacket {
  id: number;
  role_id: number;
  fname: string;
  lname: string;
  email: string;
  dob: Date;
  phone_no: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  password: string;
  about: string;
  activation_code: string;
  activation_status: boolean;
  token_created_at: Date;
}

export interface IRole extends RowDataPacket {
  id: number;
  role: string;
}
