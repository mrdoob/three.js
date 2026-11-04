# Three.js end-to-end testing

Each example is loaded in Chromium with [Playwright](https://playwright.dev/) and its screenshot is compared with its thumbnail in `examples/screenshots`. The same screenshots are used as the example thumbnails.

## Setup

- Execute `npm install` and `npm run build` from the root folder.
- Install the browser once with `npx playwright install chromium`.

## Run

```sh
# Check all examples, or only WebGPU examples.
npm run test-e2e
npm run test-e2e-webgpu

# Check specific examples.
npm run test-e2e -- webgl_geometry_cube webgl_loader_gltf

# Update thumbnails after reviewing a rendering change.
npm run make-screenshot -- webgl_geometry_cube
```

Playwright options can be passed after `--`, for example `--shard=1/5`. Set `VISIBLE=1` to watch the browser.

## Notes

CI renders on Ubuntu with Mesa's software Vulkan driver (lavapipe), which the thumbnails were made with. Other GPUs can differ slightly, so review the failure images before updating a thumbnail.

`exceptions.js` has two lists:

- `exceptionList`: examples that are not tested. Naming an example explicitly still runs it.
- `slowList`: examples that need an extra two seconds before the screenshot, for example because of async loading or shader compilation.

If an example fails because a screenshot was captured too early, add it to `slowList`. Only add it to `exceptionList` as a last resort.

When a comparison fails, the actual, expected and diff images are saved in `test/e2e/output-screenshots`. Traces are saved in `test/e2e/results` and can be opened with `npx playwright show-trace <trace.zip>`.

CI also uploads an HTML report and the test results for each shard, including failures that pass on retry. Download the `E2E report-<os>-<shard>` artifact and run `npx playwright show-report <extracted-path>/report` to inspect tests, image attachments and traces. These artifacts are retained for seven days. The separate output-screenshots artifact is preserved for the screenshot comparison bot.

To generate an HTML report locally, pass `--reporter=list,html` (Playwright writes this report to `playwright-report` by default).
