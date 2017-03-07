/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

function VertexList() {

  this.head = null;
  this.tail = null;

}

Object.assign( VertexList.prototype, {

	clear: function () {

		this.head = this.tail = null;

    return this;

	},

  // Inserts a vertex before a 'target' vertex

	insertBefore: function ( target, vertex ) {

		vertex.prev = target.prev;
    vertex.next = target;

    if ( vertex.prev === null ) {

      this.head = vertex;

    } else {

      vertex.prev.next = vertex;

    }

    target.prev = vertex;

    return this;

	},

  // Inserts a vertex after a 'target' vertex

  insertAfter: function ( target, vertex ) {

    vertex.prev = target;
    vertex.next = target.next;

    if ( vertex.next === null ) {

      this.tail = vertex;

    } else {

      vertex.next.prev = vertex;

    }

    target.next = vertex;

    return this;

  },

  // Appends a 'node' to the end of this doubly linked list

  append: function ( vertex ) {

    if ( this.head === null ) {

      this.head = vertex;

    } else {

      this.tail.next = vertex;

    }

    vertex.prev = this.tail;
    vertex.next = null; // the tail has no subsequent vertex

    this.tail = vertex;

    return this;

  },

  // Appends a chain of vertices where 'vertex' is the head.

  appendChain: function ( vertex ) {

    if ( this.head === null ) {

      this.head = vertex;

    } else {

      this.tail.next = vertex;

    }

    vertex.prev = this.tail;

    // ensure that the 'tail' reference points to the last vertex of the chain

    while ( vertex.next !== null ) {

      vertex = vertex.next;

    }

    this.tail = vertex;

    return this;

  },

  // Deletes a vertex from this linked list

  remove: function ( vertex ) {

    if ( vertex.prev === null ) {

      this.head = vertex.next;

    } else {

      vertex.prev.next = vertex.next;

    }

    if ( vertex.next === null ) {

      this.tail = vertex.prev;

    } else {

      vertex.next.prev = vertex.prev;

    }

    return this;

  },

  // Removes a list of vertices whose 'head' is 'a' and whose 'tail' is b

  removeSubList: function ( a, b ) {

    if ( a.prev === null ) {

      this.head = b.next;

    } else {

      a.prev.next = b.next;

    }

    if ( b.next === null ) {

      this.tail = a.prev;

    } else {

      b.next.prev = a.prev;

    }

    return this;

  },

  isEmpty: function() {

    return this.head === null;

  },

  clone: function () {

    return new this.constructor().copy( this );

  },

	copy: function ( other ) {

    this.head.copy( other.head );
    this.tail.copy( other.tail );

		return this;

	}

} );


export { VertexList };
