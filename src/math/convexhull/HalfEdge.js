/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Entity for a Doubly-Connected Edge List (DCEL).
 *
 */

function HalfEdge( vertex, face ) {

  this.vertex = vertex;
  this.face = face;
  this.next = null;
  this.prev = null;
  this.twin = null;

}

Object.assign( HalfEdge.prototype, {

  head: function () {

    return this.vertex;

  },

  tail: function () {

    return this.prev ? this.prev.vertex : null;

  },

  length: function () {

    var head = this.head();
    var tail = this.tail();

    if ( tail !== null ) {

      return tail.point.distanceTo( head.point );

    }

    return - 1;

  },

  lengthSquared: function () {

    var head = this.head();
    var tail = this.tail();

    if ( tail !== null ) {

      return tail.point.distanceToSquared( head.point );

    }

    return - 1;

  },

  setTwin: function ( edge ) {

    this.twin = edge;
    edge.twin = this;

    return this;

  }

} );


export { HalfEdge };
