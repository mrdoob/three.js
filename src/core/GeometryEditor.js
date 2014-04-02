/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GeometryEditor = function ( geometry ) {

	this.geometry = geometry;

};

Object.defineProperties( THREE.GeometryEditor.prototype, {
	vertices: { 
		enumerable: true,
		get: function() { return this.createVertexProxies(); }
	},
	normals: {
		enumerable: true,
		get: function() { return this.createNormalProxies(); } 
	},
	uvs: {
		enumerable: true,
		get: function() { return this.createUVProxies(); } 
	}
} );

THREE.GeometryEditor.prototype.createVertexProxies = function () {

	Object.defineProperty( this, 'vertices', { value: [], writable: true } );

	var attributes = this.geometry.attributes;
	var length = attributes.position.array.length / 3;

	for ( var i = 0; i < length; i ++ ) {

		this.vertices.push( new THREE.ProxyVector3( attributes.position.array, i * 3 ) );

	}

	return this.vertices;

};

THREE.GeometryEditor.prototype.createNormalProxies = function () {

	Object.defineProperty( this, 'normals', { value: [], writable: true } );

	var attributes = this.geometry.attributes;
	var length = attributes.position.array.length / 3;

	for ( var i = 0; i < length; i ++ ) {

		this.normals.push( new THREE.ProxyVector3( attributes.normal.array, i * 3 ) );

	}

	return this.normals;

};

THREE.GeometryEditor.prototype.createUVProxies = function () {

	Object.defineProperty( this, 'uvs', { value: [], writable: true } );

	var attributes = this.geometry.attributes;
	var length = attributes.position.array.length / 3;

	for ( var i = 0; i < length; i ++ ) {

		this.uvs.push( new THREE.ProxyVector2( attributes.uv.array, i * 2 ) );

	}

	return this.uvs;

};