import TempNode from '../core/Node.js';

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
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		if ( this.node.isBufferNode === true ) {

			const nodeData = builder.getDataFromNode( this.node, builder.getShaderStage() );
			if ( nodeData.uniformBuffer !== undefined ) return nodeData.uniformBuffer.getElement( this.indexNode ).build( builder );

		}

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

export default ArrayElementNode;
