/**
 * @author spite / http://www.clicktorelease.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryUtils = {

	fromGeometry: function geometryToBufferGeometry( geometry ) {

		var vertices = geometry.vertices;
		var faces = geometry.faces;
		var faceVertexUvs = geometry.faceVertexUvs;
		var hasFaceVertexUv = faceVertexUvs[ 0 ].length > 0;

		var triangles = 0;

		for ( var i = 0; i < faces.length; i ++ ) {

			triangles += faces[ i ] instanceof THREE.Face3 ? 1 : 2;

		}

		console.log( faces.length, triangles );

		var bufferGeometry = new THREE.BufferGeometry();

		bufferGeometry.attributes = {

			position: {
				itemSize: 3,
				array: new Float32Array( triangles * 3 * 3 )
			},
			normal: {
				itemSize: 3,
				array: new Float32Array( triangles * 3 * 3 )
			}
			/*
			color: {
				itemSize: 3,
				array: new Float32Array( triangles * 3 * 3 )
			}*/

		}

		if ( hasFaceVertexUv === true ) {

			bufferGeometry.attributes.uv = {
				itemSize: 2,
				array: new Float32Array( triangles * 3 * 2 )
			};

			var uvs = bufferGeometry.attributes.uv.array;

		}

		var positions = bufferGeometry.attributes.position.array;
		var normals = bufferGeometry.attributes.normal.array;
		// var colors = bufferGeometry.attributes.color.array;

		var i2 = 0, i3 = 0;

		for ( var i = 0; i < faces.length; i ++ ) {

			var face = faces[ i ];

			var a = vertices[ face.a ];
			var b = vertices[ face.b ];
			var c = vertices[ face.c ];

			positions[ i3     ] = a.x;
			positions[ i3 + 1 ] = a.y;
			positions[ i3 + 2 ] = a.z;
			
			positions[ i3 + 3 ] = b.x;
			positions[ i3 + 4 ] = b.y;
			positions[ i3 + 5 ] = b.z;
			
			positions[ i3 + 6 ] = c.x;
			positions[ i3 + 7 ] = c.y;
			positions[ i3 + 8 ] = c.z;

			var na = face.vertexNormals[ 0 ];
			var nb = face.vertexNormals[ 1 ];
			var nc = face.vertexNormals[ 2 ];

			normals[ i3     ] = na.x;
			normals[ i3 + 1 ] = na.y;
			normals[ i3 + 2 ] = na.z;

			normals[ i3 + 3 ] = nb.x;
			normals[ i3 + 4 ] = nb.y;
			normals[ i3 + 5 ] = nb.z;

			normals[ i3 + 6 ] = nc.x;
			normals[ i3 + 7 ] = nc.y;
			normals[ i3 + 8 ] = nc.z;

			if ( hasFaceVertexUv === true ) {

				var uva = faceVertexUvs[ 0 ][ i ][ 0 ];
				var uvb = faceVertexUvs[ 0 ][ i ][ 1 ];
				var uvc = faceVertexUvs[ 0 ][ i ][ 2 ];

				uvs[ i2     ] = uva.x;
				uvs[ i2 + 1 ] = uva.y;
			
				uvs[ i2 + 2 ] = uvb.x;
				uvs[ i2 + 3 ] = uvb.y;
			
				uvs[ i2 + 4 ] = uvc.x;
				uvs[ i2 + 5 ] = uvc.y;

			}

			i3 += 9;
			i2 += 6;

			if ( face instanceof THREE.Face4 ) {

				var d = vertices[ face.d ];
				var nd = face.vertexNormals[ 3 ];

				positions[ i3     ] = a.x;
				positions[ i3 + 1 ] = a.y;
				positions[ i3 + 2 ] = a.z;
				
				positions[ i3 + 3 ] = c.x;
				positions[ i3 + 4 ] = c.y;
				positions[ i3 + 5 ] = c.z;
				
				positions[ i3 + 6 ] = d.x;
				positions[ i3 + 7 ] = d.y;
				positions[ i3 + 8 ] = d.z;

				normals[ i3     ] = na.x;
				normals[ i3 + 1 ] = na.y;
				normals[ i3 + 2 ] = na.z;

				normals[ i3 + 3 ] = nc.x;
				normals[ i3 + 4 ] = nc.y;
				normals[ i3 + 5 ] = nc.z;

				normals[ i3 + 6 ] = nd.x;
				normals[ i3 + 7 ] = nd.y;
				normals[ i3 + 8 ] = nd.z;

				if ( hasFaceVertexUv === true ) {

					var uvd = faceVertexUvs[ 0 ][ i ][ 3 ];

					uvs[ i2     ] = uva.x;
					uvs[ i2 + 1 ] = uva.y;
				
					uvs[ i2 + 2 ] = uvc.x;
					uvs[ i2 + 3 ] = uvc.y;
				
					uvs[ i2 + 4 ] = uvd.x;
					uvs[ i2 + 5 ] = uvd.y;
								
				}

				i3 += 9;
				i2 += 6;
			
			}

		}

		bufferGeometry.computeBoundingSphere();

		return bufferGeometry;

	}

}
