import { warn } from '../../utils.js';
import Node from '../core/Node.js';

/**
 * A node allowing the user to declare a single variable in an alternate
 * address space within the shader.
 *
 * This node represents a single address-spaced variable
 * Use {@link ScopedArrayNode} when a series of elements is required instead.
 *
 * This node can only be used with a WebGPU backend.
 *
 * @augments Node
 */
class ScopedVariableNode extends Node {

	/**
	 * Constructs a new scoped variable node.
	 *
	 * @param {string} scope - The address space the variable is scoped to.
	 * @param {string} type - The data type of the variable.
	 */
	constructor( scope, type ) {

		super( type );

		/**
		 * The address space the variable is scoped to.
		 *
		 * @type {string}
		 */
		this.scope = scope;

		/**
		 * The name of the scoped variable.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.name = '';

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isScopedVariableNode = true;

	}

	/**
	 * Sets the name of this node.
	 *
	 * @param {string} name - The name to set.
	 * @return {ScopedVariableNode} A reference to this node.
	 */
	setName( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the scope of this node.
	 *
	 * @param {string} scope - The scope to set.
	 * @return {ScopedVariableNode} A reference to this node.
	 */
	setScope( scope ) {

		this.scope = scope;

		return this;

	}

	/**
	 * Returns the name the variable is declared with in the shader. Falls back to
	 * a generated, unique name when no explicit name was assigned.
	 *
	 * @return {string} The name of the scoped variable.
	 */
	getScopedName() {

		return ( this.name !== '' ) ? this.name : `${this.scope}Variable_${this.id}`;

	}

	generate( builder ) {

		if ( this.scope === ScopedVariableNode.WORKGROUP_SCOPE && builder.shaderStage !== 'compute' ) {

			warn( `ScopedVariableNode: Workgroup scoped variables are invalid in the ${builder.shaderStage} stage.` );

		}

		return builder.getScopedVariable( this.getScopedName(), this.scope, this.getNodeType( builder ), this.getArrayCount( builder ) );

	}

}

export default ScopedVariableNode;

ScopedVariableNode.WORKGROUP_SCOPE = 'workgroup';
ScopedVariableNode.PRIVATE_SCOPE = 'private';
ScopedVariableNode.FUNCTION_SCOPE = 'function';

/**
 * TSL function for creating a scoped variable node.
 * Creates a new 'workgroup' scoped variable.
 *
 * @tsl
 * @function
 * @param {string} type - The data type of the variable.
 * @returns {ScopedVariableNode}
 */
export const workgroupVariable = ( type ) => new ScopedVariableNode( 'workgroup', type );

/**
 * TSL function for creating a scoped variable node.
 * Creates a new 'private' scoped variable.
 *
 * @tsl
 * @function
 * @param {string} type - The data type of the variable.
 * @returns {ScopedVariableNode}
 */
export const privateVariable = ( type ) => new ScopedVariableNode( 'private', type );

/**
 * TSL function for creating a scoped variable node.
 * Creates a new 'function' scoped variable.
 *
 * @tsl
 * @function
 * @param {string} type - The data type of the variable.
 * @returns {ScopedVariableNode}
 */
export const functionVariable = ( type ) => new ScopedVariableNode( 'function', type );
