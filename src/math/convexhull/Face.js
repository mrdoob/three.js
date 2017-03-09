import { HalfEdge } from './HalfEdge';
import { Vector3 } from '../Vector3';
import { Triangle } from '../Triangle';
import { Visible, NonConvex, Deleted } from '../../constants';

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

function Face() {

  this.normal = new Vector3();
  this.midpoint = new Vector3();
  this.area = 0;

  this.constant = 0; // signed distance from face to the origin
  this.outside = null; // reference to the a vertex in a vertex list this face can see
  this.mark = Visible;
  this.edge = null;

}

Object.assign( Face, {

  create: function( a, b, c ) {

    var face = new Face();

    var e0 = new HalfEdge( a, face );
    var e1 = new HalfEdge( b, face );
    var e2 = new HalfEdge( c, face );

    // join edges

    e0.next = e2.prev = e1;
    e1.next = e0.prev = e2;
    e2.next = e1.prev = e0;

    // main half edge reference

    face.edge = e0;

    return face.compute();

  }

} );

Object.assign( Face.prototype, {

  getEdge: function ( i ) {

    var edge = this.edge;

    while ( i > 0 ) {

      edge = edge.next;
      i --;

    }

    while ( i < 0 ) {

      edge = edge.prev;
      i ++;

    }

    return edge;

  },

  compute: function () {

    var triangle;

    return function compute () {

      if ( triangle === undefined ) triangle = new Triangle();

      var a = this.edge.tail();
      var b = this.edge.head();
      var c = this.edge.next.head();

      triangle.set( a.point, b.point, c.point );

      triangle.normal( this.normal );
      triangle.midpoint( this.midpoint );
      this.area = triangle.area();

      this.constant = this.normal.dot( this.midpoint );

      return this;

    };

  }(),

  distanceToPoint: function ( point ) {

    return this.normal.dot( point ) - this.constant;

  },

  // Connects two edges assuming that prev.head().point === next.tail().point

  connectHalfEdges: function ( prev, next ) {

    var discardedFace;

    if ( prev.twin.face === next.twin.face ) {

      var oppositeFace = next.twin.face;
      var twinEdge;

      if ( prev === this.edge ) {

        this.edge = next;

      }

       twinEdge = next.twin.prev.twin;
       oppositeFace.mark = Deleted;
       discardedFace = oppositeFace;

       next.prev = prev.prev;
       next.prev.next = next;

       next.setTwin( twinEdge );

       oppositeFace.compute();

    } else {

      prev.next = next;
      next.prev = prev;

    }

    return discardedFace;

  },

  mergeAdjacentFaces: function( adjacentEdge, discardedFaces ) {

    var twinEdge = adjacentEdge.twin;
    var oppositeFace = twinEdge.face;

    discardedFaces.push( oppositeFace );
    oppositeFace.mark = Deleted;

    // find the chain of edges whose opposite face is 'oppositeFace'

    var adjacentEdgePrev = adjacentEdge.prev;
    var adjacentEdgeNext = adjacentEdge.next;
    var twinEdgePrev = twinEdge.prev;
    var twinEdgeNext = twinEdge.next;

    // left edge

    while ( adjacentEdgePrev.twin.face === oppositeFace ) {

      adjacentEdgePrev = adjacentEdgePrev.prev;
      twinEdgeNext = twinEdgeNext.next;

   }

   // right edge

   while ( adjacentEdgeNext.opposite.face === oppositeFace ) {

     adjacentEdgeNext = adjacentEdgeNext.next;
     twinEdgePrev = twinEdgePrev.prev;

   }

   // fix the face reference of all the twin edges that are not part of
   // the edges whose opposite face is not 'face' i.e. all the edges that
   // 'face' and 'oppositeFace' do not have in common

   var edge = twinEdgeNext;

   do {

     edge.face = this;

     edge = edge.next;

   } while ( edge !== twinEdgePrev.next );

   // make sure that 'face.edge' is not one of the edges to be destroyed
   // Note: it's important for it to be a 'next' edge since 'prev' edges
   // might be destroyed on 'connectHalfEdges'

   this.edge = adjacentEdgeNext;

   // connect the extremes
   // Note: it might be possible that after connecting the edges a triangular face might be redundant

   var discardedFace;

   discardedFace = this.connectHalfEdges( twinEdgePrev, adjacentEdgeNext );

   if ( discardedFace !== undefined ) {

     discardedFaces.push( discardedFace );

   }

   discardedFace = this.connectHalfEdges( adjacentEdgePrev, twinEdgeNext );

   if ( discardedFace !== undefined ) {

     discardedFaces.push( discardedFace );

   }

   this.compute();

   return discardedFaces;

  },

  clone: function () {

    return new this.constructor().copy( this );

  },

	copy: function ( other ) {

		this.normal.copy( other.normal );
		this.midpoint.copy( other.midpoint );
    this.area = other.area;

    this.constant = other.constant;
    this.outside = other.outside;
    this.mark = other.mark;
    this.edge = other.edge;

		return this;

	}

} );


export { Face };
