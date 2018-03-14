/**
 * @author Garrett Johnson / http://gkjohnson.github.io/
 * https://github.com/gkjohnson/ply-exporter-js
 *
 * Usage:
 *  var exporter = new THREE.PLYExporter();
 *
 *  // second argument is an array of attributes to
 *  // exclude from the format ('color', 'uv', 'normal')
 *  var data = exporter.parse(mesh, [ 'color' ]);
 *
 * Format Definition:
 *  http://paulbourke.net/dataformats/ply/
 */

THREE.PLYExporter = function () {};

THREE.PLYExporter.prototype = {

	constructor: THREE.PLYExporter,

	parse: function ( object, excludeProperties ) {

		if ( Array.isArray( excludeProperties ) !== true ) {

			excludeProperties = [];

		}

		var includeNormals = excludeProperties.indexOf( 'normal' ) === - 1;
		var includeColors = excludeProperties.indexOf( 'color' ) === - 1;
		var includeUVs = excludeProperties.indexOf( 'uv' ) === - 1;

		// count the number of vertices
		var vertexCount = 0;
		var faceCount = 0;
		var vertexList = '';
		var faceList = '';

		var vertex = new THREE.Vector3();
		var normalMatrixWorld = new THREE.Matrix3();
		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				var mesh = child;
				var geometry = mesh.geometry;

				if ( geometry instanceof THREE.Geometry ) {

					geometry = new THREE.BufferGeometry().setFromObject( mesh );

				}

				if ( geometry instanceof THREE.BufferGeometry ) {

					var vertices = geometry.getAttribute( 'position' );
					var normals = geometry.getAttribute( 'normal' );
					var uvs = geometry.getAttribute( 'uv' );
					var colors = geometry.getAttribute( 'color' );
					var indices = geometry.getIndex();

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					if ( vertices === undefined ) {

						return;

					}

					// form each line
					for ( i = 0, l = vertices.count; i < l; i ++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						vertex.applyMatrix4( mesh.matrixWorld );


						// Position information
						var line =
							vertex.x + ' ' +
							vertex.y + ' ' +
							vertex.z;

						// Normal information
						if ( includeNormals === true ) {

							if ( normals !== undefined ) {

								vertex.x = normals.getX( i );
								vertex.y = normals.getY( i );
								vertex.z = normals.getZ( i );

								vertex.applyMatrix3( normalMatrixWorld );

								line += ' ' +
									vertex.x + ' ' +
									vertex.y + ' ' +
									vertex.z;

							} else {

								line += ' 0 0 0';

							}

						}

						// UV information
						if ( includeUVs === true ) {

							if ( uvs !== undefined ) {

								line += ' ' +
									uvs.getX( i ) + ' ' +
									uvs.getY( i );

							} else if ( includeUVs !== false ) {

								line += ' 0 0';

							}

						}

						// Color information
						if ( includeColors === true ) {

							if ( colors !== undefined ) {

								line += ' ' +
									Math.floor( colors.getX( i ) ) + ' ' +
									Math.floor( colors.getY( i ) ) + ' ' +
									Math.floor( colors.getZ( i ) );

							} else {

								line += ' 255 255 255';

							}

						}

						vertexList += line + '\n';

					}


					// Create the face list
					if ( indices !== null ) {

						for ( i = 0, l = indices.count; i < l; i += 3 ) {

							faceList += `3 ${ indices.getX( i + 0 ) + vertexCount }`;
							faceList += ` ${ indices.getX( i + 1 ) + vertexCount }`;
							faceList += ` ${ indices.getX( i + 2 ) + vertexCount }\n`;

						}

					} else {

						for ( var i = 0, l = vertices.count; i < l; i += 3 ) {

							faceList += `3 ${ vertexCount + i } ${ vertexCount + i + 1 } ${ vertexCount + i + 2 }\n`;

						}

					}

					vertexCount += vertices.count;
					faceCount += indices ? indices.count / 3 : vertices.count / 3;

				}

			}

		} );

		var output =
			'ply\n' +
			'format ascii 1.0\n' +
			`element vertex ${vertexCount}\n` +

			// position
			'property float x\n' +
			'property float y\n' +
			'property float z\n';

		if ( includeNormals === true ) {

			// normal
			output +=
				'property float nx\n' +
				'property float ny\n' +
				'property float nz\n';

		}

		if ( includeUVs === true ) {

			// uvs
			output +=
				'property float s\n' +
				'property float t\n';

		}

		if ( includeColors === true ) {

			// colors
			output +=
				'property uchar red\n' +
				'property uchar green\n' +
				'property uchar blue\n';

		}

		// faces
		output +=
			`element face ${faceCount}\n` +
			'property list uchar int vertex_index\n' +
			'end_header\n' +

			`${vertexList}\n` +
			`${faceList}\n`;

		return output;

	}

};
