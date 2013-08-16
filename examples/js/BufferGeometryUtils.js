/**
 * @author spite / http://www.clicktorelease.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryUtils = {

	fromGeometry: function geometryToBufferGeometry( geometry, settings ) {

		if ( geometry instanceof THREE.BufferGeometry ) {

			return geometry;

		}

		settings = settings || { 'vertexColors': THREE.NoColors };

		var vertices = geometry.vertices;
		var faces = geometry.faces;
		var faceVertexUvs = geometry.faceVertexUvs;
		var vertexColors = settings.vertexColors;
		var hasFaceVertexUv = faceVertexUvs[ 0 ].length > 0;

		var bufferGeometry = new THREE.BufferGeometry();

		bufferGeometry.attributes = {

			position: {
				itemSize: 3,
				array: new Float32Array( faces.length * 3 * 3 )
			},
			normal: {
				itemSize: 3,
				array: new Float32Array( faces.length * 3 * 3 )
			}

		}

		var positions = bufferGeometry.attributes.position.array;
		var normals = bufferGeometry.attributes.normal.array;

		if ( vertexColors !== THREE.NoColors ) {

			bufferGeometry.attributes.color = {
				itemSize: 3,
				array: new Float32Array( faces.length * 3 * 3 )
			};

			var colors = bufferGeometry.attributes.color.array;

		}

		if ( hasFaceVertexUv === true ) {

			bufferGeometry.attributes.uv = {
				itemSize: 2,
				array: new Float32Array( faces.length * 3 * 2 )
			};

			var uvs = bufferGeometry.attributes.uv.array;

		}

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

			if ( vertexColors === THREE.FaceColors ) {

				var fc = face.color;

				colors[ i3     ] = fc.r;
				colors[ i3 + 1 ] = fc.g;
				colors[ i3 + 2 ] = fc.b;

				colors[ i3 + 3 ] = fc.r;
				colors[ i3 + 4 ] = fc.g;
				colors[ i3 + 5 ] = fc.b;

				colors[ i3 + 6 ] = fc.r;
				colors[ i3 + 7 ] = fc.g;
				colors[ i3 + 8 ] = fc.b;

			} else if ( vertexColors === THREE.VertexColors ) {

				var vca = face.vertexColors[ 0 ];
				var vcb = face.vertexColors[ 1 ];
				var vcc = face.vertexColors[ 2 ];

				colors[ i3     ] = vca.r;
				colors[ i3 + 1 ] = vca.g;
				colors[ i3 + 2 ] = vca.b;

				colors[ i3 + 3 ] = vcb.r;
				colors[ i3 + 4 ] = vcb.g;
				colors[ i3 + 5 ] = vcb.b;

				colors[ i3 + 6 ] = vcc.r;
				colors[ i3 + 7 ] = vcc.g;
				colors[ i3 + 8 ] = vcc.b;

			}

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

		}

		bufferGeometry.computeBoundingSphere();

		return bufferGeometry;

	}

}
