console.warn( "THREE.SimplifyModifier: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );
/**
 *	Simplification Geometry Modifier
 *    - based on code and technique
 *	  - by Stan Melax in 1998
 *	  - Progressive Mesh type Polygon Reduction Algorithm
 *    - http://www.melax.com/polychop/
 */

THREE.SimplifyModifier = function () {};

( function () {

	var cb = new THREE.Vector3(), ab = new THREE.Vector3();

	function pushIfUnique( array, object ) {

		if ( array.indexOf( object ) === - 1 ) array.push( object );

	}

	function removeFromArray( array, object ) {

		var k = array.indexOf( object );
		if ( k > - 1 ) array.splice( k, 1 );

	}

	function computeEdgeCollapseCost( u, v ) {

		// if we collapse edge uv by moving u to v then how
		// much different will the model change, i.e. the "error".

		var edgelength = v.position.distanceTo( u.position );
		var curvature = 0;

		var sideFaces = [];
		var i, il = u.faces.length, face, sideFace;

		// find the "sides" triangles that are on the edge uv
		for ( i = 0; i < il; i ++ ) {

			face = u.faces[ i ];

			if ( face.hasVertex( v ) ) {

				sideFaces.push( face );

			}

		}

		// use the triangle facing most away from the sides
		// to determine our curvature term
		for ( i = 0; i < il; i ++ ) {

			var minCurvature = 1;
			face = u.faces[ i ];

			for ( var j = 0; j < sideFaces.length; j ++ ) {

				sideFace = sideFaces[ j ];
				// use dot product of face normals.
				var dotProd = face.normal.dot( sideFace.normal );
				minCurvature = Math.min( minCurvature, ( 1.001 - dotProd ) / 2 );

			}

			curvature = Math.max( curvature, minCurvature );

		}

		// crude approach in attempt to preserve borders
		// though it seems not to be totally correct
		var borders = 0;
		if ( sideFaces.length < 2 ) {

			// we add some arbitrary cost for borders,
			// borders += 10;
			curvature = 1;

		}

		var amt = edgelength * curvature + borders;

		return amt;

	}

	function computeEdgeCostAtVertex( v ) {

		// compute the edge collapse cost for all edges that start
		// from vertex v.  Since we are only interested in reducing
		// the object by selecting the min cost edge at each step, we
		// only cache the cost of the least cost edge at this vertex
		// (in member variable collapse) as well as the value of the
		// cost (in member variable collapseCost).

		if ( v.neighbors.length === 0 ) {

			// collapse if no neighbors.
			v.collapseNeighbor = null;
			v.collapseCost = - 0.01;

			return;

		}

		v.collapseCost = 100000;
		v.collapseNeighbor = null;

		// search all neighboring edges for "least cost" edge
		for ( var i = 0; i < v.neighbors.length; i ++ ) {

			var collapseCost = computeEdgeCollapseCost( v, v.neighbors[ i ] );

			if ( ! v.collapseNeighbor ) {

				v.collapseNeighbor = v.neighbors[ i ];
				v.collapseCost = collapseCost;
				v.minCost = collapseCost;
				v.totalCost = 0;
				v.costCount = 0;

			}

			v.costCount ++;
			v.totalCost += collapseCost;

			if ( collapseCost < v.minCost ) {

				v.collapseNeighbor = v.neighbors[ i ];
				v.minCost = collapseCost;

			}

		}

		// we average the cost of collapsing at this vertex
		v.collapseCost = v.totalCost / v.costCount;
		// v.collapseCost = v.minCost;

	}

	function removeVertex( v, vertices ) {

		console.assert( v.faces.length === 0 );

		while ( v.neighbors.length ) {

			var n = v.neighbors.pop();
			removeFromArray( n.neighbors, v );

		}

		removeFromArray( vertices, v );

	}

	function removeFace( f, faces ) {

		removeFromArray( faces, f );

		if ( f.v1 ) removeFromArray( f.v1.faces, f );
		if ( f.v2 ) removeFromArray( f.v2.faces, f );
		if ( f.v3 ) removeFromArray( f.v3.faces, f );

		// TODO optimize this!
		var vs = [ f.v1, f.v2, f.v3 ];
		var v1, v2;

		for ( var i = 0; i < 3; i ++ ) {

			v1 = vs[ i ];
			v2 = vs[ ( i + 1 ) % 3 ];

			if ( ! v1 || ! v2 ) continue;

			v1.removeIfNonNeighbor( v2 );
			v2.removeIfNonNeighbor( v1 );

		}

	}

	function collapse( vertices, faces, u, v ) { // u and v are pointers to vertices of an edge

		// Collapse the edge uv by moving vertex u onto v

		if ( ! v ) {

			// u is a vertex all by itself so just delete it..
			removeVertex( u, vertices );
			return;

		}

		var i;
		var tmpVertices = [];

		for ( i = 0; i < u.neighbors.length; i ++ ) {

			tmpVertices.push( u.neighbors[ i ] );

		}


		// delete triangles on edge uv:
		for ( i = u.faces.length - 1; i >= 0; i -- ) {

			if ( u.faces[ i ].hasVertex( v ) ) {

				removeFace( u.faces[ i ], faces );

			}

		}

		// update remaining triangles to have v instead of u
		for ( i = u.faces.length - 1; i >= 0; i -- ) {

			u.faces[ i ].replaceVertex( u, v );

		}


		removeVertex( u, vertices );

		// recompute the edge collapse costs in neighborhood
		for ( i = 0; i < tmpVertices.length; i ++ ) {

			computeEdgeCostAtVertex( tmpVertices[ i ] );

		}

	}



	function minimumCostEdge( vertices ) {

		// O(n * n) approach. TODO optimize this

		var least = vertices[ 0 ];

		for ( var i = 0; i < vertices.length; i ++ ) {

			if ( vertices[ i ].collapseCost < least.collapseCost ) {

				least = vertices[ i ];

			}

		}

		return least;

	}

	// we use a triangle class to represent structure of face slightly differently

	function Triangle( v1, v2, v3, a, b, c ) {

		this.a = a;
		this.b = b;
		this.c = c;

		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

		this.normal = new THREE.Vector3();

		this.computeNormal();

		v1.faces.push( this );
		v1.addUniqueNeighbor( v2 );
		v1.addUniqueNeighbor( v3 );

		v2.faces.push( this );
		v2.addUniqueNeighbor( v1 );
		v2.addUniqueNeighbor( v3 );


		v3.faces.push( this );
		v3.addUniqueNeighbor( v1 );
		v3.addUniqueNeighbor( v2 );

	}

	Triangle.prototype.computeNormal = function () {

		var vA = this.v1.position;
		var vB = this.v2.position;
		var vC = this.v3.position;

		cb.subVectors( vC, vB );
		ab.subVectors( vA, vB );
		cb.cross( ab ).normalize();

		this.normal.copy( cb );

	};

	Triangle.prototype.hasVertex = function ( v ) {

		return v === this.v1 || v === this.v2 || v === this.v3;

	};

	Triangle.prototype.replaceVertex = function ( oldv, newv ) {

		if ( oldv === this.v1 ) this.v1 = newv;
		else if ( oldv === this.v2 ) this.v2 = newv;
		else if ( oldv === this.v3 ) this.v3 = newv;

		removeFromArray( oldv.faces, this );
		newv.faces.push( this );


		oldv.removeIfNonNeighbor( this.v1 );
		this.v1.removeIfNonNeighbor( oldv );

		oldv.removeIfNonNeighbor( this.v2 );
		this.v2.removeIfNonNeighbor( oldv );

		oldv.removeIfNonNeighbor( this.v3 );
		this.v3.removeIfNonNeighbor( oldv );

		this.v1.addUniqueNeighbor( this.v2 );
		this.v1.addUniqueNeighbor( this.v3 );

		this.v2.addUniqueNeighbor( this.v1 );
		this.v2.addUniqueNeighbor( this.v3 );

		this.v3.addUniqueNeighbor( this.v1 );
		this.v3.addUniqueNeighbor( this.v2 );

		this.computeNormal();

	};

	function Vertex( v, id ) {

		this.position = v;

		this.id = id; // old index id

		this.faces = []; // faces vertex is connected
		this.neighbors = []; // neighbouring vertices aka "adjacentVertices"

		// these will be computed in computeEdgeCostAtVertex()
		this.collapseCost = 0; // cost of collapsing this vertex, the less the better. aka objdist
		this.collapseNeighbor = null; // best candinate for collapsing

	}

	Vertex.prototype.addUniqueNeighbor = function ( vertex ) {

		pushIfUnique( this.neighbors, vertex );

	};

	Vertex.prototype.removeIfNonNeighbor = function ( n ) {

		var neighbors = this.neighbors;
		var faces = this.faces;

		var offset = neighbors.indexOf( n );
		if ( offset === - 1 ) return;
		for ( var i = 0; i < faces.length; i ++ ) {

			if ( faces[ i ].hasVertex( n ) ) return;

		}

		neighbors.splice( offset, 1 );

	};

	THREE.SimplifyModifier.prototype.modify = function ( geometry, count ) {

		if ( geometry.isBufferGeometry ) {

			geometry = new THREE.Geometry().fromBufferGeometry( geometry );

		}

		geometry.mergeVertices();

		var oldVertices = geometry.vertices; // Three Position
		var oldFaces = geometry.faces; // Three Face

		// conversion
		var vertices = [];
		var faces = [];

		var i, il;

		//
		// put data of original geometry in different data structures
		//

		// add vertices

		for ( i = 0, il = oldVertices.length; i < il; i ++ ) {

			var vertex = new Vertex( oldVertices[ i ], i );
			vertices.push( vertex );

		}

		// add faces

		for ( i = 0, il = oldFaces.length; i < il; i ++ ) {

			var face = oldFaces[ i ];

			var a = face.a;
			var b = face.b;
			var c = face.c;

			var triangle = new Triangle( vertices[ a ], vertices[ b ], vertices[ c ], a, b, c );
			faces.push( triangle );

		}

		// compute all edge collapse costs

		for ( i = 0, il = vertices.length; i < il; i ++ ) {

			computeEdgeCostAtVertex( vertices[ i ] );

		}

		var nextVertex;

		var z = count;

		while ( z -- ) {

			nextVertex = minimumCostEdge( vertices );

			if ( ! nextVertex ) {

				console.log( 'THREE.SimplifyModifier: No next vertex' );
				break;

			}

			collapse( vertices, faces, nextVertex, nextVertex.collapseNeighbor );

		}

		//

		var simplifiedGeometry = new THREE.BufferGeometry();
		var position = [];
		var index = [];

		//

		for ( i = 0; i < vertices.length; i ++ ) {

			var vertex = vertices[ i ].position;
			position.push( vertex.x, vertex.y, vertex.z );

		}

		//

		for ( i = 0; i < faces.length; i ++ ) {

			var face = faces[ i ];

			var a = vertices.indexOf( face.v1 );
			var b = vertices.indexOf( face.v2 );
			var c = vertices.indexOf( face.v3 );

			index.push( a, b, c );

		}

		//

		simplifiedGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
		simplifiedGeometry.setIndex( index );

		return simplifiedGeometry;

	};

} )();
