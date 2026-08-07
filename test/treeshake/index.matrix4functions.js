// Fixture that exercises only the functional Matrix4 API on plain
// Matrix4Like objects, with no Matrix4/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { mat4Create, mat4Compose, mat4Invert, mat4Multiply } from '../..';

const a = mat4Create();
const b = mat4Create();

mat4Compose( { x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0, w: 1 }, { x: 1, y: 1, z: 1 }, a );
mat4Multiply( a, b );
mat4Invert( a, b );

console.log( b.elements[ 0 ] );
