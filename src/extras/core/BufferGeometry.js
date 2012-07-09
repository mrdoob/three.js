/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BufferGeometry = function () {

	this.id = THREE.GeometryCount ++;

	// GL buffers

	this.vertexIndexBuffer = null;
	this.vertexPositionBuffer = null;
	this.vertexNormalBuffer = null;
	this.vertexUvBuffer = null;
	this.vertexColorBuffer = null;

	// typed arrays (kept only if dynamic flag is set)

	this.vertexIndexArray = null;
	this.vertexPositionArray = null;
	this.vertexNormalArray = null;
	this.vertexUvArray = null;
	this.vertexColorArray = null;

	this.dynamic = false;

	// boundings

	this.boundingBox = null;
	this.boundingSphere = null;

	// for compatibility

	this.morphTargets = [];

};

THREE.BufferGeometry.prototype = {

	constructor : THREE.BufferGeometry,

	applyMatrix: function ( matrix ) {

		if ( this.vertexPositionArray !== undefined ) {

			matrix.multiplyVector3Array( this.vertexPositionArray );
			this.verticesNeedUpdate = true;

		}

		if ( this.vertexNormalArray !== undefined ) {

			var matrixRotation = new THREE.Matrix4();
			matrixRotation.extractRotation( matrix );

			matrixRotation.multiplyVector3Array( this.vertexNormalArray );
			this.normalsNeedUpdate = true;

		}

	},

	computeBoundingBox: function () {

		if ( ! this.boundingBox ) {

			this.boundingBox = { min: new THREE.Vector3( Infinity, Infinity, Infinity ), max: new THREE.Vector3( -Infinity, -Infinity, -Infinity ) };

		}

		var vertices = this.vertexPositionArray;

		if ( vertices ) {

			var bb = this.boundingBox;
			var x, y, z;

			for ( var i = 0, il = vertices.length; i < il; i += 3 ) {

				x = vertices[ i ];
				y = vertices[ i + 1 ];
				z = vertices[ i + 2 ];

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

		}

		if ( vertices === undefined || vertices.length === 0 ) {

			this.boundingBox.min.set( 0, 0, 0 );
			this.boundingBox.max.set( 0, 0, 0 );

		}

	},

	computeBoundingSphere: function () {

		if ( ! this.boundingSphere ) this.boundingSphere = { radius: 0 };

		var vertices = this.vertexPositionArray;

		if ( vertices ) {

			var radius, maxRadius = 0;
			var x, y, z;

			for ( var i = 0, il = vertices.length; i < il; i += 3 ) {

				x = vertices[ i ];
				y = vertices[ i + 1 ];
				z = vertices[ i + 2 ];

				radius = Math.sqrt( x * x + y * y + z * z );
				if ( radius > maxRadius ) maxRadius = radius;

			}

			this.boundingSphere.radius = maxRadius;

		}

	}

};

