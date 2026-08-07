// Fixture that exercises only the functional Line3 API on plain
// Line3Like objects, with no Line3/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { line3Create, line3Set, line3GetCenter, line3DistanceSq } from '../..';

const line = line3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 4, z: 6 }, line3Create() );
const center = line3GetCenter( line );

console.log( center.x, line3DistanceSq( line ) );
