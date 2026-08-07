// Fixture that exercises only the functional Euler API on plain
// EulerLike objects, with no Euler/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { eulerCreate, eulerReorder, eulerSet, eulerSetFromVector3 } from '../..';

const a = eulerSet( 0.4, - 0.2, 0.7, 'XYZ' );
const b = eulerCreate();

eulerSetFromVector3( { x: 0.1, y: 0.2, z: 0.3 }, 'YZX', b );
eulerReorder( a, 'ZXY', b );

console.log( b._x, b._y, b._z, b._order );
