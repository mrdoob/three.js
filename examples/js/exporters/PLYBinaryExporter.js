/**
 * @author Garrett Johnson / http://gkjohnson.github.io/
 * https://github.com/gkjohnson/ply-exporter-js
 *
 * Usage:
 *  var exporter = new THREE.PLYBinaryExporter();
 *
 *  // second argument is an array of attributes to
 *  // explicitly exclude from the file:
 *  // 'color', 'uv', 'normal', 'index'
 *  var data = exporter.parse(mesh, [ 'color' ]);
 *
 * Format Definition:
 *  http://paulbourke.net/dataformats/ply/
 */

THREE.PLYBinaryExporter = function () {};

THREE.PLYBinaryExporter.prototype = {

	constructor: THREE.PLYBinaryExporter,

	parse: function ( object, excludeProperties ) {

		if ( Array.isArray( excludeProperties ) !== true ) {

			excludeProperties = [];

		}

		var geomToBufferGeom = new WeakMap();
		var includeNormals = false;
		var includeColors = false;
		var includeUVs = false;
		var includeIndices = true;

		// count the number of vertices
		var vertexCount = 0;
		var faceCount = 0;

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

					vertexCount += vertices.count;
					faceCount += indices ? indices.count / 3 : vertices.count / 3;

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

		if ( includeIndices && faceCount !== Math.floor( faceCount ) ) {

			// point cloud meshes will not have an index array and may not have a
			// number of vertices that is divisble by 3 (and therefore representable
			// as triangles)
			console.error(

				'PLYBinaryExporter: Failed to generate a valid PLY file with triangle indices because the ' +
				'number of faces is not divisible by 3.'

			);

			return null;

		}


		// get how many bytes will be needed to save out the faces
		// so we can use a minimal amount of memory / data
		var indexByteCount = 1;

		if ( vertexCount > 256 ) { // 2^8 bits

			indexByteCount = 2;

		}

		if ( vertexCount > 65536 ) { // 2^16 bits

			indexByteCount = 4;

		}


		// Form the header
		var header =
			'ply\n' +
			'format binary_big_endian 1.0\n' +
			`element vertex ${vertexCount}\n` +

			// position
			'property float x\n' +
			'property float y\n' +
			'property float z\n';

		if ( includeNormals === true ) {

			// normal
			header +=
				'property float nx\n' +
				'property float ny\n' +
				'property float nz\n';

		}

		if ( includeUVs === true ) {

			// uvs
			header +=
				'property float s\n' +
				'property float t\n';

		}

		if ( includeColors === true ) {

			// colors
			header +=
				'property uchar red\n' +
				'property uchar green\n' +
				'property uchar blue\n';

		}

		if ( includeIndices === true ) {

			// faces
			header +=
				`element face ${faceCount}\n` +
				`property list uchar uint${ indexByteCount * 8 } vertex_index\n`;

		}

		header += 'end_header\n';


		var headerBin = new TextEncoder().encode( header );

		// 3 position values at 4 bytes
		// 3 normal values at 4 bytes
		// 3 color channels with 1 byte
		// 2 uv values at 4 bytes
		var vertexListLength = vertexCount * ( 4 * 3 + ( includeNormals ? 4 * 3 : 0 ) + ( includeColors ? 3 : 0 ) + ( includeUVs ? 4 * 2 : 0 ) );

		// 1 byte shape desciptor
		// 3 vertex indices at ${indexByteCount} bytes
		var faceListLength = includeIndices ? faceCount * ( indexByteCount * 3 + 1 ) : 0;
		var output = new DataView( new ArrayBuffer( headerBin.length + vertexListLength + faceListLength ) );
		new Uint8Array( output.buffer ).set( headerBin, 0 );


		var vOffset = headerBin.length;
		var fOffset = headerBin.length + vertexListLength;
		var writtenVertices = 0;

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
						output.setFloat32( vOffset, vertex.x );
						vOffset += 4;

						output.setFloat32( vOffset, vertex.y );
						vOffset += 4;

						output.setFloat32( vOffset, vertex.z );
						vOffset += 4;

						// Normal information
						if ( includeNormals === true ) {

							if ( normals != null ) {

								vertex.x = normals.getX( i );
								vertex.y = normals.getY( i );
								vertex.z = normals.getZ( i );

								vertex.applyMatrix3( normalMatrixWorld );

								output.setFloat32( vOffset, vertex.x );
								vOffset += 4;

								output.setFloat32( vOffset, vertex.y );
								vOffset += 4;

								output.setFloat32( vOffset, vertex.z );
								vOffset += 4;

							} else {

								output.setFloat32( vOffset, 0 );
								vOffset += 4;

								output.setFloat32( vOffset, 0 );
								vOffset += 4;

								output.setFloat32( vOffset, 0 );
								vOffset += 4;

							}

						}

						// UV information
						if ( includeUVs === true ) {

							if ( uvs != null ) {

								output.setFloat32( vOffset, uvs.getX( i ) );
								vOffset += 4;

								output.setFloat32( vOffset, uvs.getY( i ) );
								vOffset += 4;

							} else if ( includeUVs !== false ) {

								output.setFloat32( vOffset, 0 );
								vOffset += 4;

								output.setFloat32( vOffset, 0 );
								vOffset += 4;

							}

						}

						// Color information
						if ( includeColors === true ) {

							if ( colors != null ) {

								output.setUint8( vOffset, Math.floor( colors.getX( i ) * 255 ) );
								vOffset += 1;

								output.setUint8( vOffset, Math.floor( colors.getY( i ) * 255 ) );
								vOffset += 1;

								output.setUint8( vOffset, Math.floor( colors.getZ( i ) * 255 ) );
								vOffset += 1;

							} else {

								output.setUint8( vOffset, 255 );
								vOffset += 1;

								output.setUint8( vOffset, 255 );
								vOffset += 1;

								output.setUint8( vOffset, 255 );
								vOffset += 1;

							}

						}

					}

					if ( includeIndices === true ) {

						// Create the face list
						var faceIndexFunc = `setUint${indexByteCount * 8}`;
						if ( indices !== null ) {

							for ( var i = 0, l = indices.count; i < l; i += 3 ) {

								output.setUint8( fOffset, 3 );
								fOffset += 1;

								output[ faceIndexFunc ]( fOffset, indices.getX( i + 0 ) + writtenVertices );
								fOffset += indexByteCount;

								output[ faceIndexFunc ]( fOffset, indices.getX( i + 1 ) + writtenVertices );
								fOffset += indexByteCount;

								output[ faceIndexFunc ]( fOffset, indices.getX( i + 2 ) + writtenVertices );
								fOffset += indexByteCount;

							}

						} else {

							for ( var i = 0, l = vertices.count; i < l; i += 3 ) {

								output.setUint8( fOffset, 3 );
								fOffset += 1;

								output[ faceIndexFunc ]( fOffset, writtenVertices + i );
								fOffset += indexByteCount;

								output[ faceIndexFunc ]( fOffset, writtenVertices + i + 1 );
								fOffset += indexByteCount;

								output[ faceIndexFunc ]( fOffset, writtenVertices + i + 2 );
								fOffset += indexByteCount;

							}

						}

					}


					// Save the amount of verts we've already written so we can offset
					// the face index on the next mesh
					writtenVertices += vertices.count;

				}

			}

		} );

		return output;

	}

};
