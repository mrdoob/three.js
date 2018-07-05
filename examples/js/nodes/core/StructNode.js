/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from './TempNode.js';
import { FunctionNode } from './FunctionNode.js';

function StructNode( src ) {

	TempNode.call( this);

	this.eval( src );

};

StructNode.rDeclaration = /^struct\s*([a-z_0-9]+)\s*{\s*((.|\n)*?)}/img;
StructNode.rProperties = /\s*(\w*?)\s*(\w*?)(\=|\;)/img;

StructNode.prototype = Object.create( TempNode.prototype );
StructNode.prototype.constructor = StructNode;
StructNode.prototype.nodeType = "Struct";

StructNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.name );

};

StructNode.prototype.getInputByName = function ( name ) {

	var i = this.inputs.length;

	while ( i -- ) {

		if ( this.inputs[ i ].name === name )
			return this.inputs[ i ];

	}

};

StructNode.prototype.generate = function ( builder, output ) {

	if ( output === 'source' ) {

		return this.src + ';';

	} else {

		return builder.format( "(" + src + ")", this.getType( builder ), output );

	}

};

StructNode.prototype.eval = function ( src ) {

	this.src = src || '';
	
	this.inputs = [];
	
	var declaration = StructNode.rDeclaration.exec( this.src );
	
	if (declaration) {
		
		var properties = declaration[2], matchType, matchName;
		
		while ( matchType = FunctionNode.rProperties.exec( properties ) ) {
			
			matchName = FunctionNode.rProperties.exec( properties )[0];
			
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

StructNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.src = this.src;

	}

	return data;

};

export { StructNode };
