import TempNode from './TempNode.js';
import { addNodeClass } from './Node.js';
import StructTypeNode from './StructTypeNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

// @TODO: clean up structs-related code (rename StructTypeNode to NodeStruct, OutputStructNode to StructNode possibly, NodeBuilder.getStructTypeFromNode to NodeBuilder.getStructFromNode, remove NodeBuilder._getWGSLStruct and NodeBuilder._getWGSLStructBinding)

class OutputStructNode extends TempNode {

	constructor( ...members ) {

		super();

		this.isOutputStructNode = true;
		this.members = members;

	}

	setup( builder ) {

		super.setup( builder );

		const members = this.members;
		const types = [];

		for ( let i = 0; i < members.length; i++ ) {

			types.push( members[ i ].getNodeType( builder ) );

		}

		this.nodeType = builder.getStructTypeFromNode( new StructTypeNode( types ) ).name;

	}

	generate( builder, output ) {

		const nodeVar = builder.getVarFromNode( this );
		nodeVar.isOutputStructVar = true;

		const propertyName = builder.getPropertyName( nodeVar );

		const members = this.members;

		const structPrefix = propertyName !== '' ? propertyName + '.' : '';

		for ( let i = 0; i < members.length; i++ ) {

			const snippet = members[ i ].build( builder, output );

			builder.addLineFlowCode( `${structPrefix}m${i} = ${snippet}` );

		}

		return propertyName;

	}

}

export default OutputStructNode;

export const outputStruct = nodeProxy( OutputStructNode );

addNodeClass( 'OutputStructNode', OutputStructNode );
