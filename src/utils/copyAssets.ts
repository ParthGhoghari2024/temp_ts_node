import path from "path";
import shell from "shelljs";

const run = () => {
  const srcDir: string = "./src/public";
  const distDir: string = "./dist/public";
  function copyFiles(src: string, dest: string) {
    shell.ls("-R", `${src}/**/!(*.ts)`).forEach((file: string): void => {
      const relativePath: string = path.relative(src, file);
      const destPath: string = path.join(dest, relativePath);
      shell.mkdir("-p", path.dirname(destPath));

      shell.cp("-R", file, destPath);
    });
  }

  copyFiles(srcDir, distDir);
  console.log("copied");
};
run();
export default run;
