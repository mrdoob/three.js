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
	 * @param {String} nodeType - The type of the node.
	 * @param {String?} [name=null] - The name of the parameter in the shader.
	 */
	constructor( nodeType, name = null ) {

		super( nodeType, name );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
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
 *
 * @param {string} type
 * @param {string?} [name=null]
 * @returns {ShaderNodeObject}
 */
export const parameter = ( type, name ) => nodeObject( new ParameterNode( type, name ) );
