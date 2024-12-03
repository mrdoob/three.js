import Node from '../core/Node.js';
import { positionView } from '../accessors/Position.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * This class can be used to configure a fog for the scene.
 * Nodes of this type are usually assigned to `Scene.fogNode`.
 *
 * @augments Node
 */
class FogNode extends Node {

	static get type() {

		return 'FogNode';

	}

	/**
	 * Constructs a new fog node.
	 *
	 * @param {Node} colorNode - Defines the color of the fog.
	 * @param {Node} factorNode - Defines how the fog is factored in the scene.
	 */
	constructor( colorNode, factorNode ) {

		super( 'float' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isFogNode = true;

		/**
		 * Defines the color of the fog.
		 *
		 * @type {Node}
		 */
		this.colorNode = colorNode;

		/**
		 * Defines how the fog is factored in the scene.
		 *
		 * @type {Node?}
		 */
		this.factorNode = factorNode;

	}

	/**
	 * Returns a node that represents the `z` coordinate in view space
	 * for the current fragment. It's a different representation of the
	 * default depth value.
	 *
	 * This value can be part of a computation that defines how the fog
	 * density increases when moving away from the camera.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The viewZ node.
	 */
	getViewZNode( builder ) {

		let viewZ;

		const getViewZ = builder.context.getViewZ;

		if ( getViewZ !== undefined ) {

			viewZ = getViewZ( this );

		}

		return ( viewZ || positionView.z ).negate();

	}

	setup() {

		return this.factorNode;

	}

}

export default FogNode;

export const fog = /*@__PURE__*/ nodeProxy( FogNode );
