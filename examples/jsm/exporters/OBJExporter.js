import {
	BufferGeometry,
	Color,
	Geometry,
	Line,
	Matrix3,
	Mesh,
	Points,
	Vector2,
	Vector3
} from '../../../build/three.module.js';

var OBJExporter = function () {};

OBJExporter.prototype = {

	constructor: OBJExporter,

	parse: function ( object ) {

		var output = '';

		var indexVertex = 0;
		var indexVertexUvs = 0;
		var indexNormals = 0;

		var vertex = new Vector3();
		var color = new Color();
		var normal = new Vector3();
		var uv = new Vector2();

		var i, j, k, l, m, face = [];

		var parseMesh = function ( mesh ) {

			var nbVertex = 0;
			var nbNormals = 0;
			var nbVertexUvs = 0;

			var geometry = mesh.geometry;

			var normalMatrixWorld = new Matrix3();

			if ( geometry instanceof Geometry ) {

				geometry = new BufferGeometry().setFromObject( mesh );

			}

			if ( geometry instanceof BufferGeometry ) {

				// shortcuts
				var vertices = geometry.getAttribute( 'position' );
				var normals = geometry.getAttribute( 'normal' );
				var uvs = geometry.getAttribute( 'uv' );
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

						// transform the vertex to export format
						output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					}

				}

				// uvs

				if ( uvs !== undefined ) {

					for ( i = 0, l = uvs.count; i < l; i ++, nbVertexUvs ++ ) {

						uv.x = uvs.getX( i );
						uv.y = uvs.getY( i );

						// transform the uv to export format
						output += 'vt ' + uv.x + ' ' + uv.y + '\n';

					}

				}

				// normals

				if ( normals !== undefined ) {

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					for ( i = 0, l = normals.count; i < l; i ++, nbNormals ++ ) {

						normal.x = normals.getX( i );
						normal.y = normals.getY( i );
						normal.z = normals.getZ( i );

						// transform the normal to world space
						normal.applyMatrix3( normalMatrixWorld ).normalize();

						// transform the normal to export format
						output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

					}

				}

				// faces

				if ( indices !== null ) {

					for ( i = 0, l = indices.count; i < l; i += 3 ) {

						for ( m = 0; m < 3; m ++ ) {

							j = indices.getX( i + m ) + 1;

							face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

						}

						// transform the face to export format
						output += 'f ' + face.join( ' ' ) + '\n';

					}

				} else {

					for ( i = 0, l = vertices.count; i < l; i += 3 ) {

						for ( m = 0; m < 3; m ++ ) {

							j = i + m + 1;

							face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

						}

						// transform the face to export format
						output += 'f ' + face.join( ' ' ) + '\n';

					}

				}

			} else {

				console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry );

			}

			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		};

		var parseLine = function ( line ) {

			var nbVertex = 0;

			var geometry = line.geometry;
			var type = line.type;

			if ( geometry instanceof Geometry ) {

				geometry = new BufferGeometry().setFromObject( line );

			}

			if ( geometry instanceof BufferGeometry ) {

				// shortcuts
				var vertices = geometry.getAttribute( 'position' );

				// name of the line object
				output += 'o ' + line.name + '\n';

				if ( vertices !== undefined ) {

					for ( i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						// transform the vertex to world space
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

		var parsePoints = function ( points ) {

			var nbVertex = 0;

			var geometry = points.geometry;

			if ( geometry instanceof Geometry ) {

				geometry = new BufferGeometry().setFromObject( points );

			}

			if ( geometry instanceof BufferGeometry ) {

				var vertices = geometry.getAttribute( 'position' );
				var colors = geometry.getAttribute( 'color' );

				output += 'o ' + points.name + '\n';

				if ( vertices !== undefined ) {

					for ( i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

						vertex.fromBufferAttribute( vertices, i );
						vertex.applyMatrix4( points.matrixWorld );

						output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z;

						if ( colors !== undefined ) {

							color.fromBufferAttribute( colors, i );

							output += ' ' + color.r + ' ' + color.g + ' ' + color.b;

						}

						output += '\n';

					}

				}

				output += 'p ';

				for ( j = 1, l = vertices.count; j <= l; j ++ ) {

					output += ( indexVertex + j ) + ' ';

				}

				output += '\n';

			} else {

				console.warn( 'THREE.OBJExporter.parsePoints(): geometry type unsupported', geometry );

			}

			// update index
			indexVertex += nbVertex;

		};

		object.traverse( function ( child ) {

			if ( child instanceof Mesh ) {

				parseMesh( child );

			}

			if ( child instanceof Line ) {

				parseLine( child );

			}

			if ( child instanceof Points ) {

				parsePoints( child );

			}

		} );

		return output;

	}

};

export { OBJExporter };
