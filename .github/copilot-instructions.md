# Three.js Development Instructions

This document provides comprehensive guidance for coding agents working on the Three.js project. Three.js is a JavaScript 3D library aimed at creating an easy-to-use, lightweight, cross-browser, general-purpose 3D library with WebGL, WebGPU, SVG, and CSS3D renderers.

## Project Architecture

### Core Directory Structure

- **`src/`** - Core library source code
  - `Three.js` - Main export file that includes WebGL renderer
  - `Three.Core.js` - Core functionality (cameras, lights, materials, geometries, etc.)  
  - `Three.WebGPU.js` - WebGPU renderer exports
  - `Three.TSL.js` - Three Shading Language exports
  - `Three.Legacy.js` - Legacy compatibility exports
  - `constants.js` - Global constants and enums
  - `utils.js` - Utility functions

- **`build/`** - Generated build outputs (DO NOT EDIT MANUALLY)
  - `three.module.js` - ES6 module build
  - `three.cjs` - CommonJS build  
  - `three.webgpu.js` - WebGPU build
  - `three.tsl.js` - TSL build

- **`examples/`** - Example files and addon modules
  - `jsm/` - JavaScript modules (addons/extensions)
  - `*.html` - Individual example files
  - `files.json` - Example metadata
  - `models/`, `textures/`, `sounds/`, `fonts/` - Asset directories

- **`test/`** - Testing infrastructure
  - `unit/` - Unit tests using QUnit
  - `e2e/` - End-to-end screenshot testing with Puppeteer
  - `treeshake/` - Tree-shaking validation

- **`utils/`** - Build and development utilities
  - `build/` - Rollup configuration and build scripts
  - `docs/` - Documentation generation tools

- **`docs/`** - Generated API documentation
- **`editor/`** - Three.js editor application
- **`manual/`** - Manual/tutorial content
- **`playground/`** - Code playground

### Source Code Architecture

The source is organized into logical modules:

- **Core (`src/core/`)** - Base classes: Object3D, BufferGeometry, BufferAttribute, etc.
- **Cameras (`src/cameras/`)** - PerspectiveCamera, OrthographicCamera, etc.
- **Lights (`src/lights/`)** - DirectionalLight, PointLight, SpotLight, etc.  
- **Materials (`src/materials/`)** - MeshBasicMaterial, MeshStandardMaterial, etc.
- **Geometries (`src/geometries/`)** - BoxGeometry, SphereGeometry, etc.
- **Renderers (`src/renderers/`)** - WebGLRenderer, WebGPURenderer and related systems
- **Math (`src/math/`)** - Vector3, Matrix4, Quaternion, etc.
- **Loaders (`src/loaders/`)** - File format loaders
- **Animation (`src/animation/`)** - Animation system
- **Audio (`src/audio/`)** - Web Audio API integration
- **Nodes (`src/nodes/`)** - Node-based material system for WebGPU

## Development Workflow

### Initial Setup

```bash
npm ci                    # Install dependencies
npm start                 # Start development server at https://localhost:8080/
```

### Key NPM Scripts

#### Development & Building
- `npm start` / `npm run dev` - Start local development server with file watching
- `npm run preview` - Build and serve with live reloading
- `npm run build` - Full production build
- `npm run build-module` - Build ES6 module only

#### Testing & Quality Assurance
- `npm test` - Run all tests (lint + unit + unit-addons)
- `npm run lint` - ESLint core source only
- `npm run lint-fix` - Auto-fix linting issues across all files
- `npm run test-unit` - QUnit unit tests for core
- `npm run test-unit-addons` - QUnit unit tests for examples/jsm addons
- `npm run test-e2e` - End-to-end screenshot testing (installs ~200MB Chromium)
- `npm run test-e2e-cov` - E2E coverage validation for examples
- `npm run test-treeshake` - Validate tree-shaking works correctly

