/**
 * @author sunag / http://www.sunag.com.br/
 * @thanks bhouston / https://clara.io/
 */

import { TempNode } from './TempNode.js';
import { NodeLib } from './NodeLib.js';

var declarationRegexp = /^([a-z_0-9]+)\s([a-z_0-9]+)\s*\((.*?)\)/i,
	propertiesRegexp = /[a-z_0-9]+/ig;

function FunctionNode( src, includes, extensions, keywords, type ) {

	this.isMethod = type === undefined;

	TempNode.call( this, type );

	this.parse( src, includes, extensions, keywords );

}

FunctionNode.prototype = Object.create( TempNode.prototype );
FunctionNode.prototype.constructor = FunctionNode;
FunctionNode.prototype.nodeType = "Function";

FunctionNode.prototype.useKeywords = true;

FunctionNode.prototype.getShared = function ( /* builder, output */ ) {

	return ! this.isMethod;

};

FunctionNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.type );

};

FunctionNode.prototype.getInputByName = function ( name ) {

	var i = this.inputs.length;

	while ( i -- ) {

		if ( this.inputs[ i ].name === name ) {

			return this.inputs[ i ];

		}

	}

};

FunctionNode.prototype.getIncludeByName = function ( name ) {

	var i = this.includes.length;

	while ( i -- ) {

		if ( this.includes[ i ].name === name ) {

			return this.includes[ i ];

		}

	}

};

FunctionNode.prototype.generate = function ( builder, output ) {

	var match, offset = 0, src = this.src;

	for ( var i = 0; i < this.includes.length; i ++ ) {

		builder.include( this.includes[ i ], this );

	}

	for ( var ext in this.extensions ) {

		builder.extensions[ ext ] = true;

	}

	var matches = [];

	while ( match = propertiesRegexp.exec( this.src ) ) matches.push( match );

	for ( var i = 0; i < matches.length; i ++ ) {

		var match = matches[ i ];

		var prop = match[ 0 ],
			isGlobal = this.isMethod ? ! this.getInputByName( prop ) : true,
			reference = prop;

		if ( this.keywords[ prop ] || ( this.useKeywords && isGlobal && NodeLib.containsKeyword( prop ) ) ) {

			var node = this.keywords[ prop ];

			if ( ! node ) {

				var keyword = NodeLib.getKeywordData( prop );

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

		builder.include( this, false, src );

		return this.name;

	} else {

		return builder.format( '( ' + src + ' )', this.getType( builder ), output );

	}

};

FunctionNode.prototype.parse = function ( src, includes, extensions, keywords ) {

	this.src = src || '';

	this.includes = includes || [];
	this.extensions = extensions || {};
	this.keywords = keywords || {};

	if ( this.isMethod ) {

		var match = this.src.match( declarationRegexp );

		this.inputs = [];

		if ( match && match.length == 4 ) {

			this.type = match[ 1 ];
			this.name = match[ 2 ];

			var inputs = match[ 3 ].match( propertiesRegexp );

			if ( inputs ) {

				var i = 0;

				while ( i < inputs.length ) {

					var qualifier = inputs[ i ++ ];
					var type, name;

					if ( qualifier == 'in' || qualifier == 'out' || qualifier == 'inout' ) {

						type = inputs[ i ++ ];

					} else {

						type = qualifier;
						qualifier = '';

					}

					name = inputs[ i ++ ];

					this.inputs.push( {
						name: name,
						type: type,
						qualifier: qualifier
					} );

				}

			}

		} else {

			this.type = '';
			this.name = '';

		}

	}

};

FunctionNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.isMethod = source.isMethod;
	this.useKeywords = source.useKeywords;

	this.parse( source.src, source.includes, source.extensions, source.keywords );

	if ( source.type !== undefined ) this.type = source.type;

};

FunctionNode.prototype.toJSON = function ( meta ) {

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

};

export { FunctionNode };
