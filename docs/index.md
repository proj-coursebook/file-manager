# File Manager

A TypeScript package for file operations with glob pattern support. It abstracts reading files from a source directory and writing processed files to a destination directory.

**Features:**

- Written in TypeScript
- Builds to both modern ES modules and CommonJS formats
- Provides TypeScript type definitions
- ESLint for code linting
- Prettier for code formatting
- Vitest for testing
- Tsup for building
- Minimal dependencies

## Installation

```bash
npm install @coursebook/file-manager
```

## Usage

A minimal package that abstracts reading files from a source directory and writing processed files to a destination directory.

### Basic Example

```typescript
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
```

### API Reference

#### Source Directory Operations

```typescript
// Set the source directory for file operations
setSourceDir(dir: string): void

// Get the current source directory
getSourceDir(): string | undefined
```

#### Destination Directory Operations

```typescript
// Set the destination directory for file operations
setDestDir(dir?: string): void

// Get the current destination directory
getDestDir(): string | undefined
```

#### Ignore Pattern Operations

```typescript
// Set patterns to ignore when reading files
setIgnorePatterns(patterns: string[]): void

// Get current ignore patterns
getIgnorePatterns(): string[]
```

#### File Operations

```typescript
// Read all files from the source directory
readFiles(): Promise<ContentSmithFiles>

// Write files to the destination directory
writeFiles(files: ContentSmithFiles): Promise<void>
```

#### Configuration

```typescript
// Set whether to clean the destination directory before builds
setShouldClean(clean: boolean): void
```

### Error Handling

The component uses the `FileManagerError` class with specific error types:

- `SOURCE_DIR_NOT_SET`: Source directory is required but not set
- `SOURCE_DIR_NOT_FOUND`: Source directory does not exist
- `DEST_DIR_NOT_SET`: Destination directory is required but not set
- `FILE_READ_ERROR`: Error reading a file
- `FILE_WRITE_ERROR`: Error writing a file
- `DIR_CREATE_ERROR`: Error creating a directory
- `DIR_CLEAN_ERROR`: Error cleaning destination directory

## Cloning the Repository

To make your workflow more organized, it's a good idea to clone this repository into a directory named `file-manager-workspace`. This helps differentiate the workspace from the `file-manager` located in the `packages` directory.

```bash
git clone https://github.com/proj-coursebook/file-manager file-manager-workspace

cd file-manager-workspace
```

## Repository Structure

- `packages` — Contains the primary package(s) for this repository (e.g., `file-manager`). Each package is self-contained and can be copied out and used independently.
- `examples` — Contains examples of how to use the packages. Each example is a minimal, standalone project.
- `playgrounds` — Contains demos of the dependencies of the primary package(s). Each playground is a minimal, standalone project.
- `docs` — Contains various documentation for users and developers.
- `.github` — Contains GitHub-specific files, such as workflows and issue templates.

## How to Use This Repo

- To work on a package, go to `packages/<package-name>` and follow its README.
- To try an example, go to `examples/<example-name>` and follow its README.
- To run the playground, go to `playground/<package-name>` and follow its README.
- For documentation, see the `docs` folder.

### Using a VSCode Multi-root Workspace

With Visual Studio Code, you can enhance your development experience by using a multi-root workspace to access packages, examples, and playgrounds simultaneously. This approach is more efficient than opening the root directory, or each package or example separately.

To set up a multi-root workspace:

1. Open Visual Studio Code.
2. Navigate to `File > Open Workspace from File...`.
3. Select the `file-manager.code-workspace` file located at the root of the repository. This action will open all specified folders in one workspace.

The `file-manager.code-workspace` file can be customized to include different folders or settings. Here's a typical configuration:

```json
{
  "folders": [
    {
      "path": "packages/file-manager"
    },
    {
      "path": "examples/simple"
    },
    {
      "path": "playgrounds/fast-glob"
    }
  ],
  "settings": {
    // Add any workspace-specific settings here, for example:
    "git.openRepositoryInParentFolders": "always"
  }
}
```

## Developing the Package

Change to the package directory and install dependencies:

```bash
cd packages/file-manager
npm install
```

- Read the [Project Roadmap](../../docs/ROADMAP.md) for project goals, status, evolution, and development guidelines.
- Read the [Development Guide](DEVELOPMENT.md) for detailed information on the package architecture, build configuration, and implementation patterns.
- Follow the [Contributing Guide](../../docs/CONTRIBUTING.md) for contribution guidelines, coding standards, and best practices.

## Package Management

When you are ready to publish your package:

```bash
npm run release
```

This single command will:

- Validate your code with the full validation pipeline
- Analyze commits to determine version bump
- Update package.json version and changelog
- Build the package
- Create and push git tag
- Create GitHub release
- Publish to NPM

> [!TIP]
> For detailed information about package publishing, versioning, and local development workflows, see the [NPM Package Management Guide](../../docs/guides/npm-package.md).
