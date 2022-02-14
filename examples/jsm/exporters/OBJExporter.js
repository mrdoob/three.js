import {
	Color,
	Matrix3,
	Vector2,
	Vector3
} from 'three';

class OBJExporter {

	parse( object ) {

		let output = '';

		let indexVertex = 0;
		let indexVertexUvs = 0;
		let indexNormals = 0;

		const vertex = new Vector3();
		const color = new Color();
		const normal = new Vector3();
		const uv = new Vector2();

		const face = [];

		function parseMesh( mesh ) {

			let nbVertex = 0;
			let nbNormals = 0;
			let nbVertexUvs = 0;

			const geometry = mesh.geometry;

			const normalMatrixWorld = new Matrix3();

			if ( geometry.isBufferGeometry !== true ) {

				throw new Error( 'THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.' );

			}

			// shortcuts
			const vertices = geometry.getAttribute( 'position' );
			const normals = geometry.getAttribute( 'normal' );
			const uvs = geometry.getAttribute( 'uv' );
			const indices = geometry.getIndex();

			// name of the mesh object
			output += 'o ' + mesh.name + '\n';

			// name of the mesh material
			if ( mesh.material && mesh.material.name ) {

				output += 'usemtl ' + mesh.material.name + '\n';

			}

			// vertices

			if ( vertices !== undefined ) {

				for ( let i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

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

				for ( let i = 0, l = uvs.count; i < l; i ++, nbVertexUvs ++ ) {

					uv.x = uvs.getX( i );
					uv.y = uvs.getY( i );

					// transform the uv to export format
					output += 'vt ' + uv.x + ' ' + uv.y + '\n';

				}

			}

			// normals

			if ( normals !== undefined ) {

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				for ( let i = 0, l = normals.count; i < l; i ++, nbNormals ++ ) {

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

				for ( let i = 0, l = indices.count; i < l; i += 3 ) {

					for ( let m = 0; m < 3; m ++ ) {

						const j = indices.getX( i + m ) + 1;

						face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

					}

					// transform the face to export format
					output += 'f ' + face.join( ' ' ) + '\n';

				}

			} else {

				for ( let i = 0, l = vertices.count; i < l; i += 3 ) {

					for ( let m = 0; m < 3; m ++ ) {

						const j = i + m + 1;

						face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

					}

					// transform the face to export format
					output += 'f ' + face.join( ' ' ) + '\n';

				}

			}

			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		}

		function parseLine( line ) {

			let nbVertex = 0;

			const geometry = line.geometry;
			const type = line.type;

			if ( geometry.isBufferGeometry !== true ) {

				throw new Error( 'THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.' );

			}

			// shortcuts
			const vertices = geometry.getAttribute( 'position' );

			// name of the line object
			output += 'o ' + line.name + '\n';

			if ( vertices !== undefined ) {

				for ( let i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

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

				for ( let j = 1, l = vertices.count; j <= l; j ++ ) {

					output += ( indexVertex + j ) + ' ';

				}

				output += '\n';

			}

			if ( type === 'LineSegments' ) {

				for ( let j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1 ) {

					output += 'l ' + ( indexVertex + j ) + ' ' + ( indexVertex + k ) + '\n';

				}

			}

			// update index
			indexVertex += nbVertex;

		}

		function parsePoints( points ) {

			let nbVertex = 0;

			const geometry = points.geometry;

			if ( geometry.isBufferGeometry !== true ) {

				throw new Error( 'THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.' );

			}

			const vertices = geometry.getAttribute( 'position' );
			const colors = geometry.getAttribute( 'color' );

			output += 'o ' + points.name + '\n';

			if ( vertices !== undefined ) {

				for ( let i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

					vertex.fromBufferAttribute( vertices, i );
					vertex.applyMatrix4( points.matrixWorld );

					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z;

					if ( colors !== undefined ) {

						color.fromBufferAttribute( colors, i ).convertLinearToSRGB();

						output += ' ' + color.r + ' ' + color.g + ' ' + color.b;

					}

					output += '\n';

				}

				output += 'p ';

				for ( let j = 1, l = vertices.count; j <= l; j ++ ) {

					output += ( indexVertex + j ) + ' ';

				}

				output += '\n';

			}

			// update index
			indexVertex += nbVertex;

		}

		object.traverse( function ( child ) {

			if ( child.isMesh === true ) {

				parseMesh( child );

			}

			if ( child.isLine === true ) {

				parseLine( child );

			}

			if ( child.isPoints === true ) {

				parsePoints( child );

			}

		} );

		return output;

	}

}

export { OBJExporter };
