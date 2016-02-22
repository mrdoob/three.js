/**
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.BoxBufferGeometry = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {

  THREE.BufferGeometry.call( this );

  this.type = 'BoxBufferGeometry';

  this.parameters = {
    width: width,
    height: height,
    depth: depth,
    widthSegments: widthSegments,
    heightSegments: heightSegments,
    depthSegments: depthSegments
  };

  // segments
  widthSegments  = Math.floor( widthSegments )  || 1;
  heightSegments = Math.floor( heightSegments ) || 1;
  depthSegments  = Math.floor( depthSegments )  || 1;

  // these are used to calculate buffer length
  var vertexCount = calculateVertexCount( widthSegments, heightSegments, depthSegments );
  var indexCount = ( vertexCount / 4 ) * 6;

  // buffers
  var indices = new ( ( vertexCount ) > 65535 ? Uint32Array : Uint16Array )( indexCount );
  var vertices = new Float32Array( vertexCount * 3 );
  var normals = new Float32Array( vertexCount * 3 );
  var uvs = new Float32Array( vertexCount * 2 );

  // offset variables
  var vertexBufferOffset = 0;
  var uvBufferOffset = 0;
  var indexBufferOffset = 0;
  var numberOfIndices = 0;

  // build each side of the box geometry
  buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height,   width,  depthSegments, heightSegments ); // px
  buildPlane( 'z', 'y', 'x',   1, - 1, depth, height, - width,  depthSegments, heightSegments ); // nx
  buildPlane( 'x', 'z', 'y',   1,   1, width, depth,    height, widthSegments, depthSegments  ); // py
  buildPlane( 'x', 'z', 'y',   1, - 1, width, depth,  - height, widthSegments, depthSegments  ); // ny
  buildPlane( 'x', 'y', 'z',   1, - 1, width, height,   depth,  widthSegments, heightSegments ); // pz
  buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth,  widthSegments, heightSegments ); // nz

  // build geometry
  this.setIndex( new THREE.BufferAttribute( indices, 1 ) );
  this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
  this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

  // helper functions

  function calculateVertexCount ( w, h, d ) {

    var segments = 0;

    // calculate the amount of segments for each side
    segments += w * h * 2; // xy
    segments += w * d * 2; // xz
    segments += d * h * 2; // zy

    return segments * 4; // four vertices per segments

  }

  function buildPlane ( u, v, w, udir, vdir, width, height, depth, gridX, gridY ) {

    var segmentWidth  = width / gridX;
    var segmentHeight = height / gridY;

    var widthHalf = width / 2;
    var heightHalf = height / 2;
    var depthHalf = depth / 2;

    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;

    var indexCounter = 0;

    var vector = new THREE.Vector3();

    // generate vertices, normals and uvs

    for ( var iy = 0; iy < gridY1; iy ++ ) {

      var y = iy * segmentHeight - heightHalf;

      for ( var ix = 0; ix < gridX1; ix ++ ) {

        var x = ix * segmentWidth - widthHalf;

        // set values to correct vector component
        vector[ u ] = x * udir;
        vector[ v ] = y * vdir;
        vector[ w ] = depthHalf;

        // now apply vector to vertex buffer
        vertices[ vertexBufferOffset ] = vector.x;
        vertices[ vertexBufferOffset + 1 ] = vector.y;
        vertices[ vertexBufferOffset + 2 ] = vector.z;

        // set values to correct vector component
        vector[ u ] = 0;
        vector[ v ] = 0;
        vector[ w ] = depth > 0 ? 1 : - 1;

        // now apply vector to normal buffer
        normals[ vertexBufferOffset ] = vector.x;
        normals[ vertexBufferOffset + 1 ] = vector.y;
        normals[ vertexBufferOffset + 2 ] = vector.z;

        // uvs
        uvs[ uvBufferOffset ] = ix / gridX;
        uvs[ uvBufferOffset + 1 ] = 1 - ( iy / gridY );

        // update offsets
        vertexBufferOffset += 3;
        uvBufferOffset += 2;
        indexCounter += 1;

      }

    }

    // 1. you need three indices to draw a single face
    // 2. a single segment consists of two faces
    // 3. so we need to generate six (2*3) indices per segment

    for ( iy = 0; iy < gridY; iy ++ ) {

      for ( ix = 0; ix < gridX; ix ++ ) {

        // indices
        var a = numberOfIndices + ix + gridX1 * iy;
        var b = numberOfIndices + ix + gridX1 * ( iy + 1 );
        var c = numberOfIndices + ( ix + 1 ) + gridX1 * ( iy + 1 );
        var d = numberOfIndices + ( ix + 1 ) + gridX1 * iy;

        // face one
        indices[ indexBufferOffset ] = a;
        indices[ indexBufferOffset + 1 ] = b;
        indices[ indexBufferOffset + 2 ] = d;

        // face two
        indices[ indexBufferOffset + 3 ] = b;
        indices[ indexBufferOffset + 4 ] = c;
        indices[ indexBufferOffset + 5 ] = d;

        // update offset
        indexBufferOffset += 6;

      }

    }

    // update total number of indices
    numberOfIndices += indexCounter;

  }

};

THREE.BoxBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.BoxBufferGeometry.prototype.constructor = THREE.BoxBufferGeometry;
