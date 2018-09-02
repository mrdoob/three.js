/* Modified from three/examples/js/modifiers/SubdivisionModifier.js */


/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *	@author centerionware / http://www.centerionware.com
 *
 *	Subdivision Geometry Modifier
 *		using Loop Subdivision Scheme
 *
 *	References:
 *		http://graphics.stanford.edu/~mdfisher/subdivision.html
 *		http://www.holmes3d.net/graphics/subdivision/
 *		http://www.cs.rutgers.edu/~decarlo/readings/subdiv-sg00c.pdf
 *
 *	Known Issues:
 *		- currently doesn't handle "Sharp Edges"
 */

export const SubdivisionModifier = function ( geometry, subdivisions ) {

	// Some constants
	var WARNINGS = true; // Set to true for development
	var ABC = [ 'a', 'b', 'c' ];

	// Number of subdivision levels default: 1.
	this.subdivisions = ( subdivisions === undefined ) ? 1 : subdivisions;

	// Create this.baseGeometry as cleaned-up copy of input geometry.
	if ( geometry.isBufferGeometry ) {

		this.baseGeometry = new THREE.Geometry().fromBufferGeometry( geometry );

	} else {

		this.baseGeometry = geometry;

	}

	this.baseGeometry.mergeVertices();

	/////////////////////////////

	function getEdge( a, b, map ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + '_' + vertexIndexB;

		return map[ key ];

	}


	function processEdge( a, b, vertices, map, face, metaVertices ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + '_' + vertexIndexB;

		var edge;

		if ( key in map ) {

			edge = map[ key ];

		} else {

			var vertexA = vertices[ vertexIndexA ];
			var vertexB = vertices[ vertexIndexB ];

			edge = {

				a: vertexA, // pointer reference
				b: vertexB,
				newEdge: null,
				aIndex: vertexIndexA, // numbered reference
				bIndex: vertexIndexB,
				faces: [] // pointers to face

			};

			map[ key ] = edge;

			metaVertices[ a ].edges.push( edge );
			metaVertices[ b ].edges.push( edge );

		}

		edge.faces.push( face );

	}

	function generateLookups( vertices, faces, metaVertices, edges ) {

		var i, il, face;

		for ( i = 0, il = vertices.length; i < il; i ++ ) {

			metaVertices[ i ] = { edges: [] };

		}

		for ( i = 0, il = faces.length; i < il; i ++ ) {

			face = faces[ i ];

			processEdge( face.a, face.b, vertices, edges, face, metaVertices );
			processEdge( face.b, face.c, vertices, edges, face, metaVertices );
			processEdge( face.c, face.a, vertices, edges, face, metaVertices );

		}

	}

	function newFace( newFaces, a, b, c, materialIndex ) {

		newFaces.push( new THREE.Face3( a, b, c, undefined, undefined, materialIndex ) );

	}

	function midpoint( a, b ) {

		return ( Math.abs( b - a ) / 2 ) + Math.min( a, b );

	}

	function newUv( newUvs, a, b, c ) {

		newUvs.push( [ a.clone(), b.clone(), c.clone() ] );

	}

	function addArray( baseArray, newArray, newArrayWeight ) {

		newArray.forEach( function ( el, i ) {

			baseArray[ i ] = ( baseArray[ i ] || 0 ) + ( el * newArrayWeight );

		} );

	}

	function scaleArray( array, arrayWeight ) {

		if ( arrayWeight !== 1 ) {

			array.forEach( function ( el, i ) {

				array[ i ] = el * arrayWeight;

			} );

		}

	}

	/////////////////////////////

	/**
	 * Subdivide base surface.
	 */
	this.modify = function () {

		var repeats = this.subdivisions;

		this.geometry = this.baseGeometry.clone();

		// Initialize vertex weights, for quick updating. Initially, each vertex is solely dependent on itself.
		this.vertexWeights = [];

		// Initialize base vertex influences, also for quick updating.
		this.vertexInfluences = [];

		// Initialize weight and influence arrays to un-subdivided status.
		for ( var i = 0, il = this.geometry.vertices.length; i < il; i ++ ) {

			this.vertexWeights[ i ] = [];
			this.vertexWeights[ i ][ i ] = 1;

			this.vertexInfluences[ i ] = new Set( [ i ] );

		}

		while ( repeats -- > 0 ) {

			this.smooth();

		}

		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();

	};

	/**
	 * Update the subdivided geometry to match changes in the base geometry.
	 * Does not handle changes in topology (added/deleted vertices, modified faces).
	 */
	this.update = function ( baseGeoVertexIds ) {

		var vertexIdsToMove;

		var i, il;

		if ( baseGeoVertexIds !== undefined ) {

			vertexIdsToMove = new Set();

			// For each base geometry vertex to update, get all related subdivided geometry vertices.
			for ( i = 0, il = baseGeoVertexIds.length; i < il; i ++ ) {

				this.vertexInfluences[ baseGeoVertexIds[ i ] ].forEach( vertexIdsToMove.add, vertexIdsToMove );

			}

		} else {

			// Update position of all vertices.
			vertexIdsToMove = new Set( this.geometry.vertices.keys() );

		}

		var baseVertices = this.baseGeometry.vertices;
		var vertices = this.geometry.vertices;
		var vertexWeights = this.vertexWeights;
		var tmp = new THREE.Vector3();

		for ( var vertexId of vertexIdsToMove ) {

			tmp.setScalar( 0 );

			vertexWeights[ vertexId ].forEach( function ( el, i ) {

				tmp.addScaledVector( baseVertices[ i ], el );

			} );

			vertices[ vertexId ].copy( tmp );

		}

		this.geometry.verticesNeedUpdate = true;
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();

	};

	/**
	 * Performs one iteration of subdivision.
	 */
	this.smooth = function () {

		var tmp = new THREE.Vector3();

		var newUVs = [];

		var n, i, il, j, k;
		var metaVertices, sourceEdges;

		var oldVertices = this.geometry.vertices; // { x, y, z}
		var oldFaces = this.geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }
		var oldUvs = this.geometry.faceVertexUvs[ 0 ];

		var hasUvs = oldUvs !== undefined && oldUvs.length > 0;

		/******************************************************
		 *
		 * Step 0: Preprocess Geometry to Generate edges Lookup
		 *
		 *******************************************************/

		metaVertices = new Array( oldVertices.length );
		sourceEdges = {}; // Edge => { oldVertex1, oldVertex2, faces[]  }

		generateLookups( oldVertices, oldFaces, metaVertices, sourceEdges );


		/******************************************************
		 *
		 *	Step 1.
		 *	For each edge, create a new Edge Vertex,
		 *	then position it.
		 *
		 *******************************************************/

		var newEdgeVertices = [], newVertexWeights = [];
		var other, currentEdge, newEdge, face;
		var edgeVertexWeight, adjacentVertexWeight, connectedFaces, newVertexWeight;

		for ( i in sourceEdges ) {

			currentEdge = sourceEdges[ i ];
			newEdge = new THREE.Vector3();
			newVertexWeight = [];

			connectedFaces = currentEdge.faces.length;

			// check how many linked faces. 2 should be correct.
			if ( connectedFaces === 2 ) {

				edgeVertexWeight = 3 / 8;
				adjacentVertexWeight = 1 / 8;

			} else {

				// if length is not 2, handle condition
				edgeVertexWeight = 0.5;
				adjacentVertexWeight = 0;

				if ( connectedFaces !== 1 ) {

					if ( WARNINGS ) console.warn( 'Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge );

				}

			}

			// Add influence of edge endpoints to edge's new vertex.
			newEdge.addVectors( currentEdge.a, currentEdge.b ).multiplyScalar( edgeVertexWeight );

			// Merge weights for edge vertices into weights for edge's new vertex.
			addArray( newVertexWeight, this.vertexWeights[ currentEdge.aIndex ], edgeVertexWeight );
			addArray( newVertexWeight, this.vertexWeights[ currentEdge.bIndex ], edgeVertexWeight );

			// Record that the ends of this edge influence the position of the new vertex.
			var newVertexId = this.vertexWeights.length + newEdgeVertices.length;

			this.vertexWeights[ currentEdge.aIndex ].forEach( ( el, j ) => {

				this.vertexInfluences[ j ].add( newVertexId );

			} );

			this.vertexWeights[ currentEdge.bIndex ].forEach( ( el, j ) => {

				this.vertexInfluences[ j ].add( newVertexId );

			} );

			tmp.set( 0, 0, 0 );

			for ( j = 0; j < connectedFaces; j ++ ) {

				face = currentEdge.faces[ j ];

				for ( k = 0; k < 3; k ++ ) {

					other = oldVertices[ face[ ABC[ k ] ] ];
					if ( other !== currentEdge.a && other !== currentEdge.b ) break;

				}

				addArray( newVertexWeight, this.vertexWeights[ face[ ABC[ k ] ] ], adjacentVertexWeight );

				tmp.add( other );

			}

			tmp.multiplyScalar( adjacentVertexWeight );
			newEdge.add( tmp );

			currentEdge.newEdge = newVertexId;
			newEdgeVertices.push( newEdge );
			newVertexWeights.push( newVertexWeight );

			// console.log(currentEdge, newEdge);

		}

		/******************************************************
		 *
		 *	Step 2.
		 *	Reposition each source vertex.
		 *
		 *******************************************************/

		var beta, sourceVertexWeight, connectingVertexWeight;
		var connectingEdge, connectingEdges, oldVertex, newSourceVertex, vertexWeight, otherEnd;
		var newSourceVertices = [];

		for ( i = 0, il = oldVertices.length; i < il; i ++ ) {

			oldVertex = oldVertices[ i ];
			vertexWeight = this.vertexWeights[ i ];

			// find all connecting edges (using lookupTable)
			connectingEdges = metaVertices[ i ].edges;
			n = connectingEdges.length;

			if ( n > 2 ) {

				if ( n === 3 ) {

					beta = 3 / 16;

				} else {

					beta = 3 / ( 8 * n ); // Warren's modified formula

				}

				// Loop's original beta formula
				// beta = 1 / n * ( 5/8 - Math.pow( 3/8 + 1/4 * Math.cos( 2 * Math. PI / n ), 2) );

				sourceVertexWeight = 1 - n * beta;
				connectingVertexWeight = beta;

			} else {

				// crease and boundary rules
				// console.warn('crease and boundary rules');

				if ( n === 2 ) {

					if ( WARNINGS ) console.warn( '2 connecting edges', connectingEdges );
					sourceVertexWeight = 3 / 4;
					connectingVertexWeight = 1 / 8;

					// sourceVertexWeight = 1;
					// connectingVertexWeight = 0;

				} else if ( n === 1 ) {

					if ( WARNINGS ) console.warn( 'only 1 connecting edge' );
					sourceVertexWeight = 3 / 4;
					connectingVertexWeight = 1 / 4;

				} else if ( n === 0 ) {

					if ( WARNINGS ) console.warn( '0 connecting edges' );

				}

			}

			newSourceVertex = oldVertex.clone().multiplyScalar( sourceVertexWeight );

			tmp.set( 0, 0, 0 );

			scaleArray( vertexWeight, sourceVertexWeight );

			for ( j = 0; j < n; j ++ ) {

				// Get connected vertex.
				connectingEdge = connectingEdges[ j ];
				otherEnd = connectingEdge.a !== oldVertex;
				other = otherEnd ? connectingEdge.a : connectingEdge.b;

				// Add influence of connected vertex.
				tmp.add( other );
				addArray( vertexWeight, this.vertexWeights[ otherEnd ? connectingEdge.aIndex : connectingEdge.bIndex ], connectingVertexWeight );

				// Merge influences on connected vertex into influences on this vertex.
				this.vertexWeights[ otherEnd ? connectingEdge.aIndex : connectingEdge.bIndex ].forEach( ( el, k ) => {

					this.vertexInfluences[ k ].add( i );

				} );

			}

			tmp.multiplyScalar( connectingVertexWeight );
			newSourceVertex.add( tmp );

			newSourceVertices.push( newSourceVertex );

		}


		/******************************************************
		 *
		 *	Step 3.
		 *	Generate Faces between source vertices
		 *	and edge vertices.
		 *
		 *******************************************************/

		var newVertices = newSourceVertices.concat( newEdgeVertices );
		var edge1, edge2, edge3;
		var newFaces = [];

		var uv, x0, x1, x2;
		var x3 = new THREE.Vector2();
		var x4 = new THREE.Vector2();
		var x5 = new THREE.Vector2();

		for ( i = 0, il = oldFaces.length; i < il; i ++ ) {

			face = oldFaces[ i ];

			// find the 3 new edges vertex of each old face

			edge1 = getEdge( face.a, face.b, sourceEdges ).newEdge;
			edge2 = getEdge( face.b, face.c, sourceEdges ).newEdge;
			edge3 = getEdge( face.c, face.a, sourceEdges ).newEdge;

			// create 4 faces.

			newFace( newFaces, edge1, edge2, edge3, face.materialIndex );
			newFace( newFaces, face.a, edge1, edge3, face.materialIndex );
			newFace( newFaces, face.b, edge2, edge1, face.materialIndex );
			newFace( newFaces, face.c, edge3, edge2, face.materialIndex );

			// create 4 new uv's

			if ( hasUvs ) {

				uv = oldUvs[ i ];

				x0 = uv[ 0 ];
				x1 = uv[ 1 ];
				x2 = uv[ 2 ];

				x3.set( midpoint( x0.x, x1.x ), midpoint( x0.y, x1.y ) );
				x4.set( midpoint( x1.x, x2.x ), midpoint( x1.y, x2.y ) );
				x5.set( midpoint( x0.x, x2.x ), midpoint( x0.y, x2.y ) );

				newUv( newUVs, x3, x4, x5 );
				newUv( newUVs, x0, x3, x5 );

				newUv( newUVs, x1, x4, x3 );
				newUv( newUVs, x2, x5, x4 );

			}

		}

		// Overwrite old arrays
		this.geometry.vertices = newVertices;
		this.geometry.faces = newFaces;
		if ( hasUvs ) this.geometry.faceVertexUvs[ 0 ] = newUVs;
		this.vertexWeights = this.vertexWeights.concat( newVertexWeights );

		// console.log('done');

	};

};
