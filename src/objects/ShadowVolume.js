/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.ShadowVolume = function( meshOrGeometry, isStatic ) {

	if( meshOrGeometry instanceof THREE.Mesh ) {

		THREE.Mesh.call( this, meshOrGeometry.geometry, isStatic ? [ new THREE.ShadowVolumeDynamicMaterial() ] : [ new THREE.ShadowVolumeDynamicMaterial() ] );
		meshOrGeometry.addChild( this );

	} else {

		THREE.Mesh.call( this, meshOrGeometry, isStatic ? [ new THREE.ShadowVolumeDynamicMaterial() ] : [ new THREE.ShadowVolumeDynamicMaterial() ] );

	}

	this.calculateShadowVolumeGeometry();

};

THREE.ShadowVolume.prototype             = new THREE.Mesh();
THREE.ShadowVolume.prototype.constructor = THREE.ShadowVolume;
THREE.ShadowVolume.prototype.supr        = THREE.Mesh.prototype;


/*
 * Calculate Shadow Faces
 */

THREE.ShadowVolume.prototype.calculateShadowVolumeGeometry = function() {

	if ( this.geometry.edges && this.geometry.edges.length ) {

		var f, fl, face, faceA, faceB, faceAIndex, faceBIndex, vertexA, vertexB;
		var faceACombination, faceBCombination;
		var faceAvertexAIndex, faceAvertexBIndex, faceBvertexAIndex, faceBvertexBIndex;
		var e, el, edge, temp;

		var newGeometry = new THREE.Geometry();
		var vertices = newGeometry.vertices = this.geometry.vertices;
		var faces = newGeometry.faces = this.geometry.faces;
		var edges = newGeometry.egdes = this.geometry.edges;
		var edgeFaces = newGeometry.edgeFaces = [];

		var vertexOffset = 0;
		var vertexOffsetPerFace = [];

		for( f = 0, fl = faces.length; f < fl; f++ ) {

			face = faces[ f ];

			// calculate faces vertex offset

			vertexOffsetPerFace.push( vertexOffset );
			vertexOffset += face instanceof THREE.Face3 ? 3 : 4;

			// set vertex normals to face normal

			face.vertexNormals[ 0 ] = face.normal;
			face.vertexNormals[ 1 ] = face.normal;
			face.vertexNormals[ 2 ] = face.normal;

			if( face instanceof THREE.Face4 ) face.vertexNormals[ 3 ] = face.normal;

		}


		// setup edge faces

		for( e = 0, el = edges.length; e < el; e++ ) {

			edge = edges[ e ];

			faceA = edge.faces[ 0 ];
			faceB = edge.faces[ 1 ];

			faceAIndex = edge.faceIndices[ 0 ];
			faceBIndex = edge.faceIndices[ 1 ];

			vertexA = edge.vertexIndices[ 0 ];
			vertexB = edge.vertexIndices[ 1 ];

			// find combination and processed vertex index (vertices are split up by renderer)

			     if( faceA.a === vertexA ) { faceACombination = "a"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 0; }
			else if( faceA.b === vertexA ) { faceACombination = "b"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 1; }
			else if( faceA.c === vertexA ) { faceACombination = "c"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 2; }
			else if( faceA.d === vertexA ) { faceACombination = "d"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 3; }

			     if( faceA.a === vertexB ) { faceACombination += "a"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 0; }
			else if( faceA.b === vertexB ) { faceACombination += "b"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 1; }
			else if( faceA.c === vertexB ) { faceACombination += "c"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 2; }
			else if( faceA.d === vertexB ) { faceACombination += "d"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 3; }

			     if( faceB.a === vertexA ) { faceBCombination = "a"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 0; }
			else if( faceB.b === vertexA ) { faceBCombination = "b"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 1; }
			else if( faceB.c === vertexA ) { faceBCombination = "c"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 2; }
 			else if( faceB.d === vertexA ) { faceBCombination = "d"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 3; }

			     if( faceB.a === vertexB ) { faceBCombination += "a"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 0; }
			else if( faceB.b === vertexB ) { faceBCombination += "b"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 1; }
			else if( faceB.c === vertexB ) { faceBCombination += "c"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 2; }
			else if( faceB.d === vertexB ) { faceBCombination += "d"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 3; }

			if( faceACombination === "ac" ||
				faceACombination === "ad" ||
				faceACombination === "ca" ||
				faceACombination === "da" ) {

				if( faceAvertexAIndex > faceAvertexBIndex ) {

					temp = faceAvertexAIndex;
					faceAvertexAIndex = faceAvertexBIndex;
					faceAvertexBIndex = temp;

				}

			} else {

				if( faceAvertexAIndex < faceAvertexBIndex ) {

					temp = faceAvertexAIndex;
					faceAvertexAIndex = faceAvertexBIndex;
					faceAvertexBIndex = temp;

				}

			}

			if( faceBCombination === "ac" ||
				faceBCombination === "ad" ||
				faceBCombination === "ca" ||
				faceBCombination === "da" ) {

				if( faceBvertexAIndex > faceBvertexBIndex ) {

					temp = faceBvertexAIndex;
					faceBvertexAIndex = faceBvertexBIndex;
					faceBvertexBIndex = temp;

				}

			} else {

				if( faceBvertexAIndex < faceBvertexBIndex ) {

					temp = faceBvertexAIndex;
					faceBvertexAIndex = faceBvertexBIndex;
					faceBvertexBIndex = temp;

				}

			}

			face = new THREE.Face4( faceAvertexAIndex, faceAvertexBIndex, faceBvertexAIndex, faceBvertexBIndex );
			face.normal.set( 1, 0, 0 );
			edgeFaces.push( face );

		}

		this.geometry = newGeometry;

	} else {

		this.calculateShadowVolumeGeometryWithoutEdgeInfo( this.geometry );

	}
}


