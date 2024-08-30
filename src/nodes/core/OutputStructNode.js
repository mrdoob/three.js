import Node, { registerNode } from './Node.js';
import StructTypeNode from './StructTypeNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class OutputStructNode extends Node {

	constructor( ...members ) {

		super();

		this.members = members;

		this.isOutputStructNode = true;

	}

	setup( builder ) {

		super.setup( builder );

		const members = this.members;
		const types = [];

		for ( let i = 0; i < members.length; i ++ ) {

			types.push( members[ i ].getNodeType( builder ) );

		}

		this.nodeType = builder.getStructTypeFromNode( new StructTypeNode( types ) ).name;

	}

	generate( builder, output ) {

		const propertyName = builder.getOutputStructName();
		const members = this.members;

		const structPrefix = propertyName !== '' ? propertyName + '.' : '';

		for ( let i = 0; i < members.length; i ++ ) {

			const snippet = members[ i ].build( builder, output );

			builder.addLineFlowCode( `${ structPrefix }m${ i } = ${ snippet }` );

		}

		return propertyName;

	}

}

export default OutputStructNode;

OutputStructNode.type = /*@__PURE__*/ registerNode( 'OutputStruct', OutputStructNode );

export const outputStruct = /*@__PURE__*/ nodeProxy( OutputStructNode );
