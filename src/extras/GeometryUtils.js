var GeometryUtils = {

	merge: function ( object1, object2 ) {

		var isMesh = object2 instanceof THREE.Mesh;

		var geometry1 = object1,
		vertexPosition = geometry1.vertices.length,
		facePosition = geometry1.faces.length,
		uvPosition = geometry1.uvs.length,
		geometry2 = isMesh ? object2.geometry : object2;

		if ( isMesh ) object2.updateMatrix();

		for ( var i = 0, il = geometry2.vertices.length; i < il; i ++ ) {

			var vertex = geometry2.vertices[ i ];

			var vertexCopy = new THREE.Vertex( vertex.position.clone() );

			if ( isMesh ) object2.matrix.transform( vertexCopy.position );

			geometry1.vertices.push( vertexCopy );

		}

		for ( var i = 0, il = geometry2.faces.length; i < il; i ++ ) {

			var face = geometry2.faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				var faceCopy = new THREE.Face3();
				faceCopy.a = face.a + vertexPosition;
				faceCopy.b = face.b + vertexPosition;
				faceCopy.c = face.c + vertexPosition;

			} else if ( face instanceof THREE.Face4 ) {

				var faceCopy = new THREE.Face4();
				faceCopy.a = face.a + vertexPosition;
				faceCopy.b = face.b + vertexPosition;
				faceCopy.c = face.c + vertexPosition;
				faceCopy.d = face.d + vertexPosition;

			}

			for ( var j = 0, jl = face.vertexNormals.length; j < jl; j ++ ) {

				var normal = face.vertexNormals[ j ];
				faceCopy.vertexNormals.push( normal.clone() );
			}

			geometry1.faces.push( faceCopy );

		}

		for ( var i = 0, il = geometry2.uvs.length; i < il; i ++ ) {

			var uv = geometry2.uvs[ i ];

			var uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			geometry1.uvs.push( uvCopy );

		}

	}

}
