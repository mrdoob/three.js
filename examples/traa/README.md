# TRAA challenges

Open `examples/webgl_postprocessing_traa.html` with the example server. Select
WebGL or WebGPU in the GUI; the backend selector reloads the page. Both runners
use `scene.js`, the same materials, geometry, camera and analytic animations.
The WebGL runner uses GBufferPass + TRAAPass; WebGPU uses the existing TRAANode.
MSAA is disabled in both the canvas and scene render targets. Neither implementation was upgraded beyond the new WebGL port.

The glossy knot uses a periodic tangent-space wave normal texture and the existing Venice sunset
HDR environment for colored reflections. That environment is also the opaque
background; the transparency toggle removes the visible background while keeping
it for lighting/reflections. **Surface waves** adjusts the normal strength; zero
shows the smooth knot for comparison. Wave frequency is three times the initial
normal-map pattern in both texture directions. The waves affect shading, not the silhouette.

**Render resolution** scales the canvas drawing buffer relative to device pixels
(100%, 75%, 50%, 25%, or 12.5%), keeping its CSS size unchanged. On a 2× Retina
screen, 50% gives one render pixel per CSS pixel; 25% gives half that resolution.
Both TRAA implementations resolve at that lower resolution before the browser
scales the canvas for display. This is ordinary downsampling for testing, not
TRAA upscaling. The WebGPU canvas and scene pass use matching resolutions so
camera jitter remains one fraction of an actual render pixel. Changing the scale
resets history. The status line shows the drawing-buffer dimensions and MSAA state.
The 2× reference renders twice the selected resolution in each dimension.

## Repeatable visual checks

Keep **Fixed 1/60 step** enabled, choose a speed, and restart at t=0 for each run.
Pause freezes scene motion while temporal accumulation continues. **step** advances
scene time by 1/60 second. Compare **TRAA enabled** with no AA and with **2× size
reference (no AA)** at the same paused time. The reference renders twice the width
and height (four samples per display pixel), then downsamples: it is a useful
spatial reference, not converged ground truth. Renderer/material/backend differences
also affect the comparison. Reference mode disables temporal accumulation.

| Challenge | Watch for |
| --- | --- |
| Static fine checker and thin diagonal bars | Shimmer, detail loss, slow convergence, unstable silhouettes |
| Linear translation | Trails, blur, sign errors in motion, subpixel phase changes |
| Rotating checker/spokes | Rotational motion accuracy; disappearing thin features |
| Wavy glossy knot, colored HDR environment, moving light | Specular shimmer and history lag; shading/reflections move differently from geometry |
| Opposing bars and checker | Mixed motion at silhouettes, foreground velocity dilation, ghost trails |
| Approaching patterned plane | Scale changes, rapidly changing pixel footprints, texture aliasing |
| Rotating finned cavity | Repeated disocclusion, fresh surface history rejection, color leaking between surfaces |
| Alpha cutout and overlapping blended sheet | Coverage mismatch, multi-layer motion, transparency trails |
| Morphing mesh and moving instances | Missing previous deformation/instance transforms; differing backend coverage |

Camera **Pan**, **Orbit** and **Zoom** add camera motion to all the object motion.
**cameraCut** jumps camera position and explicitly resets history. Resize also
resets history. Toggle **transparentBackground** to composite the canvas over a
CSS checkerboard: inspect alpha fringes, halos and silhouettes, not just RGB.
A CSS background has no motion vectors and must never become scene history.
Blended geometry is a separate challenge: a single opaque depth/velocity field
cannot describe both the foreground layer and the surface behind it.

Useful automated checks are velocity readbacks with known transforms, history
rejection after disocclusion/cuts/resizes, zero motion during camera jitter,
projection restoration after render failure, and a resolve that demonstrably uses
valid history. These are in `test/unit/addons/postprocessing/TRAAPass.tests.js`.
Run `node test/e2e/traa.js` for both backend smoke checks, GUI transitions, resize
and screenshots saved to the system temporary directory. These checks test
correctness, not perceptual quality. For image-quality evaluation,
capture synchronized sequences and compare temporal flicker, trail length and
edge sharpness against a stronger supersampled reference. A single still image
cannot establish whether motion is stable. This example's frame counter counts
render calls and is not a GPU throughput benchmark.

