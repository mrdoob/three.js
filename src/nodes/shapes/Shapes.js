import { Fn, float, select } from '../tsl/TSLBase.js';
import { lengthSq, smoothstep } from '../math/MathNode.js';
import { uv } from '../accessors/UV.js';

/**
 * Generates a circle based on the uv coordinates.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} coord - The uv to generate the circle.
 * @return {Node<float>} The circle shape.
 */
export const shapeCircle = Fn( ( [ coord = uv() ], { renderer, material } ) => {

	const len2 = lengthSq( coord.mul( 2 ).sub( 1 ) );

	let alpha;

	if ( material.alphaToCoverage && renderer.samples > 1 ) {

		const dlen = float( len2.fwidth() ).toVar();

		alpha = smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus();

	} else {

		alpha = select( len2.greaterThan( 1.0 ), 0, 1 );

	}

	return alpha;

} );
