import { error } from '../../utils.js';
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

		/**
		 * Whether the node is atomic or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.isAtomic = false;

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
	 * Defines whether the node is atomic or not.
	 *
	 * @param {boolean} value - The atomic flag.
	 * @return {ScopedVariableNode} A reference to this node.
	 */
	setAtomic( value ) {

		this.isAtomic = value;

		return this;

	}

	/**
	 * Convenience method for making this node atomic.
	 *
	 * @return {ScopedVariableNode} A reference to this node.
	 */
	toAtomic() {

		return this.setAtomic( true );

	}

	/**
	 * Returns the name the variable is declared with, or falls back to a generated name.
	 *
	 * @return {string} The name of the scoped variable.
	 */
	getScopedName() {

		return ( this.name !== '' ) ? this.name : `${this.scope}Variable_${this.id}`;

	}

	generate( builder ) {

		if ( this.scope === ScopedVariableNode.WORKGROUP_SCOPE && builder.shaderStage !== 'compute' ) {

			error( `TSL: Workgroup scoped variables are invalid in the ${builder.shaderStage} stage.` );

		}

		if ( this.scope === ScopedVariableNode.PRIVATE_SCOPE && this.isAtomic ) {

			error( 'TSL: A private variable cannot hold an atomic type. ' );

		}

		return builder.getScopedVariable( this.getScopedName(), this.scope, this.getNodeType( builder ), this.getArrayCount( builder ), this.isAtomic );

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
