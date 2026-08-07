// Fixture that exercises only the functional Spherical API on plain
// SphericalLike objects, with no Spherical/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { sphericalCreate, sphericalMakeSafe, sphericalSetFromCartesianCoords } from '../..';

const a = sphericalCreate();
sphericalSetFromCartesianCoords( 1, 2, 3, a );
sphericalMakeSafe( a, a );

console.log( a.radius, a.phi, a.theta );
