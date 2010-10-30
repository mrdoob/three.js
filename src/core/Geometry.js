/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 */

THREE.Geometry = function () {

	this.vertices = [];
	this.faces = [];
	this.uvs = [];

};

THREE.Geometry.prototype = {

	computeCentroids: function () {

		var f, fl, face;

		for ( f = 0, fl = this.faces.length; f < fl; f++ ) {

			face = this.faces[ f ];
			face.centroid.set( 0, 0, 0 );

			if ( face instanceof THREE.Face3 ) {

				face.centroid.addSelf( this.vertices[ face.a ].position );
				face.centroid.addSelf( this.vertices[ face.b ].position );
				face.centroid.addSelf( this.vertices[ face.c ].position );
				face.centroid.divideScalar( 3 );

			} else if ( face instanceof THREE.Face4 ) {

				face.centroid.addSelf( this.vertices[ face.a ].position );
				face.centroid.addSelf( this.vertices[ face.b ].position );
				face.centroid.addSelf( this.vertices[ face.c ].position );
				face.centroid.addSelf( this.vertices[ face.d ].position );
				face.centroid.divideScalar( 4 );

			}

		}

	},

	computeNormals: function ( useVertexNormals ) {

		var n, nl, v, vl, vertex, f, fl, face, vA, vB, vC,
		cb = new THREE.Vector3(), ab = new THREE.Vector3();

		for ( v = 0, vl = this.vertices.length; v < vl; v++ ) {

			vertex = this.vertices[ v ];
			vertex.normal.set( 0, 0, 0 );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f++ ) {

			face = this.faces[ f ];

			if ( useVertexNormals && face.vertexNormals.length  ) {

				cb.set( 0, 0, 0 );

				for ( n = 0, nl = face.normal.length; n < nl; n++ ) {

					cb.addSelf( face.vertexNormals[n] );

				}

				cb.divideScalar( 3 );

				if ( ! cb.isZero() ) {

					cb.normalize();

				}

				face.normal.copy( cb );

			} else {

				vA = this.vertices[ face.a ];
				vB = this.vertices[ face.b ];
				vC = this.vertices[ face.c ];

				cb.sub( vC.position, vB.position );
				ab.sub( vA.position, vB.position );
				cb.crossSelf( ab );

				if ( !cb.isZero() ) {

				    cb.normalize();

				}

				face.normal.copy( cb );

			}

		}

	},

	computeBoundingBox: function ( ) {

		if ( this.vertices.length > 0 ) {

			this.bbox = { 'x': [ this.vertices[ 0 ].position.x, this.vertices[ 0 ].position.x ],
			'y': [ this.vertices[ 0 ].position.y, this.vertices[ 0 ].position.y ], 
			'z': [ this.vertices[ 0 ].position.z, this.vertices[ 0 ].position.z ] };

			for ( var v = 1, vl = this.vertices.length; v < vl; v++ ) {

				vertex = this.vertices[ v ];

				if ( vertex.position.x < this.bbox.x[ 0 ] ) {

					this.bbox.x[ 0 ] = vertex.position.x;

				} else if ( vertex.position.x > this.bbox.x[ 1 ] ) {

					this.bbox.x[ 1 ] = vertex.position.x;

				}

				if ( vertex.position.y < this.bbox.y[ 0 ] ) {

					this.bbox.y[ 0 ] = vertex.position.y;

				} else if ( vertex.position.y > this.bbox.y[ 1 ] ) {

					this.bbox.y[ 1 ] = vertex.position.y;

				}

				if ( vertex.position.z < this.bbox.z[ 0 ] ) {

					this.bbox.z[ 0 ] = vertex.position.z;

				} else if ( vertex.position.z > this.bbox.z[ 1 ] ) {

					this.bbox.z[ 1 ] = vertex.position.z;

				}

			}

		}

	},

	toString: function () {

		return 'THREE.Geometry ( vertices: ' + this.vertices + ', faces: ' + this.faces + ' )';

	}

};
