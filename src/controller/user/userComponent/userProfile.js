import { logger } from "../../../utils/pino";

const userProfile = (req, res) => {
  try {
    res.render("./user/userProfile");
  } catch (error) {
    logger.error(error);
  }
};

const updateUserRender = (req, res) => {
  try {
    res.render("./user/userProfileUpdate");
  } catch (error) {
    logger.error(error);
  }
};

const userDashboard = (req, res) => {
  try {
    res.render("./user/userDashboard");
  } catch (error) {
    logger.error(error);
  }
};

const userScoreRender = (req, res) => {
  try {
    // console.log(req);
    res.render("./user/userComponent/scoreCard.ejs");
  } catch (error) {
    logger.error(error);
  }
};

const error404Route = (req, res) => {
  try {
    res.render("./expirePage.ejs");
  } catch (error) {
    logger.fatal(error);
  }
};

const resultsRender = (req, res) => {
  try {
    res.render("./user/viewResults.ejs");
  } catch (error) {
    logger.error(error);
  }
};
export {
  updateUserRender,
  userProfile,
  userDashboard,
  userScoreRender,
  resultsRender,
  error404Route,
};
