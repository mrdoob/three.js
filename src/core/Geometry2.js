/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( size ) {

	this.id = THREE.GeometryIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.positions = size !== undefined ? new Float32Array( size * 3 ) : [];
	this.normals = size !== undefined ? new Float32Array( size * 3 ) : [];
	this.uvs = size !== undefined ? new Float32Array( size * 2 ) : [];

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.Geometry2.prototype = {

	constructor: THREE.Geometry2,

	applyMatrix: function ( matrix ) {

		matrix.multiplyVector3Array( this.positions );

	},

	computeBoundingSphere: function () {

		var box = new THREE.Box3();
		var vector = new THREE.Vector3();

		return function () {

			if ( this.boundingSphere === null ) {

				this.boundingSphere = new THREE.Sphere();

			}

			box.makeEmpty();

			var positions = this.positions;
			var center = this.boundingSphere.center;

			for ( var i = 0, il = positions.length; i < il; i += 3 ) {

				vector.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
				box.addPoint( vector );

			}

			box.center( center );

			var maxRadiusSq = 0;

			for ( var i = 0, il = positions.length; i < il; i += 3 ) {

				vector.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
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
