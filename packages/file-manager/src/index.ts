import { promises as fs } from "fs";
import { join, dirname } from "path";
import fastGlob from "fast-glob";
import {
  type FileManager,
  type FileDataCollection,
  FileManagerConfig,
  FileEntry,
  ReadResult,
  FileManagerError,
  FileManagerErrorType,
} from "./types";
import { LogManagerImpl, Logger } from "@madooei/simple-logger";

/**
 * Implementation of the FileManager component
 */
class FileManagerImpl implements FileManager {
  private config: FileManagerConfig;
  private logger: Logger;

  constructor() {
    this.config = {
      shouldClean: false,
      ignorePatterns: ["**/node_modules/**", "**/.git/**"],
    };
    this.logger = LogManagerImpl.getInstance().getLogger("file-manager");
  }

  setSourceDir(dir: string): void {
    this.logger.trace("Setting source directory:", dir);
    if (!dir) {
      this.logger.info("Source directory is required");
      throw new FileManagerError(
        FileManagerErrorType.SOURCE_DIR_NOT_SET,
        "Source directory is required",
      );
    }
    this.config.sourceDir = dir;
    this.logger.info("Source directory set to:", dir);
  }

  setDestDir(dir?: string): void {
    this.logger.trace("Setting destination directory:", dir || "none");
    this.config.destDir = dir;
    this.logger.info("Destination directory set to:", dir || "none");
  }

  setShouldClean(clean: boolean): void {
    this.logger.trace("Setting shouldClean:", clean);
    this.config.shouldClean = clean;
    this.logger.info("Clean mode set to:", clean);
  }

  setIgnorePatterns(patterns: string[]): void {
    this.logger.trace("Setting ignore patterns:", patterns);
    this.config.ignorePatterns = [
      "**/node_modules/**",
      "**/.git/**",
      ...patterns,
    ];
    this.logger.info(
      "Ignore patterns updated, total patterns:",
      this.config.ignorePatterns.length,
    );
    this.logger.trace("Full ignore patterns:", this.config.ignorePatterns);
  }

  getSourceDir(): string | undefined {
    return this.config.sourceDir;
  }

  getDestDir(): string | undefined {
    return this.config.destDir;
  }

  getIgnorePatterns(): string[] {
    return this.config.ignorePatterns;
  }

  async readFiles(): Promise<FileDataCollection> {
    this.logger.trace("Starting readFiles operation");
    if (!this.config.sourceDir) {
      this.logger.info("Source directory not set");
      throw new FileManagerError(
        FileManagerErrorType.SOURCE_DIR_NOT_SET,
        "Source directory must be set before reading files",
      );
    }

    try {
      this.logger.trace(
        "Verifying source directory exists:",
        this.config.sourceDir,
      );
      await fs.access(this.config.sourceDir);
    } catch {
      this.logger.info("Source directory not found:", this.config.sourceDir);
      throw new FileManagerError(
        FileManagerErrorType.SOURCE_DIR_NOT_FOUND,
        `Source directory not found: ${this.config.sourceDir}`,
      );
    }

    // Find all files
    this.logger.trace("Finding files in source directory");
    const entries = await this.findFiles();
    this.logger.info("Found files:", entries.length);
    this.logger.trace("File entries:", entries);

    this.logger.trace("Reading file contents");
    const results = await Promise.all(
      entries.map((entry) => this.readFile(entry)),
    );
    this.logger.trace("Finished reading all files");

    // Convert to FileDataCollection format
    this.logger.trace("Converting to FileDataCollection format");
    const files = results.reduce((files, result) => {
      files[result.entry.relativePath] = {
        contents: result.contents,
      };
      return files;
    }, {} as FileDataCollection);

    this.logger.info(
      "Successfully read all files, total count:",
      Object.keys(files).length,
    );
    return files;
  }

  async writeFiles(files: FileDataCollection): Promise<void> {
    this.logger.trace("Starting writeFiles operation");
    if (!this.config.destDir) {
      this.logger.info("Destination directory not set");
      throw new FileManagerError(
        FileManagerErrorType.DEST_DIR_NOT_SET,
        "Destination directory must be set before writing files",
      );
    }

    // Clean destination if needed
    if (this.config.shouldClean) {
      this.logger.info("Cleaning destination directory:", this.config.destDir);
      await this.cleanDirectory(this.config.destDir);
    }

    this.logger.trace("Writing files to destination");
    const fileEntries = Object.entries(files);
    this.logger.info("Writing files, total count:", fileEntries.length);

    // Write all files
    await Promise.all(
      fileEntries.map(async ([relativePath, file]) => {
        const destPath = join(this.config.destDir!, relativePath);
        this.logger.trace("Writing file:", destPath);
        await this.writeFile(destPath, file.contents);
      }),
    );

    this.logger.info("Successfully wrote all files");
  }

  private async findFiles(): Promise<FileEntry[]> {
    this.logger.trace("Finding files with fast-glob patterns");
    const files = await fastGlob("**/*", {
      cwd: this.config.sourceDir,
      onlyFiles: true,
      ignore: this.config.ignorePatterns,
      dot: true,
    });

    this.logger.trace("Converting glob results to FileEntry objects");
    return await Promise.all(
      files.map(async (file) => {
        const absolutePath = join(this.config.sourceDir!, file);
        const stats = await fs.stat(absolutePath);
        return {
          relativePath: file,
          absolutePath,
          stats,
        };
      }),
    );
  }

  private async readFile(entry: FileEntry): Promise<ReadResult> {
    this.logger.trace("Reading file:", entry.absolutePath);
    try {
      const contents = await fs.readFile(entry.absolutePath);
      this.logger.trace("Successfully read file:", entry.relativePath);
      return { entry, contents };
    } catch (error) {
      this.logger.info("Failed to read file:", entry.absolutePath, error);
      throw new FileManagerError(
        FileManagerErrorType.FILE_READ_ERROR,
        `Failed to read file: ${entry.absolutePath}`,
        error as Error,
      );
    }
  }

  private async writeFile(filepath: string, contents: Buffer): Promise<void> {
    this.logger.trace("Writing file:", filepath);
    try {
      await fs.mkdir(dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, contents);
      this.logger.trace("Successfully wrote file:", filepath);
    } catch (error) {
      this.logger.info("Failed to write file:", filepath, error);
      throw new FileManagerError(
        FileManagerErrorType.FILE_WRITE_ERROR,
        `Failed to write file: ${filepath}`,
        error as Error,
      );
    }
  }

  private async cleanDirectory(dir: string): Promise<void> {
    this.logger.trace("Cleaning directory:", dir);
    try {
      // Check if directory exists first
      await fs.access(dir);

      for (const file of await fs.readdir(dir)) {
        await fs.rm(join(dir, file), { recursive: true, force: true });
      }
      this.logger.trace("Successfully cleaned directory:", dir);
    } catch (error) {
      this.logger.info("Failed to clean directory:", dir, error);
      throw new FileManagerError(
        FileManagerErrorType.CLEAN_ERROR,
        `Failed to clean directory: ${dir}`,
        error as Error,
      );
    }
  }
}

// Export types for external usage
export type {
  FileManager,
  FileDataCollection,
  FileManagerConfig,
  FileEntry,
  ReadResult,
  FileManagerErrorType,
};

// Export the FileManager implementation and error class
export { FileManagerImpl, FileManagerError };
