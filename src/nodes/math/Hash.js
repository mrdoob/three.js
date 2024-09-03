import { Fn } from '../tsl/TSLBase.js';

export const hash = /*@__PURE__*/ Fn( ( [ seed ] ) => {

	// Taken from https://www.shadertoy.com/view/XlGcRh, originally from pcg-random.org

	const state = seed.toUint().mul( 747796405 ).add( 2891336453 );
	const word = state.shiftRight( state.shiftRight( 28 ).add( 4 ) ).bitXor( state ).mul( 277803737 );
	const result = word.shiftRight( 22 ).bitXor( word );

	return result.toFloat().mul( 1 / 2 ** 32 ); // Convert to range [0, 1)

} );
