import mysql, { ConnectionOptions } from "mysql2";
import { logger } from "../utils/pino";

const conOptions: ConnectionOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dateStrings: true,
  timezone: "+00:00",
};
const con = mysql.createConnection(conOptions).promise();

con
  .connect()
  .then(() => logger.info("db Connected"))
  .catch((error: unknown) => logger.info((<Error>error).message));

export default con;