## WebGL port compared with TSL

There was no WebGL TRAAPass in this checkout. TAARenderPass explicitly accumulates
without reprojection and targets static scenes. The new TRAAPass follows the
TSL implementation's 32-sample Halton jitter, nearest-depth 3×3 velocity selection,
RGB variance/AABB clipping, motion-dependent current-frame weight, optional
subpixel correction and luminance-weighted blending. Both use bilinear color
history and resolve at native resolution; neither is a temporal upscaler.

| Area | WebGL TRAAPass | Existing TSL TRAANode |
| --- | --- | --- |
| Integration | EffectComposer; caller uses renderFrame() to jitter all passes | RenderPipeline before/after hooks manage jitter |
| Motion | Optional GBuffer MRT; rigid meshes and camera, no extra geometry draw for velocity | Renderer VelocityNode handles previous object/deformation state |
| History depth | Float color attachment ping-ponged with color; no depth texture copies | Retained depth texture with copy/update logic |
| Rejection | Compare saved depth to predicted previous surface depth in velocity B; reject either sign, including edges | Reconstruct previous depth into current view; one-sided rejection, with edge exception |
| First frame/reset | Explicit current-only first resolve; reset() handles cuts | Resize reinitializes color history; example recreates node for explicit cuts |
| Camera jitter | Matrix offsets preserve custom projection and cropped views; restored with try/finally | setViewOffset()/clearViewOffset() via pipeline hooks |
| Depth conventions | Conventional WebGL depth only, like GBufferPass | Includes reversed/logarithmic depth conversion |
| Deformation | Skinned, morphing, instanced and batched meshes invalidate history conservatively | Broader renderer-integrated velocity support; evaluate each deformation path |

The WebGL port's conservative rejection avoids knowingly retaining wrong history,
but loses accumulation on unsupported motion and may shimmer more at edges. Its
BA metadata costs bandwidth, and float depth history costs memory. TSL has better
renderer integration and motion coverage. Neither has a reactive transparency
mask, shading-change classification, bicubic history reconstruction or a dedicated
high-quality current-sample reconstruction filter. Bilinear history tends to
soften detail under repeated reprojection. Shader-level differences above are
observable design differences, not measured quality/performance rankings.

Recommended follow-up work (not implemented): prior deformation and per-instance
motion in GBufferPass; reactive masks for changing highlights/transparency;
Catmull–Rom history reconstruction; filtered current-frame reconstruction; stronger
history confidence/disocclusion handling with a common test protocol. Compare
changes in motion sequences before choosing a sharper or more stable default.

## Current reference approaches

There is no single universally best TRAA. Modern temporal reconstruction includes
native-resolution TAA, temporal upscalers and learned reconstruction, with different
compute, memory, hardware and integration constraints:

- [Epic TSR](https://dev.epicgames.com/documentation/en-us/unreal-engine/temporal-super-resolution-in-unreal-engine)
  uses shading rejection, flicker analysis, higher-resolution history and history
  resurrection. These target detail and stability, at higher history/processing cost.
- [AMD's temporal FSR integration](https://gpuopen.com/manuals/fsr_sdk/techniques/super-resolution-temporal/)
  documents motion/depth conventions, exposure, reactive and transparency/composition
  masks. These are useful design references for portable temporal reconstruction.
- [AMD FSR Upscaling 4.1.1](https://gpuopen.com/manuals/fsr_sdk/techniques/super-resolution-ml/)
  and [NVIDIA DLSS / DLAA](https://developer.nvidia.com/rtx/dlss) represent learned
  reconstruction approaches. NVIDIA documents second-generation transformer models
  in DLSS 4.5. These require native SDK/hardware integration; they are not drop-in
  Three.js browser passes. Their vendor claims do not establish a universal winner.

Practical algorithm references:
[Alex Tardif's TAA starter pack](https://alextardif.com/TAA.html),
[Emilio López's temporal AA walkthrough](https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/),
and [the temporal AA survey](https://onlinelibrary.wiley.com/doi/full/10.1111/cgf.14018).
