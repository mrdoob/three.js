import Node from './Node.js';
import { NodeShaderStage } from './constants.js';

class VaryNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		// VaryNode is auto type

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const node = this.node;
		const name = this.name;

		const nodeVary = builder.getVaryFromNode( this, type );

		if ( name !== null ) {

			nodeVary.name = name;

		}

		const propertyName = builder.getPropertyName( nodeVary, NodeShaderStage.Vertex );

		// force node run in vertex stage
		builder.flowNodeFromShaderStage( NodeShaderStage.Vertex, node, type, propertyName );

		return builder.getPropertyName( nodeVary );

	}

}

export default VaryNode;
