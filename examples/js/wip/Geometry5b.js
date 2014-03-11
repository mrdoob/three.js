/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry5b = function ( bufferGeometry ) {

	THREE.BufferGeometry.call( this );

	this.attributes = bufferGeometry.attributes;

	var verticesBuffer = this.attributes.position.array;
	var normalsBuffer = this.attributes.normal.array;
	var uvsBuffer = this.attributes.uv.array;

	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	for ( var i = 0, l = verticesBuffer.length / 3; i < l; i ++ ) {

		this.vertices.push( new THREE.TypedVector3( verticesBuffer, i * 3 ) );
		this.normals.push( new THREE.TypedVector3( normalsBuffer, i * 3 ) );
		this.uvs.push( new THREE.TypedVector2( uvsBuffer, i * 2 ) );

	}

};

THREE.Geometry5b.prototype = Object.create( THREE.BufferGeometry.prototype );

THREE.TypedVector2 = function ( array, offset ) {

	this.array = array;
	this.offset = offset;
	
};

THREE.TypedVector2.prototype = Object.create( THREE.Vector2.prototype );

Object.defineProperties( THREE.TypedVector2.prototype, {
	'x': {
		get: function () { return this.array[ this.offset ]; },
		set: function ( v ) { this.array[ this.offset ] = v; }
	},
	'y': {
		get: function () { return this.array[ this.offset + 1 ]; },
		set: function ( v ) { this.array[ this.offset + 1 ] = v; }
	}
} );

THREE.TypedVector3 = function ( array, offset ) {
	
	this.array = array;
	this.offset = offset;

};

THREE.TypedVector3.prototype = Object.create( THREE.Vector3.prototype );

Object.defineProperties( THREE.TypedVector3.prototype, {
	'x': {
		get: function () { return this.array[ this.offset ]; },
		set: function ( v ) { this.array[ this.offset ] = v; }
	},
	'y': {
		get: function () { return this.array[ this.offset + 1 ]; },
		set: function ( v ) { this.array[ this.offset + 1 ] = v; }
	},
	'z': {
		get: function () { return this.array[ this.offset + 2 ]; },
		set: function ( v ) { this.array[ this.offset + 2 ] = v; }
	}
} );