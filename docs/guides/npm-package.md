# NPM Package Management Guide

This guide explains how NPM packages work, how to publish them, and different ways to use packages locally during development. Understanding these concepts is essential for both creating your own packages and integrating them into other projects.

## Understanding NPM Packages

### What is an NPM Package?

An NPM package is a reusable piece of code that can be easily shared and installed across different projects. Packages can contain:

- **Libraries**: Reusable functions and utilities
- **Tools**: Command-line utilities and build tools
- **Frameworks**: Complete application frameworks

### Package Structure

Every NPM package needs a `package.json` file that defines:

```json
{
  "name": "@your-scope/package-name", // Unique package identifier
  "version": "1.0.0", // Semantic version
  "main": "./dist/index.cjs", // CommonJS entry point
  "module": "./dist/index.js", // ES modules entry point
  "types": "./dist/index.d.ts", // TypeScript type definitions
  "exports": {
    // Modern module resolution
    "import": "./dist/index.js",
    "require": "./dist/index.cjs"
  },
  "files": ["dist"] // Files to include when publishing
}
```

### Package Naming and Scopes

**Scoped Packages**: Use `@scope/package-name` format

- **Benefits**: Avoid naming conflicts, organize related packages
- **Example**: `@madooei/example-package`

**Unscoped Packages**: Use `package-name` format

- **Benefits**: Shorter names, no scope management needed
- **Example**: `lodash`, `express`

## Publishing to NPM

### Automated Publishing with GitHub Actions

Modern packages often use automated publishing workflows:

**When does it publish?**

- When you create a GitHub Release
- When you push a version tag
- When manually triggered

**What happens during publishing?**

1. Install dependencies
2. Run type checking, linting, formatting
3. Run all tests
4. Build the package
5. Publish to NPM (if all checks pass)

**Setup Requirements:**

- Add `NPM_TOKEN` as a GitHub repository secret
- Configure GitHub Actions workflow
- Use conventional commit messages for automated versioning

### Manual Publishing Process

If you prefer manual control over publishing:

1. **Build the package:**

   ```bash
   npm run build
   ```

2. **Login to NPM:**

   ```bash
   npm login
   ```

3. **Publish:**

   ```bash
   # For scoped packages (first time)
   npm publish --access public

   # For subsequent publishes
   npm publish
   ```

### Versioning and Releases

**Semantic Versioning (SemVer):**

- `MAJOR.MINOR.PATCH` (e.g., `1.4.2`)
- **PATCH**: Bug fixes (1.4.2 → 1.4.3)
- **MINOR**: New features, backward compatible (1.4.2 → 1.5.0)
- **MAJOR**: Breaking changes (1.4.2 → 2.0.0)

**Automated Versioning with release-it:**

```bash
# Analyzes commits, bumps version, updates changelog, and publishes
npm run release
```

This approach uses [Conventional Commits](https://www.conventionalcommits.org/) to automatically determine version bumps and generates changelogs. Release-it is a modern, actively maintained alternative to standard-version with the same familiar workflow.

## Local Development (Without Publishing)

During development, you often need to test packages locally before publishing. Here are three effective approaches:

### Option 1: Using npm link (Recommended for Active Development)

**Best for:** Packages you're actively developing and want live updates

```bash
# In your package directory
cd packages/example-package
npm install
npm run build
npm link  # Creates global symlink

# In your consuming project
npm link @madooei/example-package
```

**Benefits:**

- ✅ Live updates when you rebuild the package
- ✅ Easy to set up and tear down
- ✅ Works like a real NPM package

**Cleanup:**

```bash
# In consuming project
npm unlink @madooei/example-package

# In package directory
npm unlink
```

### Option 2: Using File Protocol (Recommended for Stable Testing)

**Best for:** Testing stable versions or when you want explicit control over updates

```json
// In your consuming project's package.json
{
  "dependencies": {
    "@madooei/example-package": "file:../path/to/example-package"
  }
}
```

Then run `npm install` to install the local package.

**Benefits:**

- ✅ Explicit dependency management
- ✅ Works offline
- ✅ Version controlled in package.json

**When to rebuild:**
You need to manually run `npm install` after changes to pick up updates.

### Option 3: Using Tarball (npm pack)

**Best for:** Testing the exact package that would be published to NPM

```bash
# In your package directory
npm run build
npm pack  # Creates madooei-example-package-1.0.0.tgz

# In your consuming project
npm install ./path/to/madooei-example-package-1.0.0.tgz
```

**Benefits:**

- ✅ Tests the exact publish artifact
- ✅ Includes only files that would be published
- ✅ Perfect for pre-publish validation

**Use cases:**

- Final testing before publishing
- Sharing packages without publishing
- Creating reproducible installs

## Package Development Best Practices

### Dual Module Format Support

Modern packages should support both ES modules and CommonJS:

```json
{
  "main": "./dist/index.cjs", // CommonJS for older tools
  "module": "./dist/index.js", // ES modules for modern bundlers
  "exports": {
    "import": "./dist/index.js", // ES modules
    "require": "./dist/index.cjs" // CommonJS
  }
}
```

### TypeScript Support

Always include TypeScript declarations for better developer experience:

```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    "import": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "require": {
      "types": "./dist/index.d.cts",
      "require": "./dist/index.cjs"
    }
  }
}
```

### Package Scope Considerations

**Public Scoped Packages:**

- Free on NPM
- Must use `--access public` on first publish
- Format: `@username/package-name`

**Private Scoped Packages:**

- Requires paid NPM account
- Can be published normally
- Only accessible to authorized users

**Unscoped Packages:**

- Must have globally unique names
- Immediately public
- Harder to get good names

## Choosing the Right Approach

**For Active Development:** Use `npm link` for packages you're frequently modifying

**For Stable Integration:** Use `file:` protocol for consistent, version-controlled dependencies

**For Pre-Publish Testing:** Use `npm pack` to test the exact artifact that will be published

**For Distribution:** Publish to NPM with automated workflows for reliability and consistency

This multi-faceted approach gives you flexibility to choose the right tool for each situation while maintaining a smooth development experience.
