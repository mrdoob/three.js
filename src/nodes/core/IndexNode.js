import Node from './Node.js';
import { nodeImmutable, varying } from '../tsl/TSLBase.js';

/**
 * This class represents shader indices of different types. The following predefined node
 * objects cover frequent use cases:
 *
 * - `vertexIndex`: The index of a vertex within a mesh.
 * - `instanceIndex`: The index of either a mesh instance or an invocation of a compute shader.
 * - `drawIndex`: The index of a draw call.
 * - `invocationLocalIndex`: The index of a compute invocation within the scope of a workgroup load.
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
	 * @param {('vertex'|'instance'|'subgroup'|'invocationLocal'|'invocationGlobal'|'invocationSubgroup'|'draw')} scope - The scope of the index node.
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
 * TSL object that represents the index of either a mesh instance or an invocation of a compute shader.
 *
 * @tsl
 * @type {IndexNode}
 */
export const instanceIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INSTANCE );

/**
 * TSL object that represents the index of the subgroup the current compute invocation belongs to.
 *
 * @tsl
 * @type {IndexNode}
 */
export const subgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.SUBGROUP );

/**
 * TSL object that represents the index of a compute invocation within the scope of a subgroup.
 *
 * @tsl
 * @type {IndexNode}
 */
export const invocationSubgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_SUBGROUP );

/**
 * TSL object that represents the index of a compute invocation within the scope of a workgroup load.
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
