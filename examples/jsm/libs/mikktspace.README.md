# MikkTSpace

JavaScript port of [Morten S. Mikkelsen's MikkTSpace reference](https://github.com/mmikk/MikkTSpace/blob/3e895b49d05ea07e4c2133156cfa94369e19e409/mikktspace.c), specialized for the triangle input and tangent output used by `BufferGeometryUtils.computeMikkTSpaceTangents()`.

```js
import * as MikkTSpace from 'three/addons/libs/mikktspace.module.js';

const tangents = MikkTSpace.generateTangents( positions, normals, uvs );
```

The inputs are matching, non-indexed `Float32Array` attributes: three position and normal components, and two UV components per vertex. Input components should be finite and normals should be unit length. As in the reference, extreme magnitudes can overflow intermediate float32 arithmetic. The result contains four components per vertex: tangent XYZ and handedness W. `computeMikkTSpaceTangents()` handles indexed, normalized, and interleaved geometry attributes and negates W by default for conventions such as glTF.

There is no initialization or WebAssembly dependency. The `isReady` and `ready` exports remain available for existing callers; `isReady` is always `true` and `ready` is an already resolved promise. `dispose()` is retained as a no-op because there are no persistent buffers to release.

The port retains attribute welding, connected orientation groups, angular subgroups, corner-angle weighting, float32 arithmetic, and degenerate-triangle fallback. Typed hash tables replace sorting and linear lookups, and projected derivatives and corner angles are reused within each group. It supports the reference's default 180-degree threshold and basic tangent output. Quads, custom thresholds, and bitangent/magnitude output are not exposed by this API.

## Compatibility

This port intentionally corrects an edge-pairing defect in `BuildNeighborsFast()` in the upstream C revision linked above. Its two secondary sorting loops omit their final buckets. This can leave identical edges separated or use a different face order when pairing nonmanifold edges. The JavaScript implementation pairs all edges in face order.

This correction is part of the JavaScript port and is absent from the linked upstream C revision. For comparison, a local copy of that C revision was patched to add both missing final bucket sorts. The JavaScript output matches that locally patched copy on the tested inputs.

The bundled WASM implementation also contains this defect. Consequently, the new implementation can produce different tangents on affected meshes. For `ShaderBall.glb`, the preview mesh is identical; the calibration mesh changes at 129 corners, with a maximum angular difference of approximately 0.353 degrees and no handedness changes.

Completely collapsed triangles with no usable neighbor return the default `(1, 0, 0, -1)` already provided by the unmodified C reference. The previous WASM implementation could throw on these inputs. Empty input returns an empty array.

The original license is preserved in `mikktspace.module.js`, which is explicitly marked as an altered JavaScript port.
