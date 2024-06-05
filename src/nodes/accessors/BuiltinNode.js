import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class BuiltinNode extends Node {

	constructor( name ) {

		super( 'float' );

		this.name = name;

		this.isBuiltinNode = true;

	}

	generate( /* builder */ ) {

		return this.name;

	}

}

export default BuiltinNode;

export const builtin = nodeProxy( BuiltinNode );
