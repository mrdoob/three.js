import Node from './Node.js';

class CodeNode extends Node {

	constructor( code = '', type = 'code' ) {

		super( type );

		this.code = code;

		this.useKeywords = false;

		this._includes = [];

		Object.defineProperty( this, 'isCodeNode', { value: true } );

	}

	setIncludes( includes ) {

		this._includes = includes;

		return this;

	}

	getIncludes( /*builder*/ ) {

		return this._includes;

	}

	generate( builder, output ) {

		if ( this.useKeywords === true ) {

			const contextKeywords = builder.getContextValue( 'keywords' );

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

		const type = this.getType( builder );
		const nodeCode = builder.getCodeFromNode( this, type );

		nodeCode.code = this.code;

		return nodeCode.code;

	}

}

export default CodeNode;
