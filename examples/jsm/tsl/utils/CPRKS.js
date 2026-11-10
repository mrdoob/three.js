import { Fn, float, uint, vec2, vec3, vec4 } from 'three/tsl';

const pcg = Fn( ( [ input ] ) => {

	const state = uint( input ).mul( uint( 747796405 ) ).add( uint( 2891336453 ) ).toConst();
	const word = state.shiftRight( state.shiftRight( 28 ).add( 4 ) ).bitXor( state ).mul( uint( 277803737 ) ).toConst();
	return word.shiftRight( 22 ).bitXor( word );

} );

/**
 * Per-dimension temporal steps (0.32 fixed point) from the R2 and R4 generalized
 * golden ratio sequences. Each dimension needs its own step so a pixel's samples
 * don't line up over time. Use `R2_STEPS` for two values and `R4_STEPS` for four.
 */
export const R2_STEPS = [ 3242174889, 2447445413 ];
export const R4_STEPS = [ 3679390609, 3152041523, 2700274805, 2313257605 ];

/**
 * Cranley–Patterson-rotated Kronecker sequence (CPRKS): texture-free noise with
 * PCG-hashed per-pixel offsets and a separate temporal step for each dimension.
 *
 * @param {Node<vec2>} coordinate - Pixel coordinates.
 * @param {Node<uint>} index - Frame or sample index.
 * @param {number} seed - Seeds the per-pixel offsets.
 * @param {Array<number>} [steps=R4_STEPS] - One to four per-dimension temporal steps.
 * @return {Node} A float, vec2, vec3 or vec4 of samples in [0,1), matching the step count.
 */
export const cprks = ( coordinate, index, seed, steps = R4_STEPS ) => Fn( () => {

	let state = pcg( uint( coordinate.x ).add( pcg( uint( coordinate.y ).add( pcg( uint( seed ) ) ) ) ) ).toConst();

	const values = steps.map( ( step, k ) => {

		if ( k > 0 ) state = pcg( state ).toConst();
		return state.add( uint( index ).mul( uint( step ) ) ).shiftRight( 8 ).toFloat().div( 16777216 );

	} );

	return [ float, vec2, vec3, vec4 ][ steps.length - 1 ]( ...values );

} )();

/**
 * Returns a TSL function that samples four dimensions of CPRKS noise.
 *
 * @param {UniformNode<Vector2>} resolution
 * @param {number} [seed=0] - Seeds the offsets so each pass gets independent noise.
 * @return {Function} Takes a uv and a frame or sample index, returns a `vec4` of samples in [0,1).
 */
export function bindCPRKS( resolution, seed = 0 ) {

	return Fn( ( [ uvCoord, sampleIndex ] ) => {

		const pixel = uvCoord.mul( resolution ).floor();
		return cprks( pixel, sampleIndex, seed );

	} );

}
