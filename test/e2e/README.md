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
- deterministic random and clocks in pages and workers
- deterministic page rAF and video for screenshots
- ignores browser input while preserving scripted DOM clicks
- freezes video playback, preserves explicit seeks, and waits for decoded frames
- increased robustness with hided text, datgui, different flags and timeouts.
- pipeline: turn off rAF -> 'networkidle0' -> video readiness -> networkTax -> turn on rAF -> render promise
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

### Native capture

Most examples are captured in Node instead of a browser: WebGL through
`@onirenaud/node-webgl` and WebGPU through `webgpu` (Dawn). The runner loads
the example's HTML module and import map as they are; examples need no edits.
Each capture is a separate process, and captures run in parallel (one per CPU
by default, `E2E_CONCURRENCY` overrides it), except WebGPU captures on Linux:
SwiftShader keeps every core busy on its own, so they run one at a time.
Requires Node 24 or newer.

```sh
npm ci
npm run build

# Check or regenerate exact examples (native when possible, Puppeteer otherwise).
npm run test-e2e -- webgl_loader_gltf_iridescence webgpu_compute_points
npm run make-screenshot -- webgl_loader_gltf_iridescence

# Run the native or the browser partition, as CI does.
npm run test-e2e -- --node
npm run test-e2e -- --browser

# Force Puppeteer, for instance to compare a native capture with the browser's.
npm run test-e2e -- --browser webgl_loader_gltf_iridescence
```

[`browser-examples.js`](./browser-examples.js) lists the examples captured with
Puppeteer and why: DOM layout, XML and SVG parsing, canvas 2D, media, module
workers, page composition, image formats beyond PNG and JPEG, and the driver
differences below. Every other example runs natively. Without example names,
`--node` and `--browser` select one partition; `--node` fails when an unlisted
example turns out to need the browser and prints the reason to add to the list.
Without either flag, such an example falls back to Puppeteer. Rendering, shader,
device, asset and pixel errors fail the test; they never select the browser.

Both paths share the deterministic random and clock injection, the screenshot
size, the JPEG writer, the comparison, the failure artifacts and the baselines.
Timers of up to two seconds run before the first frame, like the browser's
startup window, and intervals are replayed on a virtual clock (the ticks Chrome
fires while waiting for the network to settle), so physics and spawner examples
reach the browser's state without waiting.

The baselines are what Chrome renders on the `ubuntu-latest` runners, and the
native captures match that environment:

- WebGPU runs Dawn on SwiftShader, the CPU Vulkan driver Chrome bundles, shipped
  by `@onirenaud/swiftshader-vulkan`. Without it the Vulkan loader's default
  driver is used (Mesa's lavapipe on the runners, which renders some examples
  differently and crashes on a few shaders); `VK_DRIVER_FILES` overrides the choice.
- WebGL runs on Mesa llvmpipe through node-webgl on a desktop OpenGL core
  profile, the context type Chrome's ANGLE drives on the runners, so wide points
  and lines are clipped exactly like in the browser (Mesa's OpenGL ES contexts
  clip them after widening, which showed on sprites at the viewport edge and on
  helper lines crossing the near plane). The native context exposes exactly the
  WebGL extensions Chrome exposes there, so compressed-texture examples pick the
  same formats. Chrome compiles ANGLE's translation of the GLSL ES shaders where
  node-webgl hands them to Mesa unchanged; three examples show that in a few
  pixels (equirect background sampling, ray marching) and stay in the browser list.
- JPEG textures are decoded with libjpeg-turbo (`@cwasm/jpeg-turbo`), which is
  what Chrome uses, ignoring embedded ICC profiles as WebGL uploads do.
  Pure-JavaScript decoders differ by a few levels on about half of the samples,
  enough to move sampling positions when a texture drives them.

CI runs two native shards and four Puppeteer shards. `CI` selects the zero-based
shard and `E2E_SHARDS` the partition's shard count; shards are interleaved so
heavy examples spread evenly. Native shards install no Chrome and need no xvfb.
On Linux they need `libegl1`, `libgles2`, `libgl1-mesa-dri`, `mesa-vulkan-drivers`
and a C++ toolchain for node-webgl's install script. Windows has not been validated.
