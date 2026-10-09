# Native UV unwrapper development spike

## Research and decisions (before implementation)

[xatlas](https://github.com/jpcy/xatlas) is an MIT C++ library descended from thekla_atlas. Its [implementation](https://github.com/jpcy/xatlas/blob/master/source/xatlas/xatlas.cpp) separates chart construction, parameterization, packing, and source-vertex remapping. It extracts planar charts, grows charts using normal/seam/boundary costs, tries orthographic and least-squares conformal maps (LSCM), validates the result, and falls back to smaller piecewise charts. Its [API](https://github.com/jpcy/xatlas/blob/master/source/xatlas/xatlas.h) supports pixel padding, common texels-per-unit, multiple atlases, and raster-mask packing. These stages are the useful architectural inspiration; porting its entire implementation is incompatible with a small native JavaScript spike.

Blender's [UV operators](https://docs.blender.org/manual/en/latest/modeling/meshes/editing/uv.html) offer angle-based, conformal, and minimum-stretch flattening. [Blender 4.3](https://developer.blender.org/docs/release_notes/4.3/modeling/) added SLIM. ABF and SLIM require substantially more solver machinery. Use documented mathematical concepts; do not copy Blender's GPL implementation into this MIT project. The [LSCM paper](https://www.cs.jhu.edu/~misha/ReadingSeminar/Papers/Levy02.pdf) provides a compact conformal least-squares objective that can be solved with matrix-free conjugate gradients.

Lightmaps need unique scene-wide coverage, consistent world-space area per texel, and a pixel gutter large enough for the intended filtering. Dilating baked texels into gutters is the baker's job; no fixed gutter protects arbitrary mip levels. Character normal baking also needs deliberate seams, acceptable angular distortion, rest/bind-pose geometry, and a matching tangent convention. Keep existing material UVs unless explicitly replacing them. [Three.js MikkTSpace](../examples/jsm/utils/BufferGeometryUtils.js) should generate tangents after a UV0 replacement; the baker and renderer must agree on that basis.

Current Three.js attributes are `uv`, `uv1`, `uv2`, and `uv3`, with `Texture.channel` selecting 0–3. Default to `uv1` (the second channel), retain `uv` and its tangents, and pack all meshes in one global atlas. World transforms, including nonuniform scale, affect chart construction and area. Density is equal on average per chart; individual curved triangles can differ, so report the actual distortion.

## Implementation plan

1. Add `examples/jsm/utils/UVUnwrapper.js`, exporting `UVUnwrapper`. `unwrap(root, options)` accepts an in-memory Object3D hierarchy, clones geometry per mesh, and commits replacements only after the entire result succeeds. Return mesh/chart records, source vertex correspondence, atlas dimensions, density, and quality statistics. No renderer, network access, native binary, or WASM dependency.
2. Validate finite triangle geometry and options. Weld coincident positions for topology only; copy original vertex attributes without welding them. Cut boundaries, ambiguous/nonmanifold edges, material boundaries, and optional input UV seams. Preserve skin and morph attributes, groups, draw ranges, and triangle order. Reject unsupported instancing and GPU-only attributes explicitly.
3. Grow deterministic connected charts against a fixed normal cone. Orthographic projection is the lightmap fast path. A normal-bake preset tries an LSCM solve with two pins and matrix-free preconditioned conjugate gradients. Check orientation, local stretch, and positive-area triangle intersections. Split failed charts recursively, ultimately reaching individually valid triangles. Degenerate world triangles retain topology but consume no chart area.
4. Normalize each chart's UV area to world area, then fit padded chart rectangles into one square atlas with a common scale. Use an existing small rectangle packer where practical. Pixel borders stay fixed while fitting scale. Allow explicit texels-per-unit, failing if it does not fit rather than silently shrinking it. Report true triangle utilization.
5. Rebuild indexed geometry by `(original vertex, chart)` so seams add only necessary vertices. Copy all attribute storage, including interleaved and normalized data, and all morph targets. Remove stale tangents when explicitly overwriting `uv`.
6. Add `webgpu_unwrap.html` with selectable local glTF assets, checkerboard mapped through the output channel, atlas visualization, timing, and quality statistics. Include rigid, scene, and skinned character fixtures.
7. Independently test overlap, finite/range/orientation, preservation, density, malformed input, transformed shared geometry, solver behavior, and padding. Benchmark generated geometry and actual glTF assets. Verify the example with a hardware-backed context and record the adapter; SwiftShader results do not count.

## Scope and follow-up

This is a development spike, not a claim of parity with xatlas or artist-authored Blender character UVs. Automatic normal-cone charts sacrifice seam placement; rectangle packing sacrifices utilization. A single atlas may not meet density goals for huge scenes. Explicit failure lets callers partition scenes; multiple atlas pages, raster-mask packing, worker execution/cancellation, artist seam input, and SLIM-style refinement are follow-up work driven by measured results.

## Implemented API

```js
import { UVUnwrapper } from 'three/addons/utils/UVUnwrapper.js';

const result = new UVUnwrapper().unwrap( root, {
  mode: 'lightmap',
  attribute: 'uv1',
  resolution: 2048,
  padding: 4,
  texelsPerUnit: 0 // Fit one atlas; specify a positive density to require it.
} );

lightMap.channel = result.channel; // 1 for uv1.
```

`root` may itself be a Mesh. Meshes receive separate indexed geometry even when they originally shared it. Original geometry remains available in `result.meshes` and is not disposed, because other objects may still use it. `sourceVertices` maps each new vertex to its original vertex; `faceCharts` maps original triangle order to atlas charts. Exact zero-area faces retain their indices and receive zero UVs and chart index `-1`; they do not contribute bake area. Groups, draw ranges, morph attributes, normalized attributes, interleaved values, Float16 values, and skin attributes are preserved. Materials and transforms are not reassigned by the utility.

Lightmap mode uses bounded orthographic charts (maximum anisotropy 1.5 by default). Normal mode tries LSCM on broader charts (maximum anisotropy 2). `maxAreaRatio: 2` limits local UV area per world area to between half and twice the chart mean. Each chart is normalized by `sqrt(worldArea / uvArea)` before a common atlas scale is applied. This preserves *chart-average* density, not equal density on every curved triangle. `statistics` reports coverage, worst anisotropy, density range, and CPU time. Output validation permits 0.05% additional distortion for Float32 rounding.

`useInputUVs: true` first attempts existing UV islands, validating their shape and overlap, then tries LSCM or splits failures. Input UV seam endpoints remain distinct in the solver even when their positions coincide. This option reduces seams on tested characters, but can cost more time and need not improve distortion or packing. It is opt-in. Exact positional welding avoids unexpectedly joining nearby surfaces; nearly coincident vertices may remain disconnected. Material seams and input UV seams influence adjacency, but there is no separate artist seam-edge API in this spike.

Skinning and morphs are **evaluated in the supplied pose** for world-area measurements, using Three.js vertex evaluation and updated bind matrices. Raw geometry positions remain intact. This is necessary for glTF skins: measuring raw positions with only `matrixWorld` underestimates Xbot's area by a factor of 10,000. Set the intended rest/bind bake pose before unwrapping a character; the utility does not reset the skeleton or animate it. Moving/deforming the hierarchy later does not recompute the atlas or preserve the original density guarantees. Bones outside the hierarchy are updated before vertex evaluation.

For actual tangent-space normal baking, choose the UV channel used by the baker and rendering tangent basis. The easiest standard Three.js path is:

```js
const result = unwrapper.unwrap( characterInBakePose, {
  mode: 'normal', attribute: 'uv', useInputUVs: true, resolution: 2048
} );
// Old UV0 tangents were removed. Before baking/rendering the new normal map,
// generate a matching MikkTSpace basis for every result.meshes[i].geometry
// with BufferGeometryUtils.computeMikkTSpaceTangents and the bundled MikkTSpace.
```

`mode: 'normal'` selects parameterization; it does not bake a texture or generate tangents. The example intentionally previews both modes on `uv1`. Existing UV0 tangents must not be reused as the basis of a normal map baked against UV1. UV1 remains the recommended lightmap destination. Pixels in gutters must be dilated by the baker, and padding should be chosen for its filtering/mip policy.

All flattening and **actual Float32 atlas coordinates** are validated before any mesh geometry is replaced. Insufficient resolution for gutters, an explicit density that cannot fit, unsupported instancing/GPU-only attributes, and insufficient Float32 precision produce errors. The hallway fixture contains hundreds of nearly collinear triangles, some with aspect ratios exceeding a million to one. Both presets reject it with an actionable precision error, rather than returning collapsed, flipped, or overlapping bake triangles. Increasing atlas size does not necessarily solve normalized Float32 precision; repairing the slivers or partitioning the geometry is appropriate. No faces are silently discarded to make this fixture pass.

The implementation is approximately 830 lines including documentation and repository-style spacing, and reuses the existing ISC-licensed `potpack` addon. It adds no runtime package dependency, WASM download, or GPU dependency. The example's renderer and glTF decoder are separate from the unwrapper.

## Reproduction and results

Run from this worktree:

```sh
npm run test-uv-unwrapper
npm run benchmark-uv-unwrapper
node utils/server.js -p 8091
```

Open `http://localhost:8091/examples/webgpu_unwrap.html`. Select local repository glTF fixtures or scaled boxes, projection/conformal mode, atlas resolution, authored-island reuse, and checker/original materials. The atlas inset shows chart coverage. The hallway is deliberately included to make the precision limitation visible.

The [benchmark harness](../test/benchmarks/uv-unwrapper.js) checks a real adapter **before** rendering, audits every successful layout using independent triangle polygon clipping, and saves [raw results](../test/benchmarks/uv-unwrapper/results.json) and [screenshots](../test/benchmarks/uv-unwrapper/screenshots/). The unwrapper itself uses separating-axis intersection tests; the auditor independently checks output Float32 values, orientation, coverage, density, gutters, and stretch. Float32 intersection noise along shared edges is tolerated up to `max(1e-14, min(triangleAreas) * 1e-5)` in normalized UV area. These are floating-point geometry checks, not a formal exact-arithmetic proof.

Measured on Windows, AMD Ryzen 9 5950X, Chrome 154, NVIDIA GeForce RTX 3060 Ti, ANGLE/D3D11. WebGPU reported NVIDIA Ampere and `fallback: false`; WebGL's unmasked renderer identified the RTX 3060 Ti. No SwiftShader renderer or flag was used. Times below are the median of three warm CPU unwraps, excluding glTF download/decode, GPU rendering, and the independent audit. Cold timings and all raw samples are also recorded. Fixed 2048-square atlas, 4-pixel padding, default settings unless stated.

| Fixture | Triangles | Projection ms / charts / coverage | Conformal ms / charts / coverage | Conformal p95 / worst stretch |
| --- | ---: | --- | --- | --- |
| Damaged Helmet | 15,452 | 97.6 / 1,335 / 33.7% | 186.7 / 951 / 36.5% | 1.075 / 1.961 |
| Soldier | 11,376 | 84.4 / 1,478 / 37.1% | 195.9 / 961 / 39.9% | 1.118 / 1.961 |
| Xbot | 49,112 | 319.8 / 2,732 / 35.4% | 663.9 / 977 / 44.2% | 1.081 / 1.348 |
| Lee Perry Smith | 17,684 | 116.3 / 1,141 / 43.1% | 701.3 / 378 / 42.9% | 1.057 / 1.900 |

With authored-island reuse, Xbot used 629 charts and 45.8% coverage, but cost 1,512 ms and had p95 stretch 1.207. Reuse is useful seam guidance, not a guaranteed optimization. A 65,024-triangle generated sphere took approximately 0.5 seconds for projection and 2.24 seconds for conformal, with 38 and 40 charts respectively; conformal p95 stretch was 1.089. More faces can require more cuts because `maxChartFaces` bounds each solver/validation job.

| Generated scene, 4096 atlas | Triangles | Charts | Projection median ms | Triangle coverage |
| --- | ---: | ---: | ---: | ---: |
| 100 transformed shared-geometry boxes | 1,200 | 600 | 10.6 | 80.1% |
| 1,000 boxes | 12,000 | 6,000 | 87.8 | 60.8% |
| 10,000 boxes | 120,000 | 60,000 | 830.2 | 16.9% |

All 15 successful fixture/preset combinations, eight sphere scaling layouts, and three generated scenes passed the independent audit: zero positive-area overlaps above the stated tolerance, zero reversed/collapsed nondegenerate triangles, zero gutter violations, finite in-range UVs. Hallway failures are recorded separately. Eleven Node tests cover transformed shared geometries, exact density on differently scaled planes, curved parameterization, all attribute storage/remapping, morph and skin preservation, triangle order, nonindexed input, malformed input, atomic overflow/precision failures, degeneracy, nonmanifold topology, determinism, authored cylinder seams, and glTF-style bind matrices. ESLint passed on the touched JavaScript and HTML. The new Node tests are included in `npm test`; the full unrelated repository suite was not run for this addon spike.

## Assessment and next steps

The spike demonstrates a compact native implementation with valid bounded-distortion UVs on the tested assets. It does **not** establish parity with xatlas or Blender; neither was benchmarked head-to-head. Character seam placement still falls short of artist workflows, and rectangle coverage on organic fixtures is roughly 34–46%. World density is consistent per chart, within the documented local area variation, and the tool preserves the data needed for subsequent skinning and baking.

The 10,000-box case shows the large-scene constraint: 60,000 charts spend most of a fixed atlas on gutters, so density falls despite fast projection. Partition by spatial region/bake target and use multiple atlas pages to retain an explicit density budget. Worker execution with transfer-friendly geometry snapshots and cancellation should come before scaling this synchronous API to interactive production scenes. The spike does not measure peak memory or test million-triangle assets.

Next priorities are multiple pages and worker execution, then better chart growth/seam costs and raster-mask packing. Prefer those measured improvements to adding ABF/SLIM immediately: LSCM already gives low p95 angular distortion on tested characters, while chart boundaries and packing account for the larger remaining quality gaps. Keep Float32 validation and atomic output as invariants.
