import { RowDataPacket } from "mysql2";
import con from "../config/dbConnection";
import { IReqWithUser } from "../types/authTypes";
import { logger } from "../utils/pino";
import { Request, Response, NextFunction, RequestHandler } from "express";

interface IPermission extends RowDataPacket {
  permission: string;
}
const userHasPermission = async (
  req: IReqWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let urlStr: string = req.baseUrl + req.path;

    let url: string[] = urlStr.split("/");
    url.shift();

    let id: string | undefined = url.pop();

    let api = "";
    url.forEach((element) => {
      api += "/" + element;
    });

    if (isNaN(Number(id))) {
      api += "/" + id;
    }

    let roleid: number = req.user.role_id;

    let sql: string = `SELECT p.permission FROM role_has_permissions as rp  inner join permissions as p on p.id=rp.permission_id where rp.role_id=? and p.permission=?`;

    let result: IPermission[] = [];
    try {
      [result] = await con.query<IPermission[]>(sql, [roleid, api]);
    } catch (error) {
      logger.fatal(error);
    }

    if (result.length !== 0) {
      next();
    } else {
      return res.render("errorPage404");
    }
  } catch (error) {
    logger.fatal(error);
  }
};

export default userHasPermission;
