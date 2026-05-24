import Node from '../core/Node.js';
import { nodeObject, nodeProxy } from '../tsl/TSLCore.js';

class ReturnNode extends Node {

	static get type() {

		return 'ReturnNode';

	}

	constructor( valueNode = null ) {

		super( 'void' );

		this.valueNode = valueNode;

	}

	generate( builder ) {

		if ( this.valueNode !== null ) {

			const snippet = this.valueNode.build( builder );

			builder.addLineFlowCode( `return ${ snippet };`, this );

		} else {

			builder.addLineFlowCode( 'return;', this );

		}

	}

}

export default ReturnNode;

export const returnNode = ( value = null ) => nodeProxy( ReturnNode )( value === null ? null : nodeObject( value ) );
