import express from "express";

const router = express.Router();
import { exportQueMiddleware } from "../../middlewares/exportQueMiddleware";
import { userScoreRenderEJS } from "../../controller/user/userDatas/fetchUser";

router.route("/userScoreEJS").get(exportQueMiddleware, userScoreRenderEJS);
export default router;
