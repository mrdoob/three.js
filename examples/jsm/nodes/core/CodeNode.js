import Node, { addNodeClass } from './Node.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class CodeNode extends Node {

	constructor( code = '', includes = [] ) {

		super( 'code' );

		this.isCodeNode = true;

		this.code = code;

		this._includes = includes;

	}

	setIncludes( includes ) {

		this._includes = includes;

		return this;

	}

	getIncludes( /*builder*/ ) {

		return this._includes;

	}

	generate( builder ) {

		const includes = this.getIncludes( builder );

		for ( const include of includes ) {

			include.build( builder );

		}

		const nodeCode = builder.getCodeFromNode( this, this.getNodeType( builder ) );
		nodeCode.code = this.code;

		return nodeCode.code;

	}

}

export default CodeNode;

export const code = nodeProxy( CodeNode );

addNodeClass( CodeNode );
