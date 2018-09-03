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

class MeshStructure {

	constructor( geometry ) {

		this.geometry = geometry;

		this.connectingEdges = new Array( geometry.vertices.length );

		this.edges = {};

		var i, il, face;

		for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {

			this.connectingEdges[ i ] = [];

		}

		for ( i = 0, il = geometry.faces.length; i < il; i ++ ) {

			face = geometry.faces[ i ];

			this._processEdge( face.a, face.b, face );
			this._processEdge( face.b, face.c, face );
			this._processEdge( face.c, face.a, face );

		}

	}

	/////////////////////////////
	// Private methods

	_processEdge( a, b, face ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + '_' + vertexIndexB;

		var edge;

		if ( key in this.edges ) {

			edge = this.edges[ key ];

		} else {

			edge = {

				a: this.geometry.vertices[ vertexIndexA ], // pointer reference
				b: this.geometry.vertices[ vertexIndexB ],
				newEdge: null,
				aIndex: vertexIndexA, // numbered reference
				bIndex: vertexIndexB,
				faces: [], // pointers to face
				sharpness: 0

			};

			this.edges[ key ] = edge;

			this.connectingEdges[ a ].push( edge );
			this.connectingEdges[ b ].push( edge );

		}

		edge.faces.push( face );

	}

	/////////////////////////////
	// Public methods

	getEdge( a, b ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + '_' + vertexIndexB;

		return this.edges[ key ];

	}

}


export class SubdivisionModifier {

	// Some constants
	WARNINGS = true; // Set to true for development
	ABC = [ 'a', 'b', 'c' ];

	constructor ( geometry, subdivisions ) {

		// Number of subdivision levels default: 1.
		this.subdivisions = ( subdivisions === undefined ) ? 1 : subdivisions;

		// Create this.baseGeometry as cleaned-up copy of input geometry.
		if ( geometry.isBufferGeometry ) {

			this.baseGeometry = new THREE.Geometry().fromBufferGeometry( geometry );

		} else {

			this.baseGeometry = geometry;

		}

		this.baseGeometry.mergeVertices();

	}

	/////////////////////////////
	// Private methods

	_newFace( a, b, c, materialIndex ) {

		return new THREE.Face3( a, b, c, undefined, undefined, materialIndex );

	}

	_midpoint( a, b ) {

		return ( Math.abs( b - a ) / 2 ) + Math.min( a, b );

	}

	_newUv( newUvs, a, b, c ) {

		newUvs.push( [ a.clone(), b.clone(), c.clone() ] );

	}

	_addArray( baseArray, newArray, newArrayWeight ) {

		newArray.forEach( function ( el, i ) {

			baseArray[ i ] = ( baseArray[ i ] || 0 ) + ( el * newArrayWeight );

		} );

	}

	_scaleArray( array, arrayWeight ) {

		if ( arrayWeight !== 1 ) {

			array.forEach( function ( el, i ) {

				array[ i ] = el * arrayWeight;

			} );

		}

	}

	/////////////////////////////
	// Public methods

	/**
	 * Subdivide base surface.
	 */
	modify() {

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

	}

	/**
	 * Update the subdivided geometry to match changes in the base geometry.
	 * Does not handle changes in topology (added/deleted vertices, modified faces).
	 */
	update( baseGeoVertexIds ) {

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

	}

	/**
	 * Performs one iteration of subdivision.
	 */
	smooth() {

		var tmp = new THREE.Vector3();

		var newUVs = [];

		var n, i, il, j, k;

		var oldVertices = this.geometry.vertices; // { x, y, z}
		var oldFaces = this.geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }
		var oldUvs = this.geometry.faceVertexUvs[ 0 ];

		var hasUvs = oldUvs !== undefined && oldUvs.length > 0;

		/******************************************************
		 *
		 * Step 0: Preprocess Geometry to Generate edges Lookup
		 *
		 *******************************************************/

		var structure = new MeshStructure( this.geometry );

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

		for ( i in structure.edges ) {

			currentEdge = structure.edges[ i ];
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

					if ( this.WARNINGS ) console.warn( 'Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge );

				}

			}

