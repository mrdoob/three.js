/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BufferGeometry = function () {

	this.id = THREE.GeometryCount ++;

	// attributes

	this.attributes = {};

	// attributes typed arrays are kept only if dynamic flag is set

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

		var positionArray;
		var normalArray;

		if ( this.attributes[ "position" ] ) positionArray = this.attributes[ "position" ].array;
		if ( this.attributes[ "normal" ] ) normalArray = this.attributes[ "normal" ].array;

		if ( positionArray !== undefined ) {

			matrix.multiplyVector3Array( positionArray );
			this.verticesNeedUpdate = true;

		}

		if ( normalArray !== undefined ) {

			var matrixRotation = new THREE.Matrix4();
			matrixRotation.extractRotation( matrix );

			matrixRotation.multiplyVector3Array( normalArray );
			this.normalsNeedUpdate = true;

		}

	},

	computeBoundingBox: function () {

		if ( ! this.boundingBox ) {

			this.boundingBox = {

				min: new THREE.Vector3( Infinity, Infinity, Infinity ),
				max: new THREE.Vector3( -Infinity, -Infinity, -Infinity )

			};

		}

		var positions = this.attributes[ "position" ].array;

		if ( positions ) {

			var bb = this.boundingBox;
			var x, y, z;

			for ( var i = 0, il = positions.length; i < il; i += 3 ) {

				x = positions[ i ];
				y = positions[ i + 1 ];
				z = positions[ i + 2 ];

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

		if ( positions === undefined || positions.length === 0 ) {

			this.boundingBox.min.set( 0, 0, 0 );
			this.boundingBox.max.set( 0, 0, 0 );

		}

	},

	computeBoundingSphere: function () {

		if ( ! this.boundingSphere ) this.boundingSphere = { radius: 0 };

		var positions = this.attributes[ "position" ].array;

		if ( positions ) {

			var radius, maxRadius = 0;
			var x, y, z;

			for ( var i = 0, il = positions.length; i < il; i += 3 ) {

				x = positions[ i ];
				y = positions[ i + 1 ];
				z = positions[ i + 2 ];

				radius = Math.sqrt( x * x + y * y + z * z );
				if ( radius > maxRadius ) maxRadius = radius;

			}

			this.boundingSphere.radius = maxRadius;

		}

	},

	computeVertexNormals: function () {

		if ( this.attributes[ "position" ] && this.attributes[ "index" ] ) {

			var i, il;
			var j, jl;

			var nVertices = this.attributes[ "position" ].array.length;

			if ( this.attributes[ "normal" ] === undefined ) {

				this.attributes[ "normal" ] = {

					itemSize: 3,
					array: new Float32Array( nVertices ),
					numItems: nVertices * 3

				};

			} else {

				// reset existing normals to zero

				for ( i = 0, il = this.attributes[ "normal" ].array.length; i < il; i ++ ) {

					this.attributes[ "normal" ].array[ i ] = 0;

				}

			}

			var offsets = this.offsets;

			var indices = this.attributes[ "index" ].array;
			var positions = this.attributes[ "position" ].array;
			var normals = this.attributes[ "normal" ].array;

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

					x = positions[ vA * 3 ];
					y = positions[ vA * 3 + 1 ];
					z = positions[ vA * 3 + 2 ];
					pA.set( x, y, z );

					x = positions[ vB * 3 ];
					y = positions[ vB * 3 + 1 ];
					z = positions[ vB * 3 + 2 ];
					pB.set( x, y, z );

					x = positions[ vC * 3 ];
					y = positions[ vC * 3 + 1 ];
					z = positions[ vC * 3 + 2 ];
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

