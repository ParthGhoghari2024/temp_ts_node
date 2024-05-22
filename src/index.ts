import express from "express";
const app = express();
var cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let passport = require("passport");
import { passportAuth } from "./middlewares/auth";
passportAuth(passport);

const dotenv = require("dotenv").config(); //to config the env for all the routes
const port = process.env.PORT;
app.set("view engine", "ejs");
app.use(express.static("public"));
import { notifyUser } from "./controller/admin/examNotify";
import { Socket } from "socket.io";
import path from "path";
//bootstrap css and js (npm installed)
app.use(
  "/css",
  express.static(path.resolve(__dirname, "../node_modules/bootstrap/dist/css"))
);
console.log(path.resolve(__dirname, "../node_modules/bootstrap/dist/css"));

app.use(
  "/js",
  express.static(path.resolve(__dirname, "../node_modules/bootstrap/dist/js"))
);
// //  <link rel="stylesheet" href="/css/bootstrap.min.css" />
//use above link to bootsrap css

app.use(
  "/sweetalert2",
  express.static(path.resolve(__dirname, "../node_modules/sweetalert2/dist"))
);

// export result route
import exportResult from "./routes/user/exportResult";
app.use("/user", exportResult); // don't change this route location

//admin routes

//IMPORTANT : use both exports route on top of every route
import exportExamRoute from "./routes/admin/exportRoute";
app.use("/admin/exams", exportExamRoute);

import dashboardRouter from "./routes/admin/dashboardRoute";
app.use("/admin", dashboardRouter);

import studentsRouter from "./routes/admin/StudentsRoute";
app.use("/admin/students", studentsRouter);

import examsRouter from "./routes/admin/ExamsRoute";
app.use("/admin/exams", examsRouter);

//users routes
import usersProfile from "./routes/user/userProfile";
app.use("/user", usersProfile);

//student exams route
import examRoute from "./routes/user/examRoute";
app.use("/exam", examRoute);

// user answer key
import UserAnswerKeyReview from "./routes/user/userAnswerKey";
app.use("/user/useranswerkey", UserAnswerKeyReview);

// authenticator
import authenticationRouter from "./routes/authentication/authenticationRoute";
app.use("/", authenticationRouter);

//User Feedback
import userFeedbackRoute from "./routes/user/userFeedbackRoute";
app.use("/user/userFeedback", userFeedbackRoute);

//----PAGE NOT FOUND 404 ERROR----
app.use((req, res, next) => {
  res.status(404).render("errorPage404");
});

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}.`);
});

//SOCKET.IO
const io = require("socket.io")(server);

io.on("connection", async (socket: Socket, req: Request, res: Response) => {
  console.log("connected to socket.io");

  socket.on("send feedback", (databody: string) => {
    io.emit("send feedback", databody);

    io.emit("receive feedback");
  });

  socket.on("send notifications", async (data: string) => {
    if (data) {
      const result = await notifyUser(req, res);
      io.emit("notifications", result);
    }
  });
});
