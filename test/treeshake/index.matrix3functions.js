// Fixture that exercises only the functional Matrix3 API on plain
// Matrix3Like objects, with no Matrix3/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { mat3Create, mat3Invert, mat3MakeRotation, mat3Multiply } from '../..';

const a = mat3Create();
const b = mat3MakeRotation( Math.PI / 4 );

mat3Multiply( a, b );
mat3Invert( a, b );

console.log( b.elements[ 0 ] );
