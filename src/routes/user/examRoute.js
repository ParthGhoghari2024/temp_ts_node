let express = require("express");
import {
  startExam,
  showExam,
  examList,
  submitAnswer,
  checkMarks,
  verifyCode,
} from "../../controller/user/examdetailsController/examController";
import passport from "passport";
import { hasExamCode } from "../../middlewares/auth";
import userHasPermission from "../../middlewares/permission";
import { notifyUser } from "../../controller/admin/examNotify";

let router = express.Router();

router.use(
  passport.authenticate("jwt", { session: false, failureRedirect: "/" }),
  userHasPermission
);

router.route("/startexam").get(hasExamCode, startExam);

router.route("/showexam").get(hasExamCode, showExam);

router.route("/examList").get(examList);

router.route("/examList").post(verifyCode);

router.route("/submitexam").post(submitAnswer);

router.route("/checkmark").get(checkMarks);

router.route("/expired").get((req, res) => {
  res.render("expirePage");
});

router.route("/examnotifications").get(notifyUser);

export default router;
