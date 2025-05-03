# Simple Example Usage For `@coursebook/file-manager`

This is a minimal example showing how to use `@coursebook/file-manager` package in a local project. The example demonstrates how to read files from a source directory and write them to a destination directory.

## Setup

```bash
npm install
```

## Run the Example

```bash
npm run start
``` 

## How does it work?

The `@coursebook/file-manager` is a local package that is installed using the `file:` protocol; see the `dependencies` section in the `package.json` file:

```json
  "dependencies": {
    "@coursebook/file-manager": "file:../../packages/file-manager"
  },
```

If you want to use the package through NPM, you can do so by changing the `dependencies` section in the `package.json` file to:

```json
  "dependencies": {
    "@coursebook/file-manager": "latest"
  },
```

Then install the dependencies again and it will be installed through NPM (assuming you have published the package to NPM).
