import Node from './Node.js';
import { nodeImmutable, varying } from '../tsl/TSLBase.js';

class IndexNode extends Node {

	static get type() {

		return 'IndexNode';

	}

	constructor( scope ) {

		super( 'uint' );

		this.scope = scope;

		this.isInstanceIndexNode = true;

	}

	generate( builder ) {

		const nodeType = this.getNodeType( builder );
		const scope = this.scope;

		let propertyName;

		if ( scope === IndexNode.VERTEX ) {

			// The index of a vertex within a mesh.
			propertyName = builder.getVertexIndex();

		} else if ( scope === IndexNode.INSTANCE ) {

			// The index of either a mesh instance or an invocation of a compute shader.
			propertyName = builder.getInstanceIndex();

		} else if ( scope === IndexNode.DRAW ) {

			// The index of a draw call.
			propertyName = builder.getDrawIndex();

		} else if ( scope === IndexNode.INVOCATION_LOCAL ) {

			// The index of a compute invocation within the scope of a workgroup load.
			propertyName = builder.getInvocationLocalIndex();

		} else if ( scope === IndexNode.INVOCATION_SUBGROUP ) {

			// The index of a compute invocation within the scope of a subgroup.
			propertyName = builder.getInvocationSubgroupIndex();

		} else if ( scope === IndexNode.SUBGROUP ) {

			// The index of the subgroup the current compute invocation belongs to.
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

export const vertexIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.VERTEX );
export const instanceIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INSTANCE );
export const subgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.SUBGROUP );
export const invocationSubgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_SUBGROUP );
export const invocationLocalIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_LOCAL );
export const drawIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.DRAW );
