/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( size ) {

	this.id = THREE.GeometryIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.vertices = size !== undefined ? new Float32Array( size * 3 ) : [];
	this.normals = size !== undefined ? new Float32Array( size * 3 ) : [];
	this.uvs = size !== undefined ? new Float32Array( size * 2 ) : [];

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.Geometry2.prototype = {

	constructor: THREE.Geometry2,

	applyMatrix: function ( matrix ) {

		matrix.multiplyVector3Array( this.vertices );

	},

	computeBoundingBox: function () {

		if ( this.boundingBox === null ) {

			this.boundingBox = new THREE.Box3();

		}

		var vertices = this.vertices;
		var bb = this.boundingBox;

		if ( vertices.length >= 3 ) {

			bb.min.x = bb.max.x = vertices[ 0 ];
			bb.min.y = bb.max.y = vertices[ 1 ];
			bb.min.z = bb.max.z = vertices[ 2 ];

		}

		for ( var i = 3, il = vertices.length; i < il; i += 3 ) {

			var x = vertices[ i ];
			var y = vertices[ i + 1 ];
			var z = vertices[ i + 2 ];

			// bounding box

			if ( x < bb.min.x ) {

				bb.min.x = x;

			} else if ( x > bb.max.x ) {

				bb.max.x = x;

			}

			if ( y < bb.min.y ) {

				bb.min.y = y;

			} else if ( y > bb.max.y ) {

				bb.max.y = y;

			}

			if ( z < bb.min.z ) {

				bb.min.z = z;

			} else if ( z > bb.max.z ) {

				bb.max.z = z;

			}

		}

	},

	computeBoundingSphere: function () {

		var box = new THREE.Box3();
		var vector = new THREE.Vector3();

		return function () {

			if ( this.boundingSphere === null ) {

				this.boundingSphere = new THREE.Sphere();

			}

			box.makeEmpty();

			var vertices = this.vertices;
			var center = this.boundingSphere.center;

			for ( var i = 0, il = vertices.length; i < il; i += 3 ) {

				vector.set( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] );
				box.addPoint( vector );

			}

			box.center( center );

			var maxRadiusSq = 0;

			for ( var i = 0, il = vertices.length; i < il; i += 3 ) {

				vector.set( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] );
				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( vector ) );

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

		}

	}(),

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.Geometry2.prototype );
