# Three.js automatic regression testing with CI

You probably shouldn't run this tests on PC because right now it's not optimized for local usage and you can get different results on different GPUs. Goal is to make quick automated testing inside CI and keep screenshot pack updated for it.

### Local usage
```shell
# generate new screenshots
npm run make-screenshot <example1_name> ... <exampleN_name>

# check examples
npm run test-diff <example1_name> ... <exampleN_name>

# check all examples in browser
npx cross-env VISIBLE=ture npm run test-diff
```

### How it works
- ci configs with parallelism
- deterministic random/timer/rAF/video for screenshots
- increased robustness with hided text, datgui, different flags and timeouts.
- pipeline: turn off rAF -> 'networkidle0' -> networkTax -> turn on rAF -> render promise
- added 3 progressive attempts for robustness

### Status
97% examples are covered with tests. Random robusness in CI ~85%. Robustness on different machines ~97%. For example in Windows webgl_effects_ascii example always fails or on integrated GPU you will have additional artifacts: webgl_materials_texture_anisotropy, webgl_postprocessing_procedural, webgl_shaders_tonemapping.

### Probably wrong screenshots
webgl2_multisampled_renderbuffers, webgl_simple_gi, webgl_postprocessing_dof2, webgl_loader_texture_pvrtc

### Contribution
You can help to simplify puppeteer script by suggesting example with [HeadlessExperimental.beginFrame](https://chromedevtools.github.io/devtools-protocol/tot/HeadlessExperimental) CDP API.
