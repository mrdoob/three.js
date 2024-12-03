import FogNode from './FogNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * Represents an exponential squared fog. This type of fog gives
 * a clear view near the camera and a faster than exponentially
 * densening fog farther from the camera.
 *
 * @augments FogNode
 */
class FogExp2Node extends FogNode {

	static get type() {

		return 'FogExp2Node';

	}

	/**
	 * Constructs a new exponential squared fog node.
	 *
	 * @param {Node} colorNode - Defines the color of the fog.
	 * @param {Node} densityNode - Defines the fog densitiy.
	 */
	constructor( colorNode, densityNode ) {

		super( colorNode, null );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isFogExp2Node = true;

		/**
		 * Defines the fog densitiy.
		 *
		 * @type {Node}
		 */
		this.densityNode = densityNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );
		const density = this.densityNode;

		return density.mul( density, viewZ, viewZ ).negate().exp().oneMinus();

	}

}

export default FogExp2Node;

export const densityFog = /*@__PURE__*/ nodeProxy( FogExp2Node );
