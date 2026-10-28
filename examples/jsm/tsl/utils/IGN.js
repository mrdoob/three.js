import { Fn, float, frameId, screenCoordinate, uint } from 'three/tsl';

const hashUint = Fn( ( [ input ] ) => {

	const value = uint( input ).toVar();
	value.assign( value.bitXor( value.shiftRight( 16 ) ).mul( uint( 0x21f0aaad ) ) );
	value.assign( value.bitXor( value.shiftRight( 15 ) ).mul( uint( 0x735a2d97 ) ) );
	return value.bitXor( value.shiftRight( 15 ) );

} );

/**
 * Animated interleaved gradient noise (Jimenez), with the 5.588238-pixel
 * diagonal temporal scroll described by Jorge Jimenez / Demofox. No texture
 * or startup generation is required.
 *
 * Floating-point precision limits large coordinates and frame indices; reset
 * the index when history resets. Local stratification is approximate; this
 * scalar sequence is not an optimized spatiotemporal blue noise mask.
 *
 * References:
 * - Jorge Jimenez, Next Generation Post Processing (SIGGRAPH 2014):
 *   {@link https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/}
 * - Alan Wolfe (Demofox), temporal scroll:
 *   {@link https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/}
 *
 * @param {Node<vec2>} [coordinate=screenCoordinate] - Nonnegative integer pixel coordinates.
 * @param {Node<uint>} [index=frameId] - Temporal sample index.
 * @param {Node<uint>|number} [seed=1] - Fixed random seed.
 * @return {Node<float>} Scalar sample in [0,1).
 */
export const animatedIGN = ( coordinate = screenCoordinate, index = frameId, seed = 1 ) => Fn( () => {

	const shift = float( index ).mul( 5.588238 );
	const offset = hashUint( uint( seed ) ).shiftRight( 8 ).toFloat().div( 16777216 ).mul( 256 );
	const px = uint( coordinate.x ).toFloat().add( shift ).add( offset );
	const py = uint( coordinate.y ).toFloat().add( shift ).add( offset );
	return px.mul( 0.06711056 ).add( py.mul( 0.00583715 ) ).fract().mul( 52.9829189 ).fract();

} )();