THREE.ShadowVolume.prototype.calculateShadowVolumeGeometryWithoutEdgeInfo = function( originalGeometry ) {

	// create geometry

	this.geometry = new THREE.Geometry();
	this.geometry.boundingSphere = originalGeometry.boundingSphere;
	this.geometry.edgeFaces = [];

	// copy vertices / faces from original mesh

	var vertexTypes = this.geometry.vertexTypes;
	var vertices    = this.geometry.vertices;
	var	faces       = this.geometry.faces;
	var edgeFaces   = this.geometry.edgeFaces;

	var originalFaces    = originalGeometry.faces;
	var originalVertices = originalGeometry.vertices;
	var	fl               = originalFaces.length;

	var	originalFace, face, i, f, n, vertex, numVertices;
	var indices = [ "a", "b", "c", "d" ];


	for( f = 0; f < fl; f++ ) {

		numVertices = vertices.length;
		originalFace = originalFaces[ f ];

		if ( originalFace instanceof THREE.Face4 ) {

			n = 4;
			face = new THREE.Face4( numVertices, numVertices + 1, numVertices + 2, numVertices + 3 );

		} else {

          	n = 3;
			face = new THREE.Face3( numVertices, numVertices + 1, numVertices + 2 );

		}

		face.normal.copy( originalFace.normal );
		faces.push( face );


		for( i = 0; i < n; i++ ) {

			vertex = originalVertices[ originalFace[ indices[ i ]]];
			vertices.push( new THREE.Vertex( vertex.position.clone()));

		}

	}


	// calculate edge faces

	var result, faceA, faceB, v, vl;

	for( var fa = 0; fa < originalFaces.length - 1; fa++ ) {

		faceA = faces[ fa ];

		for( var fb = fa + 1; fb < originalFaces.length; fb++ ) {

			faceB = faces[ fb ];
			result = this.facesShareEdge( vertices, faceA, faceB );

			if( result !== undefined ) {

				numVertices = vertices.length;
				face = new THREE.Face4( result.indices[ 0 ], result.indices[ 3 ], result.indices[ 2 ], result.indices[ 1 ] );
				face.normal.set( 1, 0, 0 );
				edgeFaces.push( face );

			}

		}

	}

};


THREE.ShadowVolume.prototype.facesShareEdge = function( vertices, faceA, faceB ) {

	var indicesA,
		indicesB,
		indexA,
		indexB,
		vertexA,
		vertexB,
		savedVertexA,
		savedVertexB,
		savedIndexA,
		savedIndexB,
		indexLetters,
		a, b,
		numMatches = 0,
		indices = [ "a", "b", "c", "d" ];

	if( faceA instanceof THREE.Face4 ) indicesA = 4;
	else                               indicesA = 3;

	if( faceB instanceof THREE.Face4 ) indicesB = 4;
	else                               indicesB = 3;


	for( a = 0; a < indicesA; a++ ) {

		indexA  = faceA[ indices[ a ] ];
		vertexA = vertices[ indexA ];

		for( b = 0; b < indicesB; b++ ) {

			indexB  = faceB[ indices[ b ] ];
			vertexB = vertices[ indexB ];

			if( Math.abs( vertexA.position.x - vertexB.position.x ) < 0.0001 &&
				Math.abs( vertexA.position.y - vertexB.position.y ) < 0.0001 &&
				Math.abs( vertexA.position.z - vertexB.position.z ) < 0.0001 ) {

				numMatches++;

				if( numMatches === 1 ) {

 					savedVertexA = vertexA;
 					savedVertexB = vertexB;
					savedIndexA  = indexA;
					savedIndexB  = indexB;
					indexLetters = indices[ a ];

				}

				if( numMatches === 2 ) {

					indexLetters += indices[ a ];

					if( indexLetters === "ad" || indexLetters === "ac" ) {

						return {

							faces   	: [ faceA, faceB ],
							vertices	: [ savedVertexA, savedVertexB, vertexB, vertexA  ],
							indices		: [ savedIndexA,  savedIndexB,  indexB,  indexA   ],
							vertexTypes	: [ 1, 2, 2, 1 ],
							extrudable	: true

						};

					} else {

						return {

							faces   	: [ faceA, faceB ],
							vertices	: [ savedVertexA, vertexA, vertexB, savedVertexB ],
							indices		: [ savedIndexA,  indexA,  indexB,  savedIndexB  ],
							vertexTypes	: [ 1, 1, 2, 2 ],
							extrudable	: true

						};

					}

				}

			}

		}

	}

	return undefined;

};
