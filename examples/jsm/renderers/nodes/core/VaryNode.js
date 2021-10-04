import Node from './Node.js';
import { NodeShaderStage } from './constants.js';

class VaryNode extends Node {

	constructor( value, name = '' ) {

		super();

		this.value = value;
		this.name = name;

	}

	getNodeType( builder ) {

		// VaryNode is auto type

		return this.value.getNodeType( builder );

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const value = this.value;
		const name = this.name;

		const nodeVary = builder.getVaryFromNode( this, type );

		if ( name !== '' ) {

			nodeVary.name = name;

		}

		const propertyName = builder.getPropertyName( nodeVary );

		// force nodeVary.snippet work in vertex stage
		builder.flowNodeFromShaderStage( NodeShaderStage.Vertex, value, type, propertyName );

		return propertyName;

	}

}

export default VaryNode;
