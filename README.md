# Green Lint

> An energy-aware linting tool for sustainable web development

**Green Lint** detects energy-inefficient patterns in your web applications using empirical research findings. It helps developers write code that's not just better for the planet, but often faster and more performant too.

## Why Green Lint?

Web applications consume significant energy through inefficient coding practices. Green Lint identifies these anti-patterns and provides research-backed fixes based on real performance measurements.

### Key Benefits

- **Evidence-Based** - All patterns backed by empirical research with cited sources
- **Performance Improvements** - Energy savings often correlate with faster load times
- **Automatic Fixes** - Built-in solutions for common anti-patterns
- **Multiple Interfaces** - CLI, VS Code extension, and Lighthouse plugin
- **Detailed Reports** - Energy impact metrics and optimization guidance

## Quick Start

### Installation

```bash
# Install all packages
npm install

# Build the project
npm run build
```

### Using the CLI

`npm install` sets up a `green-lint` binary in this repo's `node_modules/.bin`, so after installing and building you can run it with `npx` from the repo root — no extra setup required:

```bash
npx green-lint analyze "src/**/*.{html,jsx,tsx}"
```

To use it against a project living elsewhere (e.g. your own app), point the pattern at that project's path instead of `cd`-ing into it:

```bash
npx green-lint analyze "../my-other-project/src/**/*.{html,jsx,tsx}"
```

If you'd rather have a bare `green-lint` command available anywhere, without the `npx` prefix, link it globally once:

```bash
cd packages/cli
npm link
```

Both commands take a glob pattern, not a bare file or directory path. **Always quote the pattern** — an unquoted `**` gets expanded by your shell before green-lint ever sees it, which can fail with a shell error like `no matches found` instead of running the tool.

```bash
# Analyze an entire directory recursively
green-lint analyze "src/**"

# Scope to specific file types for more precise results
green-lint analyze "src/**/*.{html,jsx,tsx}"

# Output results as JSON
green-lint analyze "src/**/*.{html,jsx,tsx}" --json

# Automatically fix issues
green-lint fix "src/**/*.{html,jsx,tsx}"

# Preview fixes without writing changes
green-lint fix "src/**/*.{html,jsx,tsx}" --dry-run
```

### Using VS Code Extension

The VS Code extension provides real-time analysis with editor integration:

1. Open the `green-lint` folder in VS Code
2. Press `F5` to launch an Extension Development Host
3. Open any HTML, JSX, or CSS file
4. Issues appear with clickable fixes

### Lighthouse Integration

The Lighthouse plugin adds green software audits to your Lighthouse reports:

```bash
# Link the plugin so Lighthouse can resolve it
cd packages/lighthouse-plugin
npm link

# Run Lighthouse with the plugin
lighthouse https://example.com --plugins=lighthouse-plugin-green-lint
```

## Patterns & Research

Green Lint detects the following energy-inefficient patterns:

### Lazy Loading Images

**Measured**: Reduced network transfer for offscreen images

- Detects images missing `loading="lazy"` attribute
- Recommends lazy loading for offscreen images

### Excessive DOM Size

**Measured**: No statistically significant energy impact (informational only)

- Identifies DOM trees exceeding optimal size thresholds
- Suggests simplification and component optimization

### Modern Format Usage

**Measured**: Reduced network transfer serving WebP instead of JPEG

- Detects images not using modern formats (WebP, AVIF)
- Recommends format conversion with responsive sizing

## Project Structure

```
green-lint/
├── packages/
│   ├── core/              # Pattern detection engine
│   │   ├── src/
│   │   │   ├── engine.ts     # Main analysis engine
│   │   │   ├── types.ts      # Type definitions
│   │   │   └── patterns/     # Pattern implementations
│   │   └── package.json
│   ├── cli/               # Command-line interface
│   │   ├── src/
│   │   │   └── cli.ts
│   │   └── package.json
│   ├── vscode-extension/  # VS Code extension
│   └── lighthouse-plugin/ # Lighthouse integration
├── green-lint-test-app/   # Example application
└── package.json          # Root workspace config
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development mode (with auto-rebuild)
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Building

```bash
# Build all packages
npm run build

# Clean build outputs
npm run clean
```

## Configuration

Create a `.green-lintrc.json` in your project root to customize Green Lint:

```json
{
  "patterns": {
    "lazy-loading": { "enabled": true },
    "excessive-dom": { "enabled": true, "maxNodes": 2000 },
    "modern-formats": { "enabled": true }
  },
  "severity": "warning",
  "ignore": ["node_modules/**", ".next/**"]
}
```

### Configuration Options

- **patterns** - Enable/disable specific patterns
- **severity** - Minimum severity level to report (`info`, `warning`, `error`)
- **ignore** - File patterns to exclude from analysis
- **fix** - Automatically apply fixes where possible
- **output** - Output format (`json`, `text`, `html`)

## API Usage

### Core Engine

```typescript
import { GreenLintEngine } from '@green-lint/core';

const engine = new GreenLintEngine();
const issues = await engine.analyzeFile(
  'path/to/file.js',
  sourceCode,
  { /* config */ }
);

// Access results
for (const issue of issues) {
  console.log(`${issue.message} (${issue.energyImpact.level})`);
  console.log(`Energy savings: ${issue.energyImpact.metric}`);
  
  // Get available fixes
  for (const fix of issue.fixes) {
    console.log(`- ${fix.description}`);
  }
}
```

## Examples

See the [green-lint-test-app](./green-lint-test-app/) directory for complete examples including:

- Bloated vs. clean DOM structures
- Optimized vs. unoptimized galleries
- Image lazy loading implementation

## License

ISC

## Acknowledgments

Green Lint is built on empirical research in green software engineering.
