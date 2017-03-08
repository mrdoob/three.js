import { Vertex } from './Vertex';
import { VertexList } from './VertexList';
import { Face } from './Face';
import { Vector3 } from '../Vector3';
import { Line3 } from '../Line3';
import { Plane } from '../Plane';
import { Visible, NonConvex, Deleted } from '../../constants';

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

			// mark the vertices to be reassigned to some other face

			this.unclaimed.appendChain( faceVertices );

			if ( absorbingFace === undefined ) {

			} else {

				// if there is an absorbing face assign vertices to it

				var vertex = faceVertices;

				do {

					// we need to buffer the subsequent vertex at this point because the 'vertex.next' reference
					// will be changed by upcoming method calls

					var nextVertex = vertex.next;

					var distance = absorbingFace.distanceToPlane( vertex.point );

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

		var vertex = this.unclaimed.head;

		do {

			// buffer 'next' reference, see .deleteFaceVertices()

			var nextVertex = vertex.next;

			var maxDistance = this.tolerance;

			var maxFace = null;

			for ( var i = 0; i < newFaces.length; i ++ ) {

				var face = newFaces[ i ];

				if ( face.mark === Visible ) {

					var distance = face.distanceToPlane( vertex.point );

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

						distance = this.faces[ j ].distanceToPlane( vertex.point );

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

	}()

} );


export { QuickHull3 };