#### Documentation
- `npm run build-docs` - Generate JSDoc API documentation

### Pre-commit Checklist

Before committing changes, ensure:

1. **Linting passes**: `npm run lint` (or `npm run lint-fix` to auto-correct)
2. **Unit tests pass**: `npm run test-unit` and `npm run test-unit-addons`  
3. **No build files are committed** - builds are generated automatically
4. **Examples still work** if you modified core functionality
5. **Run relevant E2E tests** if you changed rendering behavior

## GitHub Actions CI/CD

The project uses multiple automated workflows:

### Main CI Pipeline (`.github/workflows/ci.yml`)
Triggers on pull requests, runs:
- ESLint validation
- Unit test suite (core + addons)  
- Example coverage validation
- Cross-platform E2E testing (Windows)

### Size Monitoring (`.github/workflows/read-size.yml`, `report-size.yml`)
- Tracks bundle size changes on PRs affecting `src/` or build configs
- Validates tree-shaking effectiveness  
- Reports size metrics for both WebGL and WebGPU builds

### Security (`codeql-code-scanning.yml`)
- Automated security scanning with CodeQL

## Testing Strategy

### Unit Testing
- **Framework**: QUnit
- **Location**: `test/unit/`
- **Run**: `npm run test-unit` (Node.js) or serve `test/unit/UnitTests.html` (browser)
- **Patterns**: Use `QUnit.test()` for ready tests, `QUnit.todo()` for pending
- Tests are split between core library (`three.source.unit.js`) and addons (`three.addons.unit.js`)

### E2E Testing  
- **Framework**: Puppeteer with screenshot comparison
- **Location**: `test/e2e/`
- **Purpose**: Ensure examples render correctly and catch visual regressions
- **Features**: Deterministic rendering (fixed random/timers), parallel execution, progressive retry
- **Commands**: 
  - `npm run test-e2e` - Test all examples
  - `npm run test-e2e <example_name>` - Test specific examples  
  - `npm run make-screenshot <example_name>` - Generate new reference screenshots

### Tree-shaking Validation
- **Purpose**: Ensure unused code can be eliminated by bundlers
- **Configuration**: `test/rollup.treeshake.config.js`
- **Run**: `npm run test-treeshake`

## Code Quality & Standards

### ESLint Configuration
- **Config**: `.eslintrc.json` (extends `mdcs` config)
- **Scopes**: Separate linting for core (`src/`), addons (`examples/jsm/`), examples, docs, editor, etc.
- **Browser Compatibility**: Uses `eslint-plugin-compat` to ensure API compatibility
- **HTML**: Supports linting JavaScript in HTML files via `eslint-plugin-html`

### Code Style Guidelines
- ES2018+ syntax in source files
- Module-based architecture using ES6 imports/exports
- Consistent naming: Classes use PascalCase, methods/variables use camelCase
- Extensive JSDoc documentation for API generation

### Browser Support
- Target: `"> 1%, not dead, not ie 11, not op_mini all"` (per `browserslist` in package.json)
- WebGL 1.0/2.0 and WebGPU support where available
- Progressive enhancement for newer APIs

## Build System

### Rollup Configuration (`utils/build/rollup.config.js`)
- **Plugin: `glsl()`** - Processes `.glsl.js` files, strips comments and minimizes GLSL shaders
- **Plugin: `header()`** - Adds license headers to built files
- **Minification**: Uses Terser for production builds
- **Multiple outputs**: ES6 modules, CommonJS, WebGPU variants

### Build Targets
- **`three.module.js`** - Standard WebGL build (ES6 modules)
- **`three.cjs`** - CommonJS build for Node.js
- **`three.webgpu.js`** - WebGPU renderer build
- **`three.tsl.js`** - Three Shading Language build

## Development Server
- **Tool**: `servez` (custom server)
- **SSL Support**: Available via `npm run dev-ssl` 
- **Port**: 8080 (configurable)
- **Features**: Automatic rebuilding during development

