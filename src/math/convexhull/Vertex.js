/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * A vertex is a double linked list node.
 *
 */

function Vertex( point ) {

  this.point = point;
  this.next = null;
  this.prev = null;
  this.face = null; // the face that is able to see this point

}

export { Vertex };
