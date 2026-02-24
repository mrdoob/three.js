import { uv } from '../accessors/UV.js';
import { Fn, float, vec2 } from '../tsl/TSLBase.js';

/**
 * TSL function for computing texture coordinates for animated sprite sheets.
 *
 * ```js
 * const uvNode = spritesheetUV( vec2( 6, 6 ), uv(), time.mul( animationSpeed ) );
 *
 * material.colorNode = texture( spriteSheet, uvNode );
 * ```
 *
 * @tsl
 * @function
 * @param {Node<vec2>} countNode - The node that defines the number of sprites in the x and y direction (e.g 6x6).
 * @param {?Node<vec2>} [uvNode=uv()] - The uv node.
 * @param {?Node<float>} [frameNode=float(0)] - The node that defines the current frame/sprite.
 * @returns {Node<vec2>}
 */
export const spritesheetUV = /*@__PURE__*/ Fn( ( [ countNode, uvNode = uv(), frameNode = float( 0 ) ] ) => {

	const width = countNode.x;
	const height = countNode.y;

	const frameNum = frameNode.mod( width.mul( height ) ).floor();

	const column = frameNum.mod( width );
	const row = height.sub( frameNum.add( 1 ).div( width ).ceil() );

	const scale = countNode.reciprocal();
	const uvFrameOffset = vec2( column, row );

	return uvNode.add( uvFrameOffset ).mul( scale );

} );
