"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportQueMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pino_1 = require("../utils/pino");
const exportQueMiddleware = (req, res, next) => {
    try {
        const SECRET_KEY = process.env.TOKEN_SECRET;
        if (!req || !req.query.token) {
            return res.redirect("/");
        }
        else {
            jsonwebtoken_1.default.verify(req.query.token, SECRET_KEY, function (err, decoded) {
                if (err) {
                    return res.redirect("/");
                }
                else {
                    next();
                }
            });
        }
    }
    catch (error) {
        pino_1.logger.error(error);
        return res.redirect("/");
    }
};
exports.exportQueMiddleware = exportQueMiddleware;
