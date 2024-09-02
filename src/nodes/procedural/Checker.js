import { uv } from '../accessors/UV.js';
import { Fn } from '../tsl/TSLBase.js';

export const checker = /*@__PURE__*/ Fn( ( [ coord = uv() ] ) => {

	const uv = coord.mul( 2.0 );

	const cx = uv.x.floor();
	const cy = uv.y.floor();
	const result = cx.add( cy ).mod( 2.0 );

	return result.sign();

} );
