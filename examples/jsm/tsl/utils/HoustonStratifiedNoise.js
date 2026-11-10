import { Fn, uint, vec4 } from 'three/tsl';

const hashUint = Fn( ( [ input ] ) => {

	const value = uint( input ).toVar();
	value.assign( value.bitXor( value.shiftRight( 16 ) ).mul( uint( 0x21f0aaad ) ) );
	value.assign( value.bitXor( value.shiftRight( 15 ) ).mul( uint( 0x735a2d97 ) ) );
	return value.bitXor( value.shiftRight( 15 ) );

} );

const pixelHash = ( x, y, seed ) => hashUint( x.mul( uint( 0x9e3779b1 ) ).bitXor( y.mul( uint( 0x85ebca77 ) ) ).bitXor( seed ) );

/**
 * Per-dimension temporal steps (0.32 fixed point) of Houston Stratified Noise (HSN), from the R2 and
 * R4 generalized golden ratio sequences. Each dimension needs its own step so a pixel's samples
 * don't line up over time.
 */
export const R2_STEPS = [ 3242174889, 2447445413 ];
export const R4_STEPS = [ 3679390609, 3152041523, 2700274805, 2313257605 ];

/**
 * Houston Stratified Noise (HSN): texture-free noise where each aligned 8×8 tile gets a scrambled
 * three-level hierarchical rank pattern and a hashed phase, shifted by a Weyl sequence over time.
 *
 * @param {Node<vec2>} coordinate - Pixel coordinates.
 * @param {Node<uint>} index - Frame or sample index.
 * @param {number} seed - Seed; use a different one per dimension.
 * @param {number} [step=2654435769] - Temporal step; use one of `R2_STEPS` or `R4_STEPS` per dimension.
 * @return {Node<float>} Sample in [0,1).
 */
export const houstonStratifiedNoise = ( coordinate, index, seed, step = 2654435769 ) => Fn( () => {

	const x = uint( coordinate.x ), y = uint( coordinate.y ), s = uint( seed );
	const rank = uint( 0 ).toVar();

	for ( let level = 0; level < 3; level ++ ) {

		const scramble = pixelHash( x.shiftRight( level + 1 ), y.shiftRight( level + 1 ), s.bitXor( uint( Math.imul( level + 1, 0x632be5ab ) >>> 0 ) ) );
		const a = x.shiftRight( level ).bitAnd( 1 );
		const b = y.shiftRight( level ).bitAnd( 1 );
		const low = scramble.bitAnd( 4 ).notEqual( 0 ).select( a, b );
		const child = a.bitXor( b ).shiftLeft( 1 ).bitOr( low );
		rank.assign( rank.bitOr( child.bitXor( scramble.bitAnd( 3 ) ).shiftLeft( 30 - 2 * level ) ) );

	}

	const phase = pixelHash( x.shiftRight( 3 ), y.shiftRight( 3 ), s.bitXor( uint( 0x02e5be93 ) ) );
	return rank.add( phase ).add( uint( index ).mul( uint( step ) ) ).shiftRight( 8 ).toFloat().div( 16777216 );

} )();

/**
 * Returns a TSL function that samples four independently seeded dimensions of Houston Stratified Noise.
 *
 * @param {UniformNode<Vector2>} resolution
 * @param {number} [seed=0] - Seeds the dimensions so each pass gets independent noise.
 */
export function bindHoustonStratifiedNoise( resolution, seed = 0 ) {

	return Fn( ( [ uvCoord, sampleIndex ] ) => {

		const pixel = uvCoord.mul( resolution ).floor();
		const dimension = ( k ) => houstonStratifiedNoise( pixel, sampleIndex, seed * 4 + k + 1, R4_STEPS[ k ] );

		return vec4( dimension( 0 ), dimension( 1 ), dimension( 2 ), dimension( 3 ) );

	} );

}
