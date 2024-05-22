let express = require("express");
let router = express.Router();
import { cacheControl } from "../../middlewares/authValidation";
import {
  userFeedbackController,
  getFeedbacks,
} from "../../controller/user/userFeedback/userFeedbackController";
import passport from "passport";
import userHasPermissions from "../../middlewares/permission";

router.use(
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/",
  }),
  userHasPermissions
);

router.route("/").get(cacheControl, userFeedbackController);

router.route("/getAllFeedbacks").get(cacheControl, getFeedbacks);

export default router;
