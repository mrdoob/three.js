# Technical Context

## Technologies Used

### Core Technologies
- **JavaScript (ES6+)**: Modern JavaScript with ES modules
- **WebGL**: Low-level 3D graphics API
- **WebGPU**: Next-generation graphics API (experimental)
- **HTML5 Canvas**: Rendering target

### Build Tools
- **Rollup**: Module bundler for creating builds
- **ESLint**: Code linting
- **JSDoc**: Documentation generation
- **QUnit**: Unit testing framework
- **Puppeteer**: End-to-end testing

### Development Tools
- **Node.js**: Runtime for build scripts
- **npm**: Package management
- **servez**: Development server
- **concurrently**: Run multiple scripts simultaneously

## Development Setup

### Prerequisites
- Node.js (version not specified, but modern version required)
- npm

### Installation
```bash
npm install
```

### Key Scripts
- `npm start` / `npm run dev`: Start development server
- `npm run build`: Build production bundles
- `npm test`: Run all tests (lint + unit tests)
- `npm run lint`: Lint core source code
- `npm run build-docs`: Generate documentation

### Build Outputs
Located in `build/` directory:
- `three.module.js` - ES module build
- `three.cjs` - CommonJS build
- `three.webgpu.js` - WebGPU renderer
- `three.tsl.js` - Three Shading Language
- Minified versions of above

## Technical Constraints

### Browser Support
- Modern browsers (not IE 11, not Opera Mini)
- WebGL support required for core functionality
- WebGPU support optional (experimental)

### Module System
- ES6 modules in source (`src/`)
- Multiple output formats (ESM, CJS)
- Tree-shaking friendly

### Performance Considerations
- BufferGeometry for efficient vertex data
- Instanced rendering for many objects
- Render targets for post-processing
- Texture compression support

## Dependencies

### Runtime Dependencies
None (three.js is a standalone library)

### Development Dependencies
- `@rollup/plugin-node-resolve`: Module resolution
- `@rollup/plugin-terser`: Minification
- `eslint`: Code linting
- `jsdoc`: Documentation
- `puppeteer`: E2E testing
- `qunit`: Unit testing
- `rollup`: Bundling
- `servez`: Dev server

## File Structure

### Source Code (`src/`)
- Pure JavaScript modules
- ES6 class syntax
- Modular organization by feature

### Examples (`examples/`)
- HTML examples demonstrating features
- JSM (JavaScript Modules) examples
- Font files for text rendering

### Documentation (`docs/`, `manual/`)
- Auto-generated API docs (`docs/`)
- Manual with tutorials (`manual/`)
- Multiple languages supported

### Tests (`test/`)
- Unit tests (`test/unit/`)
- End-to-end tests (`test/e2e/`)
- Tree-shaking tests (`test/treeshake/`)

## Build Configuration
- Rollup config: `utils/build/rollup.config.js`
- JSDoc config: `utils/docs/jsdoc.config.json`
- ESLint config: Uses `eslint-config-mdcs`

## Development Workflow
1. Edit source files in `src/`
2. Run `npm run dev` for development server
3. View examples at `http://localhost:8080`
4. Run `npm test` before committing
5. Build with `npm run build` for production

## Code Style
- Follows MDCS (Mr.doob's Code Style)
- ESLint enforced
- Consistent naming conventions
- JSDoc comments for documentation

