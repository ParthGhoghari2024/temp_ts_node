"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error404Route = exports.resultsRender = exports.userScoreRender = exports.userDashboard = exports.userProfile = exports.updateUserRender = void 0;
const pino_1 = require("../../../utils/pino");
const userProfile = (req, res) => {
    try {
        res.render("./user/userProfile");
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
exports.userProfile = userProfile;
const updateUserRender = (req, res) => {
    try {
        res.render("./user/userProfileUpdate");
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
exports.updateUserRender = updateUserRender;
const userDashboard = (req, res) => {
    try {
        res.render("./user/userDashboard");
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
exports.userDashboard = userDashboard;
const userScoreRender = (req, res) => {
    try {
        // console.log(req);
        res.render("./user/userComponent/scoreCard.ejs");
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
exports.userScoreRender = userScoreRender;
const error404Route = (req, res) => {
    try {
        res.render("./expirePage.ejs");
    }
    catch (error) {
        pino_1.logger.fatal(error);
    }
};
exports.error404Route = error404Route;
const resultsRender = (req, res) => {
    try {
        res.render("./user/viewResults.ejs");
    }
    catch (error) {
        pino_1.logger.error(error);
    }
};
exports.resultsRender = resultsRender;
