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

Place example names before Playwright options after npm's `--` separator:

```sh
npm run test-e2e -- webgl_geometry_cube --workers 2 --retries 0
npm run test-e2e -- --shard=1/5
```

Put `--make` and `--webgpu` before Playwright options too. Set `VISIBLE=1` to watch the browser.

## Notes

CI renders on Ubuntu with Mesa's software Vulkan driver (lavapipe), which the thumbnails were made with. Other GPUs can differ slightly, so review the failure images before updating a thumbnail.

Screenshots are captured as soon as possible and retried for up to five seconds until one matches. Early mismatches are expected and are not reported as failures.

If none matches, Playwright retries the whole test with a fresh page, up to twice. Playwright labels tests that pass on a whole-test retry "flaky"; this does not refer to the screenshot polling above.

`exceptions.js` has two lists:

- `exceptionList`: examples that are not tested. Naming an example explicitly still runs it.
- `slowList`: examples that need an extra two seconds before the screenshot, for example because of async loading or shader compilation.

Use `slowList` for examples that consistently need more preparation time, and `exceptionList` as a last resort. Thumbnail generation also waits two extra seconds because there is no expected image to match.

When a comparison fails, the actual, expected and diff images are saved in `test/e2e/output-screenshots` and uploaded by CI.

For local traces and an HTML report, run:

```sh
npm run test-e2e -- webgl_geometry_cube --trace retain-on-failure --reporter=list,html
npx playwright show-report playwright-report
```

Traces are saved in `test/e2e/results` and can also be opened with `npx playwright show-trace <trace.zip>`. HTML reports and traces are disabled by default.
