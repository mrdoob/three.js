var GeometryUtils = {

	merge: function ( geometry1, object2 /* mesh | geometry */ ) {

		var isMesh = object2 instanceof THREE.Mesh,
		vertexPosition = geometry1.vertices.length,
		facePosition = geometry1.faces.length,
		uvPosition = geometry1.uvs.length,
		geometry2 = isMesh ? object2.geometry : object2,
		vertices1 = geometry1.vertices,
		vertices2 = geometry2.vertices,
		faces1 = geometry1.faces,
		faces2 = geometry2.faces,
		uvs1 = geometry1.uvs,
		uvs2 = geometry2.uvs;

		isMesh && object2.matrixAutoUpdate && object2.updateMatrix();

		for ( var i = 0, il = vertices2.length; i < il; i ++ ) {

			var vertex = vertices2[ i ];

			var vertexCopy = new THREE.Vertex( vertex.position.clone() );

			isMesh && object2.localMatrix.multiplyVector3( vertexCopy.position );

			vertices1.push( vertexCopy );

		}

		for ( i = 0, il = faces2.length; i < il; i ++ ) {

			var face = faces2[ i ], faceCopy, normal,
			faceVertexNormals = face.vertexNormals;

			if ( face instanceof THREE.Face3 ) {

				faceCopy = new THREE.Face3( face.a + vertexPosition, face.b + vertexPosition, face.c + vertexPosition );

			} else if ( face instanceof THREE.Face4 ) {

				faceCopy = new THREE.Face4( face.a + vertexPosition, face.b + vertexPosition, face.c + vertexPosition, face.d + vertexPosition );

			}

			faceCopy.centroid.copy( face.centroid );
			faceCopy.normal.copy( face.normal );

			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {

				normal = faceVertexNormals[ j ];
				faceCopy.vertexNormals.push( normal.clone() );

			}

			faceCopy.materials = face.materials.slice();

			faces1.push( faceCopy );

		}

		for ( i = 0, il = uvs2.length; i < il; i ++ ) {

			var uv = uvs2[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			uvs1.push( uvCopy );

		}

	}

};
