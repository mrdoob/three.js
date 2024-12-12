import Node from '../core/Node.js';
import { uv } from '../accessors/UV.js';
import { nodeProxy, float, vec2 } from '../tsl/TSLBase.js';

/** @module SpriteSheetUVNode **/

/**
 * Can be used to compute texture coordinates for animated sprite sheets.
 *
 * ```js
 * const uvNode = spritesheetUV( vec2( 6, 6 ), uv(), time.mul( animationSpeed ) );
 *
 * material.colorNode = texture( spriteSheet, uvNode );
 * ```
 *
 * @augments Node
 */
class SpriteSheetUVNode extends Node {

	static get type() {

		return 'SpriteSheetUVNode';

	}

	/**
	 * Constructs a new sprite sheet uv node.
	 *
	 * @param {Node<vec2>} countNode - The node that defines the number of sprites in the x and y direction (e.g 6x6).
	 * @param {Node<vec2>} [uvNode=uv()] - The uv node.
	 * @param {Node<float>} [frameNode=float()] - The node that defines the current frame/sprite.
	 */
	constructor( countNode, uvNode = uv(), frameNode = float( 0 ) ) {

		super( 'vec2' );

		/**
		 * The node that defines the number of sprites in the x and y direction (e.g 6x6).
		 *
		 * @type {Node<vec2>}
		 */
		this.countNode = countNode;

		/**
		 * The uv node.
		 *
		 * @type {Node<vec2>}
		 */
		this.uvNode = uvNode;

		/**
		 * The node that defines the current frame/sprite.
		 *
		 * @type {Node<float>}
		 */
		this.frameNode = frameNode;

	}

	setup() {

		const { frameNode, uvNode, countNode } = this;

		const { width, height } = countNode;

		const frameNum = frameNode.mod( width.mul( height ) ).floor();

		const column = frameNum.mod( width );
		const row = height.sub( frameNum.add( 1 ).div( width ).ceil() );

		const scale = countNode.reciprocal();
		const uvFrameOffset = vec2( column, row );

		return uvNode.add( uvFrameOffset ).mul( scale );

	}

}

export default SpriteSheetUVNode;

/**
 * TSL function for creating a sprite sheet uv node.
 *
 * @function
 * @param {Node<vec2>} countNode - The node that defines the number of sprites in the x and y direction (e.g 6x6).
 * @param {Node<vec2>} [uvNode=uv()] - The uv node.
 * @param {Node<float>} [frameNode=float()] - The node that defines the current frame/sprite.
 * @returns {SpriteSheetUVNode}
 */
export const spritesheetUV = /*@__PURE__*/ nodeProxy( SpriteSheetUVNode );
