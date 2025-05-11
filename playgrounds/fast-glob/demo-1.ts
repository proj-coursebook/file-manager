import fastGlob from "fast-glob";

const sourceDir = "./source-folder";
const include = ["**/*"];
const exclude = [".DS_Store", "*.tmp", "*.log"];

const options = {
  cwd: sourceDir,
  onlyFiles: true,
  // onlyDirectories: true, 
  ignore: exclude,
  dot: true,
};

const files = await fastGlob(include, options);

console.log(files);
