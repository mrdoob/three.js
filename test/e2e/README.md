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

GitHub Actions retains the legacy Ubuntu Mesa configuration under xvfb to match its screenshot baselines. Use a physical GPU when verifying rendering quality locally. If the bundled Chromium cannot create a WebGPU device on Windows, try an installed Chrome channel.

One worker runs by default to avoid GPU contention. Playwright handles retries and replaces a failed worker's browser. Each example has its own context, console error checks and trace on failure. Increase workers explicitly when the hardware has enough capacity. CI uses Playwright's native sharding, independent of the `CI` environment variable.

Screenshot comparisons normally use Playwright's native `networkidle` navigation, deterministic video/render readiness, and `expect.poll` to recapture until the existing JPEG comparison passes (at most five seconds). This avoids an additional two-second quiet period on successful comparisons. JPEG baselines and comparison thresholds are unchanged; permanent mismatches still fail and retain the final actual/expected/diff images.

The `slowList` in `exceptions.js` adds a two-second wait before opening the render gate for examples with delayed loading, shader compilation or real-time timers. These examples are still tested and use the same navigation, video/render readiness, screenshot polling and comparison as other examples. Only the extra wait differs.

`make-screenshot` also waits the extra two seconds because a new thumbnail has no expected image against which to poll.

Playwright's DOM actionability checks do not establish GPU/asset readiness. Native network idle remains a heuristic, and screenshot polling cannot rerun an animation callback missed by the one-shot render gate. A scene captured before a timer or asynchronous setup finishes can remain wrong even while screenshots are retried; add such examples to `slowList` after comparing with the original method.

Failures retain `<example>-actual.jpg`, `-expected.jpg` and `-diff.jpg` in `test/e2e/output-screenshots` for the existing CI screenshot report. Playwright attaches the browser console and images to its test result. Traces are in `test/e2e/results`; inspect one with `npx playwright show-trace <trace.zip>`.

The exclusion list (`exceptionList`) and extra-wait list (`slowList`) are in `exceptions.js`. An explicit example name overrides that list, preserving the screenshot maintenance workflow. An unmatched selection fails through Playwright’s standard no-tests check. `test-e2e-cov` checks that examples, screenshot thumbnails and `examples/files.json` have matching entries; it does not require a browser.
