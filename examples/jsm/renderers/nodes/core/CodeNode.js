import Node from './Node.js';

class CodeNode extends Node {

	constructor( code = '', nodeType = 'code' ) {

		super( nodeType );

		this.code = code;

		this.useKeywords = false;

		this._includes = [];

	}

	setIncludes( includes ) {

		this._includes = includes;

		return this;

	}

	getIncludes( /*builder*/ ) {

		return this._includes;

	}

	generate( builder ) {

		if ( this.useKeywords === true ) {

			const contextKeywords = builder.context.keywords;

			if ( contextKeywords !== undefined ) {

				const nodeData = builder.getDataFromNode( this, builder.shaderStage );

				if ( nodeData.keywords === undefined ) {

					nodeData.keywords = [];

				}

				if ( nodeData.keywords.indexOf( contextKeywords ) === - 1 ) {

					contextKeywords.include( builder, this.code );

					nodeData.keywords.push( contextKeywords );

				}

			}

		}

		const includes = this.getIncludes( builder );

		for ( const include of includes ) {

			include.build( builder );

		}

		const nodeCode = builder.getCodeFromNode( this, this.getNodeType( builder ) );
		nodeCode.code = this.code;

		return nodeCode.code;

	}

}

CodeNode.prototype.isCodeNode = true;

export default CodeNode;
