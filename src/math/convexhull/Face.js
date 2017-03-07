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
      i -= 1;

    }

    while ( i < 0 ) {

      edge = edge.prev;
      i += 1;

    }

    return edge;

  },

  compute: function () {

    var triangle;

    return function compute () {

      if ( triangle === undefined ) triangle = new Triangle();

      var a = this.edge.start();
      var b = this.edge.end();
      var c = this.edge.next.end();

      triangle.set( a, b, c );

      triangle.normal( this.normal );
      triangle.midpoint( this.midpoint );
      triangle.area( this.area );

      this.constant = this.normal.dot( this.midpoint );

      return this;

    };

  },

  distanceToPlane: function ( point ) {

    return this.normal.dot( point ) - this.constant;

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
