/**
 * @author sunag / http://www.sunag.com.br/
 * @thanks bhouston / https://clara.io/
 */

THREE.FunctionNode = function ( src, includesOrType, extensionsOrIncludes, keywordsOrExtensions ) {

	src = src || '';

	this.isMethod = typeof includesOrType !== "string";
	this.useKeywords = true;

	THREE.TempNode.call( this, this.isMethod ? null : includesOrType );

	if ( this.isMethod ) this.eval( src, includesOrType, extensionsOrIncludes, keywordsOrExtensions );
	else this.eval( src, extensionsOrIncludes, keywordsOrExtensions );

};

THREE.FunctionNode.rDeclaration = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\((.*?)\)/i;
THREE.FunctionNode.rProperties = /[a-z_0-9]+/ig;

THREE.FunctionNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.FunctionNode.prototype.constructor = THREE.FunctionNode;
THREE.FunctionNode.prototype.nodeType = "Function";

THREE.FunctionNode.prototype.isShared = function ( builder, output ) {

	return ! this.isMethod;

};

THREE.FunctionNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.type );

};

THREE.FunctionNode.prototype.getInputByName = function ( name ) {

	var i = this.inputs.length;

	while ( i -- ) {

		if ( this.inputs[ i ].name === name )
			return this.inputs[ i ];

	}

};

THREE.FunctionNode.prototype.getIncludeByName = function ( name ) {

	var i = this.includes.length;

	while ( i -- ) {

		if ( this.includes[ i ].name === name )
			return this.includes[ i ];

	}

};

THREE.FunctionNode.prototype.generate = function ( builder, output ) {

	var match, offset = 0, src = this.value;

	for ( var i = 0; i < this.includes.length; i ++ ) {

		builder.include( this.includes[ i ], this );

	}

	for ( var ext in this.extensions ) {

		builder.material.extensions[ ext ] = true;

	}

	while ( match = THREE.FunctionNode.rProperties.exec( this.value ) ) {

		var prop = match[ 0 ], isGlobal = this.isMethod ? ! this.getInputByName( prop ) : true;
		var reference = prop;

		if ( this.keywords[ prop ] || ( this.useKeywords && isGlobal && THREE.NodeLib.containsKeyword( prop ) ) ) {

			var node = this.keywords[ prop ];

			if ( ! node ) {

				var keyword = THREE.NodeLib.getKeywordData( prop );

				if ( keyword.cache ) node = builder.keywords[ prop ];

				node = node || THREE.NodeLib.getKeyword( prop, builder );

				if ( keyword.cache ) builder.keywords[ prop ] = node;

			}

			reference = node.build( builder );

		}

		if ( prop != reference ) {

			src = src.substring( 0, match.index + offset ) + reference + src.substring( match.index + prop.length + offset );

			offset += reference.length - prop.length;

		}

		if ( this.getIncludeByName( reference ) === undefined && THREE.NodeLib.contains( reference ) ) {

			builder.include( THREE.NodeLib.get( reference ) );

		}

	}

	if ( output === 'source' ) {

		return src;

	} else if ( this.isMethod ) {

		builder.include( this, false, src );

		return this.name;

	} else {

		return builder.format( "(" + src + ")", this.getType( builder ), output );

	}

};

THREE.FunctionNode.prototype.eval = function ( src, includes, extensions, keywords ) {

	src = ( src || '' ).trim();

	this.includes = includes || [];
	this.extensions = extensions || {};
	this.keywords = keywords || {};

	if ( this.isMethod ) {

		var match = src.match( THREE.FunctionNode.rDeclaration );

		this.inputs = [];

		if ( match && match.length == 4 ) {

			this.type = match[ 1 ];
			this.name = match[ 2 ];

			var inputs = match[ 3 ].match( THREE.FunctionNode.rProperties );

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

	this.value = src;

};

THREE.FunctionNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.src = this.value;
		data.isMethod = this.isMethod;
		data.useKeywords = this.useKeywords;

		if ( ! this.isMethod ) data.out = this.type;

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
