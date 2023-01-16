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

		if ( aNode.isBufferNode === true || ( aNode.node && aNode.node.isBufferNode === true ) ) { // TODO: Maybe this can be moved to .construct()?

			const nodeData = builder.getDataFromNode( aNode.isBufferNode ? aNode : aNode.node, builder.getShaderStage() );
			const buffer = nodeData.uniformBuffer;
			if ( buffer !== undefined ) {

				builder.outComputeBuffer = buffer;
				return buffer.setElement( bNode ).build( builder, output );

			}

		}

		const type = this.getNodeType( builder, output );

		const a = aNode.build( builder, type );
		const b = bNode.build( builder, type );

		if ( output !== 'void' ) {

			builder.addFlowCode( `${a} = ${b}` );

			return a;

		} else if ( type !== 'void' ) {

			return builder.format( `${a} = ${b}`, type, output );

		}

	}

}

export default AssignNode;
