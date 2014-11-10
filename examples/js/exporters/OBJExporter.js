/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,

	parse: function ( object ) {

		var output = '';

		var indexVertex = 0;
		var indexVertexUvs = 0
		var indexNormals = 0;

		var parseObject = function ( child ) {

			var nbVertex = 0;
			var nbVertexUvs = 0;
			var nbNormals = 0;

			var geometry = child.geometry;

			if ( geometry instanceof THREE.Geometry ) {

				output += 'o ' + child.name + '\n';

				for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

					var vertex = geometry.vertices[ i ].clone();
					vertex.applyMatrix4( child.matrixWorld );

					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					nbVertex ++;

				}

				// uvs

				for ( var i = 0, l = geometry.faceVertexUvs[ 0 ].length; i < l; i ++ ) {

					var vertexUvs = geometry.faceVertexUvs[ 0 ][ i ];

					for ( var j = 0; j < vertexUvs.length; j ++ ) {

						var uv = vertexUvs[ j ];
						vertex.applyMatrix4( child.matrixWorld );

						output += 'vt ' + uv.x + ' ' + uv.y + '\n';

						nbVertexUvs ++;

					}

				}

				// normals

				for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

					var normals = geometry.faces[ i ].vertexNormals;

					for ( var j = 0; j < normals.length; j ++ ) {

						var normal = normals[ j ];
						output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

						nbNormals ++;

					}

				}

				// faces

				for ( var i = 0, j = 1, l = geometry.faces.length; i < l; i ++, j += 3 ) {

					var face = geometry.faces[ i ];

					output += 'f ';
					output += ( indexVertex + face.a + 1 ) + '/' + ( indexVertexUvs + j ) + '/' + ( indexNormals + j ) + ' ';
					output += ( indexVertex + face.b + 1 ) + '/' + ( indexVertexUvs + j + 1 ) + '/' + ( indexNormals + j + 1 ) + ' ';
					output += ( indexVertex + face.c + 1 ) + '/' + ( indexVertexUvs + j + 2 ) + '/' + ( indexNormals + j + 2 ) + '\n';

				}

			}

			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		};

		object.traverse( parseObject );

		return output;

	}

};
