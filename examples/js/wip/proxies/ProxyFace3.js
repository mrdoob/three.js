/**
 * @author jbaicoianu / http://baicoianu.com/
 */

THREE.ProxyFace3 = function ( array, offset, vertexNormals, vertexColors, vertexTangents ) {

	this.array = array;
	this.offset = offset;
	this.vertexNormals = vertexNormals || [];
	this.vertexColors = vertexColors || [];
	this.vertexTangents = vertexTangents || [];

	this.normal = new THREE.MultiVector3( this.vertexNormals );
	this.color = new THREE.MultiColor( this.vertexColors );

	//THREE.Face3.call( this, array[offset], array[offset+1], array[offset+2] /*, normal, color, materialIndex */);

}

THREE.ProxyFace3.prototype = Object.create( THREE.Face3.prototype );

Object.defineProperties( THREE.ProxyFace3.prototype, {
	'a': {
		enumerable: true,	
		get: function () { return this.array[ this.offset ]; },
		set: function ( v ) { this.array[ this.offset ] = v; }
	},
	'b': {
		enumerable: true,	
		get: function () { return this.array[ this.offset + 1 ]; },
		set: function ( v ) { this.array[ this.offset + 1 ] = v; }
	},
	'c': {
		enumerable: true,	
		get: function () { return this.array[ this.offset + 2 ]; },
		set: function ( v ) { this.array[ this.offset + 2 ] = v; }
	},
} );

