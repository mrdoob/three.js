import Node from '../core/Node.js';
import { nodeObject } from '../tsl/TSLBase.js';

/** @module ComputeBuiltinNode **/

/**
 * `ComputeBuiltinNode` represents a compute-scope builtin value that expose information
 * about the currently running dispatch and/or the device it is running on.
 *
 * This node can only be used with a WebGPU backend.
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
	 * This method is overwritten since the node type is simply derived from `nodeType`..
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
 * Represents the number of workgroups dispatched by the compute shader.
 * ```js
 * // Run 512 invocations/threads with a workgroup size of 128.
 * const computeFn = Fn(() => {
 *
 *     // numWorkgroups.x = 4
 *     storageBuffer.element(0).assign(numWorkgroups.x)
 *
 * })().compute(512, [128]);
 *
 * // Run 512 invocations/threads with the default workgroup size of 64.
 * const computeFn = Fn(() => {
 *
 *     // numWorkgroups.x = 8
 *     storageBuffer.element(0).assign(numWorkgroups.x)
 *
 * })().compute(512);
 * ```
 *
 * @function
 * @returns {ComputeBuiltinNode<uvec3>}
 */
export const numWorkgroups = /*@__PURE__*/ computeBuiltin( 'numWorkgroups', 'uvec3' );

/**
 * TSL function for creating a `workgroupId` builtin node.
 * Represents the 3-dimensional index of the workgroup the current compute invocation belongs to.
 * ```js
 * // Execute 12 compute threads with a workgroup size of 3.
 * const computeFn = Fn( () => {
 *
 * 	If( workgroupId.x.modInt( 2 ).equal( 0 ), () => {
 *
 * 		storageBuffer.element( instanceIndex ).assign( instanceIndex );
 *
 * 	} ).Else( () => {
 *
 * 		storageBuffer.element( instanceIndex ).assign( 0 );
 *
 * 	} );
 *
 * } )().compute( 12, [ 3 ] );
 *
 * // workgroupId.x =  [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
 * // Buffer Output =  [0, 1, 2, 0, 0, 0, 6, 7, 8, 0, 0, 0];
 * ```
 *
 * @function
 * @returns {ComputeBuiltinNode<uvec3>}
 */
export const workgroupId = /*@__PURE__*/ computeBuiltin( 'workgroupId', 'uvec3' );

/**
 * TSL function for creating a `localId` builtin node. A non-linearized 3-dimensional
 * representation of the current invocation's position within a 3D workgroup grid.
 *
 * @function
 * @returns {ComputeBuiltinNode<uvec3>}
 */
export const localId = /*@__PURE__*/ computeBuiltin( 'localId', 'uvec3' );

/**
 * TSL function for creating a `subgroupSize` builtin node. A device dependent variable
 * that exposes the size of the current invocation's subgroup.
 *
 * @function
 * @returns {ComputeBuiltinNode<uint>}
 */
export const subgroupSize = /*@__PURE__*/ computeBuiltin( 'subgroupSize', 'uint' );

