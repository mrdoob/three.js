import { error } from '../../utils.js';
import StackTrace from '../core/StackTrace.js';
import PropertyNode from './PropertyNode.js';
import { shaderStages } from './constants.js';

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

	/**
	 * Gets the type of a member variable in the parameter node.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @param {string} name - The name of the member variable.
	 * @returns {string}
	 */
	getMemberType( builder, name ) {

		const type = this.getNodeType( builder );
		let struct = builder.getStructTypeNode( type );

		if ( struct === null ) {

			// Struct types are registered per shader stage as a side effect of
			// `StructTypeNode.setup()`. Since a node is set up only once, the
			// registration happens in the first stage that builds the struct.
			// When the struct is also used in another stage, the type might not
			// be registered for the current stage yet. Member layouts are
			// stage-independent, so resolve the type from another stage.

			for ( const shaderStage of shaderStages ) {

				struct = builder.getStructTypeNode( type, shaderStage );

				if ( struct !== null ) break;

			}

			if ( struct === null ) {

				error( `TSL: Struct type "${ type }" is not registered for the "${ builder.shaderStage }" stage.`, new StackTrace() );

				return 'float';

			}

		}

		const memberType = struct.getMemberType( builder, name );

		if ( memberType === 'void' ) {

			error( `TSL: Member "${ name }" not found in struct "${ type }".`, new StackTrace() );

		}

		return memberType;

	}

	getHash() {

		return String( this.id );

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
export const parameter = ( type, name ) => new ParameterNode( type, name );
