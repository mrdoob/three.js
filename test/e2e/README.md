# Three.js end-to-end testing

### Motivation
Simplify code reviews with quick pixel testing inside CI. The same screenshots are used for thumbnails.

### Local usage
If you get an error in e2e test after PR and you sure that all is correct,
just make a new screenshot to example. As a last resort increase timeouts or add it to exception list.

```shell
# generate new screenshots for exact examples
npm run make-screenshot <example1_name> ... <exampleN_name>

# check exact examples
npm run test-e2e <example1_name> ... <exampleN_name>

# check all examples
npm run test-e2e
```

Merge only those commits that pass the tests, otherwise all next commits will also fail.

### How it works
- ci configs with parallelism
- deterministic random/timer/rAF/video for screenshots
- increased robustness with hided text, datgui, different flags and timeouts.
- pipeline: turn off rAF -> 'networkidle0' -> networkTax -> turn on rAF -> render promise
- added 3 progressive attempts for robustness

### Development progress

|           Travis                        |               Attempts               |
|-----------------------------------------|--------------------------------------|
| 61 from 362 failed, time=21:14          | networkidle0 timeout                 |
| 26 from 362 failed, time=16:22          | with rAF hook                        |
| 13=1+1+7+4 failed, time=4:26            | with render promise and parallelism  |
| 4=0+0+2+2 failed, time=5:13             | with network tax and other settings  |
| 4=0+0+2+2 failed, time=3:26             | with progressive attempts            |

### Status
97% examples are covered with tests. Check exception list for more information.

### Perf & VRAM regression

`perf-regression.js` measures JS heap, GC, frame timing, and WebGPU resource deltas for a given example. Useful for catching VRAM leaks, GC churn increases, or frame-time regressions introduced by a renderer change. The WebGPU device is wrapped in a page-side interceptor; no external tooling required.

```shell
# capture a baseline on one branch
node test/e2e/perf-regression.js baseline webgpu_backdrop_water

# switch branches, capture the candidate
node test/e2e/perf-regression.js candidate webgpu_backdrop_water

# compare
node test/e2e/perf-regression-compare.js baseline candidate webgpu_backdrop_water
```

Each run produces `test/e2e/perf-regression-<label>-<example>.json`. Optional args: `durationMs` (default 10000), `warmupMs` (default 3000).

Single-run numbers have measurement noise — for regression signals below ~5%, average 3 runs per branch (different `<label>` each run, then average the fields manually). Frame `p50/p95/p99/max`, JS heap `mean`/`max`, `gc.totalFreedBytes`, and all WebGPU resource deltas are the most repeatable signals.
