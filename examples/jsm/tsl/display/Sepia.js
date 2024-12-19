import { dot, Fn, vec3, vec4 } from 'three/tsl';

/** @module Sepia **/

/**
 * Applies a sepia effect to the given color node.
 *
 * @function
 * @param {Node<vec4>} color - The color node to apply the sepia for.
 * @return {Node<vec4>} The updated color node.
 */
export const sepia = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const c = vec3( color );

	// https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/sepia.js

	return vec4(
		dot( c, vec3( 0.393, 0.769, 0.189 ) ),
		dot( c, vec3( 0.349, 0.686, 0.168 ) ),
		dot( c, vec3( 0.272, 0.534, 0.131 ) ),
		color.a
	);

} );
