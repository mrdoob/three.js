// Fixture that exercises only the functional Matrix2 API on plain
// Matrix2Like objects, with no Matrix2/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { mat2Create, mat2FromArray, mat2Identity, mat2Set } from '../..';

const a = mat2Create();
mat2Set( a, 11, 12, 21, 22 );
mat2FromArray( [ 1, 2, 3, 4 ], 0, a );
mat2Identity( a );

console.log( a.elements[ 0 ] );
