// Fixture that exercises only the functional Ray API on plain
// RayLike objects, with no Ray/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { rayCreate, rayAt, rayLookAt, rayDistanceSqToPoint } from '../..';

const ray = rayCreate();
rayLookAt( ray, { x: 1, y: 2, z: 3 }, ray );

const point = rayAt( ray, 1 );
const d = rayDistanceSqToPoint( ray, { x: 0, y: 0, z: 0 } );

console.log( point.x, d );
