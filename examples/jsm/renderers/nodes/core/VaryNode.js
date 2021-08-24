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

		const nodeVary = builder.getVaryFromNode( this, type );
		const propertyName = builder.getPropertyName( nodeVary );

		// force nodeVary.snippet work in vertex stage
		const flowData = builder.flowNodeFromShaderStage( NodeShaderStage.Vertex, this.value, type, propertyName );

		return builder.format( propertyName, type, output );

	}

}

export default VaryNode;
