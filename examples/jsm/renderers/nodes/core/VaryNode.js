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
		const value = this.value;

		const nodeVary = builder.getVaryFromNode( this, type );
		const propertyName = builder.getPropertyName( nodeVary );

		// force nodeVary.snippet work in vertex stage
		builder.flowNodeFromShaderStage( NodeShaderStage.Vertex, value, type, propertyName );

		return builder.format( propertyName, type, output );

	}

}

export default VaryNode;
