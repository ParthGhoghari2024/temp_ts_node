import jwt, { Secret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/pino";

const exportQueMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const SECRET_KEY: Secret | undefined = process.env.TOKEN_SECRET;
    if (!req || !req.query.token) {
      return res.redirect("/");
    } else {
      jwt.verify(
        req.query.token as string,
        SECRET_KEY as string,
        function (err: unknown, decoded: string | jwt.JwtPayload | undefined) {
          if (err) {
            return res.redirect("/");
          } else {
            next();
          }
        }
      );
    }
  } catch (error) {
    logger.error(error);
    return res.redirect("/");
  }
};
export { exportQueMiddleware };
