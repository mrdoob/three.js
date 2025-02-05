import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * Represents a posterize effect which reduces the number of colors
 * in an image, resulting in a more blocky and stylized appearance.
 *
 * @augments TempNode
 */
class PosterizeNode extends TempNode {

	static get type() {

		return 'PosterizeNode';

	}

	/**
	 * Constructs a new posterize node.
	 *
	 * @param {Node} sourceNode - The input color.
	 * @param {Node} stepsNode - Controls the intensity of the posterization effect. A lower number results in a more blocky appearance.
	 */
	constructor( sourceNode, stepsNode ) {

		super();

		/**
		 * The input color.
		 *
		 * @type {Node}
		 */
		this.sourceNode = sourceNode;

		/**
		 * Controls the intensity of the posterization effect. A lower number results in a more blocky appearance.
		 *
		 * @type {Node}
		 */
		this.stepsNode = stepsNode;

	}

	setup() {

		const { sourceNode, stepsNode } = this;

		return sourceNode.mul( stepsNode ).floor().div( stepsNode );

	}

}

export default PosterizeNode;

/**
 * TSL function for creating a posterize node.
 *
 * @tsl
 * @function
 * @param {Node} sourceNode - The input color.
 * @param {Node} stepsNode - Controls the intensity of the posterization effect. A lower number results in a more blocky appearance.
 * @returns {PosterizeNode}
 */
export const posterize = /*@__PURE__*/ nodeProxy( PosterizeNode );
