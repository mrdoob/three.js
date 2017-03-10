import { Vertex } from './Vertex';
import { VertexList } from './VertexList';
import { Face } from './Face';
import { Vector3 } from '../Vector3';
import { Line3 } from '../Line3';
import { Plane } from '../Plane';
import { Visible, Deleted } from '../../constants';

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

function QuickHull3() {

	this.tolerance = - 1;

	this.faces = []; // the generated faces of the convex hull
	this.newFaces = []; // this array holds the faces that are generated within a single iteration

	this.assigned = new VertexList();
	this.unassigned = new VertexList();

	this.vertices = []; 	// vertices of the hull (internal representation of given geometry data)

}

Object.assign( QuickHull3.prototype, {

	setFromPoints: function ( points ) {

		if ( Array.isArray( points ) !== true ) {

			console.error( 'THREE.QuickHull3: Points parameter is not an array.' );

		}

		if ( points.length < 4 ) {

			console.error( 'THREE.QuickHull3: The algorithm needs at least four points.' );

		}

		this.makeEmpty();

		for ( var i = 0, l = points.length; i < l; i ++ ) {

			this.vertices.push( new Vertex( points[ i ] ) );

		}

		this.compute();

		return this;

	},

	setFromObject: function ( object ) {

		var points = [];

		object.updateMatrixWorld( true );

		object.traverse( function ( node ) {

			var i, l, point;

			var geometry = node.geometry;

			if ( geometry !== undefined ) {

				if ( geometry.isGeometry ) {

					var vertices = geometry.vertices;

					for ( i = 0, l = vertices.length; i < l; i ++ ) {

						point = vertices[ i ].clone();
						point.applyMatrix4( node.matrixWorld );

						points.push( point );

					}

				} else if ( geometry.isBufferGeometry ) {

					var attribute = geometry.attributes.position;

					if ( attribute !== undefined ) {

						for ( i = 0, l = attribute.count; i < l; i ++ ) {

							point = new Vector3();

							point.fromBufferAttribute( attribute, i ).applyMatrix4( node.matrixWorld );

							points.push( point );

						}

					}

				}

			}

		} );

		return this.setFromPoints( points );

	},

	makeEmpty: function () {

		this.faces = [];
		this.vertices = [];

		return this;

	},

	// Adds a 'vertex' to the 'assigned' list of vertices and assigns it to the given face.

	addVertexToFace: function ( vertex, face ) {

		vertex.face = face;

		if ( face.outside === null ) {

			this.assigned.append( vertex );

		} else {

			this.assigned.insertBefore( face.outside, vertex );

		}

		face.outside = vertex;

		return this;

	},

	// Removes 'vertex' for the 'assigned' list of vertices.
	// It also makes sure that the link from 'face' to the first vertex it sees in 'assigned' is linked correctly after the removal

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

		this.assigned.remove( vertex );

	},

	// Removes all the visible vertices that 'face' is able to see which are stored in the 'assigned' vertext list

	removeAllVerticesFromFace: function ( face ) {

		if ( face.outside !== null ) {

			// reference to the first and last vertex of this face

			var start = face.outside;
			var end = face.outside;

			while ( end.next !== null && end.next.face === face ) {

				end = end.next;

			}

			this.assigned.removeSubList( start, end );

			// fix references

			start.prev = end.next = null;
			face.outside = null;

			return start;

		}

	},

	// Removes all the visible vertices that 'face' is able to see

	// If 'absorbingFace' doesn't exist then all the removed vertices will be added to the 'unassigned' vertex list.
	// If 'absorbingFace' exists then this method will assign all the vertices of 'face' that can see 'absorbingFace',
	// if a vertex cannot see 'absorbingFace' it's added to the 'unassigned' vertex list.

	deleteFaceVertices: function ( face, absorbingFace ) {

		var faceVertices = this.removeAllVerticesFromFace( face );

		if ( faceVertices !== undefined ) {

			if ( absorbingFace === undefined ) {

				// mark the vertices to be reassigned to some other face

				this.unassigned.appendChain( faceVertices );


			} else {

				// if there's an absorbing face try to assign as many vertices as possible to it

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

						this.unassigned.append( vertex );

					}

					// now assign next vertex

					vertex = nextVertex;

				} while ( vertex !== null );

			}

		}

	},

	// Reassigns as many vertices as possible from the unassigned list to the new faces

	resolveUnassignedPoints: function ( newFaces ) {

		if ( this.unassigned.isEmpty() === false ) {

			var vertex = this.unassigned.first();

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

						if ( maxDistance > 1000 * this.tolerance ) break;

					}

				}

				// 'maxFace' can be null e.g. if there are identical vertices

				if ( maxFace !== null ) {

					this.addVertexToFace( vertex, maxFace );

				}

				vertex = nextVertex;

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

		// use min/max vectors to compute an optimal epsilon

		this.tolerance = 3 * Number.EPSILON * (
			Math.max( Math.abs( min.x ), Math.abs( max.x ) ) +
			Math.max( Math.abs( min.y ), Math.abs( max.y ) ) +
			Math.max( Math.abs( min.z ), Math.abs( max.z ) )
		);

		return { min: minVertices, max: maxVertices };

	},

	// Computes the initial simplex assigning to its faces all the points
	// that are candidates to form part of the hull

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

	reindexFaces: function () {

		var activeFaces = [];

		for ( var i = 0; i < this.faces.length; i ++ ) {

			var face = this.faces[ i ];

			if ( face.mark === Visible ) {

				activeFaces.push( face );

			}

		}

		this.faces = activeFaces;

	},

	// Finds the next vertex to create faces with the current hull

	nextVertexToAdd: function () {

		// if the 'assigned' list of vertices is empty, no vertices are left. return with 'undefined'

		if ( this.assigned.isEmpty() === false ) {

			var eyeVertex, maxDistance = 0;

			// grap the first available face and start with the first visible vertex of that face

			var eyeFace = this.assigned.first().face;
			var vertex = eyeFace.outside;

			// now calculate the farthest vertex that face can see

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
	// - eyePoint: The coordinates of a point
	// - crossEdge: The edge used to jump to the current 'face'
	// - face: The current face being tested
	// - horizon: The edges that form part of the horizon in ccw order

	computeHorizon: function ( eyePoint, crossEdge, face, horizon ) {

		// moves face's vertices to the 'unassigned' vertex list

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

			}

			edge = edge.next;

		} while ( edge !== crossEdge );

	},

	// Creates a face with the vertices 'eyeVertex.point', 'horizonEdge.tail' and 'horizonEdge.head' in ccw order

	addAdjoiningFace: function ( eyeVertex, horizonEdge ) {

		// all the half edges are created in ccw order thus the face is always pointing outside the hull

		var face = Face.create( eyeVertex, horizonEdge.tail(), horizonEdge.head() );

		this.faces.push( face );

		// join face.getEdge( - 1 ) with the horizon's opposite edge face.getEdge( - 1 ) = face.getEdge( 2 )

		face.getEdge( - 1 ).setTwin( horizonEdge.twin );

		return face.getEdge( 0 ); // the half edge whose vertex is the eyeVertex


	},

	//  Adds 'horizon.length' faces to the hull, each face will be linked with the
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

		// perform final join of new faces

		firstSideEdge.next.setTwin( previousSideEdge );

	},

	// Adds a vertex to the hull

	addVertexToHull: function ( eyeVertex ) {

		var horizon = [];
		var i, face;

		this.unassigned.clear();

		// remove 'eyeVertex' from 'eyeVertex.face' so that it can't be added to the 'unassigned' vertex list

		this.removeVertexFromFace( eyeVertex, eyeVertex.face );

		this.computeHorizon( eyeVertex.point, null, eyeVertex.face, horizon );

		this.addNewFaces( eyeVertex, horizon );

		// reassign 'unassigned' vertices to the new faces

	 this.resolveUnassignedPoints( this.newFaces );

	},

	cleanup: function () {

		this.assigned.clear();
		this.unassigned.clear();
		this.newFaces = [];

	},

	compute: function () {

		var vertex;

		this.computeInitialHull();

		// add all available vertices gradually to the hull

		while ( ( vertex = this.nextVertexToAdd() ) !== undefined ) {

			this.addVertexToHull( vertex );

		}

		this.reindexFaces();

		this.cleanup();

	}

} );


export { QuickHull3 };
