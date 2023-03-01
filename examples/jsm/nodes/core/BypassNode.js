import Node, { addNodeClass } from './Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class BypassNode extends Node {

	constructor( returnNode, callNode ) {

		super();

		this.isBypassNode = true;

		this.outputNode = returnNode;
		this.callNode = callNode;

	}

	getNodeType( builder ) {

		return this.outputNode.getNodeType( builder );

	}

	generate( builder, output ) {

		const snippet = this.callNode.build( builder, 'void' );

		if ( snippet !== '' ) {

			builder.addFlowCode( snippet );

		}

		return this.outputNode.build( builder, output );

	}

}

export default BypassNode;

export const bypass = nodeProxy( BypassNode );

addNodeElement( 'bypass', bypass );

addNodeClass( BypassNode );
