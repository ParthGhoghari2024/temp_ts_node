import db from "../../../config/dbConnection";
import { logger } from "../../../utils/pino";

const userFeedbackController = (req, res) => {
  try {
    res.render("./user/userFeedbacks.ejs");
  } catch (error) {
    logger.info(error.message);
  }
};

const getFeedbacks = async (req, res) => {
  try {
    let userId = req.user.id;
    let getAllFeedbacks = `select instructor_feedbacks.id as id,users.fname,users.lname,exam_details.title,exam_details.start_time as date,instructor_feedbacks.feedback from users inner join instructor_feedbacks on users.id = instructor_feedbacks.instructor_id inner join  exam_details on exam_details.id = instructor_feedbacks.exam_id where instructor_feedbacks.student_id = ? order by id desc`;
    let resultdetails = await db.query(getAllFeedbacks, [userId]);
    res.json(resultdetails);
  } catch (err) {
    console.log(err);
  }
};

export { userFeedbackController, getFeedbacks };
