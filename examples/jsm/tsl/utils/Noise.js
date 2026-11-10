import { Fn, array, float, fract, interleavedGradientNoise, rand, uint, vec2, vec4 } from 'three/tsl';
import { bindAnalyticNoise } from './RNoise.js';
import { animatedInterleavedGradientNoise } from './IGN.js';
import { bindHierarchicalHashedWeyl } from './HierarchicalHashedWeyl.js';

/** Noise algorithms available to screen-space effects. */
export const noiseAlgorithms = {
	'Analytic R²': 0,
	'Interleaved Gradient Noise': 1,
	'Animated Gradient Noise': 2,
	'Hierarchical Hashed Weyl': 3
};

/**
 * Binds four noise components to an effect's pixel resolution and selected algorithm.
 * Offset IGN components are correlated; HHW provides independently seeded dimensions.
 *
 * @param {Node<vec2>} resolution - Effect resolution.
 * @param {number} algorithm - Index in `noiseAlgorithms`.
 * @param {number} [seed=0] - Independent phase for each pass.
 * @return {Function} TSL sampler accepting UV coordinates and a sample index.
 */
export function bindNoise( resolution, algorithm, seed = 0 ) {

	if ( algorithm === 0 ) return bindAnalyticNoise( resolution, seed );
	if ( algorithm === 3 ) return bindHierarchicalHashedWeyl( resolution, seed );

	return Fn( ( [ uvCoord, index ] ) => {

		const pixel = uvCoord.mul( resolution ).floor();

		if ( algorithm === 1 ) {

			// The SSGI spatial pattern and temporal schedules, with a normalized ray offset.
			const direction = interleavedGradientNoise( pixel );
			const offset = float( 0.25 ).mul( pixel.y.sub( pixel.x ).toInt().bitAnd( 3 ) );
			const rotation = array( [ 1 / 6, 5 / 6, 3 / 6, 4 / 6, 2 / 6, 0 ] ).element( uint( index ).mod( 6 ) );
			const temporal = uint( index ).mod( 4 );
			const shift = float( temporal.bitAnd( 1 ) ).mul( 0.5 ).add( float( temporal.shiftRight( 1 ) ).mul( 0.25 ) );
			return vec4( fract( direction.add( rotation ) ), fract( offset.add( shift ) ), rand( uvCoord.add( rotation.mul( 0.02 ) ).mul( 2 ).sub( 1 ) ), interleavedGradientNoise( pixel.add( vec2( 17, 31 ) ) ) );

		}

		const position = pixel.add( seed );
		return vec4(
			animatedInterleavedGradientNoise( position, index ),
			animatedInterleavedGradientNoise( position.add( vec2( 5.588238, 3.14159 ) ), index ),
			animatedInterleavedGradientNoise( position.add( vec2( 17, 31 ) ), index ),
			animatedInterleavedGradientNoise( position.add( vec2( 47, 59 ) ), index )
		);

	} );

}
