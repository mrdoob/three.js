/**
 * @author sunag / http://www.sunag.com.br/
 * @thanks bhouston / https://clara.io/
 */

import { TempNode } from './TempNode.js';
import { NodeLib } from './NodeLib.js';

import { GLSLParser } from './GLSLParser.js';

export class FunctionNode extends TempNode {

	constructor( src, includes, extensions, keywords, type ) {

		super( type );

		this.isMethod = type === undefined;
		this.isInterface = false;

		this.tokenProperties = [];

		this.parse( src, includes, extensions, keywords );

		this.isFunctionNode = true;
		this.useKeywords = true;

		this.nodeType = "Function";

	}

	getShared() {

		return ! this.isMethod;

	}

	getType( builder ) {

		return builder.getTypeByFormat( this.type );

	}

	getInputByName( name ) {

		var i = this.inputs.length;

		while ( i -- ) {

			if ( this.inputs[ i ].name === name ) {

				return this.inputs[ i ];

			}

		}

	}

	getIncludeByName( name ) {

		var i = this.includes.length;

		while ( i -- ) {

			if ( this.includes[ i ].name === name ) {

				return this.includes[ i ];

			}

		}

	}

	generate( builder, output ) {

		var match, offset = 0, src = this.src;

		for ( var i = 0; i < this.includes.length; i ++ ) {

			builder.include( this.includes[ i ], this );

		}

		for ( var ext in this.extensions ) {

			builder.extensions[ ext ] = true;

		}

		for ( var i = 0; i < this.tokenProperties.length; i ++ ) {

			var property = this.tokenProperties[ i ],
				propertyName = property.token.str,
				isGlobal = this.isMethod ? ! this.getInputByName( propertyName ) : true,
				reference = propertyName;

			if ( this.keywords[ propertyName ] || ( this.useKeywords && isGlobal && NodeLib.containsKeyword( propertyName ) ) ) {

				var node = this.keywords[ propertyName ];

				if ( ! node ) {

					var keyword = NodeLib.getKeywordData( propertyName );

					if ( keyword.cache ) node = builder.keywords[ propertyName ];

					node = node || NodeLib.getKeyword( propertyName, builder );

					if ( keyword.cache ) builder.keywords[ propertyName ] = node;

				}

				if ( node !== this ) reference = node.build( builder );

			}

			if ( propertyName !== reference ) {
				
				var codeBlockStartPos = property.codeBlock.start.pos,
					relativeStartPos = ( property.token.pos - codeBlockStartPos ) + offset,
					relativeEndPos = ( property.token.endPos - codeBlockStartPos ) + offset;
				
				src = src.substring( 0, relativeStartPos ) + reference + src.substring( relativeEndPos );

				offset += reference.length - propertyName.length;

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

	fromParser( parser, prop ) {

		this.name = prop.name;
		this.type = prop.type;

		this.src = prop.getSource();

		this.tokenProperties = prop.nodes;

		this.inputs = [];

		for ( var i = 0; i < prop.args.length; i ++ ) {

			var argument = prop.args[i];

			this.inputs.push( {
				type: argument.type,
				name: argument.name
			} );

		}

		parser.getIncludes( prop, this.includes );

		return this;

	}

	parse( src, includes, extensions, keywords ) {

		this.src = src || '';

		this.includes = includes || [];
		this.extensions = extensions || {};
		this.keywords = keywords || {};

		if ( this.isMethod && src ) {
			
			var parser = new GLSLParser( src );
			
			this.fromParser( parser, parser.getMainProperty() );
			
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

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.src = this.src;
			data.isMethod = this.isMethod;
			data.useKeywords = this.useKeywords;

			if ( ! this.isMethod ) data.type = this.type;

			data.extensions = JSON.parse( JSON.stringify( this.extensions ) );
			data.keywords = {};

			for ( var keyword in this.keywords ) {

				data.keywords[ keyword ] = this.keywords[ keyword ].toJSON( meta ).uuid;

			}

			if ( this.includes.length ) {

				data.includes = [];

				for ( var i = 0; i < this.includes.length; i ++ ) {

					data.includes.push( this.includes[ i ].toJSON( meta ).uuid );

				}

			}

		}

		return data;

	}

}
