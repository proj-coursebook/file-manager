import {
  FileManagerImpl,
  type FileDataCollection,
} from "@coursebook/file-manager";

const fileManager = new FileManagerImpl();

// Configure
fileManager.setSourceDir("./source-folder");
fileManager.setDestDir("./destination-folder");
fileManager.setShouldClean(true);
fileManager.setIgnorePatterns(["*.tmp", "*.log"]);

// Read files
const files: FileDataCollection = await fileManager.readFiles();

// Process files...

// Write files
await fileManager.writeFiles(files);
