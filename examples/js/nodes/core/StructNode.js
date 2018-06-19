/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.StructNode = function ( src ) {

	THREE.TempNode.call( this);

	this.eval( src );

};

THREE.StructNode.rDeclaration = /^struct\s*([a-z_0-9]+)\s*{\s*((.|\n)*?)}/img;
THREE.StructNode.rProperties = /\s*(\w*?)\s*(\w*?)(\=|\;)/img;

THREE.StructNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.StructNode.prototype.constructor = THREE.StructNode;
THREE.StructNode.prototype.nodeType = "Struct";

THREE.StructNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.name );

};

THREE.StructNode.prototype.getInputByName = function ( name ) {

	var i = this.inputs.length;

	while ( i -- ) {

		if ( this.inputs[ i ].name === name )
			return this.inputs[ i ];

	}

};

THREE.StructNode.prototype.generate = function ( builder, output ) {

	if ( output === 'source' ) {

		return this.src + ';';

	} else {

		return builder.format( "(" + src + ")", this.getType( builder ), output );

	}

};

THREE.StructNode.prototype.eval = function ( src ) {

	this.src = src || '';
	
	this.inputs = [];
	
	var declaration = THREE.StructNode.rDeclaration.exec( this.src );
	
	if (declaration) {
		
		var properties = declaration[2], matchType, matchName;
		
		while ( matchType = THREE.FunctionNode.rProperties.exec( properties ) ) {
			
			matchName = THREE.FunctionNode.rProperties.exec( properties )[0];
			
			this.inputs.push( {
				name: matchName,
				type: matchType
			} );
			
		}
		
		this.name = declaration[1];

	} else {
		
		this.name = '';
		
	}
	
	this.type = this.name;

};

THREE.StructNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.src = this.src;

	}

	return data;

};
