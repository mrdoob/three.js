import { Vertex } from './Vertex';
import { VertexList } from './VertexList';
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

	this.vertices = []; // vertices of the hull (internal representation of points)

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

			// buffer next reference, see .deleteFaceVertices()

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

  clone: function () {

    return new this.constructor().copy( this );

  },

	copy: function ( other ) {

    return this;

	}

} );


export { QuickHull3 };
