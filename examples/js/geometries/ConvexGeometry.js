/**
 * @author Mugen87 / https://github.com/Mugen87
 */

// ConvexGeometry

THREE.ConvexGeometry = function ( points ) {

	THREE.Geometry.call( this );

	this.fromBufferGeometry( new THREE.ConvexBufferGeometry( points ) );
	this.mergeVertices();

};

THREE.ConvexGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.ConvexGeometry.prototype.constructor = THREE.ConvexGeometry;

// ConvexBufferGeometry

THREE.ConvexBufferGeometry = function ( points ) {

	THREE.BufferGeometry.call( this );

	// buffers

	var vertices = [];
	var normals = [];

	if ( THREE.ConvexHull === undefined ) {

		console.error( 'THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on THREE.ConvexHull' );

	}

	var convexHull = new THREE.ConvexHull().setFromPoints( points );

	// generate vertices and normals

	var faces = convexHull.faces;

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

	this.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

};

THREE.ConvexBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.ConvexBufferGeometry.prototype.constructor = THREE.ConvexBufferGeometry;
