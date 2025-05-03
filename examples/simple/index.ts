import { FileManagerImpl } from "@coursebook/file-manager";

const fileManager = new FileManagerImpl();

// Configure
fileManager.setSourceDir("./source-folder");
fileManager.setDestDir("./distination-folder");
fileManager.setShouldClean(true);
fileManager.setIgnorePatterns(["*.tmp", "*.log"]);

// Read files
const files = await fileManager.readFiles();

// Process files...

// Write files
await fileManager.writeFiles(files);