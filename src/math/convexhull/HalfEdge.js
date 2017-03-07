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

	start: function () {

		return this.vertex;

	},

  end: function () {

    return this.next ? this.next.vertex : null;

  },

  length: function () {

    var start = this.end();
    var end = this.end();

    if ( end !== null ) {

      return start.point.distanceTo( end.point );

    }

    return - 1;

  },

  lengthSquared: function () {

    var start = this.end();
    var end = this.end();

    if ( end !== null ) {

      return start.point.distanceToSquared( end.point );

    }

    return - 1;

  },

  setTwin: function ( edge ) {

    this.twin = edge;
    edge.twin = this;

    return this;

  },

  clone: function () {

    return new this.constructor().copy( this );

  },

	copy: function ( other ) {

		this.vertex.copy( other.vertex );
		this.face.copy( other.face );
		this.next.copy( other.next );
		this.prev.copy( other.prev );
		this.twin.copy( other.twin );

		return this;

	}

} );


export { HalfEdge };
