( function () {

	class ConvexGeometry extends THREE.BufferGeometry {

		constructor( points = [] ) {

			super(); // buffers

			const vertices = [];
			const normals = [];

			if ( THREE.ConvexHull === undefined ) {

				console.error( 'THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on THREE.ConvexHull' );

			}

			const convexHull = new THREE.ConvexHull().setFromPoints( points ); // generate vertices and normals

			const faces = convexHull.faces;

			for ( let i = 0; i < faces.length; i ++ ) {

				const face = faces[ i ];
				let edge = face.edge; // we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

				do {

					const point = edge.head().point;
					vertices.push( point.x, point.y, point.z );
					normals.push( face.normal.x, face.normal.y, face.normal.z );
					edge = edge.next;

				} while ( edge !== face.edge );

			} // build geometry


			this.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
			this.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

		}

	}

	THREE.ConvexGeometry = ConvexGeometry;

} )();
