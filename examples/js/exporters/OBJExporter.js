/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,

	parse: function ( geometry ) {

		var output = '';

		for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

			var vertex = geometry.vertices[ i ];
			output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

		}

		// uvs

		for ( var i = 0, l = geometry.faceVertexUvs[ 0 ].length; i < l; i ++ ) {

			var vertexUvs = geometry.faceVertexUvs[ 0 ][ i ];

			for ( var j = 0; j < vertexUvs.length; j ++ ) {

				var uv = vertexUvs[ j ];
				output += 'vt ' + uv.x + ' ' + uv.y + '\n';

			}

		}

		// normals

		for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

			var normals = geometry.faces[ i ].vertexNormals;

			for ( var j = 0; j < normals.length; j ++ ) {

				var normal = normals[ j ];
				output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

			}

		}

		// faces

		for ( var i = 0, j = 1, l = geometry.faces.length; i < l; i ++, j += 3 ) {

			var face = geometry.faces[ i ];

			output += 'f ';
			output += ( face.a + 1 ) + '/' + ( j ) + '/' + ( j ) + ' ';
			output += ( face.b + 1 ) + '/' + ( j + 1 ) + '/' + ( j + 1 ) + ' ';
			output += ( face.c + 1 ) + '/' + ( j + 2 ) + '/' + ( j + 2 ) + '\n';

		}

		return output;

	}

}
