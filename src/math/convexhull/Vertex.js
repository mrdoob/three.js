/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * A vertex as a double linked list node.
 *
 */

function Vertex( point ) {

  this.point = point;
  this.prev = null;
  this.next = null;
  this.face = null; // the face that is able to see this vertex

}

export { Vertex };
