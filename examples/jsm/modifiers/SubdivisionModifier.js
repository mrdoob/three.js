/**
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

import {
	Face3,
	Geometry,
	Vector2,
	Vector3
} from "../../../build/three.module.js";

var SubdivisionModifier = function ( subdivisions ) {

	this.subdivisions = ( subdivisions === undefined ) ? 1 : subdivisions;

};

// Applies the "modify" pattern
SubdivisionModifier.prototype.modify = function ( geometry ) {

	if ( geometry.isBufferGeometry ) {

		geometry = new Geometry().fromBufferGeometry( geometry );

	} else {

		geometry = geometry.clone();

	}

	geometry.mergeVertices();

	var repeats = this.subdivisions;

	while ( repeats -- > 0 ) {

		this.smooth( geometry );

	}

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	return geometry;

};

( function () {

	// Some constants
	var ABC = [ 'a', 'b', 'c' ];


	function getEdge( a, b, map ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + "_" + vertexIndexB;

		return map[ key ];

	}


	function processEdge( a, b, vertices, map, face, metaVertices ) {

		var vertexIndexA = Math.min( a, b );
		var vertexIndexB = Math.max( a, b );

		var key = vertexIndexA + "_" + vertexIndexB;

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
				// aIndex: a, // numbered reference
				// bIndex: b,
				faces: [] // pointers to face

			};

			map[ key ] = edge;

		}

		edge.faces.push( face );

		metaVertices[ a ].edges.push( edge );
		metaVertices[ b ].edges.push( edge );


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

		newFaces.push( new Face3( a, b, c, undefined, undefined, materialIndex ) );

	}

	function midpoint( a, b ) {

		return ( Math.abs( b - a ) / 2 ) + Math.min( a, b );

	}

	function newUv( newUvs, a, b, c ) {

		newUvs.push( [ a.clone(), b.clone(), c.clone() ] );

	}

	/////////////////////////////

	// Performs one iteration of Subdivision
	SubdivisionModifier.prototype.smooth = function ( geometry ) {

		var tmp = new Vector3();

		var oldVertices, oldFaces, oldUvs;
		var newVertices, newFaces, newUVs = [];

		var n, i, il, j, k;
		var metaVertices, sourceEdges;

		// new stuff.
		var sourceEdges, newEdgeVertices, newSourceVertices;

		oldVertices = geometry.vertices; // { x, y, z}
		oldFaces = geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }
		oldUvs = geometry.faceVertexUvs;

		var hasUvs = oldUvs[ 0 ] !== undefined && oldUvs[ 0 ].length > 0;

		if ( hasUvs ) {

			for ( var j = 0; j < oldUvs.length; j ++ ) {

				newUVs.push( [] );

			}

		}

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

		newEdgeVertices = [];
		var other, currentEdge, newEdge, face;
		var edgeVertexWeight, adjacentVertexWeight, connectedFaces;

		for ( i in sourceEdges ) {

			currentEdge = sourceEdges[ i ];
			newEdge = new Vector3();

			edgeVertexWeight = 3 / 8;
			adjacentVertexWeight = 1 / 8;

			connectedFaces = currentEdge.faces.length;

			// check how many linked faces. 2 should be correct.
			if ( connectedFaces != 2 ) {

				// if length is not 2, handle condition
				edgeVertexWeight = 0.5;
				adjacentVertexWeight = 0;

				if ( connectedFaces != 1 ) {

					// console.warn( 'Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge );

				}

			}

			newEdge.addVectors( currentEdge.a, currentEdge.b ).multiplyScalar( edgeVertexWeight );

			tmp.set( 0, 0, 0 );

			for ( j = 0; j < connectedFaces; j ++ ) {

				face = currentEdge.faces[ j ];

				for ( k = 0; k < 3; k ++ ) {

					other = oldVertices[ face[ ABC[ k ] ] ];
					if ( other !== currentEdge.a && other !== currentEdge.b ) break;

				}

				tmp.add( other );

			}

			tmp.multiplyScalar( adjacentVertexWeight );
			newEdge.add( tmp );

			currentEdge.newEdge = newEdgeVertices.length;
			newEdgeVertices.push( newEdge );

			// console.log(currentEdge, newEdge);

		}

		/******************************************************
		 *
		 *	Step 2.
		 *	Reposition each source vertices.
		 *
		 *******************************************************/

		var beta, sourceVertexWeight, connectingVertexWeight;
		var connectingEdge, connectingEdges, oldVertex, newSourceVertex;
		newSourceVertices = [];

		for ( i = 0, il = oldVertices.length; i < il; i ++ ) {

			oldVertex = oldVertices[ i ];

			// find all connecting edges (using lookupTable)
			connectingEdges = metaVertices[ i ].edges;
			n = connectingEdges.length;

			if ( n == 3 ) {

				beta = 3 / 16;

			} else if ( n > 3 ) {

				beta = 3 / ( 8 * n ); // Warren's modified formula

			}

			// Loop's original beta formula
			// beta = 1 / n * ( 5/8 - Math.pow( 3/8 + 1/4 * Math.cos( 2 * Math. PI / n ), 2) );

			sourceVertexWeight = 1 - n * beta;
			connectingVertexWeight = beta;

			if ( n <= 2 ) {

				// crease and boundary rules
				// console.warn('crease and boundary rules');

				if ( n == 2 ) {

					// console.warn( '2 connecting edges', connectingEdges );
					sourceVertexWeight = 3 / 4;
					connectingVertexWeight = 1 / 8;

					// sourceVertexWeight = 1;
					// connectingVertexWeight = 0;

				} else if ( n == 1 ) {

					// console.warn( 'only 1 connecting edge' );

				} else if ( n == 0 ) {

					// console.warn( '0 connecting edges' );

				}

			}

			newSourceVertex = oldVertex.clone().multiplyScalar( sourceVertexWeight );

			tmp.set( 0, 0, 0 );

			for ( j = 0; j < n; j ++ ) {

				connectingEdge = connectingEdges[ j ];
				other = connectingEdge.a !== oldVertex ? connectingEdge.a : connectingEdge.b;
				tmp.add( other );

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

		newVertices = newSourceVertices.concat( newEdgeVertices );
		var sl = newSourceVertices.length, edge1, edge2, edge3;
		newFaces = [];

		var uv, x0, x1, x2;
		var x3 = new Vector2();
		var x4 = new Vector2();
		var x5 = new Vector2();

		for ( i = 0, il = oldFaces.length; i < il; i ++ ) {

			face = oldFaces[ i ];

			// find the 3 new edges vertex of each old face

			edge1 = getEdge( face.a, face.b, sourceEdges ).newEdge + sl;
			edge2 = getEdge( face.b, face.c, sourceEdges ).newEdge + sl;
			edge3 = getEdge( face.c, face.a, sourceEdges ).newEdge + sl;

			// create 4 faces.

			newFace( newFaces, edge1, edge2, edge3, face.materialIndex );
			newFace( newFaces, face.a, edge1, edge3, face.materialIndex );
			newFace( newFaces, face.b, edge2, edge1, face.materialIndex );
			newFace( newFaces, face.c, edge3, edge2, face.materialIndex );

			// create 4 new uv's

			if ( hasUvs ) {

				for ( var j = 0; j < oldUvs.length; j ++ ) {

					uv = oldUvs[ j ][ i ];

					x0 = uv[ 0 ];
					x1 = uv[ 1 ];
					x2 = uv[ 2 ];

					x3.set( midpoint( x0.x, x1.x ), midpoint( x0.y, x1.y ) );
					x4.set( midpoint( x1.x, x2.x ), midpoint( x1.y, x2.y ) );
					x5.set( midpoint( x0.x, x2.x ), midpoint( x0.y, x2.y ) );

					newUv( newUVs[ j ], x3, x4, x5 );
					newUv( newUVs[ j ], x0, x3, x5 );

					newUv( newUVs[ j ], x1, x4, x3 );
					newUv( newUVs[ j ], x2, x5, x4 );

				}

			}

		}

		// Overwrite old arrays
		geometry.vertices = newVertices;
		geometry.faces = newFaces;
		if ( hasUvs ) geometry.faceVertexUvs = newUVs;

		// console.log('done');

	};

} )();

export { SubdivisionModifier };
