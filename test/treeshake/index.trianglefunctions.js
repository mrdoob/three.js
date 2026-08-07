// Fixture that exercises only the functional Triangle API on plain
// TriangleLike objects, with no Triangle/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { triangleCreate, triangleGetArea, triangleGetNormal, triangleSet } from '../..';

const t = triangleSet(
	{ x: 0, y: 0, z: 0 },
	{ x: 1, y: 0, z: 0 },
	{ x: 0, y: 1, z: 0 },
	triangleCreate()
);

const normal = triangleGetNormal( t.a, t.b, t.c );

console.log( triangleGetArea( t ), normal.z );
