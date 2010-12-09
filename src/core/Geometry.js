/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Geometry = function () {

	this.vertices = [];
	this.faces = [];
	this.uvs = [];

	this.geometryChunks = {};

	this.hasTangents = false;
	
};

THREE.Geometry.prototype = {

	computeCentroids: function () {

		var f, fl, face;

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

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

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertex = this.vertices[ v ];
			vertex.normal.set( 0, 0, 0 );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

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

	computeVertexNormals: function () {

		var v, vertices = [],
		f, fl, face;

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ] = new THREE.Vector3();

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );

			} else if ( face instanceof THREE.Face4 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );
				vertices[ face.d ].addSelf( face.normal );

			}

		}

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ].normalize();

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				face.vertexNormals[ 0 ] = vertices[ face.a ].clone();
				face.vertexNormals[ 1 ] = vertices[ face.b ].clone();
				face.vertexNormals[ 2 ] = vertices[ face.c ].clone();

			} else if ( face instanceof THREE.Face4 ) {

				face.vertexNormals[ 0 ] = vertices[ face.a ].clone();
				face.vertexNormals[ 1 ] = vertices[ face.b ].clone();
				face.vertexNormals[ 2 ] = vertices[ face.c ].clone();
				face.vertexNormals[ 3 ] = vertices[ face.d ].clone();

			}

		}

	},

	computeTangents: function() {
		
		// based on http://www.terathon.com/code/tangent.html
		// tangents go to vertices
		
		var f, fl, v, vl, face, uv, vA, vB, vC, uvA, uvB, uvC,
			x1, x2, y1, y2, z1, z2,
			s1, s2, t1, t2, r, t, n,
			tan1 = [], tan2 = [],
			sdir = new THREE.Vector3(), tdir = new THREE.Vector3(),
			tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), 
			n = new THREE.Vector3(), w;
		
		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			tan1[ v ] = new THREE.Vector3();
			tan2[ v ] = new THREE.Vector3();

		}
		
		function handleTriangle( context, a, b, c ) {
			
			vA = context.vertices[ a ].position;
			vB = context.vertices[ b ].position;
			vC = context.vertices[ c ].position;
			
			uvA = uv[ 0 ];
			uvB = uv[ 1 ];
			uvC = uv[ 2 ];
			
			x1 = vB.x - vA.x;
			x2 = vC.x - vA.x;
			y1 = vB.y - vA.y;
			y2 = vC.y - vA.y;
			z1 = vB.z - vA.z;
			z2 = vC.z - vA.z;

			s1 = uvB.u - uvA.u;
			s2 = uvC.u - uvA.u;
			t1 = uvB.v - uvA.v;
			t2 = uvC.v - uvA.v;

			r = 1.0 / ( s1 * t2 - s2 * t1 );
			sdir.set( ( t2 * x1 - t1 * x2 ) * r, 
					  ( t2 * y1 - t1 * y2 ) * r,
					  ( t2 * z1 - t1 * z2 ) * r );
			tdir.set( ( s1 * x2 - s2 * x1 ) * r, 
					  ( s1 * y2 - s2 * y1 ) * r,
					  ( s1 * z2 - s2 * z1 ) * r );
			
			tan1[ a ].addSelf( sdir );
			tan1[ b ].addSelf( sdir );
			tan1[ c ].addSelf( sdir );
			
			tan2[ a ].addSelf( tdir );
			tan2[ b ].addSelf( tdir );
			tan2[ c ].addSelf( tdir );
			
		}
		
		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {
			
			face = this.faces[ f ];
			uv = this.uvs[ f ];
			
			if ( face instanceof THREE.Face3 ) {
				
				handleTriangle( this, face.a, face.b, face.c );
				
				this.vertices[ face.a ].normal.copy( face.vertexNormals[ 0 ] );
				this.vertices[ face.b ].normal.copy( face.vertexNormals[ 1 ] );
				this.vertices[ face.c ].normal.copy( face.vertexNormals[ 2 ] );
				
				
			} else if ( face instanceof THREE.Face4 ) {
				
				handleTriangle( this, face.a, face.b, face.c );
				
				// this messes up everything
				// quads need to be handled differently
				//handleTriangle( this, face.a, face.c, face.d );

				this.vertices[ face.a ].normal.copy( face.vertexNormals[ 0 ] );
				this.vertices[ face.b ].normal.copy( face.vertexNormals[ 1 ] );
				this.vertices[ face.c ].normal.copy( face.vertexNormals[ 2 ] );
				this.vertices[ face.d ].normal.copy( face.vertexNormals[ 3 ] );
				
			}
			
		}
		
		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {
			
			n.copy( this.vertices[ v ].normal );
			t = tan1[ v ];
			
			// Gram-Schmidt orthogonalize
			
			tmp.copy( t );
			tmp.subSelf( n.multiplyScalar( n.dot( t ) ) ).normalize();
			
			// Calculate handedness
			
			tmp2.cross( this.vertices[ v ].normal, t );
			test = tmp2.dot( tan2[ v ] );
			w = (test < 0.0) ? -1.0 : 1.0;
			
			this.vertices[ v ].tangent.set( tmp.x, tmp.y, tmp.z, w );
			
		}
		
		this.hasTangents = true;
		
	},
	
	computeBoundingBox: function () {

		if ( this.vertices.length > 0 ) {

			this.bbox = { 'x': [ this.vertices[ 0 ].position.x, this.vertices[ 0 ].position.x ],
			'y': [ this.vertices[ 0 ].position.y, this.vertices[ 0 ].position.y ], 
			'z': [ this.vertices[ 0 ].position.z, this.vertices[ 0 ].position.z ] };

			for ( var v = 1, vl = this.vertices.length; v < vl; v ++ ) {

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

	sortFacesByMaterial: function () {

		// TODO
		// Should optimize by grouping faces with ColorFill / ColorStroke materials
		// which could then use vertex color attributes instead of each being
		// in its separate VBO

		var i, l, f, fl, face, material, vertices, mhash, ghash, hash_map = {};

		function materialHash( material ) {

			var hash_array = [];

			for ( i = 0, l = material.length; i < l; i++ ) {

				if ( material[ i ] == undefined ) {

					hash_array.push( "undefined" );

				} else {

					hash_array.push( material[ i ].toString() );

				}

			}

			return hash_array.join( '_' );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f++ ) {

			face = this.faces[ f ];
			material = face.material;

			mhash = materialHash( material );

			if ( hash_map[ mhash ] == undefined ) {

				hash_map[ mhash ] = { 'hash': mhash, 'counter': 0 };

			}

			ghash = hash_map[ mhash ].hash + '_' + hash_map[ mhash ].counter;

			if ( this.geometryChunks[ ghash ] == undefined ) {

				this.geometryChunks[ ghash ] = { 'faces': [], 'material': material, 'vertices': 0 };

			}

			vertices = face instanceof THREE.Face3 ? 3 : 4;

			if ( this.geometryChunks[ ghash ].vertices + vertices > 65535 ) {

				hash_map[ mhash ].counter += 1;
				ghash = hash_map[ mhash ].hash + '_' + hash_map[ mhash ].counter;

				if ( this.geometryChunks[ ghash ] == undefined ) {

					this.geometryChunks[ ghash ] = { 'faces': [], 'material': material, 'vertices': 0 };

				}

			}

			this.geometryChunks[ ghash ].faces.push( f );
			this.geometryChunks[ ghash ].vertices += vertices;

		}

	},

	toString: function () {

		return 'THREE.Geometry ( vertices: ' + this.vertices + ', faces: ' + this.faces + ', uvs: ' + this.uvs + ' )';

	}

};
