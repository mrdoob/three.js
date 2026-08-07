// Fixture that exercises only the functional Color API on plain
// ColorLike objects, with no Color/Object3D/renderer usage. Used to
// verify that consumers of the functional API do not pull in the rest
// of three.js (see test/rollup.treeshake.config.js).
import { colorCreate, colorSetHex, colorMultiply, colorGetHex } from '../..';
import { SRGBColorSpace } from '../..';

const a = colorCreate();
const b = colorSetHex( 0xff8800, SRGBColorSpace );

colorMultiply( a, b, a );

console.log( colorGetHex( a ) );
