// Fixture that exercises only the functional Cylindrical API on plain
// CylindricalLike objects, with no Cylindrical/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { cylindricalCreate, cylindricalSet, cylindricalSetFromCartesianCoords } from '../..';

const a = cylindricalCreate();
cylindricalSet( 2, Math.PI / 2, 1, a );
cylindricalSetFromCartesianCoords( 3, - 1, - 3, a );

console.log( a.radius, a.theta, a.y );
