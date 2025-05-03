# FileManager Module

The FileManager Module is an essential component of ContentSmith, another package I wrote. The FileManager is responsible for all file system operations in ContentSmith. It handles reading files from a source directory and writing processed files to a destination directory.

## Features

- Read files from source directory with glob pattern support
- Write files to destination directory with automatic directory creation
- Clean destination directory before builds (optional)
- Ignore specific files using glob patterns
- Error handling with specific error types

## API

### Source Directory Operations

```typescript
// Set the source directory for file operations
setSourceDir(dir: string): void

// Get the current source directory
getSourceDir(): string | undefined
```

### Destination Directory Operations

```typescript
// Set the destination directory for file operations
setDestDir(dir?: string): void

// Get the current destination directory
getDestDir(): string | undefined
```

### Ignore Pattern Operations

```typescript
// Set patterns to ignore when reading files
setIgnorePatterns(patterns: string[]): void

// Get current ignore patterns
getIgnorePatterns(): string[]
```

### File Operations

```typescript
// Read all files from the source directory
readFiles(): Promise<ContentSmithFiles>

// Write files to the destination directory
writeFiles(files: ContentSmithFiles): Promise<void>
```

### Configuration

```typescript
// Set whether to clean the destination directory before builds
setShouldClean(clean: boolean): void
```

## Usage

```typescript
import { FileManagerImpl } from '@coursebook/file-manager';

const fileManager = new FileManagerImpl();

// Configure
fileManager.setSourceDir('./src');
fileManager.setDestDir('./dist');
fileManager.setShouldClean(true);
fileManager.setIgnorePatterns(['*.tmp', '*.log']);

// Read files
const files = await fileManager.readFiles();

// Process files...

// Write files
await fileManager.writeFiles(files);
```

## Error Handling

The component uses the `FileManagerError` class with specific error types:

- `SOURCE_DIR_NOT_SET`: Source directory is required but not set
- `SOURCE_DIR_NOT_FOUND`: Source directory does not exist
- `DEST_DIR_NOT_SET`: Destination directory is required but not set
- `FILE_READ_ERROR`: Error reading a file
- `FILE_WRITE_ERROR`: Error writing a file
- `DIR_CREATE_ERROR`: Error creating a directory
- `DIR_CLEAN_ERROR`: Error cleaning destination directory

## Internal Types

- `FileEntry`: Represents a file in the file system with absolute and relative paths
- `FileManagerConfig`: Configuration for the file manager
- `ReadResult`: Result of a file read operation

## Dependencies

- `fs/promises`: Node.js file system promises API
- `path`: Node.js path module
- `glob`: Pattern matching for file paths

## Installation

### Installing from NPM (After Publishing)

Once published to NPM, the package can be installed using:

```bash
npm install @coursebook/file-manager
```

This template is particularly useful for creating packages that are intended to be used locally so read the instructions below for local development.

### Local Development (Without Publishing to NPM)

There are three ways to use this package locally:

#### Option 1: Using npm link

1. Clone this repository, install dependencies, build the package, and create a global symlink:

   ```bash
   git clone <repository-url>
   cd file-manager/packages/file-manager
   # Install dependencies and build the package
   npm install
   npm run build
   # Create a global symlink
   npm link
   ```

   Note: You can unlink the package later using `npm unlink`.

2. In your other project where you want to use this package:

   ```bash
   npm link @coursebook/file-manager
   ```

3. Import the package in your project:

   ```typescript
   import { example, Person } from '@coursebook/file-manager';
   ```

#### Option 2: Using local path

In your other project's `package.json`, add this package as a dependency using the local path:

```json
{
  "dependencies": {
    "@coursebook/file-manager": "file:/path/to/file-manager"
  }
}
```

You can use absolute or relative paths with the `file:` protocol.

Then run `npm install` in your project.

Now you can import the package in your project as usual.

#### Option 3: Using a local tarball (npm pack)

1. Follow option 1 but instead of using `npm link`, create a tarball of the package:

   ```bash
   npm pack
   ```

   This will generate a file like `coursebook-file-manager-1.0.0.tgz`. (Or whatever version you have.)
   You can find the tarball in the same directory as your `package.json`.

2. In your other project, install the tarball:

   ```bash
   npm install /absolute/path/to/file-manager/coursebook-file-manager-1.0.0.tgz
   ```

   Or, if you copy the tarball into your project directory:

   ```bash
   npm install ./coursebook-file-manager-1.0.0.tgz
   ```

This method installs the package exactly as it would be published to npm, making it ideal for final testing. After this installation, you must have the package in your `node_modules` directory, and you can import it as usual. You will also see the package in your `package.json` file as a dependency:

```json
{
  "dependencies": {
    "@coursebook/file-manager": "file:coursebook-file-manager-1.0.0.tgz"
  }
}
```
