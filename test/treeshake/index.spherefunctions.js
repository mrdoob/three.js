// Fixture that exercises only the functional Sphere API on plain
// SphereLike objects, with no Sphere/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { sphereCreate, sphereSet, sphereExpandByPoint, sphereUnion } from '../..';

const a = sphereCreate();
const b = sphereSet( { x: 2, y: 0, z: 0 }, 1 );

sphereExpandByPoint( a, { x: 1, y: 0, z: 0 }, a );
sphereUnion( a, b, a );

console.log( a.radius );
