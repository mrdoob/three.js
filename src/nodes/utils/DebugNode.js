import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

class DebugNode extends TempNode {

	static get type() {

		return 'DebugNode';

	}

	constructor( node, callback = null ) {

		super();

		this.node = node;
		this.callback = callback;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	setup( builder ) {

		return this.node.build( builder );

	}

	analyze( builder ) {

		return this.node.build( builder );

	}

	generate( builder ) {

		const callback = this.callback;
		const snippet = this.node.build( builder );

		let code = '';
		code += '// #--- TSL Debug ---#\n';
		code += builder.flow.code.replace( /^\t/mg, '' ) + '\n';
		code += '/* ... */ ' + snippet + ' /* ... */\n';
		code += '// #-----------------#\n';

		if ( callback !== null ) {

			callback( code );

		} else {

			console.log( code );

		}

		return snippet;

	}

}

export default DebugNode;

export const debug = ( node, callback = null ) => nodeObject( new DebugNode( nodeObject( node ), callback ) );

addMethodChaining( 'debug', debug );
