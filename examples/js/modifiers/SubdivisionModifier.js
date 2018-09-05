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

	get geometry() {

		return this._geometry;

	}

	set geometry( geometry ) {

		this._geometry = geometry;

		this.connectingEdges = new Array( geometry.vertices.length );

		for ( var i = 0, il = geometry.vertices.length; i < il; i ++ ) {

			this.connectingEdges[ i ] = [];

		}

	}

	constructor( geometry ) {

		this.edges = {};

		if ( geometry !== undefined ) {

			this.geometry = geometry;

			for ( var i = 0, il = geometry.faces.length; i < il; i ++ ) {

				this.addFace( geometry.faces[ i ] );

			}

		} else {

			this.connectingEdges = [];

		}

	}

	/////////////////////////////
	// Private methods

	/////////////////////////////
	// Public methods

	getEdge( a, b ) {

		return this.edges[ a + '_' + b ] || this.edges[ b + '_' + a ];

	}

	addFace( face ) {

		this.addEdge( face.a, face.b, face );
		this.addEdge( face.b, face.c, face );
		this.addEdge( face.c, face.a, face );

	}

	addEdge( a, b, face ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + '_' + vertexIndexB;

		var edge;

		if ( key in this.edges ) {

			edge = this.edges[ key ];

		} else {

			edge = {

				a: this._geometry.vertices[ vertexIndexA ], // pointer reference
				b: this._geometry.vertices[ vertexIndexB ],
				newEdgeVertexId: null,
				aIndex: vertexIndexA, // numbered reference
				bIndex: vertexIndexB,
				faces: [], // pointers to face
				sharpness: 0

			};

			this.edges[ key ] = edge;

			if ( ! this.connectingEdges[ a ] ) {

				this.connectingEdges[ a ] = [];

			}

			if ( ! this.connectingEdges[ b ] ) {

				this.connectingEdges[ b ] = [];

			}

			this.connectingEdges[ a ].push( edge );
			this.connectingEdges[ b ].push( edge );

		}

		edge.faces.push( face );

	}

}


export class SubdivisionModifier {

	// Some constants
	WARNINGS = true; // Set to true for development
	ABC = [ 'a', 'b', 'c' ];

	get baseGeometry() {

		return this._baseGeometry;

	}

	set baseGeometry( geometry ) {

		// Create this.baseGeometry as cleaned-up copy of input geometry.
		if ( geometry.isBufferGeometry ) {

			this._baseGeometry = new THREE.Geometry().fromBufferGeometry( geometry );

		} else {

			this._baseGeometry = geometry;

		}

		this._baseGeometry.mergeVertices();

		this.reset();

	}

