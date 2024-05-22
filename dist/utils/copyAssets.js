"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const run = () => {
    const srcDir = "./src/public";
    const distDir = "./dist/public";
    function copyFiles(src, dest) {
        shelljs_1.default.ls("-R", `${src}/**/!(*.ts)`).forEach((file) => {
            const relativePath = path_1.default.relative(src, file);
            const destPath = path_1.default.join(dest, relativePath);
            shelljs_1.default.mkdir("-p", path_1.default.dirname(destPath));
            shelljs_1.default.cp("-R", file, destPath);
        });
    }
    copyFiles(srcDir, distDir);
    console.log("copied");
};
run();
exports.default = run;
