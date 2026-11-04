# Unit tests

Unit tests use [Vitest](https://vitest.dev/) and import the source files directly, so no build is needed.

## Setup

- Execute `npm install` from the root folder.
- For browser tests, install Chromium once with `npx playwright install chromium`.

## Run

| Command | Runs |
| --- | --- |
| `npm run test-unit` | Core tests: Node, plus Chromium for browser and WebGL/WebGPU tests |
| `npm run test-unit-addons` | Addon tests: Node, plus Chromium for browser tests |
| `npm test` | Lint and all of the above |

The `-headful` variants run the browser tests in a visible window. A single Vitest project can be run with `npx vitest --project <name>` (see `vitest.config.js`).

Vitest options can be passed after `--`, for example `npm run test-unit -- --watch test/unit/src/math/Vector3.tests.js`.

## Notes

Test files are discovered automatically: any `*.tests.js` file is picked up, so there is no import list to maintain.

Tests that need browser APIs (such as `DOMParser` or image decoding) are listed in `browserTests` and `addonsBrowserTests` in `vitest.config.js`.

GPU tests need a real GPU. WebGL skips tests that need WebGPU-only features.

GPU files are discovered directly. Each GPU project runs one file at a time and reuses module imports, as the former combined suite did. The renderer is shared within a file and disposed after that file. To run one file or test:

```sh
npx vitest run --project webgpu test/unit/src/nodes/tsl/GPUComputeBuiltins.tests.js
npx vitest run --project webgl test/unit/src/nodes/tsl/TSLMath.tests.js -t abs
```

## Debugging

The [Vitest VS Code extension](https://github.com/vitest-dev/vscode) can run and debug individual tests from the editor. For browser tests, add `debugger;` and run with `--browser.headless=false`.

See [../e2e/README.md](../e2e/README.md) for the example screenshot tests.
