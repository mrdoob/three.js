// Fixture that exercises only the functional Box3 API on plain
// Box3Like objects, with no Box3/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { box3Create, box3ExpandByPoint, box3Set, box3Union } from '../..';

const a = box3Set( { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 } );
const b = box3Create();

box3ExpandByPoint( a, { x: 2, y: 3, z: 4 }, b );
box3Union( a, b, a );

console.log( a.min.x, a.max.z );
