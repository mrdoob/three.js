import Node from './Node.js';

class BypassNode extends Node {

	constructor( callNode, outputNode = null ) {

		super();

		this.isBypassNode = true;

		this.callNode = callNode;
		this.outputNode = outputNode;

	}

	getNodeType( builder ) {

		return this.outputNode.getNodeType( builder );

	}

	generate( builder, output ) {

		const snippet = this.callNode.build( builder, 'void' );

		if ( snippet !== '' ) {

			builder.addFlowCode( snippet );

		}

		return this.outputNode ? this.outputNode.build( builder, output ) : '';

	}

}

export default BypassNode;
