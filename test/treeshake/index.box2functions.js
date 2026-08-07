// Fixture that exercises only the functional Box2 API on plain
// Box2Like objects, with no Box2/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { box2Create, box2ExpandByPoint, box2Set, box2Union } from '../..';

const a = box2Set( { x: 0, y: 0 }, { x: 1, y: 1 } );
const b = box2Create();

box2ExpandByPoint( a, { x: 2, y: 3 }, b );
box2Union( a, b, a );

console.log( a.min.x, a.max.y );
