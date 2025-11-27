import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';
import { log } from '../../utils.js';

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

		const title = '--- TSL debug - ' + builder.shaderStage + ' shader ---';
		const border = '-'.repeat( title.length );

		let code = '';
		code += '// #' + title + '#\n';
		code += builder.flow.code.replace( /^\t/mg, '' ) + '\n';
		code += '/* ... */ ' + snippet + ' /* ... */\n';
		code += '// #' + border + '#\n';

		if ( callback !== null ) {

			callback( builder, code );

		} else {

			log( code );

		}

		return snippet;

	}

}

export default DebugNode;

/**
 * TSL function for creating a debug node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node to debug.
 * @param {?Function} [callback=null] - Optional callback function to handle the debug output.
 * @returns {DebugNode}
 */
export const debug = ( node, callback = null ) => nodeObject( new DebugNode( nodeObject( node ), callback ) ).toStack();

addMethodChaining( 'debug', debug );
