// Fixture that exercises only the functional Plane API on plain
// PlaneLike objects, with no Plane/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { planeCreate, planeNormalize, planeDistanceToPoint, planeSetComponents } from '../..';

const a = planeSetComponents( 2, 0, 0, - 2, planeCreate() );
planeNormalize( a, a );

console.log( planeDistanceToPoint( a, { x: 4, y: 0, z: 0 } ) );
