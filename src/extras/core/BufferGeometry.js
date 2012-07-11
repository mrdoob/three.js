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

	},

	computeVertexNormals: function () {

		var indices = this.vertexIndexArray;
		var vertices = this.vertexPositionArray;

		if ( vertices && indices ) {

			var i, il;
			var j, jl;

			var nElements = vertices.length;

			if ( this.vertexNormalArray === undefined ) {

				this.vertexNormalArray = new Float32Array( nElements );

			} else {

				// reset existing normals to zero

				for ( i = 0, il = this.vertexNormalArray.length; i < il; i ++ ) {

					this.vertexNormalArray[ i ] = 0;

				}

			}

			var offsets = this.offsets;
			var normals = this.vertexNormalArray;

			var vA, vB, vC, x, y, z,

			pA = new THREE.Vector3(),
			pB = new THREE.Vector3(),
			pC = new THREE.Vector3(),

			cb = new THREE.Vector3(),
			ab = new THREE.Vector3();

			for ( j = 0, jl = offsets.length; j < jl; ++ j ) {

				var start = offsets[ j ].start;
				var count = offsets[ j ].count;
				var index = offsets[ j ].index;

				for ( i = start, il = start + count; i < il; i += 3 ) {

					vA = index + indices[ i ];
					vB = index + indices[ i + 1 ];
					vC = index + indices[ i + 2 ];

					x = vertices[ vA * 3 ];
					y = vertices[ vA * 3 + 1 ];
					z = vertices[ vA * 3 + 2 ];
					pA.set( x, y, z );

					x = vertices[ vB * 3 ];
					y = vertices[ vB * 3 + 1 ];
					z = vertices[ vB * 3 + 2 ];
					pB.set( x, y, z );

					x = vertices[ vC * 3 ];
					y = vertices[ vC * 3 + 1 ];
					z = vertices[ vC * 3 + 2 ];
					pC.set( x, y, z );

					cb.sub( pC, pB );
					ab.sub( pA, pB );
					cb.crossSelf( ab );

					normals[ vA * 3 ] 	  += cb.x;
					normals[ vA * 3 + 1 ] += cb.y;
					normals[ vA * 3 + 2 ] += cb.z;

					normals[ vB * 3 ] 	  += cb.x;
					normals[ vB * 3 + 1 ] += cb.y;
					normals[ vB * 3 + 2 ] += cb.z;

					normals[ vC * 3 ] 	  += cb.x;
					normals[ vC * 3 + 1 ] += cb.y;
					normals[ vC * 3 + 2 ] += cb.z;

				}

			}

			// normalize normals

			for ( i = 0, il = normals.length; i < il; i += 3 ) {

				x = normals[ i ];
				y = normals[ i + 1 ];
				z = normals[ i + 2 ];

				var n = 1.0 / Math.sqrt( x * x + y * y + z * z );

				normals[ i ] 	 *= n;
				normals[ i + 1 ] *= n;
				normals[ i + 2 ] *= n;

			}

			this.normalsNeedUpdate = true;

		}

	}

};

