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
const dbConnection_1 = __importDefault(require("../config/dbConnection"));
const pino_1 = require("../utils/pino");
const userHasPermission = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let urlStr = req.baseUrl + req.path;
        let url = urlStr.split("/");
        url.shift();
        let id = url.pop();
        let api = "";
        url.forEach((element) => {
            api += "/" + element;
        });
        if (isNaN(Number(id))) {
            api += "/" + id;
        }
        let roleid = req.user.role_id;
        let sql = `SELECT p.permission FROM role_has_permissions as rp  inner join permissions as p on p.id=rp.permission_id where rp.role_id=? and p.permission=?`;
        let result = [];
        try {
            [result] = yield dbConnection_1.default.query(sql, [roleid, api]);
        }
        catch (error) {
            pino_1.logger.fatal(error);
        }
        if (result.length !== 0) {
            next();
        }
        else {
            return res.render("errorPage404");
        }
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
});
exports.default = userHasPermission;
