# Unit tests

Unit tests use [Vitest](https://vitest.dev/) and import the source files directly, so no build is needed.

## Setup

- Execute `npm install` from the root folder.
- For browser tests, install Chromium once with `npx playwright install chromium`.

## Run

| Command | Runs |
| --- | --- |
| `npm run test-unit` | Core tests in Node |
| `npm run test-unit-addons` | Addon tests in Node |
| `npm run test-unit-browser` | Tests that need a browser, in Chromium |
| `npm run test-unit-gpu` | WebGL and WebGPU tests on the GPU, in Chromium |
| `npm test` | Lint and all of the above |

The `-headful` variants of `test-unit` and `test-unit-addons` also run the browser tests in a visible window.

Vitest options can be passed after `--`, for example `npm run test-unit -- --watch test/unit/src/math/Vector3.tests.js`.

## Notes

Test files are discovered automatically: any `*.tests.js` file is picked up, so there is no import list to maintain.

Tests that need browser APIs (such as `DOMParser` or image decoding) are listed in `browserTests` in `vitest.config.js`.

GPU tests need a real GPU. WebGL skips tests that need WebGPU-only features.

## Debugging

The [Vitest VS Code extension](https://github.com/vitest-dev/vscode) can run and debug individual tests from the editor. For browser tests, add `debugger;` and run with `--browser.headless=false`.

See [../e2e/README.md](../e2e/README.md) for the example screenshot tests.
