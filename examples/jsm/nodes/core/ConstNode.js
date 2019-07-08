/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from './TempNode.js';

var declarationRegexp = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\=?\s?(.*?)(\;|$)/i;

function ConstNode( src, useDefine ) {

	TempNode.call( this );

	this.parse( src || ConstNode.PI, useDefine );

}

ConstNode.PI = 'PI';
ConstNode.PI2 = 'PI2';
ConstNode.RECIPROCAL_PI = 'RECIPROCAL_PI';
ConstNode.RECIPROCAL_PI2 = 'RECIPROCAL_PI2';
ConstNode.LOG2 = 'LOG2';
ConstNode.EPSILON = 'EPSILON';

ConstNode.prototype = Object.create( TempNode.prototype );
ConstNode.prototype.constructor = ConstNode;
ConstNode.prototype.nodeType = "Const";

ConstNode.prototype.getType = function ( builder ) {

	return builder.getTypeByFormat( this.type );

};

ConstNode.prototype.parse = function ( src, useDefine ) {

	this.src = src || '';

	var name, type, value = "";

	var match = this.src.match( declarationRegexp );

	this.useDefine = useDefine || this.src.charAt( 0 ) === '#';

	if ( match && match.length > 1 ) {

		type = match[ 1 ];
		name = match[ 2 ];
		value = match[ 3 ];

	} else {

		name = this.src;
		type = 'f';

	}

	this.name = name;
	this.type = type;
	this.value = value;

};

ConstNode.prototype.build = function ( builder, output ) {

	if ( output === 'source' ) {

		if ( this.value ) {

			if ( this.useDefine ) {

				return '#define ' + this.name + ' ' + this.value;

			}

			return 'const ' + this.type + ' ' + this.name + ' = ' + this.value + ';';

		} else if ( this.useDefine ) {

			return this.src;

		}

	} else {

		builder.include( this );

		return builder.format( this.name, this.getType( builder ), output );

	}

};

ConstNode.prototype.generate = function ( builder, output ) {

	return builder.format( this.name, this.getType( builder ), output );

};

ConstNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.parse( source.src, source.useDefine );

	return this;

};

ConstNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.src = this.src;

		if ( data.useDefine === true ) data.useDefine = true;

	}

	return data;

};

export { ConstNode };
