# Three.js end-to-end testing

Playwright loads each example in an isolated browser context and compares its screenshot with the existing JPEG thumbnail. Deterministic clock and random injection also applies to worker imports; animation and video hooks apply in the page. Tests retain the existing 800 × 500 viewport, downsampled 400 × 250 thumbnails, JPEG quality and pixel thresholds.

```sh
# Check examples, optionally with their .html extension.
npm run test-e2e -- webgl_geometry_cube

# Check all examples, or only WebGPU examples.
npm run test-e2e
npm run test-e2e-webgpu

# Deliberately update thumbnails after reviewing a rendering change.
npm run make-screenshot -- webgl_geometry_cube

# Native Playwright selection, workers and sharding are available.
npm run test-e2e -- --list
npm run test-e2e -- --shard=1/5 --workers=1

# Check runner option parsing and readiness without a browser.
node --test test/e2e/*.tests.js
```

Run `npm run build` before example tests. Install the browser with `npx playwright install chromium`, or set `THREE_BROWSER_CHANNEL=chrome` to use an installed Google Chrome. `VISIBLE=1` opens a visible browser. Windows uses ANGLE's hardware D3D11 backend. Browser and driver differences can affect pixel comparisons; review mismatch artifacts before updating a thumbnail.

The runner records the WebGL renderer and, for WebGPU examples, adapter identity and successful device creation. GitHub Actions retains the legacy Ubuntu Mesa configuration under xvfb to match its screenshot baselines. Use a physical GPU when verifying rendering quality locally. If the bundled Chromium cannot create a WebGPU device on Windows, try an installed Chrome channel.

One worker runs by default to avoid GPU contention. Playwright handles retries and replaces a failed worker's browser. Each example has its own context, console error checks and trace on failure. Increase workers explicitly when the hardware has enough capacity. CI uses Playwright's native sharding, independent of the `CI` environment variable.

Screenshot comparisons navigate with Playwright's native `networkidle` boundary, wait for the deterministic video/render hooks, and use `expect.poll` to recapture until the existing JPEG comparison passes (at most five seconds). This experiment removes the additional two-second quiet period on successful comparisons. It retains the 0.1 per-pixel threshold, fewer than 0.1% differing pixels, and all existing JPEG baselines. Permanent differences still fail and retain the final actual/expected/diff images.

DOM actionability and a stable canvas rectangle do not establish GPU or asset readiness. Native `networkidle` remains a 500 ms heuristic; screenshot polling can observe late rendering but cannot make a missed one-shot animation callback run again. The frozen clock does not stop real-time intervals, so shorter waits can also change physics scenes. CI failure counts and images must be compared with the parent branch before adopting this experiment.

Thumbnail generation (`make-screenshot`) keeps the original Puppeteer boundaries: Chromium's navigation `networkIdle` lifecycle, two continuous seconds without requests, and browser-side render polling. A new thumbnail has no expected image against which to retry.

Failures retain `<example>-actual.jpg`, `-expected.jpg` and `-diff.jpg` in `test/e2e/output-screenshots` for the existing CI screenshot report. Playwright attaches the GPU identity, browser console and images to its test result. Traces are in `test/e2e/results`; inspect one with `npx playwright show-trace <trace.zip>`.

The exception list is in `exceptions.js`. An explicit example name overrides that list, preserving the screenshot maintenance workflow. An unmatched selection fails through Playwright’s standard no-tests check. `test-e2e-cov` checks that examples, screenshot thumbnails and `examples/files.json` have matching entries; it does not require a browser.
