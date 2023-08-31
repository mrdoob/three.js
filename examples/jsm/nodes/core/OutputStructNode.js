import Node, { addNodeClass } from './Node.js';
import StructTypeNode from './StructTypeNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class OutputStructNode extends Node {

	constructor( ...members ) {

		super();

		this.isOutputStructNode = true;
		this.members = members;

	}

	construct( builder ) {

		super.construct( builder );

		const members = this.members;
		const types = [];

		for ( let i = 0; i < members.length; i++ ) {

			types.push( members[ i ].getNodeType( builder ) );

		}

		this.nodeType = builder.getStructTypeFromNode( new StructTypeNode( types ) ).name;

	}

	generate( builder, output ) {

		const nodeVar = builder.getVarFromNode( this, this.nodeType );
		const propertyName = builder.getPropertyName( nodeVar );

		const members = this.members;

		for ( let i = 0; i < members.length; i++ ) {

			const snippet = members[ i ].build( builder, output );

			builder.addLineFlowCode( `${propertyName}.m${i} = ${snippet}` );

		}

		return propertyName;

	}

}

export default OutputStructNode;

export const outputStruct = nodeProxy( OutputStructNode );

addNodeClass( OutputStructNode );
