import ReferenceNode from './ReferenceNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

/** @module MaterialReferenceNode **/

/**
 * This node is a special type of reference node which is intended
 * for linking material properties with node values.
 * ```js
 * const opacityNode = materialReference( 'opacity', 'float', material );
 * ```
 * When changing `material.opacity`, the node value of `opacityNode` will
 * automatically be updated.
 *
 * @augments module:ReferenceNode~ReferenceNode
 */
class MaterialReferenceNode extends ReferenceNode {

	static get type() {

		return 'MaterialReferenceNode';

	}

	/**
	 * Constructs a new material reference node.
	 *
	 * @param {String} property - The name of the property the node refers to.
	 * @param {String} inputType - The uniform type that should be used to represent the property value.
	 * @param {Material?} [material=null] - The material the property belongs to. When no material is set,
	 * the node refers to the material of the current rendered object.
	 */
	constructor( property, inputType, material = null ) {

		super( property, inputType, material );

		/**
		 * The material the property belongs to. When no material is set,
		 * the node refers to the material of the current rendered object.
		 *
		 * @type {Material?}
		 * @default null
		 */
		this.material = material;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isMaterialReferenceNode = true;

	}

	/**
	 * Updates the reference based on the given state. The state is only evaluated
	 * {@link module:MaterialReferenceNode~MaterialReferenceNode#material} is not set.
	 *
	 * @param {(NodeFrame|NodeBuilder)} state - The current state.
	 * @return {Object} The updated reference.
	 */
	updateReference( state ) {

		this.reference = this.material !== null ? this.material : state.material;

		return this.reference;

	}

}

export default MaterialReferenceNode;

/**
 * TSL function for creating a material reference node.
 *
 * @function
 * @param {String} name - The name of the property the node refers to.
 * @param {String} type - The uniform type that should be used to represent the property value.
 * @param {Material?} [material=null] - The material the property belongs to.
 * When no material is set, the node refers to the material of the current rendered object.
 * @returns {MaterialReferenceNode}
 */
export const materialReference = ( name, type, material = null ) => nodeObject( new MaterialReferenceNode( name, type, material ) );
