import type { Stats } from "fs";

/**
 * Represents a file entry in the file system
 */
export interface FileEntry {
  /**
   * Absolute path to the file
   */
  absolutePath: string;

  /**
   * Path relative to the source directory
   */
  relativePath: string;

  /**
   * File system stats
   */
  stats: Stats;
}

/**
 * File contents and metadata
 */
export interface FileData {
  contents: Buffer;
  metadata?: Record<string, any>;
}

/**
 * Collection of files, keyed by relative path
 */
export type FileDataCollection = Record<string, FileData>;

/**
 * Configuration for file operations
 */
export interface FileManagerConfig {
  /**
   * Source directory for reading files
   */
  sourceDir?: string;

  /**
   * Destination directory for writing files
   */
  destDir?: string;

  /**
   * Whether to clean destination before writing
   */
  shouldClean: boolean;

  /**
   * Glob patterns to ignore
   */
  ignorePatterns: string[];
}

/**
 * Component responsible for file system operations
 */
export interface FileManager {
  /**
   * Sets the source directory for file operations
   */
  setSourceDir(dir: string): void;

  /**
   * Gets the source directory for file operations
   */
  getSourceDir(): string | undefined;

  /**
   * Sets the destination directory for file operations
   */
  setDestDir(dir?: string): void;

  /**
   * Gets the destination directory for file operations
   */
  getDestDir(): string | undefined;

  /**
   * Sets whether to clean the destination directory before builds
   */
  setShouldClean(clean: boolean): void;

  /**
   * Sets patterns to ignore when reading files
   */
  setIgnorePatterns(patterns: string[]): void;

  /**
   * Gets patterns to ignore when reading files
   */
  getIgnorePatterns(): string[];

  /**
   * Reads all files from the source directory
   */
  readFiles(): Promise<FileDataCollection>;

  /**
   * Writes files to the destination directory
   */
  writeFiles(files: FileDataCollection): Promise<void>;
}

/**
 * Result of a file read operation
 */
export interface ReadResult {
  /**
   * File contents as a buffer
   */
  contents: Buffer;

  /**
   * File entry information
   */
  entry: FileEntry;
}

/**
 * Error types specific to file operations
 */
export enum FileManagerErrorType {
  SOURCE_DIR_NOT_SET = "SOURCE_DIR_NOT_SET",
  SOURCE_DIR_NOT_FOUND = "SOURCE_DIR_NOT_FOUND",
  DEST_DIR_NOT_SET = "DEST_DIR_NOT_SET",
  FILE_READ_ERROR = "FILE_READ_ERROR",
  FILE_WRITE_ERROR = "FILE_WRITE_ERROR",
  CLEAN_ERROR = "CLEAN_ERROR",
}

/**
 * Error class for file operations
 */
export class FileManagerError extends Error {
  constructor(
    public type: FileManagerErrorType,
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "FileManagerError";
  }
}
