class NodeKeywords {

	constructor() {

		this.keywords = [];
		this.nodes = {};
		this.keywordsCallback = {};

	}

	getNode( name ) {

		let node = this.nodes[ name ];

		if ( node === undefined && this.keywordsCallback[ name ] !== undefined ) {

			node = this.keywordsCallback[ name ]( name );

			this.nodes[ name ] = node;

		}

		return node;

	}

	addKeyword( name, callback ) {

		this.keywords.push( name );
		this.keywordsCallback[ name ] = callback;

		return this;

	}

	parse( code ) {

		const keywordNames = this.keywords;

		const regExp = new RegExp( `\\b${keywordNames.join( '\\b|\\b' )}\\b`, 'g' );

		const codeKeywords = code.match( regExp );

		const keywordNodes = [];

		if ( codeKeywords !== null ) {

			for ( const keyword of codeKeywords ) {

				const node = this.getNode( keyword );

				if ( node !== undefined && keywordNodes.indexOf( node ) === - 1 ) {

					keywordNodes.push( node );

				}

			}

		}

		return keywordNodes;

	}

	include( builder, code ) {

		const keywordNodes = this.parse( code );

		for ( const keywordNode of keywordNodes ) {

			keywordNode.build( builder );

		}

	}

}

export default NodeKeywords;
