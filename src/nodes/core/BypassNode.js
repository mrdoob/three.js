import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

class BypassNode extends Node {

	static get type() {

		return 'BypassNode';

	}

	constructor( returnNode, callNode ) {

		super();

		this.isBypassNode = true;

		this.outputNode = returnNode;
		this.callNode = callNode;

	}

	getNodeType( builder ) {

		return this.outputNode.getNodeType( builder );

	}

	generate( builder ) {

		const snippet = this.callNode.build( builder, 'void' );

		if ( snippet !== '' ) {

			builder.addLineFlowCode( snippet, this );

		}

		return this.outputNode.build( builder );

	}

}

export default BypassNode;

export const bypass = /*@__PURE__*/ nodeProxy( BypassNode );

addMethodChaining( 'bypass', bypass );
