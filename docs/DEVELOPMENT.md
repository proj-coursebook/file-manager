# Development Guide

This document provides technical details for developers working on this TypeScript package template, including build architecture, development workflows, and implementation patterns.

## Build Architecture

### TypeScript Configuration

**Multiple TypeScript Configurations:**

- `tsconfig.json` - Development configuration with all files included
- `tsconfig.build.json` - Production build configuration, excludes tests and dev files

**Key Settings:**

- Target: `ESNext` for modern JavaScript features
- Module: `ESNext` for ES modules
- Path aliases: `@/*` maps to `src/*` for clean imports
- Strict mode enabled for type safety

> [!TIP]
> For detailed information about TypeScript setup, see the [TypeScript Setup Guide](guides/typescript.md).

### Build System (tsup)

**Why tsup over tsc:**

- Fast builds with esbuild under the hood
- Dual format output (ESM + CJS) without complex configuration
- Automatic declaration file generation
- Built-in code splitting and tree-shaking

**Configuration (`tsup.config.ts`):**

```typescript
export default defineConfig({
  target: "node20", // Target Node.js 20+
  entry: ["src/index.ts"], // Single entry point
  outDir: "dist", // Output directory
  format: ["esm", "cjs"], // Dual module format
  sourcemap: true, // Source maps for debugging
  clean: true, // Clean output before build
  dts: true, // Generate .d.ts files
  splitting: true, // Code splitting for better tree-shaking
  treeshake: true, // Remove unused code
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
    };
  },
});
```

### Module Format Strategy

**Dual ESM/CJS Support:**

- Modern bundlers use ESM (`module` field)
- Legacy tools use CJS (`main` field)
- Modern resolution via `exports` field

**package.json Configuration:**

```json
{
  "main": "./dist/index.cjs", // CommonJS entry
  "module": "./dist/index.js", // ESM entry
  "types": "./dist/index.d.ts", // TypeScript declarations
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

## Testing Strategy

### Vitest Configuration

**Why Vitest:**

- Fast execution with native ES modules support
- Hot module reloading for watch mode
- Built-in TypeScript support
- Rich assertion API and mocking capabilities

**Key Features Configured:**

- Path alias support (`@/` → `src/`)
- Coverage reporting with v8 provider
- UI mode for interactive testing
- Comprehensive coverage tracking

**Test Patterns:**

- Unit tests in `tests/` directory
- Test files named `*.test.ts`
- Type constraint testing for runtime validation
- Mock strategies for external dependencies

### Coverage Configuration

**Coverage Setup:**

- Provider: v8 (faster than c8)
- Reporters: text, json, html
- Include: `src/**/*.ts`
- Exclude: test files, coverage, node_modules

## Development Workflow

### Validation Pipeline

**The `npm run validate` Command:**

1. **Type checking** - `tsc --noEmit --project tsconfig.build.json`
2. **Linting with auto-fix** - `eslint --fix`
3. **Formatting with auto-fix** - `prettier --write .`
4. **Testing** - `vitest run`

**Why This Order:**

- Type check first to catch structural issues
- Auto-fix linting and formatting to reduce noise
- Tests last to validate working code

### Development Scripts

**Core Development:**

- `npm run dev` - tsx watch mode for rapid iteration
- `npm run debug` - tsx with inspect-brk for debugging
- `npm run build` - Production build with tsup

**Quality Assurance:**

- `npm run lint` - ESLint check only
- `npm run format` - Prettier check only
- `npm run type-check` - TypeScript validation only

**Testing:**

- `npm run test` - Single test run
- `npm run test:watch` - Watch mode testing
- `npm run test:ui` - Interactive test interface
- `npm run test:coverage` - Coverage report generation

## Key Implementation Patterns

### Runtime Validation Pattern

**Dual Validation Strategy:**

- TypeScript provides compile-time type safety
- Runtime validation provides JavaScript user safety

**Implementation:**

```typescript
export const example = (person: Person) => {
  // Runtime validation for JavaScript users
  if (
    !person ||
    typeof person.name !== "string" ||
    typeof person.age !== "number"
  ) {
    throw new Error("Invalid person object...");
  }
  // Implementation continues...
};
```

### Type Constraint Testing

**Testing TypeScript Types:**

```typescript
// Test invalid types would fail compilation
const testCases = [
  { name: "John Doe" }, // missing age
  { age: 30 }, // missing name
];

testCases.forEach((invalidPerson) => {
  // @ts-expect-error - Intentionally testing invalid types
  expect(() => example(invalidPerson)).toThrow("Invalid person object");
});
```

### Path Alias Usage

**Clean Imports:**

- Use `@/types` instead of `./types` or `../types` or `@/types.ts`
- Consistent across TypeScript, build tools, and tests
- Configured in tsconfig.json, tsup.config.ts, and vitest.config.ts

## Code Quality Setup

### ESLint Configuration

**Rules Applied:**

- TypeScript ESLint recommended rules
- Prettier integration to avoid conflicts
- Consistent casing enforcement
- Modern JavaScript/TypeScript patterns

### Prettier Configuration

**Formatting Strategy:**

- Consistent code style across all files
- Automatic formatting on save (with editor setup)
- Integration with ESLint to avoid rule conflicts

## File Organization

### Source Structure

```plaintext
src/
├── index.ts      # Main exports and public API
└── types.ts      # Type definitions
```

### Test Structure

```plaintext
tests/
└── index.test.ts # Comprehensive tests including type constraints
```

### Configuration Files

```plaintext
├── tsconfig.json         # Development TypeScript config
├── tsconfig.build.json   # Build-specific TypeScript config
├── tsup.config.ts        # Build configuration
├── vitest.config.ts      # Test configuration
├── eslint.config.js      # Linting rules
└── prettier.config.json  # Code formatting
```

## Technical Decisions

### Why These Tools?

**tsup over tsc:** Faster builds, easier dual-format output, better developer experience

**vitest over jest:** Native ES modules, faster execution, better TypeScript integration

**ESLint + Prettier:** Industry standard, extensive rule ecosystem, editor integration

**tsx over ts-node:** Faster TypeScript execution, better ES modules support

**standard-version:** Conventional commits, automated changelog, semantic versioning

### Development Philosophy

1. **Fast Feedback Loops:** Watch modes, hot reloading, instant type checking
2. **Comprehensive Validation:** Multiple layers of checking before commits
3. **Modern Tooling:** Embrace latest JavaScript/TypeScript capabilities
4. **Portability:** Self-contained packages that work independently
5. **Developer Experience:** Clear error messages, helpful tooling, good defaults
