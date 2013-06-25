/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,

	parse: function ( geometry ) {

		console.log( geometry );

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

		// map

		var count = 1; // OBJ values start by 1
		var map = [ count ];

		for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

			var face = geometry.faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				count += 3;

			} else if ( face instanceof THREE.Face4 ) {

				count += 4;

			}

			map.push( count );

		}

		// faces

		for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

			var face = geometry.faces[ i ];

			output += 'f ';

			if ( face instanceof THREE.Face3 ) {

				output += ( face.a + 1 ) + '/' + ( map[ i ] ) + '/' + ( map[ i ] ) + ' ';
				output += ( face.b + 1 ) + '/' + ( map[ i ] + 1 ) + '/' + ( map[ i ] + 1 ) + ' ';
				output += ( face.c + 1 ) + '/' + ( map[ i ] + 2 ) + '/' + ( map[ i ] + 2 ) + '\n';

			} else if ( face instanceof THREE.Face4 ) {

				output += ( face.a + 1 ) + '/' + ( map[ i ] ) + '/' + ( map[ i ] ) + ' ';
				output += ( face.b + 1 ) + '/' + ( map[ i ] + 1 ) + '/' + ( map[ i ] + 1 ) + ' ';
				output += ( face.c + 1 ) + '/' + ( map[ i ] + 2 ) + '/' + ( map[ i ] + 2 ) + ' ';
				output += ( face.d + 1 ) + '/' + ( map[ i ] + 3 ) + '/' + ( map[ i ] + 3 ) + '\n';

			}

		}

		return output;

	}

}
