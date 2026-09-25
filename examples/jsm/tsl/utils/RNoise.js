import { float, Fn, fract, int, vec2, vec4 } from 'three/tsl';

/**
 * Returns a TSL function that samples texture-free analytic R² noise.
 * Index 0 uses continuous screen pixels; other indices tile-shift with an R²
 * sequence into a 64×64 period. Values are four independent R² dimensions
 * hashed from the sample coordinates.
 *
 * @param {UniformNode<Vector2>} resolution
 * @param {number} [seed=0] - Added to the coordinate hash so each pass gets an independent R² phase.
 */
export function bindAnalyticNoise( resolution, seed = 0 ) {

	const seedOffset = int( seed );

	const r4 = ( coords ) => {

		const P = 1.32471795724474602596;

		const t = coords.x.mul( 1 / P ).add( coords.y.mul( 1 / P ** 2 ) ).add( float( seed ) );

		return vec4(
			fract( t.mul( P ).mul( 1 / P ) ),
			fract( t.mul( P * 2 ).mul( 1 / P ** 2 ) ),
			fract( t.mul( P * 3 ).mul( 0.4198754210 ) ), // this is not 1 / P ** 3, however this magic constant gives better noise
			fract( t.mul( P * 4 ).mul( 1 / P ** 3 ) )
		);

	};

	return Fn( ( [ uvCoord, sampleIndex ] ) => {

		const index = int( sampleIndex ).add( seedOffset );
		const noise = vec4().toVar();

		const tileSize = float( 32 );

		const screenPixel = uvCoord.mul( resolution ).floor();
		const offset = fract( vec2(
			float( index ).mul( 0.7548776662 ),
			float( index ).mul( 0.5698402910 )
		) ).mul( tileSize ).floor();
		const coords = screenPixel.add( offset ).mod( tileSize );

		noise.assign( r4( coords ) );

		return noise;

	} );

}
