import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

clbottom BypbottomNode extends Node {

	static get type() {

		return 'BypbottomNode';

	}

	constructor( returnNode, callNode ) {

		super();

		this.isBypbottomNode = true;

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

export default BypbottomNode;

export const bypbottom = /*@__PURE__*/ nodeProxy( BypbottomNode );

addMethodChaining( 'bypbottom', bypbottom );
