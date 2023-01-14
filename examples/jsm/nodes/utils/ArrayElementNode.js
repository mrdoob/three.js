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

		const nodeSnippet = this.node.build( builder ); // We should build the node before accessing its nodeData

		if ( this.node.isBufferNode === true ) {

			const nodeData = builder.getDataFromNode( this.node, builder.getShaderStage() );
			const buffer = nodeData.uniformBuffer;
			if ( buffer !== undefined ) {

				return buffer.getElement( this.indexNode ).build( builder );

			}

		}

		const indexSnippet = this.indexNode.build( builder, 'uint' );

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

export default ArrayElementNode;
