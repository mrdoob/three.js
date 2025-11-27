import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { property } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';

/**
 * Base class for all shadow nodes.
 *
 * Shadow nodes encapsulate shadow related logic and are always coupled to lighting nodes.
 * Lighting nodes might share the same shadow node type or use specific ones depending on
 * their requirements.
 *
 * @augments Node
 */
class ShadowBaseNode extends Node {

	static get type() {

		return 'ShadowBaseNode';

	}

	/**
	 * Constructs a new shadow base node.
	 *
	 * @param {Light} light - The shadow casting light.
	 */
	constructor( light ) {

		super();

		/**
		 * The shadow casting light.
		 *
		 * @type {Light}
		 */
		this.light = light;

		/**
		 * Overwritten since shadows are updated by default per render.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateBeforeType = NodeUpdateType.RENDER;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isShadowBaseNode = true;

	}

	/**
	 * Setups the shadow position node which is by default the predefined TSL node object `shadowPositionWorld`.
	 *
	 * @param {NodeBuilder} object - A configuration object that must at least hold a material reference.
	 */
	setupShadowPosition( { context, material } ) {

		// Use assign inside an Fn()

		shadowPositionWorld.assign( material.receivedShadowPositionNode || context.shadowPositionWorld || positionWorld );

	}

}

/**
 * TSL object that represents the vertex position in world space during the shadow pass.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const shadowPositionWorld = /*@__PURE__*/ property( 'vec3', 'shadowPositionWorld' );

export default ShadowBaseNode;
