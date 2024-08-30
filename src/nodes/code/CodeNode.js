import Node, { registerNode } from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class CodeNode extends Node {

	constructor( code = '', includes = [], language = '' ) {

		super( 'code' );

		this.isCodeNode = true;

		this.code = code;
		this.language = language;

		this.includes = includes;

	}

	isGlobal() {

		return true;

	}

	setIncludes( includes ) {

		this.includes = includes;

		return this;

	}

	getIncludes( /*builder*/ ) {

		return this.includes;

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

	serialize( data ) {

		super.serialize( data );

		data.code = this.code;
		data.language = this.language;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.code = data.code;
		this.language = data.language;

	}

}

export default CodeNode;

CodeNode.type = /*@__PURE__*/ registerNode( 'Code', CodeNode );

export const code = /*@__PURE__*/ nodeProxy( CodeNode );

export const js = ( src, includes ) => code( src, includes, 'js' );
export const wgsl = ( src, includes ) => code( src, includes, 'wgsl' );
export const glsl = ( src, includes ) => code( src, includes, 'glsl' );
