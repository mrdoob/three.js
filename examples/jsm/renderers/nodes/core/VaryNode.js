import Node from './Node.js';
import { NodeShaderStage } from './constants.js';

class VaryNode extends Node {

	constructor( value ) {

		super();

		this.value = value;

	}

	getType( builder ) {

		// VaryNode is auto type

		return this.value.getType( builder );

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		// force nodeVary.snippet work in vertex stage
		const snippet = this.value.buildStage( builder, NodeShaderStage.Vertex, type );

		const nodeVary = builder.getVaryFromNode( this, type );
		nodeVary.snippet = snippet;

		const propertyName = builder.getPropertyName( nodeVary );

		return builder.format( propertyName, type, output );

	}

}

export default VaryNode;
