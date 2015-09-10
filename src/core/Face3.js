/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = Face3;

var Color = require( "../math/Color" ),
	Vector3 = require( "../math/Vector3" );

function Face3( a, b, c, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.normal = normal instanceof Vector3 ? normal : new Vector3();
	this.vertexNormals = Array.isArray( normal ) ? normal : [];

	this.color = color instanceof Color ? color : new Color();
	this.vertexColors = Array.isArray( color ) ? color : [];

	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

}

Face3.prototype = {

	constructor: Face3,

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		var i, il;

		this.a = source.a;
		this.b = source.b;
		this.c = source.c;

		this.normal.copy( source.normal );
		this.color.copy( source.color );

		this.materialIndex = source.materialIndex;

		for ( i = 0, il = source.vertexNormals.length; i < il; i ++ ) {

			this.vertexNormals[ i ] = source.vertexNormals[ i ].clone();

		}

		for ( i = 0, il = source.vertexColors.length; i < il; i ++ ) {

			this.vertexColors[ i ] = source.vertexColors[ i ].clone();

		}

		return this;

	}

};