## Examples & Addons System

### Examples Structure
- **HTML files**: Individual examples in project root (`examples/webgl_*.html`, etc.)
- **Shared assets**: Models, textures, fonts in `examples/files/`
- **Metadata**: `examples/files.json` contains example categorization and info

### Addons (`examples/jsm/`)
These are community-contributed extensions:
- **Controls**: Orbit, transform, drag controls, etc.
- **Loaders**: GLTF, OBJ, FBX, Draco, etc.  
- **Post-processing**: Bloom, SSAO, motion blur effects
- **Exporters**: GLTF, OBJ, STL export functionality
- **Physics**: Ammo.js, Rapier integration
- **Utilities**: GUI, stats, helpers

### Adding New Examples
1. Create HTML file following naming convention (`webgl_feature_description.html`)
2. Add entry to `examples/files.json` with appropriate metadata
3. Include screenshot in `examples/screenshots/`
4. Ensure E2E tests pass via `npm run test-e2e-cov`

## Key Dependencies

### Runtime Dependencies
- **None** - Three.js is dependency-free at runtime

### Development Dependencies  
- **Build**: `rollup`, `@rollup/plugin-terser`, `@rollup/plugin-node-resolve`
- **Testing**: `qunit`, `puppeteer`, `pixelmatch`, `jimp`
- **Linting**: `eslint`, `eslint-config-mdcs`, `eslint-plugin-compat`, `eslint-plugin-html`
- **Documentation**: `jsdoc`
- **Development**: `servez`, `concurrently`, `magic-string`

## WebGPU & Node System

Three.js includes a modern WebGPU renderer with a node-based material system:

### Node System (`src/nodes/`)
- **TSL (Three Shading Language)**: High-level shading language that compiles to WGSL/GLSL
- **Node Graph**: Composable node system for materials and post-processing
- **Cross-renderer**: Nodes work with both WebGL and WebGPU

### WebGPU Features
- **Modern GPU API**: Direct access to GPU compute and advanced rendering features
- **Compute Shaders**: Available via `webgpu_compute_*` examples
- **Advanced Materials**: PBR, transmission, clearcoat, etc.

## Contribution Guidelines

### Branch Strategy  
- **Main branch**: `dev` (not `main` or `master`)
- **Feature branches**: Create from `dev`, name descriptively
- **Pull Requests**: Target `dev` branch

### Commit Guidelines
- **No build files**: Never commit generated files in `build/`
- **Atomic commits**: One logical change per commit
- **Link issues**: Reference issues with `#1234` syntax in commit messages
- **Examples**: Add examples for new features when appropriate

### Code Review Process
- All changes require PR review
- CI must pass (linting, unit tests, E2E coverage)
- Performance regression checks for core changes
- Documentation updates may be required

## Debugging & Development

### Local Development
- **Live reloading**: Use `npm run preview` for automatic rebuilds
- **HTTPS**: Use `npm run dev-ssl` for testing secure contexts (WebXR, etc.)
- **Debugging**: Add `debugger;` statements, use browser dev tools
- **Performance**: Use `examples/webgl_test_memory*.html` for memory leak testing

### Common Issues
- **Import errors in tests**: Usually caused by typos in import paths
- **E2E failures**: Run `npm run make-screenshot <example>` to update reference images
- **Build failures**: Check for syntax errors, missing exports
- **Performance regressions**: Test with relevant examples, check memory usage

## Editor & Playground

### Three.js Editor (`editor/`)
- **Standalone application**: Visual scene editor built with Three.js
- **Features**: Scene hierarchy, inspector, asset management
- **Development**: Has separate linting config and build process

### Playground (`playground/`)  
- **Code experimentation**: Interactive code environment
- **Testing ground**: Try Three.js features before committing to examples

This document should provide sufficient context for coding agents to work effectively within the Three.js codebase while maintaining code quality and following established conventions.