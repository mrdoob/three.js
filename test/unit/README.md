# Unit tests

Use Node 26 and install dependencies with `npm ci`. Tests import current source files. No build or manually started server is required.

| Command | Environment |
| --- | --- |
| `npm run test-unit` | CPU core and TSL code-generation tests in Node |
| `npm run test-unit-headful` | CPU core tests plus browser tests in visible Chromium |
| `npm run test-unit-addons` | CPU addon tests in Node |
| `npm run test-unit-addons-headful` | CPU addon tests plus browser tests in visible Chromium |
| `npm run test-unit-browser` | Image, loader and WebGL postprocessing tests in Chromium |
| `npm run test-unit-gpu` | Native hardware WebGL and WebGPU tests using vitest-gpu |
| `npm test` | Core lint and all unit projects, including native GPU |

Install Chromium once with `npx playwright install chromium` for browser tests. Test commands run once by default and forward Vitest arguments after `--`: use `npm test -- --watch`, `npm run test-unit -- --watch test/unit/src/math/Vector3.tests.js`, or `npm run test-unit-browser -- --watch --browser.headless=false`. Use `npm test -- --project webgpu` to select one GPU backend. Vitest discovers `*.tests.js` automatically; GPU suites use a glob entry point rather than a manual import list.

The restored headful entry points run their CPU project alongside the shared browser project with visible Chromium; native GPU tests remain available through `test-unit-gpu`.

Tests use native Vitest `describe`, `test`, hooks and assertions. Existing numerical and geometry comparisons remain in `utils/test-utils.js`. An unfinished behavior can use `test.fails` when it should execute and report an unexpected pass; use `test.skip` for an explicitly unsupported case.

GPU tests use the WebGL and WebGPU Node environments from [vitest-gpu](https://github.com/bhouston/vitest-gpu). They test real shader results and renderer pixels through completed GPU readbacks. WebGL skips tests requiring WebGPU-only workgroups, barriers or atomics; unsupported optional adapter features are reported as skips. CPU-only commands work without a GPU; the full `npm test` requires hardware and Chromium. CI runs both native backends on macOS using Metal. Node 26 satisfies Vitest and the native environments.

Browser tests cover APIs such as DOMParser, image decoding, HTTP loader integration and WebGL postprocessing. Browser examples and screenshot maintenance are documented in [../e2e/README.md](../e2e/README.md). Use `debugger` with Vitest's browser UI or Playwright traces to inspect a failure.

## Development workflow

`npm run test-unit -- --watch --project addons` watches core and addon files and reruns affected tests as source changes. CPU files share worker environments; tests must restore changes to shared globals. Tests within each file remain sequential. Each native GPU backend runs one automatically discovered suite in its own environment, sharing imports and a renderer until suite cleanup. All projects inherit one worker limit: 75% of available logical CPUs rounded down, with a minimum of one. CPU, browser and GPU projects can overlap. Browser units reuse one browser process. Example tests default to one worker and CI uses five Playwright shards.

CI screenshot shards wait for CPU checks and run independently of native GPU and browser unit jobs.

The [official Vitest VS Code extension](https://github.com/vitest-dev/vscode) provides Test Explorer discovery, individual test runs and debugging using the Vitest configurations. No repository-specific editor integration is needed. Browser and native GPU projects still require their documented browser/hardware prerequisites.

Vitest supplies file discovery, filtering, watch mode, assertion diffs, source locations and per-test results. Playwright supplies browser lifecycle, retries, sharding and traces. CPU tests run without starting a browser or server. Shared CPU workers and one GPU suite per backend avoid repeated imports and renderer startup; `npm test` runs all projects in one invocation after lint. Example commands forward Playwright arguments separately; they do not use Vitest watch mode.

## Async failures and diagnostics

| Check | Behavior |
| --- | --- |
| Unhandled errors | Unhandled promise rejections and uncaught errors fail the run by default, including browser error events. |
| Unresolved work | A promise returned or awaited by a test reaches the test timeout: 5 seconds in Node, 15 seconds in Browser Mode, or the configured 30 seconds for native GPU tests. |
| Forgotten assertion awaits | Vitest 5 fails unawaited asynchronous `expect` assertions such as `resolves` and `rejects`. Arbitrary unreturned promises are not universally detectable. |
| Isolation | CPU file isolation is disabled to reuse imports. Each GPU backend has its own environment and renderer cleanup at suite completion; browser files retain isolation. Individual tests within shared suites are sequential. |

Async failure checks are [Vitest defaults](https://vitest.dev/guide/features); the isolation and GPU timeout settings above are project configuration. See [asynchronous assertions](https://vitest.dev/guide/migration/#unawaited-asynchronous-assertions-fail-the-test), [timeouts](https://vitest.dev/config/testtimeout) and [parallelism](https://vitest.dev/guide/parallelism).

For Node async-resource diagnostics, use `npx vitest run --project unit --detectAsyncLeaks`. For a process that will not exit, use `npx vitest run --project unit --reporter=default --reporter=hanging-process`. [Async leak detection](https://vitest.dev/config/detectasyncleaks) is opt-in, adds overhead and does not support Browser Mode. The [hanging-process reporter](https://vitest.dev/guide/reporters#hanging-process-reporter) diagnoses open handles. Neither is a general JavaScript heap-leak detector, and neither automatically fixes a leak. Tests still need to await work and clean up resources.
