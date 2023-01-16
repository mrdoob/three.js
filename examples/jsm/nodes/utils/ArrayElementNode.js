import TempNode from '../core/TempNode.js';

class ArrayElementNode extends TempNode {

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		if ( this.node.isBufferNode === true ) { // TODO: Maybe this can be moved to .construct()?

			const nodeData = builder.getDataFromNode( this.node, builder.getShaderStage() );
			const buffer = nodeData.uniformBuffer;
			if ( buffer !== undefined ) {

				return buffer.getElement( this.indexNode ).build( builder );

			}

		}

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

export default ArrayElementNode;
