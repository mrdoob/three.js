/**
 * @author Mugen87 / https://github.com/Mugen87
 */

( function () {

	// ConvexGeometry

	function ConvexGeometry( points ) {

		THREE.Geometry.call( this );

		this.fromBufferGeometry( new ConvexBufferGeometry( points ) );
		this.mergeVertices();

	}

	ConvexGeometry.prototype = Object.create( THREE.Geometry.prototype );
	ConvexGeometry.prototype.constructor = ConvexGeometry;

	// ConvexBufferGeometry

	function ConvexBufferGeometry( points ) {

		THREE.BufferGeometry.call( this );

		// buffers

		var vertices = [];
		var normals = [];

		// execute QuickHull

		if ( THREE.QuickHull === undefined ) {

			console.error( 'THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on THREE.QuickHull' );

		}

		var quickHull = new THREE.QuickHull().setFromPoints( points );

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

	ConvexBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
	ConvexBufferGeometry.prototype.constructor = ConvexBufferGeometry;

	// export

	THREE.ConvexGeometry = ConvexGeometry;
	THREE.ConvexBufferGeometry = ConvexBufferGeometry;

} )();
