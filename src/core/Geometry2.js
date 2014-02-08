/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry = function ( size ) {

	this.id = THREE.GeometryIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.vertices = size !== undefined ? new Float32Array( size * 3 ) : [];
	this.normals = size !== undefined ? new Float32Array( size * 3 ) : [];
	this.uvs = size !== undefined ? new Float32Array( size * 2 ) : [];

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.Geometry.prototype = {

	constructor: THREE.Geometry,

	applyMatrix: function ( matrix ) {

		matrix.multiplyVector3Array( this.vertices );

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

THREE.EventDispatcher.prototype.apply( THREE.Geometry.prototype );
