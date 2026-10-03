# MikkTSpace

JavaScript port of [Morten S. Mikkelsen's MikkTSpace reference](https://github.com/mmikk/MikkTSpace/blob/3e895b49d05ea07e4c2133156cfa94369e19e409/mikktspace.c), specialized for the triangle input and tangent output used by `BufferGeometryUtils.computeMikkTSpaceTangents()`.

```js
import * as MikkTSpace from 'three/addons/libs/mikktspace.module.js';

const tangents = MikkTSpace.generateTangents( positions, normals, uvs );
```

The inputs are matching, non-indexed `Float32Array` attributes: three position and normal components, and two UV components per vertex. Input components should be finite and normals should be unit length. As in the reference, extreme magnitudes can overflow intermediate float32 arithmetic. The result contains four components per vertex: tangent XYZ and handedness W. `computeMikkTSpaceTangents()` handles indexed, normalized, and interleaved geometry attributes and negates W by default for conventions such as glTF.

`isReady` is always `true`: the JavaScript needs no initialization and nothing runs on import. A caller that awaits `ready` has `generateTangents()` run in the WebAssembly build below from then on (`ready` resolves to `false` where WebAssembly is unavailable, and the JavaScript keeps serving). `dispose()` releases the build and its memory; awaiting `ready` again brings it back.

The port retains attribute welding, connected orientation groups, angular subgroups, corner-angle weighting, float32 arithmetic, and degenerate-triangle fallback. Typed hash tables replace sorting and linear lookups, and projected derivatives and corner angles are reused within each group. It supports the reference's default 180-degree threshold and basic tangent output. Quads, custom thresholds, and bitangent/magnitude output are not exposed by this API.

## WebAssembly

The module also embeds a WebAssembly build of the port above, compiled from this file's JavaScript by [jz](https://github.com/dy/jz) (commit `a4e3da3a`; the two-line recipe is in the module). `generateTangents()` runs in it once `ready` resolves, and in JavaScript otherwise. Both give the same tangents: on `ShaderBall.glb` and on a 20,000-triangle random mesh every output component is the same bit under V8 and under JavaScriptCore (jz's `Math.acos` is fdlibm's, within one ulp of the engine's).

`ShaderBall.glb` (88,264 triangles), warm, least of 120 runs, copies in and out included:

| | JavaScript | WebAssembly |
| --- | --- | --- |
| Chrome 154 | 31.8 ms | 17.8 ms (1.8× faster) |
| Node 25.9 (V8) | 29.5 ms | 15.9 ms (1.9× faster) |
| Bun 1.3.14 (JavaScriptCore) | 15.1 ms | 16.4 ms (0.92×, slower) |

The build is 64 KB (28 KB gzipped) and uses no SIMD or tail calls, so it runs from Chrome 85, Firefox 78 and Safari 15. Where it cannot instantiate, or traps inside a call, the JavaScript answers. Every call returns its memory; an instance whose memory grew past 16 MB (a 200k-corner mesh needs 19 MB) is dropped after the call and remade for the next, so no more than that stays allocated between calls. `test/unit/addons/libs/MikkTSpace.tests.js` holds the two paths to the same tangents.

## Compatibility

This port intentionally corrects an edge-pairing defect in `BuildNeighborsFast()` in the upstream C revision linked above. Its two secondary sorting loops omit their final buckets. This can leave identical edges separated or use a different face order when pairing nonmanifold edges. The JavaScript implementation pairs all edges in face order.

This correction is part of the JavaScript port and is absent from the linked upstream C revision. For comparison, a local copy of that C revision was patched to add both missing final bucket sorts. The JavaScript output matches that locally patched copy on the tested inputs.

The bundled WASM implementation also contains this defect. Consequently, the new implementation can produce different tangents on affected meshes. For `ShaderBall.glb`, the preview mesh is identical; the calibration mesh changes at 129 corners, with a maximum angular difference of approximately 0.353 degrees and no handedness changes.

Completely collapsed triangles with no usable neighbor return the default `(1, 0, 0, -1)` already provided by the unmodified C reference. The previous WASM implementation could throw on these inputs. Empty input returns an empty array.

The original license is preserved in `mikktspace.module.js`, which is explicitly marked as an altered JavaScript port.
