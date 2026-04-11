# Green Lint

> An energy-aware linting tool for sustainable web development

**Green Lint** detects energy-inefficient patterns in your web applications using empirical research findings. It helps developers write code that's not just better for the planet, but often faster and more performant too.

## Why Green Lint?

Web applications consume significant energy through inefficient coding practices. Green Lint identifies these anti-patterns and provides research-backed fixes based on real performance measurements.

### Key Benefits

- 🌍 **Evidence-Based** - All patterns backed by empirical research with cited sources
- ⚡ **Performance Improvements** - Energy savings often correlate with faster load times
- 🔧 **Automatic Fixes** - Built-in solutions for common anti-patterns
- 🛠️ **Multiple Interfaces** - CLI, VS Code extension, and Lighthouse plugin
- 📊 **Detailed Reports** - Energy impact metrics and optimization guidance

## Quick Start

### Installation

```bash
# Install all packages
npm install

# Build the project
npm run build
```

### Using the CLI

```bash
# Analyze a single file
green-lint src/index.js

# Analyze a directory
green-lint src/

# With options
green-lint src/ --severity error --fix
```

### Using VS Code Extension

The VS Code extension provides real-time analysis with editor integration:

1. Install the extension from the VS Code Marketplace
2. Open any HTML, JSX, or CSS file
3. Issues appear with clickable fixes

### Lighthouse Integration

The Lighthouse plugin adds green software audits to your Lighthouse reports:

```bash
lighthouse https://example.com --plugins=@green-lint/lighthouse-plugin
```

## Patterns & Research

Green Lint detects the following energy-inefficient patterns:

### Lazy Loading Images
**Impact**: 88% network reduction, 19.6% total energy savings
- Detects images missing `loading="lazy"` attribute
- Recommends lazy loading for offscreen images
- [Research Source](./docs/research/lazy-loading.md)

### Excessive DOM Size
**Impact**: Reduced memory usage and faster rendering
- Identifies DOM trees exceeding optimal size thresholds
- Suggests simplification and component optimization
- [Research Source](./docs/research/excessive-dom.md)

### Modern Format Usage
**Impact**: Up to 80% file size reduction for images
- Detects images not using modern formats (WebP, AVIF)
- Recommends format conversion with responsive sizing
- [Research Source](./docs/research/modern-formats.md)

### Additional Patterns (Coming Soon)
- Third-party script optimization
- CSS minification detection
- Font loading strategy analysis
- Animation performance tuning

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
│   └── lighthouse-plugin/ # Lighthouse integration
├── vscode-extension/      # VS Code extension
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
- CSS minification examples

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Adding a New Pattern

1. Create a new file in `packages/core/src/patterns/`
2. Extend `BasePattern` class
3. Implement the `detect()` method
4. Register in `engine.ts`
5. Add tests in `green-lint-test-app/tests/patterns.test.js`

[See Pattern Development Guide](./docs/PATTERN_DEVELOPMENT.md)

## License

ISC

## Resources

- 📚 [Research Documentation](./docs/research/)
- 🔬 [Methodology](./docs/METHODOLOGY.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/green-lint/issues)
- 💬 [Discussions](https://github.com/yourusername/green-lint/discussions)

## Acknowledgments

Green Lint is built on empirical research in green software engineering. Special thanks to all contributors and researchers in the sustainable computing community.

---

**Made with 🌱 for a more sustainable web**
