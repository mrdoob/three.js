import { Vertex } from './Vertex';
import { VertexList } from './VertexList';
import { Face } from './Face';
import { Vector3 } from '../Vector3';
import { Line3 } from '../Line3';
import { Plane } from '../Plane';
import { Visible, NonConvex, Deleted } from '../../constants';
import { MergeNonConvexLargerFace, MergeNonConvex } from '../../constants';

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

function QuickHull3( points ) {

	if ( Array.isArray( points ) !== true ) {

		console.error( 'THREE.QuickHull3: Points parameter is not an array.' );

	}

	if ( points.length < 4 ) {

		console.error( 'THREE.QuickHull3: The algorithm needs at least four points.' );

	}

	this.tolerance = - 1;

	this.count = {
		points: points.length,
		faces: 0
	};

	this.faces = [];
	this.newFaces = [];
	this.discardedFaces = [];
	this.vertexPointIndices = [];

	this.claimed = new VertexList();
	this.unclaimed = new VertexList();

	this.vertices = []; // vertices of the hull (internal representation of given points)

	for ( var i = 0; i < this.count.points; i ++ ) {

		this.vertices.push( new Vertex( points[ i ], i ) );

	}

}

Object.assign( QuickHull3.prototype, {

	addVertexToFace: function ( vertex, face ) {

		vertex.face = face;

		if ( face.outside === null ) {

			this.claimed.append( vertex );

		} else {

			this.claimed.insertBefore( face.outside, vertex );

		}

		face.outside = vertex;

		return this;

	},

	// Removes 'vertex' for the 'claimed' list of vertices.
	// It also makes sure that the link from 'face' to the first vertex it sees in 'claimed' is linked correctly after the removal

	removeVertexFromFace: function ( vertex, face ) {

		if ( vertex === face.outside ) {

			// fix face.outside link

			if ( vertex.next !== null && vertex.next.face === face ) {

				// face has at least 2 outside vertices, move the 'outside' reference

				face.outside = vertex.next;

			} else {

				// vertex was the only outside vertex that face had

				face.outside = null;

			}

		}

		this.claimed.remove( vertex );

	},

	// Removes all the visible vertices that 'face' is able to see which are stored in the 'claimed' vertext list

	removeAllVerticesFromFace: function ( face ) {

		if ( face.outside !== null ) {

			// reference to the first and last vertex of this face

			var start = face.outside;
			var end = face.outside;

			while ( end.next !== null && end.next.face === face ) {

				end = end.next;

			}

			this.claimed.removeSubList( start, end );

			// fix references

			start.prev = end.next = null;
			face.outside = null;

			return start;

		}

	},

	deleteFaceVertices: function ( face, absorbingFace ) {

		var faceVertices = this.removeAllVerticesFromFace( face );

		if ( faceVertices !== undefined ) {

			if ( absorbingFace === undefined ) {

				// mark the vertices to be reassigned to some other face

				this.unclaimed.appendChain( faceVertices );


			} else {

				// if there is an absorbing face assign vertices to it

				var vertex = faceVertices;

				do {

					// we need to buffer the subsequent vertex at this point because the 'vertex.next' reference
					// will be changed by upcoming method calls

					var nextVertex = vertex.next;

					var distance = absorbingFace.distanceToPoint( vertex.point );

					// check if 'vertex' is able to see 'absorbingFace'

					if ( distance > this.tolerance ) {

						this.addVertexToFace( vertex, absorbingFace );

					} else {

						this.unclaimed.append( vertex );

					}

					// now assign next vertex

					vertex = nextVertex;

				} while ( vertex !== null );

			}

		}

	},

	// Reassigns as many vertices as possible from the unclaimed list to the new faces

	resolveUnclaimedPoints: function ( newFaces ) {

		if ( this.unclaimed.isEmpty() === false ) {

			var vertex = this.unclaimed.first();

			do {

				// buffer 'next' reference, see .deleteFaceVertices()

				var nextVertex = vertex.next;

				var maxDistance = this.tolerance;

				var maxFace = null;

				for ( var i = 0; i < newFaces.length; i ++ ) {

					var face = newFaces[ i ];

					if ( face.mark === Visible ) {

						var distance = face.distanceToPoint( vertex.point );

						if ( distance > maxDistance ) {

							maxDistance = distance;
							maxFace = face;

						}

						if ( maxDistance > 1000 * this.tolerance ) break; // TODO: Why this?

					}

				}

				if ( maxFace !== null ) {

					this.addVertexToFace( vertex, maxFace );

				}

			} while ( vertex !== null );

		}

	},

	// Computes the extremes of a tetrahedron which will be the initial hull

	computeExtremes: function () {

		var min = new Vector3();
		var max = new Vector3();

		var minVertices = [];
		var maxVertices = [];

		var i, l, j;

		// initially assume that the first vertex is the min/max

		for ( i = 0; i < 3; i ++ ) {

			minVertices[ i ] = maxVertices[ i ] = this.vertices[ 0 ];

		}

		min.copy( this.vertices[ 0 ].point );
		max.copy( this.vertices[ 0 ].point );

		// compute the min/max vertex on all six directions

		for ( i = 0, l = this.vertices.length; i < l ; i ++ ) {

			var vertex = this.vertices[ i ];
			var point = vertex.point;

			// update the min coordinates

			for ( j = 0; j < 3; j ++ ) {

				if ( point.getComponent( j ) < min.getComponent( j ) ) {

					min.setComponent( j, point.getComponent( j ) );
					minVertices[ j ] = vertex;

				}

			}

			// update the max coordinates

			for ( j = 0; j < 3; j ++ ) {

				if ( point.getComponent( j ) > max.getComponent( j ) ) {

					max.setComponent( j, point.getComponent( j ) );
					maxVertices[ j ] = vertex;

				}

			}

		}

		// use min/max vectors to compute epsilon

		this.tolerance = 3 * Number.EPSILON * (
			Math.max( Math.abs( min.x ), Math.abs( max.x ) ) +
			Math.max( Math.abs( min.y ), Math.abs( max.y ) ) +
			Math.max( Math.abs( min.z ), Math.abs( max.z ) )
		);

		return { min: minVertices, max: maxVertices };

	},

	// Computes the initial tetrahedron assigning to its faces all the points that are candidates to form part of the hull

	computeInitialHull: function () {

		var line3, plane, closestPoint;

		return function computeInitialHull () {

			if ( line3 === undefined ) {

				line3 = new Line3();
				plane = new Plane();
				closestPoint = new Vector3();

			}

			var vertex, vertices = this.vertices;
			var extremes = this.computeExtremes();
			var min = extremes.min;
			var max = extremes.max;

			var v0, v1, v2, v3;
			var i, l, j;

			// 1. Find the two vertices 'v0' and 'v1' with the greatest 1d separation
			// (max.x - min.x)
			// (max.y - min.y)
			// (max.z - min.z)

			var distance, maxDistance = 0;
			var index = 0;

			for ( i = 0; i < 3; i ++ ) {

				distance = max[ i ].point.getComponent( i ) - min[ i ].point.getComponent( i );

				if ( distance > maxDistance ) {

					maxDistance = distance;
					index = i;

				}

			}

			v0 = min[ index ];
			v1 = max[ index ];

			// 2. The next vertex 'v2' is the one farthest to the line formed by 'v0' and 'v1'

			maxDistance = 0;
			line3.set( v0.point, v1.point );

			for ( i = 0, l = this.vertices.length; i < l; i ++ ) {

				vertex = vertices[ i ];

				if ( vertex !== v0 && vertex !== v1 ) {

					line3.closestPointToPoint( vertex.point, true, closestPoint );

					distance = closestPoint.distanceToSquared( vertex.point );

					if ( distance > maxDistance ) {

						maxDistance = distance;
						v2 = vertex;

					}

				}

			}

			// 3. The next vertex 'v3' is the one farthest to the plane 'v0', 'v1', 'v2'

			maxDistance = 0;
			plane.setFromCoplanarPoints( v0.point, v1.point, v2.point );

			for ( i = 0, l = this.vertices.length; i < l; i ++ ) {

				vertex = vertices[ i ];

				if ( vertex !== v0 && vertex !== v1 && vertex !== v2 ) {

					distance = Math.abs( plane.distanceToPoint( vertex.point ) );

					if ( distance > maxDistance ) {

						maxDistance = distance;
						v3 = vertex;

					}

				}

			}

			var faces = [];

			if ( plane.distanceToPoint( v3.point ) < 0 ) {

				// the face is not able to see the point so 'plane.normal' is pointing outside the tetrahedron

				faces.push(
					Face.create( v0, v1, v2 ),
					Face.create( v3, v1, v0 ),
					Face.create( v3, v2, v1 ),
					Face.create( v3, v0, v2 )
				);

				// set the twin edge

				for ( i = 0; i < 3; i ++ ) {

					j = ( i + 1 ) % 3;

					// join face[ i ] i > 0, with the first face

					faces[ i + 1 ].getEdge( 2 ).setTwin( faces[ 0 ].getEdge( j ) );

					// join face[ i ] with face[ i + 1 ], 1 <= i <= 3

					faces[ i + 1 ].getEdge( 1 ).setTwin( faces[ j + 1 ].getEdge( 0 ) );

				}

			} else {

				// the face is able to see the point so 'plane.normal' is pointing inside the tetrahedron

				faces.push(
					Face.create( v0, v2, v1 ),
					Face.create( v3, v0, v1 ),
					Face.create( v3, v1, v2 ),
					Face.create( v3, v2, v0 )
				);

				// set the twin edge

				for ( i = 0; i < 3; i ++ ) {

					j = ( i + 1 ) % 3;

					// join face[ i ] i > 0, with the first face

					faces[ i + 1 ].getEdge( 2 ).setTwin( faces[ 0 ].getEdge( ( 3 - i ) % 3 ) );

					// join face[ i ] with face[ i + 1 ]

					faces[ i + 1 ].getEdge( 0 ).setTwin( faces[ j + 1 ].getEdge( 1 ) );

				}

			}

			// the initial hull is the tetrahedron

			for ( i = 0; i < 4; i ++ ) {

      	this.faces.push( faces[ i ] );

			}

			// initial assignment of vertices to the faces of the tetrahedron

			for ( i = 0, l = vertices.length; i < l; i ++ ) {

				vertex = vertices[i];

				if ( vertex !== v0 && vertex !== v1 && vertex !== v2 && vertex !== v3 ) {

					maxDistance = this.tolerance;
					var maxFace = null;

					for ( j = 0; j < 4; j ++ ) {

						distance = this.faces[ j ].distanceToPoint( vertex.point );

						if ( distance > maxDistance ) {

							maxDistance = distance;
							maxFace = this.faces[ j ];

						}

					}

					if ( maxFace !== null ) {

          	this.addVertexToFace( vertex, maxFace );

        	}

				}

			}

		};

	}(),

	// Removes inactive faces

	reindexFaceAndVertices: function () {

		var activeFaces = [];

		for ( var i = 0; i < this.faces.length; i ++ ) {

			var face = this.faces[ i ];

			if ( face.mark === Visible ) {

				activeFaces.push( face );

			}

		}

		this.faces = activeFaces;

	},

	// Finds the next vertex to make faces with the current hull.
	//
	// - let 'face' be the first face existing in the 'claimed' vertex list
	// - if 'face' doesn't exist then return since there're no vertices left
	// - otherwise for each 'vertex' that face sees find the one furthest away from 'face'

	nextVertexToAdd: function () {

		if ( this.claimed.isEmpty() === false ) {

			var eyeVertex, maxDistance = 0;

			var eyeFace = this.claimed.first().face;
			var vertex = eyeFace.outside;

			do {

				var distance = eyeFace.distanceToPoint( vertex.point );

				if ( distance > maxDistance ) {

					maxDistance = distance;
					eyeVertex = vertex;

				}

				vertex = vertex.next;

			} while ( vertex !== null && vertex.face === eyeFace );

			return eyeVertex;

		}

	},

	// Computes a chain of half edges in ccw order called the 'horizon'.
	// For an edge to be part of the horizon it must join a face that can see
	// 'eyePoint' and a face that cannot see 'eyePoint'.
	//
	// eyePoint: The coordinates of a point
	// crossEdge: The edge used to jump to the current 'face'
	// face: The current face being tested
	// horizon: The edges that form part of the horizon in ccw order

	computeHorizon: function ( eyePoint, crossEdge, face, horizon ) {

		// moves face's vertices to the 'unclaimed' vertex list

		this.deleteFaceVertices( face );

		face.mark = Deleted;

		var edge;

		if ( crossEdge === null ) {

			edge = crossEdge = face.getEdge( 0 );

		} else {

			// start from the next edge since 'crossEdge' was already analyzed
			// (actually 'crossEdge.twin' was the edge who called this method recursively)

			edge = crossEdge.next;

		}

		do {

			var twinEdge = edge.twin;
			var oppositeFace = twinEdge.face;

			if ( oppositeFace.mark === Visible ) {

				if ( oppositeFace.distanceToPoint( eyePoint ) > this.tolerance ) {

					// the opposite face can see the vertex, so proceed with next edge

					this.computeHorizon( eyePoint, twinEdge, oppositeFace, horizon );

				} else {

					// the opposite face can't see the vertex, so this edge is part of the horizon

					horizon.push( edge );

				}

				edge = edge.next;

			}

		} while ( edge !== crossEdge );

	},

	// Creates a face with the points 'eyeVertex.point', 'horizonEdge.tail' and 'horizonEdge.head' in ccw order

	addAdjoiningFace: function ( eyeVertex, horizonEdge ) {

		// all the half edges are created in ccw order thus the face is always pointing outside the hull

		var face = Face.create( eyeVertex, horizonEdge.tail(), horizonEdge.head() );

		this.faces.push( face );

		// join face.getEdge( - 1 ) with the horizon's opposite edge face.getEdge( - 1 ) = face.getEdge( 2 )

		face.getEdge( - 1 ).setTwin( horizonEdge.twin );

		return face.getEdge( 0 ); // The half edge whose vertex is the eyeVertex


	},

	//  Adds horizon.length faces to the hull, each face will be 'linked' with the
	//  horizon opposite face and the face on the left/right

	addNewFaces: function ( eyeVertex, horizon ) {

		this.newFaces = [];

		var firstSideEdge = null;
		var previousSideEdge = null;

		for ( var i = 0; i < horizon.length; i ++ ) {

			var horizonEdge = horizon[ i ];

			// returns the right side edge

			var sideEdge = this.addAdjoiningFace( eyeVertex, horizonEdge );

			if ( firstSideEdge === null ) {

				firstSideEdge = sideEdge;

			} else {

				// joins face.getEdge( 1 ) with previousFace.getEdge( 0 )

				sideEdge.next.setTwin( previousSideEdge );

			}

			this.newFaces.push( sideEdge.face );
			previousSideEdge = sideEdge;

		}

		firstSideEdge.next.setTwin( previousSideEdge );

	},

	// Computes the distance from 'edge' opposite face's centroid to 'edge.face'

	oppositeFaceDistance: function ( edge ) {

		// The result is:
		//
		// - a positive number when the centroid of the opposite face is above the face i.e. when the faces are concave
		// - a negative number when the centroid of the opposite face is below the face i.e. when the faces are convex

		return edge.face.distanceToPoint( edge.twin.face.midpoint );

	},

	// Merges a face with none/any/all its neighbors according to the given strategy

	doAdjacentMerge: function ( face, mergeType ) {

		var edge = face.edge;
		var convex = true;

		do {

			var oppositeFace = edge.twin.face;
			var merge = false;

			if ( mergeType === MergeNonConvex ) {

				if ( this.oppositeFaceDistance( edge ) > this.tolerance ||
				this.oppositeFaceDistance( edge.twin ) > - this.tolerance ) {

					merge = true;

				}

			} else {

				if ( face.area > oppositeFace.area ) {

					if ( this.oppositeFaceDistance( edge ) > - this.tolerance ) {

						merge = true;

					} else if ( this.oppositeFaceDistance( edge.twin ) > - this.tolerance ) {

						convex = false;

					}

				} else {

					if ( this.oppositeFaceDistance( edge.twin ) > - this.tolerance ) {

            merge = true;

          } else if ( this.oppositeFaceDistance( edge ) > - this.tolerance ) {

            convex = false;

          }

				}

				if ( merge === true ) {

					var discardedFaces = this.mergeAdjacentFaces( edge, [] );

					for ( var i = 0; i < discardedFaces.length; i ++ ) {

						this.deleteFaceVertices( discardedFaces[ i ], face );

					}

					return true;

				}

			}

			edge = edge.next;

		} while ( edge !== face.edge );

		if ( convex === false ) {

			face.mark = NonConvex;

		}

		return false;

	},

	addVertexToHull: function ( eyeVertex ) {

		var horizon = [];
		var i, face;

		this.unclaimed.clear();

		// remove 'eyeVertex' from 'eyeVertex.face' so that it can't be added to the 'unclaimed' vertex list

		this.removeVertexFromFace( eyeVertex, eyeVertex.face );

		this.computeHorizon( eyeVertex.point, null, eyeVertex.face, horizon );

		this.addNewFaces( eyeVertex, horizon );

		// first merge pass.
    // Do the merge with respect to the larger face

    for ( i = 0; i < this.newFaces.length; i ++ ) {

      face = this.newFaces[ i ];

      if ( face.mark === Visible ) {

        while ( this.doAdjacentMerge( face, MergeNonConvexLargerFace ) ) {}

      }

    }

		// second merge pass.
    // Do the merge on non convex faces (a face is marked as non convex in the first pass)

		for ( i = 0; i < this.newFaces.length; i ++ ) {

      face = this.newFaces[ i ];

      if ( face.mark === NonConvex ) {

				face.mark = Visible;

        while ( this.doAdjacentMerge( face, MergeNonConvex ) ) {}

      }

    }

		// reassign 'unclaimed' vertices to the new faces

	 this.resolveUnclaimedPoints( this.newFaces );

	},

	build: function () {

		var iterations = 0;
		var eyeVertex;

		this.computeInitialHull();

		while ( ( eyeVertex = this.nextVertexToAdd() ) !== undefined ) {

			iterations ++;

			console.log( 'THREE.QuickHull3: Iteration %i', iterations );
			console.log( 'THREE.QuickHull3: Next vertex to add %i %o', eyeVertex.index, eyeVertex.point );

			this.addVertexToHull( eyeVertex );

		}

		this.reindexFaceAndVertices();

		// TODO: Clean up

	}

} );


export { QuickHull3 };
