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
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
var cookieParser = require("cookie-parser");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cookieParser());
let passport = require("passport");
const auth_1 = require("./middlewares/auth");
(0, auth_1.passportAuth)(passport);
const dotenv = require("dotenv").config(); //to config the env for all the routes
const port = process.env.PORT;
app.set("view engine", "ejs");
app.use(express_1.default.static("public"));
const examNotify_1 = require("./controller/admin/examNotify");
const path_1 = __importDefault(require("path"));
//bootstrap css and js (npm installed)
app.use("/css", express_1.default.static(path_1.default.resolve(__dirname, "../node_modules/bootstrap/dist/css")));
console.log(path_1.default.resolve(__dirname, "../node_modules/bootstrap/dist/css"));
app.use("/js", express_1.default.static(path_1.default.resolve(__dirname, "../node_modules/bootstrap/dist/js")));
// //  <link rel="stylesheet" href="/css/bootstrap.min.css" />
//use above link to bootsrap css
app.use("/sweetalert2", express_1.default.static(path_1.default.resolve(__dirname, "../node_modules/sweetalert2/dist")));
// export result route
const exportResult_1 = __importDefault(require("./routes/user/exportResult"));
app.use("/user", exportResult_1.default); // don't change this route location
//admin routes
//IMPORTANT : use both exports route on top of every route
const exportRoute_1 = __importDefault(require("./routes/admin/exportRoute"));
app.use("/admin/exams", exportRoute_1.default);
const dashboardRoute_1 = __importDefault(require("./routes/admin/dashboardRoute"));
app.use("/admin", dashboardRoute_1.default);
const StudentsRoute_1 = __importDefault(require("./routes/admin/StudentsRoute"));
app.use("/admin/students", StudentsRoute_1.default);
const ExamsRoute_1 = __importDefault(require("./routes/admin/ExamsRoute"));
app.use("/admin/exams", ExamsRoute_1.default);
//users routes
const userProfile_1 = __importDefault(require("./routes/user/userProfile"));
app.use("/user", userProfile_1.default);
//student exams route
const examRoute_1 = __importDefault(require("./routes/user/examRoute"));
app.use("/exam", examRoute_1.default);
// user answer key
const userAnswerKey_1 = __importDefault(require("./routes/user/userAnswerKey"));
app.use("/user/useranswerkey", userAnswerKey_1.default);
// authenticator
const authenticationRoute_1 = __importDefault(require("./routes/authentication/authenticationRoute"));
app.use("/", authenticationRoute_1.default);
//User Feedback
const userFeedbackRoute_1 = __importDefault(require("./routes/user/userFeedbackRoute"));
app.use("/user/userFeedback", userFeedbackRoute_1.default);
//----PAGE NOT FOUND 404 ERROR----
app.use((req, res, next) => {
    res.status(404).render("errorPage404");
});
const server = app.listen(port, () => {
    console.log(`App listening on port ${port}.`);
});
//SOCKET.IO
const io = require("socket.io")(server);
io.on("connection", (socket, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("connected to socket.io");
    socket.on("send feedback", (databody) => {
        io.emit("send feedback", databody);
        io.emit("receive feedback");
    });
    socket.on("send notifications", (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data) {
            const result = yield (0, examNotify_1.notifyUser)(req, res);
            io.emit("notifications", result);
        }
    }));
}));
