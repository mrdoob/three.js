import { TempNode } from './TempNode.js';
import { NodeLib } from './NodeLib.js';

const declarationRegexp = /^\s*([a-z_0-9]+)\s+([a-z_0-9]+)\s*\(([\s\S]*?)\)/i,
	propertiesRegexp = /[a-z_0-9]+/ig;

class FunctionNode extends TempNode {

	constructor( src, includes, extensions, keywords, type ) {

		super( type );

		this.isMethod = type === undefined;
		this.isInterface = false;

		this.parse( src, includes, extensions, keywords );

	}

	getShared( /* builder, output */ ) {

		return ! this.isMethod;

	}

	getType( builder ) {

		return builder.getTypeByFormat( this.type );

	}

	getInputByName( name ) {

		let i = this.inputs.length;

		while ( i -- ) {

			if ( this.inputs[ i ].name === name ) {

				return this.inputs[ i ];

			}

		}

	}

	getIncludeByName( name ) {

		let i = this.includes.length;

		while ( i -- ) {

			if ( this.includes[ i ].name === name ) {

				return this.includes[ i ];

			}

		}

	}

	generate( builder, output ) {

		let match, offset = 0, src = this.src;

		for ( let i = 0; i < this.includes.length; i ++ ) {

			builder.include( this.includes[ i ], this );

		}

		for ( const ext in this.extensions ) {

			builder.extensions[ ext ] = true;

		}

		const matches = [];

		while ( match = propertiesRegexp.exec( this.src ) ) matches.push( match );

		for ( let i = 0; i < matches.length; i ++ ) {

			const match = matches[ i ];

			const prop = match[ 0 ],
				isGlobal = this.isMethod ? ! this.getInputByName( prop ) : true;

			let reference = prop;

			if ( this.keywords[ prop ] || ( this.useKeywords && isGlobal && NodeLib.containsKeyword( prop ) ) ) {

				let node = this.keywords[ prop ];

				if ( ! node ) {

					const keyword = NodeLib.getKeywordData( prop );

					if ( keyword.cache ) node = builder.keywords[ prop ];

					node = node || NodeLib.getKeyword( prop, builder );

					if ( keyword.cache ) builder.keywords[ prop ] = node;

				}

				reference = node.build( builder );

			}

			if ( prop !== reference ) {

				src = src.substring( 0, match.index + offset ) + reference + src.substring( match.index + prop.length + offset );

				offset += reference.length - prop.length;

			}

			if ( this.getIncludeByName( reference ) === undefined && NodeLib.contains( reference ) ) {

				builder.include( NodeLib.get( reference ) );

			}

		}

		if ( output === 'source' ) {

			return src;

		} else if ( this.isMethod ) {

			if ( ! this.isInterface ) {

				builder.include( this, false, src );

			}

			return this.name;

		} else {

			return builder.format( '( ' + src + ' )', this.getType( builder ), output );

		}

	}

	parse( src, includes, extensions, keywords ) {

		this.src = src || '';

		this.includes = includes || [];
		this.extensions = extensions || {};
		this.keywords = keywords || {};

		if ( this.isMethod ) {

			const match = this.src.match( declarationRegexp );

			this.inputs = [];

			if ( match && match.length == 4 ) {

				this.type = match[ 1 ];
				this.name = match[ 2 ];

				const inputs = match[ 3 ].match( propertiesRegexp );

				if ( inputs ) {

					let i = 0;

					while ( i < inputs.length ) {

						let qualifier = inputs[ i ++ ];
						let type;

						if ( qualifier === 'in' || qualifier === 'out' || qualifier === 'inout' ) {

							type = inputs[ i ++ ];

						} else {

							type = qualifier;
							qualifier = '';

						}

						const name = inputs[ i ++ ];

						this.inputs.push( {
							name: name,
							type: type,
							qualifier: qualifier
						} );

					}

				}

				this.isInterface = this.src.indexOf( '{' ) === - 1;

			} else {

				this.type = '';
				this.name = '';

			}

		}

	}

	copy( source ) {

		super.copy( source );

		this.isMethod = source.isMethod;
		this.useKeywords = source.useKeywords;

		this.parse( source.src, source.includes, source.extensions, source.keywords );

		if ( source.type !== undefined ) this.type = source.type;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.src = this.src;
			data.isMethod = this.isMethod;
			data.useKeywords = this.useKeywords;

			if ( ! this.isMethod ) data.type = this.type;

			data.extensions = JSON.parse( JSON.stringify( this.extensions ) );
			data.keywords = {};

			for ( const keyword in this.keywords ) {

				data.keywords[ keyword ] = this.keywords[ keyword ].toJSON( meta ).uuid;

			}

			if ( this.includes.length ) {

				data.includes = [];

				for ( let i = 0; i < this.includes.length; i ++ ) {

					data.includes.push( this.includes[ i ].toJSON( meta ).uuid );

				}

			}

		}

		return data;

	}

}

FunctionNode.prototype.nodeType = 'Function';
FunctionNode.prototype.useKeywords = true;

export { FunctionNode };
