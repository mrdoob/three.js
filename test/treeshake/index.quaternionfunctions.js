// Fixture that exercises only the functional Quaternion API on plain
// QuaternionLike objects, with no Quaternion/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { quatCreate, quatMultiply, quatNormalize, quatSlerp, quatSet } from '../..';

const a = quatCreate();
const b = quatSet( 0, Math.sin( Math.PI / 4 ), 0, Math.cos( Math.PI / 4 ) );

quatMultiply( a, b, a );
quatNormalize( a, a );
quatSlerp( a, b, 0.5, a );

console.log( a._x, a._y, a._z, a._w );
