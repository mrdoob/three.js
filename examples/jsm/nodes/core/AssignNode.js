import TempNode from './TempNode.js';

class AssignNode extends TempNode {

	constructor( aNode, bNode ) {

		super();

		this.aNode = aNode;
		this.bNode = bNode;

	}

	hasDependencies( builder ) {

		return false;

	}

	getNodeType( builder, output ) {

		const aNode = this.aNode;
		const bNode = this.bNode;

		const typeA = aNode.getNodeType( builder );
		const typeB = bNode.getNodeType( builder );

		if ( typeA === 'void' || typeB === 'void' ) {

			return 'void';

		} else {

			return typeA;

		}

	}

	generate( builder, output ) {

		const aNode = this.aNode;
		const bNode = this.bNode;

		const type = this.getNodeType( builder, output );

		const a = aNode.build( builder, type );
		const b = bNode.build( builder, type );

		const outputLength = builder.getTypeLength( output );

		if ( output !== 'void' ) {

			if ( aNode.isBufferNode === true || aNode.node.isBufferNode === true ) {

				const nodeData = builder.getDataFromNode( aNode.isBufferNode ? aNode : aNode.node, builder.getShaderStage() );
				if ( nodeData.uniformBuffer !== undefined ) return nodeData.uniformBuffer.setElement( bNode ).build( builder );

			}

			builder.addFlowCode( `${a} = ${b}` );

			return a;

		} else if ( type !== 'void' ) {

			return builder.format( `${a} = ${b}`, type, output );

		}

	}

}

export default AssignNode;
