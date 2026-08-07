// Fixture that exercises only the functional Vector4 API on plain
// Vector4Like objects, with no Vector4/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { vec4Create, vec4Add, vec4Normalize, vec4Dot } from '../..';

const a = vec4Create();
const b = { x: 1, y: 2, z: 3, w: 4 };

vec4Add( a, b, a );
vec4Normalize( a, a );

console.log( vec4Dot( a, b ) );