	constructor ( geometry, subdivisions = 1 ) {

		this.subdivisions = subdivisions;

		this.baseGeometry = geometry;

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
	reset() {

		this.baseStructure = new MeshStructure( this._baseGeometry );

		this.subdivStructure = this.baseStructure;

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
	 * Does not handle changes in topology (added/deleted vertices, modified faces) or edge sharpness.
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

		var oldStructure = this.subdivStructure;

		/******************************************************
		 *
		 *	Step 1.
		 *	For each edge, create a new Edge Vertex,
		 *	then position it.
		 *
		 *******************************************************/

		var newEdgeVertices = [], newVertexWeights = [];
		var otherId, currentEdge, newEdgeVertex, face;
		var edgeVertexWeight, adjacentVertexWeight, connectedFaces, newEdgeVertexWeight, newEdgeVertexId;

		for ( i in oldStructure.edges ) {

			currentEdge = oldStructure.edges[ i ];

			newEdgeVertex = new THREE.Vector3();
			newEdgeVertexWeight = [];
			newEdgeVertexId = this.vertexWeights.length + newEdgeVertices.length;

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
			newEdgeVertex.addVectors( currentEdge.a, currentEdge.b ).multiplyScalar( edgeVertexWeight );

			// Merge weights for edge vertices into weights for edge's new vertex.
			this._addArray( newEdgeVertexWeight, this.vertexWeights[ currentEdge.aIndex ], edgeVertexWeight );
			this._addArray( newEdgeVertexWeight, this.vertexWeights[ currentEdge.bIndex ], edgeVertexWeight );

			// Record that the ends of this edge influence the position of the new vertex.
			this.vertexWeights[ currentEdge.aIndex ].forEach( ( el, j ) => {

				this.vertexInfluences[ j ].add( newEdgeVertexId );

			}, this );

			this.vertexWeights[ currentEdge.bIndex ].forEach( ( el, j ) => {

				this.vertexInfluences[ j ].add( newEdgeVertexId );

			}, this );

			tmp.set( 0, 0, 0 );

			for ( j = 0; j < connectedFaces; j ++ ) {

				face = currentEdge.faces[ j ];

				for ( k = 0; k < 3; k ++ ) {

					otherId = face[ this.ABC[ k ] ];
					if ( ! ( otherId === currentEdge.aIndex ) && ! ( otherId === currentEdge.bIndex ) ) break;

				}

				this._addArray( newEdgeVertexWeight, this.vertexWeights[ otherId ], adjacentVertexWeight );

				tmp.add( oldVertices[ otherId ] );

			}

			tmp.multiplyScalar( adjacentVertexWeight );
			newEdgeVertex.add( tmp );

			currentEdge.newEdgeVertexId = newEdgeVertexId;
			newEdgeVertices.push( newEdgeVertex );
			newVertexWeights.push( newEdgeVertexWeight );

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

			n = oldStructure.connectingEdges[ i ].length;

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

					if ( this.WARNINGS ) console.warn( '2 connecting edges', oldStructure.connectingEdges[ i ] );
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
				connectingEdge = oldStructure.connectingEdges[ i ][ j ];
				otherEnd = connectingEdge.aIndex !== i;
				otherId = otherEnd ? connectingEdge.a : connectingEdge.b;

				// Add influence of connected vertex.
				tmp.add( otherId );
				this._addArray( vertexWeight, this.vertexWeights[ otherEnd ? connectingEdge.aIndex : connectingEdge.bIndex ], connectingVertexWeight );

				// Merge influences on connected vertex into influences on this vertex.
				this.vertexWeights[ otherEnd ? connectingEdge.aIndex : connectingEdge.bIndex ].forEach( ( el, k ) => {

					this.vertexInfluences[ k ].add( i );

				}, this );

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

		this.geometry.vertices = newSourceVertices.concat( newEdgeVertices );

		var newStructure = new MeshStructure();
		newStructure.geometry = this.geometry;

		var newEdgeVertexId1, newEdgeVertexId2, newEdgeVertexId3, newFace;
		var newFaces = [];

		var uv, x0, x1, x2;
		var x3 = new THREE.Vector2();
		var x4 = new THREE.Vector2();
		var x5 = new THREE.Vector2();

		for ( i = 0, il = oldFaces.length; i < il; i ++ ) {

			face = oldFaces[ i ];

			// find the 3 new edge vertices of each old face

			newEdgeVertexId1 = oldStructure.getEdge( face.a, face.b ).newEdgeVertexId;
			newEdgeVertexId2 = oldStructure.getEdge( face.b, face.c ).newEdgeVertexId;
			newEdgeVertexId3 = oldStructure.getEdge( face.c, face.a ).newEdgeVertexId;

			// create 4 faces.

			newFace = this._newFace( newEdgeVertexId1, newEdgeVertexId2, newEdgeVertexId3, face.materialIndex );
			newStructure.addFace( newFace );
			newFaces.push( newFace );

			newFace = this._newFace( face.a, newEdgeVertexId1, newEdgeVertexId3, face.materialIndex );
			newStructure.addFace( newFace );
			newFaces.push( newFace );

			newFace = this._newFace( face.b, newEdgeVertexId2, newEdgeVertexId1, face.materialIndex );
			newStructure.addFace( newFace );
			newFaces.push( newFace );

			newFace = this._newFace( face.c, newEdgeVertexId3, newEdgeVertexId2, face.materialIndex );
			newStructure.addFace( newFace );
			newFaces.push( newFace );

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

		// Overwrite old objects
		this.subdivStructure = newStructure;
		this.geometry.faces = newFaces;
		if ( hasUvs ) this.geometry.faceVertexUvs[ 0 ] = newUVs;
		this.vertexWeights = this.vertexWeights.concat( newVertexWeights );

		// console.log('done');

	}

}
