// Fixture that exercises only the functional Vector2 API on plain
// Vector2Like objects, with no Vector2/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { vec2Create, vec2Add, vec2Normalize, vec2Dot } from '../..';

const a = vec2Create( 3, 4 );
const b = vec2Create( 1, 2 );

vec2Add( a, b, a );
vec2Normalize( a, a );

console.log( vec2Dot( a, b ) );
