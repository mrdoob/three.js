import FogNode from './FogNode.js';
import { smoothstep } from '../math/MathNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * Represents a range fog. The fog is smoothly interpolated
 * between a range defined via near and far values.
 *
 * @augments FogNode
 */
class FogRangeNode extends FogNode {

	static get type() {

		return 'FogRangeNode';

	}

	/**
	 * Constructs a new range node.
	 *
	 * @param {Node} colorNode - Defines the color of the fog.
	 * @param {Node} nearNode - Defines the near value.
	 * @param {Node} farNode - Defines the far value.
	 */
	constructor( colorNode, nearNode, farNode ) {

		super( colorNode, null );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isFogRangeNode = true;

		/**
		 * Defines the near value.
		 *
		 * @type {Node}
		 */
		this.nearNode = nearNode;

		/**
		 * Defines the far value.
		 *
		 * @type {Node}
		 */
		this.farNode = farNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );

		return smoothstep( this.nearNode, this.farNode, viewZ );

	}

}

export default FogRangeNode;

export const rangeFog = /*@__PURE__*/ nodeProxy( FogRangeNode );
