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
- one Chromium process is shared by the whole run; each example gets its own
  tab, opened right before it runs and closed right after, so no state
  (console listeners, request interception, DOM, storage, in-flight
  requests) leaks between examples. A `p-limit` limiter caps how many tabs
  actually run concurrently, giving real local parallelism instead of the
  old one-example-at-a-time loop. Concurrency defaults to the CPU core
  count, override with `E2E_WORKERS=<n>`. A small pool of tabs is kept
  pre-opened ahead of need, and closing a finished tab doesn't block the
  next example from starting.
- CI additionally shards across a 5-way job matrix (`CI=0..4`) - independent
  from the local concurrency within each job.
- deterministic random/timer/rAF/video for screenshots
- increased robustness with hided text, datgui, different flags and timeouts.
- pipeline: turn off rAF -> 'networkidle0' -> networkTax -> turn on rAF -> render promise
- on a `WebGPU Device Lost` error, the affected tab is closed and the
  example gets one retry in a brand-new tab before failing - no need to
  restart the shared browser process, since each example already runs in
  its own isolated tab.

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
