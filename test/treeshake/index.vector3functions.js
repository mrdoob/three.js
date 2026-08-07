// Fixture that exercises only the functional Vector3 API on plain
// Vector3Like objects, with no Vector3/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { vec3Create, vec3Add, vec3Normalize, vec3Dot } from '../..';

const a = vec3Create();
const b = { x: 1, y: 2, z: 3 };

vec3Add( a, b, a );
vec3Normalize( a, a );

console.log( vec3Dot( a, b ) );
