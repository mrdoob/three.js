import Node from './Node.js';
import { NodeShaderStage } from './constants.js';

class VaryNode extends Node {

	constructor( value ) {

		super();

		this.value = value;

	}

	getNodeType( builder ) {

		// VaryNode is auto type

		return this.value.getNodeType( builder );

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const value = this.value;

		const nodeVary = builder.getVaryFromNode( this, type );
		const propertyName = builder.getPropertyName( nodeVary );

		// force nodeVary.snippet work in vertex stage
		builder.flowNodeFromShaderStage( NodeShaderStage.Vertex, value, type, propertyName );

		return propertyName;

	}

}

export default VaryNode;
