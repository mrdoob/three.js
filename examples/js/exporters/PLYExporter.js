/**
 * @author Garrett Johnson / http://gkjohnson.github.io/
 * https://github.com/gkjohnson/ply-exporter-js
 *
 * Usage:
 *  var exporter = new THREE.PLYExporter();
 *
 *  // second argument is an array of attributes to
 *  // explicitly exclude from the file:
 *  // 'color', 'uv', 'normal', 'index'
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

		var geomToBufferGeom = new WeakMap();
		var includeNormals = false;
		var includeColors = false;
		var includeUVs = false;
		var includeIndices = true;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				var mesh = child;
				var geometry = mesh.geometry;

				if ( geometry instanceof THREE.Geometry ) {

					var bufferGeometry = geomToBufferGeom.get( geometry ) || new THREE.BufferGeometry().setFromObject( mesh );
					geomToBufferGeom.set( geometry, bufferGeometry );
					geometry = bufferGeometry;

				}

				if ( geometry instanceof THREE.BufferGeometry ) {

					var vertices = geometry.getAttribute( 'position' );
					var normals = geometry.getAttribute( 'normal' );
					var uvs = geometry.getAttribute( 'uv' );
					var colors = geometry.getAttribute( 'color' );
					var indices = geometry.getIndex();

					if ( vertices == null ) {

						return;

					}


					if ( normals != null ) includeNormals = true;

					if ( uvs != null ) includeUVs = true;

					if ( colors != null ) includeColors = true;

				}

			}

		} );

		includeNormals = includeNormals && excludeProperties.indexOf( 'normal' ) === - 1;
		includeColors = includeColors && excludeProperties.indexOf( 'color' ) === - 1;
		includeUVs = includeUVs && excludeProperties.indexOf( 'uv' ) === - 1;
		includeIndices = includeIndices && excludeProperties.indexOf( 'index' ) === - 1;


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

					geometry = geomToBufferGeom.get( geometry );

				}

				if ( geometry instanceof THREE.BufferGeometry ) {

					var vertices = geometry.getAttribute( 'position' );
					var normals = geometry.getAttribute( 'normal' );
					var uvs = geometry.getAttribute( 'uv' );
					var colors = geometry.getAttribute( 'color' );
					var indices = geometry.getIndex();

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					if ( vertices == null ) {

						return;

					}

					// form each line
					for ( var i = 0, l = vertices.count; i < l; i ++ ) {

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

							if ( normals != null ) {

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

							if ( uvs != null ) {

								line += ' ' +
									uvs.getX( i ) + ' ' +
									uvs.getY( i );

							} else if ( includeUVs !== false ) {

								line += ' 0 0';

							}

						}

						// Color information
						if ( includeColors === true ) {

							if ( colors != null ) {

								line += ' ' +
									Math.floor( colors.getX( i ) * 255 ) + ' ' +
									Math.floor( colors.getY( i ) * 255 ) + ' ' +
									Math.floor( colors.getZ( i ) * 255 );

							} else {

								line += ' 255 255 255';

							}

						}

						vertexList += line + '\n';

					}

					// Create the face list
					if ( includeIndices === true ) {

						if ( indices !== null ) {

							for ( var i = 0, l = indices.count; i < l; i += 3 ) {

								faceList += `3 ${ indices.getX( i + 0 ) + vertexCount }`;
								faceList += ` ${ indices.getX( i + 1 ) + vertexCount }`;
								faceList += ` ${ indices.getX( i + 2 ) + vertexCount }\n`;

							}

						} else {

							for ( var i = 0, l = vertices.count; i < l; i += 3 ) {

								faceList += `3 ${ vertexCount + i } ${ vertexCount + i + 1 } ${ vertexCount + i + 2 }\n`;

							}

						}

						faceCount += indices ? indices.count / 3 : vertices.count / 3;

					}

					vertexCount += vertices.count;

				}

			}

		} );

		if ( includeIndices && faceCount !== Math.floor( faceCount ) ) {

			// point cloud meshes will not have an index array and may not have a
			// number of vertices that is divisble by 3 (and therefore representable
			// as triangles)
			console.error(

				'PLYExporter: Failed to generate a valid PLY file because the ' +
				'number of faces is not divisible by 3. This can be caused by ' +
				'exporting a mix of triangle and non-triangle mesh types.'

			);

			return null;

		}

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

		if ( includeIndices === true ) {

			// faces
			output +=
				`element face ${faceCount}\n` +
				'property list uchar int vertex_index\n';

		}

		output +=
			'end_header\n' +
			`${vertexList}\n` +
			( includeIndices ? `${faceList}\n` : '' );

		return output;

	}

};
