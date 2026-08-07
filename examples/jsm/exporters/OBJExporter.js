import {
	ColorManagement,
	SRGBColorSpace,
	colorCreate,
	colorFromBufferAttribute,
	mat3Create,
	mat3GetNormalMatrix,
	vec2Create,
	vec2FromBufferAttribute,
	vec3ApplyMatrix3,
	vec3ApplyMatrix4,
	vec3Create,
	vec3FromBufferAttribute,
	vec3Normalize
} from 'three';

/**
 * An exporter for OBJ.
 *
 * `OBJExporter` is not able to export material data into MTL files so only geometry data are supported.
 *
 * ```js
 * const exporter = new OBJExporter();
 * const data = exporter.parse( scene );
 * ```
 *
 * @three_import import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
 */
class OBJExporter {

	/**
	 * Parses the given 3D object and generates the OBJ output.
	 *
	 * If the 3D object is composed of multiple children and geometry, they are merged into a single mesh in the file.
	 *
	 * @param {Object3D} object - The 3D object to export.
	 * @return {string} The exported OBJ.
	 */
	parse( object ) {

		let output = '';

		let indexVertex = 0;
		let indexVertexUvs = 0;
		let indexNormals = 0;

		const vertex = vec3Create();
		const color = colorCreate();
		const normal = vec3Create();
		const uv = vec2Create();

		const face = [];

		function parseMesh( mesh ) {

			let nbVertex = 0;
			let nbNormals = 0;
			let nbVertexUvs = 0;

			const geometry = mesh.geometry;

			const normalMatrixWorld = mat3Create();

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

					vec3FromBufferAttribute( vertices, i, vertex );

					// transform the vertex to world space
					vec3ApplyMatrix4( vertex, mesh.matrixWorld, vertex );

					// transform the vertex to export format
					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

				}

			}

			// uvs

			if ( uvs !== undefined ) {

				for ( let i = 0, l = uvs.count; i < l; i ++, nbVertexUvs ++ ) {

					vec2FromBufferAttribute( uvs, i, uv );

					// transform the uv to export format
					output += 'vt ' + uv.x + ' ' + uv.y + '\n';

				}

			}

			// normals

			if ( normals !== undefined ) {

				mat3GetNormalMatrix( mesh.matrixWorld, normalMatrixWorld );

				for ( let i = 0, l = normals.count; i < l; i ++, nbNormals ++ ) {

					vec3FromBufferAttribute( normals, i, normal );

					// transform the normal to world space
					vec3ApplyMatrix3( normal, normalMatrixWorld, normal );
					vec3Normalize( normal, normal );

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

			// shortcuts
			const vertices = geometry.getAttribute( 'position' );

			// name of the line object
			output += 'o ' + line.name + '\n';

			if ( vertices !== undefined ) {

				for ( let i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

					vec3FromBufferAttribute( vertices, i, vertex );

					// transform the vertex to world space
					vec3ApplyMatrix4( vertex, line.matrixWorld, vertex );

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

			const vertices = geometry.getAttribute( 'position' );
			const colors = geometry.getAttribute( 'color' );

			output += 'o ' + points.name + '\n';

			if ( vertices !== undefined ) {

				for ( let i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

					vec3FromBufferAttribute( vertices, i, vertex );
					vec3ApplyMatrix4( vertex, points.matrixWorld, vertex );

					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z;

					if ( colors !== undefined ) {

						colorFromBufferAttribute( colors, i, color );

						ColorManagement.workingToColorSpace( color, SRGBColorSpace );

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
