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

		var vertex = new THREE.Vector3();
		var normal = new THREE.Vector3();
		var uv = new THREE.Vector2();

		var i, j, k, l, m, face = [];

		var precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
		var precision = Math.pow( 10, precisionPoints );

		var parseMesh = function ( mesh ) {

			var nbVertex = 0;
			var nbNormals = 0;
			var nbVertexUvs = 0;

			var geometry = mesh.geometry;

			var normalMatrixWorld = new THREE.Matrix3();

			if ( geometry instanceof THREE.Geometry ) {

				geometry = new THREE.BufferGeometry().setFromObject( mesh );

			}

			if ( geometry instanceof THREE.BufferGeometry ) {

				// shortcuts
				var vertices = geometry.getAttribute( 'position' );
				var verticesUnique = {}; // "v XXX YYY ZZZ" : [vertex index]
				var verticesMapping = {}; // [original index]: [first equal index]
				var verticesDuplicateCount = 0;
				var normals = geometry.getAttribute( 'normal' );
				var normalsUnique = {};
				var normalsMapping = {};
				var normalsDuplicateCount = 0;
				var uvs = geometry.getAttribute( 'uv' );
				var uvsUnique = {};
				var uvsMapping = {};
				var uvsDuplicateCount = 0;
				var indices = geometry.getIndex();

				// name of the mesh object
				output += 'o ' + mesh.name + '\n';

				// name of the mesh material
				if ( mesh.material && mesh.material.name ) {

					output += 'usemtl ' + mesh.material.name + '\n';

				}

				// vertices

				if ( vertices !== undefined ) {

					for ( i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						// transform the vertex to world space
						vertex.applyMatrix4( mesh.matrixWorld );

						var key = Math.round( vertex.x * precision ) + '_' + Math.round( vertex.y * precision ) + '_' + Math.round( vertex.z * precision );
						if ( verticesUnique[key] === undefined ) {
							// transform the vertex to export format
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
							// adds the line number to unique vertices, taking into account all the lines that were not written since they were duplicates
							verticesUnique[key] = i - verticesDuplicateCount + 1;
							verticesMapping[i + 1] = i - verticesDuplicateCount + 1;
						} else { // vertex already exist
							// adds the matching for the current vertex line to the existing vertex line
							verticesMapping[i + 1] = verticesUnique[key];
							verticesDuplicateCount++
						}
						

					}

				}

				// uvs

				if ( uvs !== undefined ) {

					for ( i = 0, l = uvs.count; i < l; i ++, nbVertexUvs ++ ) {

						uv.x = uvs.getX( i );
						uv.y = uvs.getY( i );

						

						var key = Math.round( uv.x * precision ) + '_' + Math.round( uv.y * precision );
						if ( uvsUnique[key] === undefined ) {
							// transform the uv to export format
							output += 'vt ' + uv.x + ' ' + uv.y + '\n';
							// adds the line number to unique uvs, taking into account all the lines that were not written since they were duplicates
							uvsUnique[key] = i - uvsDuplicateCount + 1;
							uvsMapping[i + 1] = i - uvsDuplicateCount + 1;
						} else { // uvs already exist
							// adds the matching for the current uvs line to the existing uvs line
							uvsMapping[i + 1] = uvsUnique[key];
							uvsDuplicateCount++
						}
						

					}

				}

				// normals

				if ( normals !== undefined ) {

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					for ( i = 0, l = normals.count; i < l; i ++, nbNormals ++ ) {

						normal.x = normals.getX( i );
						normal.y = normals.getY( i );
						normal.z = normals.getZ( i );

						// transfrom the normal to world space
						normal.applyMatrix3( normalMatrixWorld );

						
						var key = Math.round( normal.x * precision ) + '_' + Math.round( normal.y * precision ) + '_' + Math.round( normal.z * precision );
						if ( normalsUnique[key] === undefined ) {
							// transform the normal to export format
							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
							// adds the line number to unique normals, taking into account all the lines that were not written since they were duplicates
							normalsUnique[key] = i - normalsDuplicateCount + 1;
							normalsMapping[i + 1] = i - normalsDuplicateCount + 1;
						} else { // normals already exist
							// adds the matching for the current normals line to the existing normals line
							normalsMapping[i + 1] = normalsUnique[key];
							normalsDuplicateCount++
						}

						

					}

				}

				// faces

				if ( indices !== null ) {

					for ( i = 0, l = indices.count; i < l; i += 3 ) {

						for ( m = 0; m < 3; m ++ ) {

							j = indices.getX( i + m ) + 1;

							face[ m ] = ( indexVertex + verticesMapping[j] ) + '/' + ( uvs ? ( indexVertexUvs + uvsMapping[j] ) : '' ) + '/' + ( indexNormals + normalsMapping[j] );

						}

						// transform the face to export format
						output += 'f ' + face.join( ' ' ) + "\n";

					}

				} else {

					for ( i = 0, l = vertices.count; i < l; i += 3 ) {

						for ( m = 0; m < 3; m ++ ) {

							j = i + m + 1;

							face[ m ] = ( indexVertex + verticesMapping[j] ) + '/' + ( uvs ? ( indexVertexUvs + uvsMapping[j] ) : '' ) + '/' + ( indexNormals + normalsMapping[j] );

						}

						// transform the face to export format
						output += 'f ' + face.join( ' ' ) + "\n";

					}

				}

			} else {

				console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry );

			}

			// update index
			indexVertex += nbVertex - verticesDuplicateCount;
			indexVertexUvs += nbVertexUvs - uvsDuplicateCount;
			indexNormals += nbNormals - normalsDuplicateCount;

		};

		var parseLine = function ( line ) {

			var nbVertex = 0;

			var geometry = line.geometry;
			var type = line.type;

			if ( geometry instanceof THREE.Geometry ) {

				geometry = new THREE.BufferGeometry().setFromObject( line );

			}

			if ( geometry instanceof THREE.BufferGeometry ) {

				// shortcuts
				var vertices = geometry.getAttribute( 'position' );

				// name of the line object
				output += 'o ' + line.name + '\n';

				if ( vertices !== undefined ) {

					for ( i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						// transfrom the vertex to world space
						vertex.applyMatrix4( line.matrixWorld );

						// transform the vertex to export format
						output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					}

				}

				if ( type === 'Line' ) {

					output += 'l ';

					for ( j = 1, l = vertices.count; j <= l; j ++ ) {

						output += ( indexVertex + j ) + ' ';

					}

					output += '\n';

				}

				if ( type === 'LineSegments' ) {

					for ( j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1 ) {

						output += 'l ' + ( indexVertex + j ) + ' ' + ( indexVertex + k ) + '\n';

					}

				}

			} else {

				console.warn( 'THREE.OBJExporter.parseLine(): geometry type unsupported', geometry );

			}

			// update index
			indexVertex += nbVertex;

		};

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				parseMesh( child );

			}

			if ( child instanceof THREE.Line ) {

				parseLine( child );

			}

		} );

		return output;

	}

};
