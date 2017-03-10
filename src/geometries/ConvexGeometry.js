/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Geometry } from '../core/Geometry';
import { BufferGeometry } from '../core/BufferGeometry';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { QuickHull3 } from '../math/convexhull/QuickHull3';

function ConvexGeometry( points ) {

	Geometry.call( this );

	this.type = 'ConvexGeometry';

	this.fromBufferGeometry( new ConvexBufferGeometry( points ) );
	this.mergeVertices();

}

ConvexGeometry.prototype = Object.create( Geometry.prototype );
ConvexGeometry.prototype.constructor = ConvexGeometry;


function ConvexBufferGeometry( points ) {

  BufferGeometry.call( this );

	this.type = 'ConvexBufferGeometry';

  // buffers

  var vertices = [];
  var normals = [];

  // execute QuickHull

  var quickHull = new THREE.QuickHull3().setFromPoints( points );

  // generate vertices and normals

  var faces = quickHull.faces;

  for ( var i = 0; i < faces.length; i ++ ) {

    var face = faces[ i ];
    var edge = face.edge;

    // we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

    do {

      var point = edge.head().point;

      vertices.push( point.x, point.y, point.z );
      normals.push( face.normal.x, face.normal.y, face.normal.z );

      edge = edge.next;

    } while ( edge !== face.edge );

  }

  // build geometry

  this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  this.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

}

ConvexBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
ConvexBufferGeometry.prototype.constructor = ConvexBufferGeometry;


export { ConvexGeometry, ConvexBufferGeometry };
