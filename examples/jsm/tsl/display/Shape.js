import { Fn, float, length, smoothstep, uv } from 'three/tsl';

/**
 * Returns a radial gradient from center (white) to edges (black).
 * Useful for masking effects based on distance from center.
 *
 * @tsl
 * @function
 * @param {Node<float>} [scale=1.0] - Controls the size of the gradient (0 = all black, 1 = full circle).
 * @param {Node<float>} [softness=0.5] - Controls the edge softness (0 = hard edge, 1 = soft gradient).
 * @param {Node<vec2>} [coord=uv()] - The input UV coordinates.
 * @return {Node<float>} 1.0 at center, 0.0 at edges.
 */
export const circle = Fn( ( [ scale = float( 1.0 ), softness = float( 0.5 ), coord = uv() ] ) => {

	// Center UV coordinates (-0.5 to 0.5)
	const centered = coord.sub( 0.5 );

	// Calculate distance from center (0 at center, ~0.707 at corners)
	const dist = length( centered ).mul( 2.0 );

	// Calculate inner and outer edges based on scale and softness
	const outer = scale;
	const inner = scale.sub( softness.mul( scale ) );

	// Smoothstep for soft/hard transition
	return smoothstep( outer, inner, dist );

} );
