import { nodeObject } from '../tsl/TSLBase.js';
import PropertyNode from './PropertyNode.js';

/**
 * Special version of {@link PropertyNode} which is used for parameters.
 *
 * @augments PropertyNode
 */
class ParameterNode extends PropertyNode {

	static get type() {

		return 'ParameterNode';

	}

	/**
	 * Constructs a new parameter node.
	 *
	 * @param {string} nodeType - The type of the node.
	 * @param {?string} [name=null] - The name of the parameter in the shader.
	 */
	constructor( nodeType, name = null ) {

		super( nodeType, name );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isParameterNode = true;

	}

	getHash() {

		return this.uuid;

	}

	generate() {

		return this.name;

	}

}

export default ParameterNode;

/**
 * TSL function for creating a parameter node.
 *
 * @tsl
 * @function
 * @param {string} type - The type of the node.
 * @param {?string} name - The name of the parameter in the shader.
 * @returns {ParameterNode}
 */
export const parameter = ( type, name ) => nodeObject( new ParameterNode( type, name ) );
