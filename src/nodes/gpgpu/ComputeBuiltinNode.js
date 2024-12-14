import Node from '../core/Node.js';
import { nodeObject } from '../tsl/TSLBase.js';

/** @module ComputeBuiltinNode **/

/**
 * TODO
 *
 * @augments Node
 */
class ComputeBuiltinNode extends Node {

	static get type() {

		return 'ComputeBuiltinNode';

	}

	/**
	 * Constructs a new compute builtin node.
	 *
	 * @param {String} builtinName - The built-in name.
	 * @param {String} nodeType - The node type.
	 */
	constructor( builtinName, nodeType ) {

		super( nodeType );

		/**
		 * The built-in name.
		 *
		 * @private
		 * @type {String}
		 */
		this._builtinName = builtinName;

	}

	/**
	 * This method is overwritten since hash is derived from the built-in name.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The hash.
	 */
	getHash( builder ) {

		return this.getBuiltinName( builder );

	}

	/**
	 * This method is overwritten since the node type is simply dervied from `nodeType`..
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( /*builder*/ ) {

		return this.nodeType;

	}

	/**
	 * Sets the builtin name.
	 *
	 * @param {String} builtinName - The built-in name.
	 * @return {ComputeBuiltinNode} A reference to this node.
	 */
	setBuiltinName( builtinName ) {

		this._builtinName = builtinName;

		return this;

	}

	/**
	 * Returns the builtin name.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The builtin name.
	 */
	getBuiltinName( /*builder*/ ) {

		return this._builtinName;

	}

	/**
	 * Whether the current node builder has the builtin or not.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	hasBuiltin( builder ) {

		builder.hasBuiltin( this._builtinName );

	}

	generate( builder, output ) {

		const builtinName = this.getBuiltinName( builder );
		const nodeType = this.getNodeType( builder );

		if ( builder.shaderStage === 'compute' ) {

			return builder.format( builtinName, nodeType, output );

		} else {

			console.warn( `ComputeBuiltinNode: Compute built-in value ${builtinName} can not be accessed in the ${builder.shaderStage} stage` );
			return builder.generateConst( nodeType );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.global = this.global;
		data._builtinName = this._builtinName;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.global = data.global;
		this._builtinName = data._builtinName;

	}

}

export default ComputeBuiltinNode;

/**
 * TSL function for creating a compute builtin node.
 *
 * @function
 * @param {String} name - The built-in name.
 * @param {String} nodeType - The node type.
 * @returns {ComputeBuiltinNode}
 */
const computeBuiltin = ( name, nodeType ) => nodeObject( new ComputeBuiltinNode( name, nodeType ) );

/**
 * TSL function for creating a `numWorkgroups` builtin node.
 *
 * @function
 * @returns {ComputeBuiltinNode<uvec3>}
 */
export const numWorkgroups = /*@__PURE__*/ computeBuiltin( 'numWorkgroups', 'uvec3' );

/**
 * TSL function for creating a `workgroupId` builtin node.
 *
 * @function
 * @returns {ComputeBuiltinNode<uvec3>}
 */
export const workgroupId = /*@__PURE__*/ computeBuiltin( 'workgroupId', 'uvec3' );

/**
 * TSL function for creating a `localId` builtin node.
 *
 * @function
 * @returns {ComputeBuiltinNode<uvec3>}
 */
export const localId = /*@__PURE__*/ computeBuiltin( 'localId', 'uvec3' );

/**
 * TSL function for creating a `subgroupSize` builtin node.
 *
 * @function
 * @returns {ComputeBuiltinNode<uint>}
 */
export const subgroupSize = /*@__PURE__*/ computeBuiltin( 'subgroupSize', 'uint' );

