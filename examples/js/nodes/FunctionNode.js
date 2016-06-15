/**
 * @author sunag / http://www.sunag.com.br/
 * @thanks bhouston / https://clara.io/
 */

THREE.FunctionNode = function( src, includes, extensions ) {

	THREE.GLNode.call( this );

	this.parse( src || '', includes, extensions );

};

THREE.FunctionNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.FunctionNode.prototype.constructor = THREE.FunctionNode;

THREE.FunctionNode.prototype.parseReference = function( name ) {

	switch ( name ) {
		case 'uv': return new THREE.UVNode().name;
		case 'uv2': return new THREE.UVNode( 1 ).name;
		case 'position': return new THREE.PositionNode().name;
		case 'worldPosition': return new THREE.PositionNode( THREE.PositionNode.WORLD ).name;
		case 'normal': return new THREE.NormalNode().name;
		case 'normalPosition': return new THREE.NormalNode( THREE.NormalNode.WORLD ).name;
		case 'viewPosition': return new THREE.PositionNode( THREE.NormalNode.VIEW ).name;
		case 'viewNormal': return new THREE.NormalNode( THREE.NormalNode.VIEW ).name;
	}

	return name;

};

THREE.FunctionNode.prototype.getTypeNode = function( builder, type ) {

	return builder.getTypeByFormat( type ) || type;

};

THREE.FunctionNode.prototype.getInputByName = function( name ) {

	var i = this.inputs.length;

	while ( i -- ) {

		if ( this.inputs[ i ].name === name )
			return this.inputs[ i ];

	}

};

THREE.FunctionNode.prototype.getType = function( builder ) {

	return this.getTypeNode( builder, this.type );

};

THREE.FunctionNode.prototype.getInclude = function( name ) {

	var i = this.includes.length;

	while ( i -- ) {

		if ( this.includes[ i ].name === name )
			return this.includes[ i ];

	}

	return undefined;

};

THREE.FunctionNode.prototype.parse = function( src, includes, extensions ) {

	var rDeclaration = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\((.*?)\)/i;
	var rProperties = /[a-z_0-9]+/ig;

	this.includes = includes || [];
	this.extensions = extensions || {};

	var match = src.match( rDeclaration );

	this.inputs = [];

	if ( match && match.length == 4 ) {

		this.type = match[ 1 ];
		this.name = match[ 2 ];

		var inputs = match[ 3 ].match( rProperties );

		if ( inputs ) {

			var i = 0;

			while ( i < inputs.length ) {

				var qualifier = inputs[ i ++ ];
				var type, name;

				if ( qualifier == 'in' || qualifier == 'out' || qualifier == 'inout' ) {

					type = inputs[ i ++ ];

				}
				else {

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

		var match, offset = 0;

		while ( match = rProperties.exec( src ) ) {

			var prop = match[ 0 ];
			var reference = this.parseReference( prop );

			if ( prop != reference ) {

				src = src.substring( 0, match.index + offset ) + reference + src.substring( match.index + prop.length + offset );

				offset += reference.length - prop.length;

			}

			if ( this.getInclude( reference ) === undefined && THREE.NodeLib.contains( reference ) ) {

				this.includes.push( THREE.NodeLib.get( reference ) );

			}

		}

		this.src = src;

	}
	else {

		this.type = '';
		this.name = '';

	}

};
