import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { vec3 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';

/** @module ShadowBaseNode **/

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
		 * @type {String}
		 * @default 'render'
		 */
		this.updateBeforeType = NodeUpdateType.RENDER;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isShadowBaseNode = true;

	}

	/**
	 * Setups the shadow position node which is by default the predefined TSL node object `shadowPositionWorld`.
	 *
	 * @param {(NodeBuilder|{Material})} object - A configuration object that must at least hold a material reference.
	 */
	setupShadowPosition( { material } ) {

		// Use assign inside an Fn()

		shadowPositionWorld.assign( material.shadowPositionNode || positionWorld );

	}

	/**
	 * Can be called when the shadow isn't required anymore. That can happen when
	 * a lighting node stops casting shadows by setting {@link Object3D#castShadow}
	 * to `false`.
	 */
	dispose() {

		this.updateBeforeType = NodeUpdateType.NONE;

	}

}

/**
 * TSL object that represents the vertex position in world space during the shadow pass.
 *
 * @type {Node<vec3>}
 */
export const shadowPositionWorld = /*@__PURE__*/ vec3().toVar( 'shadowPositionWorld' );

export default ShadowBaseNode;
