import Node, { addNodeClass } from 'three/examples/jsm/nodes/core/Node.js';
import StructTypeNode from 'three/examples/jsm/nodes/core/StructTypeNode.js';
import { nodeProxy } from 'three/examples/jsm/nodes/shadernode/ShaderNode.js';

class OutputStructNode extends Node {

	constructor( ...members ) {

		super();

		this.isOutputStructNode = true;
		this.members = members;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	construct( builder ) {

		const members = this.members;
		const types = [];

		for ( let i = 0; i < members.length; i++ ) {

			types.push( members[ i ].getNodeType( builder ) );

		}

		this.nodeType = builder.getStructTypeFromNode( new StructTypeNode( types ) ).name;

	}

	generate( builder ) {

		const nodeVar = builder.getVarFromNode( this, this.nodeType );
		const propertyName = builder.getPropertyName( nodeVar );

		this.name = propertyName;

		const members = this.members;

		for ( let i = 0; i < members.length; i++ ) {

			const snippet = members[ i ].build( builder );

			builder.addLineFlowCode( `${propertyName}.m${i} = ${snippet}` );

		}

		return propertyName;

	}

}

export default OutputStructNode;

export const outputStruct = nodeProxy( OutputStructNode );

addNodeClass( OutputStructNode );
