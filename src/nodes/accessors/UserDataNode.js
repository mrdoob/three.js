import ReferenceNode from './ReferenceNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

/**
 * A special type of reference node that allows to link values in
 * `userData` fields to node objects.
 * ```js
 * sprite.userData.rotation = 1; // stores individual rotation per sprite
 *
 * const material = new THREE.SpriteNodeMaterial();
 * material.rotationNode = userData( 'rotation', 'float' );
 * ```
 * Since `UserDataNode` is extended from {@link ReferenceNode}, the node value
 * will automatically be updated when the `rotation` user data field changes.
 *
 * @augments ReferenceNode
 */
class UserDataNode extends ReferenceNode {

	static get type() {

		return 'UserDataNode';

	}

	/**
	 * Constructs a new user data node.
	 *
	 * @param {string} property - The property name that should be referenced by the node.
	 * @param {string} inputType - The node data type of the reference.
	 * @param {?Object} [userData=null] - A reference to the `userData` object. If not provided, the `userData` property of the 3D object that uses the node material is evaluated.
	 */
	constructor( property, inputType, userData = null ) {

		super( property, inputType, userData );

		/**
		 * A reference to the `userData` object. If not provided, the `userData`
		 * property of the 3D object that uses the node material is evaluated.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.userData = userData;

	}

	/**
	 * Overwritten to make sure {@link ReferenceNode#reference} points to the correct
	 * `userData` field.
	 *
	 * @param {(NodeFrame|NodeBuilder)} state - The current state to evaluate.
	 * @return {Object} A reference to the `userData` field.
	 */
	updateReference( state ) {

		this.reference = this.userData !== null ? this.userData : state.object.userData;

		return this.reference;

	}

}

export default UserDataNode;

/**
 * TSL function for creating a user data node.
 *
 * @tsl
 * @function
 * @param {string} name - The property name that should be referenced by the node.
 * @param {string} inputType - The node data type of the reference.
 * @param {?Object} userData - A reference to the `userData` object. If not provided, the `userData` property of the 3D object that uses the node material is evaluated.
 * @returns {UserDataNode}
 */
export const userData = ( name, inputType, userData ) => nodeObject( new UserDataNode( name, inputType, userData ) );
