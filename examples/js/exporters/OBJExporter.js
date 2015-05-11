/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,

	parse: function ( object ) {

		var output = '';

		var indexVertex = 0;
		var indexVertexUvs = 0;
		var indexNormals = 0;

		var parseMesh = function ( mesh ) {

			var nbVertex = 0;
			var nbVertexUvs = 0;
			var nbNormals = 0;

			var geometry = mesh.geometry;

			if ( geometry instanceof THREE.Geometry ) {

				output += 'o ' + mesh.name + '\n';

				var vertices = geometry.vertices;

				for ( var i = 0, l = vertices.length; i < l; i ++ ) {

					var vertex = vertices[ i ].clone();
					vertex.applyMatrix4( mesh.matrixWorld );

					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					nbVertex ++;

				}

				// uvs

				var faces = geometry.faces;
				var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

				if ( faces.length === faceVertexUvs.length ) {

					for ( var i = 0, l = faceVertexUvs.length; i < l; i ++ ) {

						var vertexUvs = faceVertexUvs[ i ];

						for ( var j = 0; j < vertexUvs.length; j ++ ) {

							var uv = vertexUvs[ j ];
							vertex.applyMatrix4( mesh.matrixWorld );

							output += 'vt ' + uv.x + ' ' + uv.y + '\n';

							nbVertexUvs ++;

						}

					}

				} else {

					for ( var i = 0, l = faces.length * 3; i < l; i ++ ) {

						output += 'vt 0 0\n';
						nbVertexUvs ++;

					}

				}

				// normals

				for ( var i = 0, l = faces.length; i < l; i ++ ) {

					var face = faces[ i ];
					var vertexNormals = face.vertexNormals;

					if ( vertexNormals.length === 3 ) {

						for ( var j = 0; j < vertexNormals.length; j ++ ) {

							var normal = vertexNormals[ j ];
							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

							nbNormals ++;

						}

					} else {

						var normal = face.normal;

						for ( var j = 0; j < 3; j ++ ) {

							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

							nbNormals ++;

						}

					}

				}

				// faces

				for ( var i = 0, j = 1, l = faces.length; i < l; i ++, j += 3 ) {

					var face = faces[ i ];

					output += 'f ';
					output += ( indexVertex + face.a + 1 ) + '/' + ( indexVertexUvs + j ) + '/' + ( indexNormals + j ) + ' ';
					output += ( indexVertex + face.b + 1 ) + '/' + ( indexVertexUvs + j + 1 ) + '/' + ( indexNormals + j + 1 ) + ' ';
					output += ( indexVertex + face.c + 1 ) + '/' + ( indexVertexUvs + j + 2 ) + '/' + ( indexNormals + j + 2 ) + '\n';

				}

			} else {

				console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', mesh );
				// TODO: Support only BufferGeometry and use use setFromObject()

			}

			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		};

		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) parseMesh( child );
		} );

		return output;

	}

};
