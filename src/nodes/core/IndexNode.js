import Node from './Node.js';
import { nodeImmutable } from '../tsl/TSLCore.js';
import { varying } from './VaryingNode.js';

/**
 * This class represents shader indices of different types. The following predefined node
 * objects cover frequent use cases:
 *
 * - `vertexIndex`: The index of a vertex within a mesh.
 * - `instanceIndex`: The index of either a mesh instance or an invocation of a compute shader.
 * - `drawIndex`: The index of a draw call.
 * - `invocationLocalIndex`: The index of a compute invocation within the scope of a workgroup.
 * - `invocationSubgroupIndex`: The index of a compute invocation within the scope of a subgroup.
 * - `subgroupIndex`: The index of a compute invocation's subgroup within its workgroup.
 *
 * @augments Node
 */
class IndexNode extends Node {

	static get type() {

		return 'IndexNode';

	}

	/**
	 * Constructs a new index node.
	 *
	 * @param {('vertex'|'instance'|'subgroup'|'invocationLocal'|'invocationSubgroup'|'draw')} scope - The scope of the index node.
	 */
	constructor( scope ) {

		super( 'uint' );

		/**
		 * The scope of the index node.
		 *
		 * @type {string}
		 */
		this.scope = scope;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isIndexNode = true;

	}

	generate( builder ) {

		const nodeType = this.getNodeType( builder );
		const scope = this.scope;

		let propertyName;

		if ( scope === IndexNode.VERTEX ) {

			propertyName = builder.getVertexIndex();

		} else if ( scope === IndexNode.INSTANCE ) {

			propertyName = builder.getInstanceIndex();

		} else if ( scope === IndexNode.DRAW ) {

			propertyName = builder.getDrawIndex();

		} else if ( scope === IndexNode.INVOCATION_LOCAL ) {

			propertyName = builder.getInvocationLocalIndex();

		} else if ( scope === IndexNode.INVOCATION_SUBGROUP ) {

			propertyName = builder.getInvocationSubgroupIndex();

		} else if ( scope === IndexNode.SUBGROUP ) {

			propertyName = builder.getSubgroupIndex();

		} else {

			throw new Error( 'THREE.IndexNode: Unknown scope: ' + scope );

		}

		let output;

		if ( builder.shaderStage === 'vertex' || builder.shaderStage === 'compute' ) {

			output = propertyName;

		} else {

			const nodeVarying = varying( this );

			output = nodeVarying.build( builder, nodeType );

		}

		return output;

	}

}

IndexNode.VERTEX = 'vertex';
IndexNode.INSTANCE = 'instance';
IndexNode.SUBGROUP = 'subgroup';
IndexNode.INVOCATION_LOCAL = 'invocationLocal';
IndexNode.INVOCATION_SUBGROUP = 'invocationSubgroup';
IndexNode.DRAW = 'draw';

export default IndexNode;

/**
 * TSL object that represents the index of a vertex within a mesh.
 *
 * @tsl
 * @type {IndexNode}
 */
export const vertexIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.VERTEX );

/**
 * TSL object that contextually represents specific index data depending on the shader stage.
 *
 * Within the vertex and fragment stages, `instanceIndex` will represent the index of the current mesh instance being evaluated by the shader.
 * In these stages, use `instanceIndex` to modify a mesh based on its instance or to select per-instance data.
 *
 * ```js
 * // instanceIndex will equal the current mesh's instance index between 0-500
 * const material = new THREE.BasicNodeMaterial();
 * material.positionNode = vec3( instanceIndex.mod( 10 ), instanceIndex.div( 10 ), 0 );
 * const mesh = new THREE.InstancedMesh( geometry, material, 500 );
 * ```
 *
 * Within the compute stage, `instanceIndex` will represent the global index of a compute invocation within the 3-dimensional compute workgroup load.
 * In this stage, use `instanceIndex` to modify or select data at a given index within a buffer, or derive values from the index itself.
 *
 * ```js
 * // instanceIndex will equal value between 0 - 255
 * const computeFn = Fn() => {
 *
 * 	storageBuffer.element( instanceIndex ).assign( instanceIndex );
 *
 * } )().compute( 255 )
 * ```
 *
 * @tsl
 * @type {IndexNode}
 */
export const instanceIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INSTANCE );

/**
 * TSL object that represents the index of the subgroup the current compute invocation belongs to.
 * Subgroup indices are local to the workgroups to which they belong.
 *
 * ```js
 * // Execute 12 compute threads with a workgroup size of 9. Example assumes a subgroup size of 3.
 * const computeFn = Fn( () => {
 *
 * 	storageBufferOne.element( instanceIndex ).assign( subgroupIndex );
 * 	storageBufferTwo.element( instanceIndex ).assign( workgroupId.x );
 *
 * } )().compute( 12, [ 9 ] );
 *
 * // instanceIndex =  [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
 * // Buffer One ( Subgroup Index ) =  [ 0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 0, 0 ];
 * // Buffer Two ( Workgroup ID )   =  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1 ];
 * ```
 *
 * @tsl
 * @type {IndexNode}
 */
export const subgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.SUBGROUP );

/**
 * TSL object that represents the index of a compute invocation within the scope of a subgroup.
 *
 * ```js
 * // Execute 12 compute threads with a workgroup size of 12. Example assumes a subgroup size of 3.
 * const computeFn = Fn( () => {
 *
 * 	storageBufferOne.element( instanceIndex ).assign( invocationSubgroupIndex );
 * 	storageBufferTwo.element( instanceIndex ).assign( subgroupIndex );
 *
 * } )().compute( 12, [ 12 ] );
 *
 * // instanceIndex =  [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
 * // Buffer One ( Invocation Subgroup Index ) =  [ 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2 ];
 * // Buffer Two ( Subgroup Index )            =  [ 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3 ];
 * ```
 *
 * @tsl
 * @type {IndexNode}
 */
export const invocationSubgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_SUBGROUP );

/**
 * TSL object that represents the index of a compute invocation within the scope of a workgroup.
 *
 * ```js
 * // Execute 12 compute threads with a workgroup size of 4.
 * const computeFn = Fn( () => {
 *
 * 	storageBufferOne.element( instanceIndex ).assign( invocationLocalIndex );
 * 	storageBufferTwo.element( instanceIndex ).assign( workgroupId.x );
 *
 * } )().compute( 12, [ 4 ] );
 *
 * // instanceIndex =  [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
 * // Buffer One ( Invocation Local Index ) =     [ 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3 ];
 * // Buffer Two ( Workgroup ID )           =     [ 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2 ];
 * ```
 *
 * @tsl
 * @type {IndexNode}
 */
export const invocationLocalIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_LOCAL );

/**
 * TSL object that represents the index of a draw call.
 *
 * @tsl
 * @type {IndexNode}
 */
export const drawIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.DRAW );
