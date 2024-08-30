import Node, { registerNode } from './Node.js';
import { nodeImmutable, varying } from '../tsl/TSLBase.js';

class IndexNode extends Node {

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

			propertyName = builder.getVertexIndex();

		} else if ( scope === IndexNode.INSTANCE ) {

			propertyName = builder.getInstanceIndex();

		} else if ( scope === IndexNode.DRAW ) {

			propertyName = builder.getDrawIndex();

		} else if ( scope === IndexNode.INVOCATION_LOCAL ) {

			propertyName = builder.getInvocationLocalIndex();

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
IndexNode.INVOCATION_LOCAL = 'invocationLocal';
IndexNode.DRAW = 'draw';

export default IndexNode;

IndexNode.type = /*@__PURE__*/ registerNode( 'Index', IndexNode );

export const vertexIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.VERTEX );
export const instanceIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INSTANCE );
export const invocationLocalIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_LOCAL );
export const drawIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.DRAW );
