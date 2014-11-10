/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.IndexedGeometry5 = function ( indices, size ) {

	THREE.BufferGeometry.call( this );

	var verticesBuffer = new Float32Array( size * 3 );
	var normalsBuffer = new Float32Array( size * 3 );
	var uvsBuffer = new Float32Array( size * 2 );

	this.indices = new Uint16Array( indices );
	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	for ( var i = 0; i < size; i ++ ) {

		this.vertices.push( new THREE.TypedVector3( verticesBuffer, i * 3 ) );
		this.normals.push( new THREE.TypedVector3( normalsBuffer, i * 3 ) );
		this.uvs.push( new THREE.TypedVector2( uvsBuffer, i * 2 ) );

	}

	this.attributes[ 'index' ] = { array: this.indices, itemSize: 1 };
	this.attributes[ 'position' ] = { array: verticesBuffer, itemSize: 3 };
	this.attributes[ 'normal' ] = { array: normalsBuffer, itemSize: 3 };
	this.attributes[ 'uv' ] = { array: uvsBuffer, itemSize: 2 };

};

THREE.IndexedGeometry5.prototype = Object.create( THREE.BufferGeometry.prototype );

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