			// Add influence of edge endpoints to edge's new vertex.
			newEdge.addVectors( currentEdge.a, currentEdge.b ).multiplyScalar( edgeVertexWeight );

			// Merge weights for edge vertices into weights for edge's new vertex.
			this._addArray( newVertexWeight, this.vertexWeights[ currentEdge.aIndex ], edgeVertexWeight );
			this._addArray( newVertexWeight, this.vertexWeights[ currentEdge.bIndex ], edgeVertexWeight );

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

					other = oldVertices[ face[ this.ABC[ k ] ] ];
					if ( other !== currentEdge.a && other !== currentEdge.b ) break;

				}

				this._addArray( newVertexWeight, this.vertexWeights[ face[ this.ABC[ k ] ] ], adjacentVertexWeight );

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
		var connectingEdge, oldVertex, newSourceVertex, vertexWeight, otherEnd;
		var newSourceVertices = [];

		for ( i = 0, il = oldVertices.length; i < il; i ++ ) {

			oldVertex = oldVertices[ i ];
			vertexWeight = this.vertexWeights[ i ];

			n = structure.connectingEdges[ i ].length;

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

					if ( this.WARNINGS ) console.warn( '2 connecting edges', structure.connectingEdges[ i ] );
					sourceVertexWeight = 3 / 4;
					connectingVertexWeight = 1 / 8;

					// sourceVertexWeight = 1;
					// connectingVertexWeight = 0;

				} else if ( n === 1 ) {

					if ( this.WARNINGS ) console.warn( 'only 1 connecting edge' );
					sourceVertexWeight = 3 / 4;
					connectingVertexWeight = 1 / 4;

				} else if ( n === 0 ) {

					if ( this.WARNINGS ) console.warn( '0 connecting edges' );

				}

			}

			newSourceVertex = oldVertex.clone().multiplyScalar( sourceVertexWeight );

			tmp.set( 0, 0, 0 );

			this._scaleArray( vertexWeight, sourceVertexWeight );

			for ( j = 0; j < n; j ++ ) {

				// Get connected vertex.
				connectingEdge = structure.connectingEdges[ i ][ j ];
				otherEnd = connectingEdge.a !== oldVertex;
				other = otherEnd ? connectingEdge.a : connectingEdge.b;

				// Add influence of connected vertex.
				tmp.add( other );
				this._addArray( vertexWeight, this.vertexWeights[ otherEnd ? connectingEdge.aIndex : connectingEdge.bIndex ], connectingVertexWeight );

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

			edge1 = structure.getEdge( face.a, face.b ).newEdge;
			edge2 = structure.getEdge( face.b, face.c ).newEdge;
			edge3 = structure.getEdge( face.c, face.a ).newEdge;

			// create 4 faces.

			newFaces.push( this._newFace( edge1, edge2, edge3, face.materialIndex ) );
			newFaces.push( this._newFace( face.a, edge1, edge3, face.materialIndex ) );
			newFaces.push( this._newFace( face.b, edge2, edge1, face.materialIndex ) );
			newFaces.push( this._newFace( face.c, edge3, edge2, face.materialIndex ) );

			// create 4 new uv's

			if ( hasUvs ) {

				uv = oldUvs[ i ];

				x0 = uv[ 0 ];
				x1 = uv[ 1 ];
				x2 = uv[ 2 ];

				x3.set( this._midpoint( x0.x, x1.x ), this._midpoint( x0.y, x1.y ) );
				x4.set( this._midpoint( x1.x, x2.x ), this._midpoint( x1.y, x2.y ) );
				x5.set( this._midpoint( x0.x, x2.x ), this._midpoint( x0.y, x2.y ) );

				this._newUv( newUVs, x3, x4, x5 );
				this._newUv( newUVs, x0, x3, x5 );

				this._newUv( newUVs, x1, x4, x3 );
				this._newUv( newUVs, x2, x5, x4 );

			}

		}

		// Overwrite old arrays
		this.geometry.vertices = newVertices;
		this.geometry.faces = newFaces;
		if ( hasUvs ) this.geometry.faceVertexUvs[ 0 ] = newUVs;
		this.vertexWeights = this.vertexWeights.concat( newVertexWeights );

		// console.log('done');

	}

}
