import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { FileManagerImpl } from "@/index";
import { FileManagerError, FileManagerErrorType } from "@/types";

describe("FileManager", () => {
  let fileManager: FileManagerImpl;
  let testDir: string;
  let sourceDir: string;
  let destDir: string;

  beforeEach(async () => {
    fileManager = new FileManagerImpl();
    testDir = join(process.cwd(), "__test__");
    sourceDir = join(testDir, "source");
    destDir = join(testDir, "dest");

    // Create test directories
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.mkdir(destDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("Configuration", () => {
    it("should throw when source directory is not set", () => {
      expect(() => fileManager.setSourceDir("")).toThrow(
        new FileManagerError(
          FileManagerErrorType.SOURCE_DIR_NOT_SET,
          "Source directory is required",
        ),
      );
    });

    it("should set source directory", () => {
      fileManager.setSourceDir(sourceDir);
      expect(fileManager["config"].sourceDir).toBe(sourceDir);
    });

    it("should set destination directory", () => {
      fileManager.setDestDir(destDir);
      expect(fileManager["config"].destDir).toBe(destDir);
    });

    it("should set clean flag", () => {
      fileManager.setShouldClean(true);
      expect(fileManager["config"].shouldClean).toBe(true);
    });

    it("should set ignore patterns", () => {
      const patterns = ["*.txt", "*.md"];
      fileManager.setIgnorePatterns(patterns);
      expect(fileManager["config"].ignorePatterns).toContain("*.txt");
      expect(fileManager["config"].ignorePatterns).toContain("*.md");
      expect(fileManager["config"].ignorePatterns).toContain(
        "**/node_modules/**",
      );
    });

    it("should get source directory", () => {
      fileManager.setSourceDir(sourceDir);
      expect(fileManager.getSourceDir()).toBe(sourceDir);
    });

    it("should get destination directory", () => {
      fileManager.setDestDir(destDir);
      expect(fileManager.getDestDir()).toBe(destDir);
    });

    it("should get ignore patterns", () => {
      const patterns = ["*.txt", "*.md"];
      fileManager.setIgnorePatterns(patterns);
      expect(fileManager.getIgnorePatterns()).toContain("*.txt");
      expect(fileManager.getIgnorePatterns()).toContain("*.md");
      expect(fileManager.getIgnorePatterns()).toContain("**/node_modules/**");
    });

    it("should return undefined when source directory not set", () => {
      expect(fileManager.getSourceDir()).toBeUndefined();
    });

    it("should return undefined when destination directory not set", () => {
      expect(fileManager.getDestDir()).toBeUndefined();
    });

    it("should have default ignore patterns", () => {
      const defaultPatterns = ["**/node_modules/**", "**/.git/**"];
      expect(fileManager.getIgnorePatterns()).toEqual(defaultPatterns);
    });
  });

  describe("Reading Files", () => {
    it("should throw when reading without source directory", async () => {
      await expect(fileManager.readFiles()).rejects.toThrow(
        new FileManagerError(
          FileManagerErrorType.SOURCE_DIR_NOT_SET,
          "Source directory must be set before reading files",
        ),
      );
    });

    it("should throw when source directory does not exist", async () => {
      fileManager.setSourceDir("/nonexistent");
      await expect(fileManager.readFiles()).rejects.toThrow(
        new FileManagerError(
          FileManagerErrorType.SOURCE_DIR_NOT_FOUND,
          "Source directory not found: /nonexistent",
        ),
      );
    });

    it("should read files from source directory", async () => {
      // Create test files
      const file1Path = join(sourceDir, "file1.txt");
      const file2Path = join(sourceDir, "nested", "file2.txt");
      await fs.writeFile(file1Path, "content1");
      await fs.mkdir(dirname(file2Path), { recursive: true });
      await fs.writeFile(file2Path, "content2");

      fileManager.setSourceDir(sourceDir);
      const files = await fileManager.readFiles();

      expect(files["file1.txt"].contents.toString()).toBe("content1");
      expect(files["nested/file2.txt"].contents.toString()).toBe("content2");
    });

    it("should ignore specified patterns", async () => {
      // Create test files
      await fs.writeFile(join(sourceDir, "file1.txt"), "content1");
      await fs.writeFile(join(sourceDir, "file2.md"), "content2");

      fileManager.setSourceDir(sourceDir);
      fileManager.setIgnorePatterns(["*.md"]);
      const files = await fileManager.readFiles();

      expect(files["file1.txt"]).toBeDefined();
      expect(files["file2.md"]).toBeUndefined();
    });
  });

  describe("Writing Files", () => {
    it("should throw when writing without destination directory", async () => {
      await expect(fileManager.writeFiles({})).rejects.toThrow(
        new FileManagerError(
          FileManagerErrorType.DEST_DIR_NOT_SET,
          "Destination directory must be set before writing files",
        ),
      );
    });

    it("should write files to destination directory", async () => {
      const files = {
        "file1.txt": { contents: Buffer.from("content1") },
        "nested/file2.txt": { contents: Buffer.from("content2") },
      };

      fileManager.setDestDir(destDir);
      await fileManager.writeFiles(files);

      const content1 = await fs.readFile(join(destDir, "file1.txt"), "utf8");
      const content2 = await fs.readFile(
        join(destDir, "nested/file2.txt"),
        "utf8",
      );

      expect(content1).toBe("content1");
      expect(content2).toBe("content2");
    });

    it("should clean destination directory when enabled", async () => {
      // Create existing file
      const existingFile = join(destDir, "existing.txt");
      await fs.writeFile(existingFile, "old content");

      const files = {
        "new.txt": { contents: Buffer.from("new content") },
      };

      fileManager.setDestDir(destDir);
      fileManager.setShouldClean(true);
      await fileManager.writeFiles(files);

      // Existing file should be gone
      await expect(fs.access(existingFile)).rejects.toThrow();
      // New file should exist
      const content = await fs.readFile(join(destDir, "new.txt"), "utf8");
      expect(content).toBe("new content");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      fileManager.setSourceDir(sourceDir);
      fileManager.setDestDir(destDir);
    });

    it("should handle file read errors", async () => {
      // Create a file but mock fs.readFile to throw
      const filePath = join(sourceDir, "error.txt");
      await fs.writeFile(filePath, "content");

      const readError = new Error("Mock read error");
      vi.spyOn(fs, "readFile").mockRejectedValueOnce(readError);

      await expect(fileManager.readFiles()).rejects.toThrow(
        new FileManagerError(
          FileManagerErrorType.FILE_READ_ERROR,
          `Failed to read file: ${filePath}`,
          readError,
        ),
      );
    });

    it("should handle file write errors", async () => {
      // Mock fs.writeFile to throw
      const writeError = new Error("Mock write error");
      vi.spyOn(fs, "writeFile").mockRejectedValueOnce(writeError);

      const files = {
        "error.txt": { contents: Buffer.from("content") },
      };

      await expect(fileManager.writeFiles(files)).rejects.toThrow(
        new FileManagerError(
          FileManagerErrorType.FILE_WRITE_ERROR,
          `Failed to write file: ${join(destDir, "error.txt")}`,
          writeError,
        ),
      );
    });

    it("should handle directory creation errors", async () => {
      // Mock fs.mkdir to throw
      const mkdirError = new Error("Mock mkdir error");
      vi.spyOn(fs, "mkdir").mockRejectedValueOnce(mkdirError);

      const files = {
        "nested/error.txt": { contents: Buffer.from("content") },
      };

      await expect(fileManager.writeFiles(files)).rejects.toThrow(
        new FileManagerError(
          FileManagerErrorType.FILE_WRITE_ERROR,
          `Failed to write file: ${join(destDir, "nested/error.txt")}`,
          mkdirError,
        ),
      );
    });

    it("should handle directory clean errors", async () => {
      // Mock fs.rm to throw
      const rmError = new Error("Mock rm error");
      vi.spyOn(fs, "rm").mockRejectedValueOnce(rmError);

      fileManager.setShouldClean(true);
      const files = {
        "test.txt": { contents: Buffer.from("content") },
      };

      await expect(fileManager.writeFiles(files)).rejects.toThrow(
        new FileManagerError(
          FileManagerErrorType.CLEAN_ERROR,
          `Failed to clean directory: ${destDir}`,
          rmError,
        ),
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });
  });
});
