import { Fn, float, vec2, vec3, sin, screenUV, mix, clamp, dot, convertToTexture, time, uv, select } from 'three/tsl';
import { circle } from './Shape.js';

/**
 * Creates barrel-distorted UV coordinates.
 * The center of the screen appears to bulge outward (convex distortion).
 *
 * @tsl
 * @function
 * @param {Node<float>} [curvature=0.1] - The amount of curvature (0 = flat, 0.5 = very curved).
 * @param {Node<vec2>} [coord=uv()] - The input UV coordinates.
 * @return {Node<vec2>} The distorted UV coordinates.
 */
export const barrelUV = Fn( ( [ curvature = float( 0.1 ), coord = uv() ] ) => {

	// Center UV coordinates (-1 to 1)
	const centered = coord.sub( 0.5 ).mul( 2.0 );

	// Calculate squared distance from center
	const r2 = dot( centered, centered );

	// Barrel distortion: push center outward (bulge effect)
	const distortion = float( 1.0 ).sub( r2.mul( curvature ) );

	// Calculate scale to compensate for edge expansion
	// At corners r² = 2, so we scale by the inverse of corner distortion
	const cornerDistortion = float( 1.0 ).sub( curvature.mul( 2.0 ) );

	// Apply distortion and compensate scale to keep edges aligned
	const distorted = centered.div( distortion ).mul( cornerDistortion ).mul( 0.5 ).add( 0.5 );

	return distorted;

} );

/**
 * Checks if UV coordinates are inside the valid 0-1 range.
 * Useful for masking areas inside the distorted screen.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} coord - The UV coordinates to check.
 * @return {Node<float>} 1.0 if inside bounds, 0.0 if outside.
 */
export const barrelMask = Fn( ( [ coord ] ) => {

	const outOfBounds = coord.x.lessThan( 0.0 )
		.or( coord.x.greaterThan( 1.0 ) )
		.or( coord.y.lessThan( 0.0 ) )
		.or( coord.y.greaterThan( 1.0 ) );

	return select( outOfBounds, float( 0.0 ), float( 1.0 ) );

} );

/**
 * Applies color bleeding effect to simulate horizontal color smearing.
 * Simulates the analog signal bleeding in CRT displays where colors
 * "leak" into adjacent pixels horizontally.
 *
 * @tsl
 * @function
 * @param {Node} color - The input texture node.
 * @param {Node<float>} [amount=0.002] - The amount of color bleeding (0-0.01).
 * @return {Node<vec3>} The color with bleeding effect applied.
 */
export const colorBleeding = Fn( ( [ color, amount = float( 0.002 ) ] ) => {

	const inputTexture = convertToTexture( color );

	// Get the original color
	const original = inputTexture.sample( screenUV ).rgb;

	// Sample colors from the left (simulating signal trailing)
	const left1 = inputTexture.sample( screenUV.sub( vec2( amount, 0.0 ) ) ).rgb;
	const left2 = inputTexture.sample( screenUV.sub( vec2( amount.mul( 2.0 ), 0.0 ) ) ).rgb;
	const left3 = inputTexture.sample( screenUV.sub( vec2( amount.mul( 3.0 ), 0.0 ) ) ).rgb;

	// Red bleeds more (travels further in analog signal)
	const bleedR = original.r
		.add( left1.r.mul( 0.4 ) )
		.add( left2.r.mul( 0.2 ) )
		.add( left3.r.mul( 0.1 ) );

	// Green bleeds medium
	const bleedG = original.g
		.add( left1.g.mul( 0.25 ) )
		.add( left2.g.mul( 0.1 ) );

	// Blue bleeds least
	const bleedB = original.b
		.add( left1.b.mul( 0.15 ) );

	// Normalize and clamp
	const r = clamp( bleedR.div( 1.7 ), 0.0, 1.0 );
	const g = clamp( bleedG.div( 1.35 ), 0.0, 1.0 );
	const b = clamp( bleedB.div( 1.15 ), 0.0, 1.0 );

	return vec3( r, g, b );

} );

/**
 * Applies scanline effect to simulate CRT monitor horizontal lines with animation.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} color - The input color.
 * @param {Node<float>} [intensity=0.3] - The intensity of the scanlines (0-1).
 * @param {Node<float>} [count=240] - The number of scanlines (typically matches vertical resolution).
 * @param {Node<float>} [speed=0.0] - The scroll speed of scanlines (0 = static, 1 = normal CRT roll).
 * @param {Node<vec2>} [coord=uv()] - The UV coordinates to use for scanlines.
 * @return {Node<vec3>} The color with scanlines applied.
 */
export const scanlines = Fn( ( [ color, intensity = float( 0.3 ), count = float( 240.0 ), speed = float( 0.0 ), coord = uv() ] ) => {

	// Animate scanlines scrolling down (like CRT vertical sync roll)
	const animatedY = coord.y.sub( time.mul( speed ) );

	// Create scanline pattern
	const scanline = sin( animatedY.mul( count ) );
	const scanlineIntensity = scanline.mul( 0.5 ).add( 0.5 ).mul( intensity );

	// Darken alternate lines
	return color.mul( float( 1.0 ).sub( scanlineIntensity ) );

} );

/**
 * Applies vignette effect to darken the edges of the screen.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} color - The input color.
 * @param {Node<float>} [intensity=0.4] - The intensity of the vignette (0-1).
 * @param {Node<float>} [smoothness=0.5] - The smoothness of the vignette falloff.
 * @param {Node<vec2>} [coord=uv()] - The UV coordinates to use for vignette calculation.
 * @return {Node<vec3>} The color with vignette applied.
 */
export const vignette = Fn( ( [ color, intensity = float( 0.4 ), smoothness = float( 0.5 ), coord = uv() ] ) => {

	// Use circle for radial gradient (1.42 ≈ √2 covers full diagonal)
	const mask = circle( float( 1.42 ), smoothness, coord );

	// Apply vignette: center = 1, edges = (1 - intensity)
	const vignetteAmount = mix( float( 1.0 ).sub( intensity ), float( 1.0 ), mask );

	return color.mul( vignetteAmount );

} );
