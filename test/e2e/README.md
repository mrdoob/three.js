# Three.js end-to-end testing

You probably shouldn't run this tests on PC because it's not optimized for local usage and
you can get different results on different GPUs. Goal is to make quick automated testing
inside CI and keep screenshot pack updated for it.

### Local usage
```shell
# generate new screenshots
npm run make-screenshot <example1_name> ... <exampleN_name>

# check examples
npm run test-e2e <example1_name> ... <exampleN_name>

# check all examples in browser
npx cross-env VISIBLE=ture npm run test-e2e
```

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
97% examples are covered with tests. Random robusness in CI >93%. Robustness on different machines ~97%.
For example on integrated GPU you can have additional artifacts: webgl_materials_texture_anisotropy,
webgl_postprocessing_procedural, webgl_shaders_tonemapping.

### Wrong screenshots but ok for CI
webgl_loader_bvh, webgl_simple_gi, webgl_postprocessing_dof2, webgl_loader_texture_pvrtc, webgl_physics_volume

### Contribution
Proper determinism for video/audio is welcome. You can cover more examples: `dof2` can be rendered with 2 rAF,
`offsceencanvas`/`webgl_test_memory2` with additional puppeteer flags, `webgl_simple_gi` with
[beginFrame](https://chromedevtools.github.io/devtools-protocol/tot/HeadlessExperimental) CDP API.
