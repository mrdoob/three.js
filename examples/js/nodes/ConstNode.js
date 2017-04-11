/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ConstNode = function( src, useDefine ) {

	THREE.TempNode.call( this );

	this.eval( src || THREE.ConstNode.PI, useDefine );

};

THREE.ConstNode.PI = 'PI';
THREE.ConstNode.PI2 = 'PI2';
THREE.ConstNode.RECIPROCAL_PI = 'RECIPROCAL_PI';
THREE.ConstNode.RECIPROCAL_PI2 = 'RECIPROCAL_PI2';
THREE.ConstNode.LOG2 = 'LOG2';
THREE.ConstNode.EPSILON = 'EPSILON';

THREE.ConstNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.ConstNode.prototype.constructor = THREE.ConstNode;

THREE.ConstNode.prototype.getType = function( builder ) {

	return builder.getTypeByFormat( this.type );

};

THREE.ConstNode.prototype.eval = function( src, useDefine ) {

	src = ( src || '' ).trim();

	var name, type, value;

	var rDeclaration = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\=?\s?(.*?)(\;|$)/i;
	var match = src.match( rDeclaration );

	this.useDefine = useDefine;

	if ( match && match.length > 1 ) {

		type = match[ 1 ];
		name = match[ 2 ];
		value = match[ 3 ];

	} else {

		name = src;
		type = 'fv1';

	}

	this.name = name;
	this.type = type;
	this.value = value;

};

THREE.ConstNode.prototype.build = function( builder, output ) {

	if ( output === 'source' ) {

		if ( this.value ) {

			if ( this.useDefine ) {

				return '#define ' + this.name + ' ' + this.value;

			}

			return 'const ' + this.type + ' ' + this.name + ' = ' + this.value + ';';

		}

	} else {

		builder.include( this );

		return builder.format( this.name, this.getType( builder ), output );

	}

};

THREE.ConstNode.prototype.generate = function( builder, output ) {

	return builder.format( this.name, this.getType( builder ), output );

};
