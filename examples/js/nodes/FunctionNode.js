/**
 * @author sunag / http://www.sunag.com.br/
 * @thanks bhouston / https://clara.io/
 */

THREE.FunctionNode = function( src, includes, extensions ) {

	THREE.GLNode.call( this );

	this.useReservedNames = true;
	
	this.parse( src || '', includes, extensions );

};

THREE.FunctionNode.rDeclaration = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\((.*?)\)/i;
THREE.FunctionNode.rProperties = /[a-z_0-9]+/ig;

THREE.FunctionNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.FunctionNode.prototype.constructor = THREE.FunctionNode;

THREE.FunctionNode.prototype.getType = function( builder ) {

	return builder.getTypeByFormat( this.type ) || this.type;

};

THREE.FunctionNode.prototype.getInputByName = function( name ) {

	var i = this.inputs.length;

	while ( i -- ) {

		if ( this.inputs[ i ].name === name )
			return this.inputs[ i ];

	}

};

THREE.FunctionNode.prototype.getIncludeByName = function( name ) {

	var i = this.includes.length;

	while ( i -- ) {

		if ( this.includes[ i ].name === name )
			return this.includes[ i ];

	}

};

THREE.FunctionNode.prototype.buildReference = function( builder, name ) {

	switch ( name ) {
		case 'uv': return new THREE.UVNode().build( builder );
		case 'uv2': return new THREE.UVNode( 1 ).build( builder );
		case 'position': return new THREE.PositionNode().build( builder );
		case 'worldPosition': return new THREE.PositionNode( THREE.PositionNode.WORLD ).build( builder );
		case 'normal': return new THREE.NormalNode().build( builder );
		case 'normalPosition': return new THREE.NormalNode( THREE.NormalNode.WORLD ).build( builder );
		case 'viewPosition': return new THREE.PositionNode( THREE.NormalNode.VIEW ).build( builder );
		case 'viewNormal': return new THREE.NormalNode( THREE.NormalNode.VIEW ).build( builder );
	}

	return name;

};

THREE.FunctionNode.prototype.build = function( builder, output ) {

	if (output == 'shader') {
		
		if (this.value) {
			
			var match, offset = 0, src = this.value;

			for ( var i = 0; i < this.includes.length; i ++ ) {

				builder.include( this.includes[ i ], true );

			}
			
			for ( var ext in this.extensions ) {

				builder.material.extensions[ ext ] = true;

			}
			
			while ( match = THREE.FunctionNode.rProperties.exec( src ) ) {

				var prop = match[ 0 ];
				var reference = !this.useReservedNames || this.getInputByName( prop ) ? prop : this.buildReference( builder, prop );

				if ( prop != reference ) {

					src = src.substring( 0, match.index + offset ) + reference + src.substring( match.index + prop.length + offset );

					offset += reference.length - prop.length;

				}

				if ( this.getIncludeByName( reference ) === undefined && THREE.NodeLib.contains( reference ) ) {

					builder.include( THREE.NodeLib.get( reference ) );

				}

			}
			
			return src;
			
		}
		
	} else {

		builder.include( this );
	
		return builder.format( this.name, this.getType( builder ), output );
		
	}

};

THREE.FunctionNode.prototype.parse = function( src, includes, extensions ) {

	this.includes = includes || [];
	this.extensions = extensions || {};

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
					name : name,
					type : type,
					qualifier : qualifier
				} );

			}

		}

		this.value = src;

	} else {

		this.type = '';
		this.name = '';

	}

};
