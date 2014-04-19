THREE.TypedVector2 = function ( array, offset ) {

	this.array = array;
	this.offset = offset * 2;

};

THREE.TypedVector2.prototype = {

	constructor: THREE.TypedVector3,

	get x () {

		return this.array[ this.offset ];

	},

	set x ( value ) {

		this.array[ this.offset ] = value;

	},

	get y () {

		return this.array[ this.offset + 1 ];

	},

	set y ( value ) {

		this.array[ this.offset + 1 ] = value;

	},

	set: function ( x, y ) {

		this.array[ this.offset ] = x;
		this.array[ this.offset + 1 ] = y;
		return this;

	}

};

THREE.TypedVector3 = function ( array, offset ) {

	this.array = array;
	this.offset = offset * 3;

};

THREE.TypedVector3.prototype = {

	constructor: THREE.TypedVector3,

	get x () {

		return this.array[ this.offset ];

	},

	set x ( value ) {

		this.array[ this.offset ] = value;

	},

	get y () {

		return this.array[ this.offset + 1 ];

	},

	set y ( value ) {

		this.array[ this.offset + 1 ] = value;

	},

	get z () {

		return this.array[ this.offset + 2 ];

	},

	set z ( value ) {

		this.array[ this.offset + 2 ] = value;

	},

	set: function ( x, y, z ) {

		this.array[ this.offset ] = x;
		this.array[ this.offset + 1 ] = y;
		this.array[ this.offset + 2 ] = z;
		return this;

	},

	toString: function () {

		return '[' + this.array[ this.offset ] + ',' + this.array[ this.offset + 1 ] + ',' + this.array[ this.offset + 2 ] + ']';

	}

};

THREE.TypedFace = function ( positions, normals, uvs, offset ) {

	this.positions = positions;
	this.normals = normals;
	this.uvs = uvs;
	this.offset = offset * 3;

};

THREE.TypedFace.prototype = {

	constructor: THREE.TypedFace,

	vertex: function ( index ) {

		return new THREE.TypedVector3( this.positions, this.offset + index );

	},

	normal: function ( index ) {

		return new THREE.TypedVector3( this.normals, this.offset + index );

	},

	uv: function ( index ) {

		return new THREE.TypedVector2( this.uvs, this.offset + index );

	}

}


THREE.TypedGeometry = function ( size ) {

	this.id = THREE.GeometryIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.positions = new Float32Array( size * 3 * 3 );
	this.normals = new Float32Array( size * 3 * 3 );
	this.uvs = new Float32Array( size * 3 * 2 );

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.TypedGeometry.prototype = {

	constructor: THREE.TypedGeometry,

	face: function ( index ) {

		return new THREE.TypedFace( this.positions, this.normals, this.uvs, index );

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.TypedGeometry.prototype );
