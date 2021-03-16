/**
 * https://github.com/gkjohnson/ply-exporter-js
 *
 * Usage:
 *  var exporter = new THREE.PLYExporter();
 *
 *  // second argument is a list of options
 *  exporter.parse(mesh, data => console.log(data), { binary: true, excludeAttributes: [ 'color' ], littleEndian: true });
 *
 * Format Definition:
 * http://paulbourke.net/dataformats/ply/
 */

THREE.PLYExporter = function () {};

THREE.PLYExporter.prototype = {

	constructor: THREE.PLYExporter,

	parse: function ( object, onDone, options ) {

		if ( onDone && typeof onDone === 'object' ) {

			console.warn( 'THREE.PLYExporter: The options parameter is now the third argument to the "parse" function. See the documentation for the new API.' );
			options = onDone;
			onDone = undefined;

		}

		// Iterate over the valid meshes in the object
		function traverseMeshes( cb ) {

			object.traverse( function ( child ) {

				if ( child.isMesh === true ) {

					var mesh = child;
					var geometry = mesh.geometry;

					if ( geometry.isBufferGeometry !== true ) {

						throw new Error( 'THREE.PLYExporter: Geometry is not of type THREE.BufferGeometry.' );

					}

					if ( geometry.hasAttribute( 'position' ) === true ) {

						cb( mesh, geometry );

					}

				}

			} );

		}

		// Default options
		var defaultOptions = {
			binary: false,
			excludeAttributes: [], // normal, uv, color, index
			littleEndian: false
		};

		options = Object.assign( defaultOptions, options );

		var excludeAttributes = options.excludeAttributes;
		var includeNormals = false;
		var includeColors = false;
		var includeUVs = false;

		// count the vertices, check which properties are used,
		// and cache the BufferGeometry
		var vertexCount = 0;
		var faceCount = 0;
		object.traverse( function ( child ) {

			if ( child.isMesh === true ) {

				var mesh = child;
				var geometry = mesh.geometry;

				if ( geometry.isBufferGeometry !== true ) {

					throw new Error( 'THREE.PLYExporter: Geometry is not of type THREE.BufferGeometry.' );

				}

				var vertices = geometry.getAttribute( 'position' );
				var normals = geometry.getAttribute( 'normal' );
				var uvs = geometry.getAttribute( 'uv' );
				var colors = geometry.getAttribute( 'color' );
				var indices = geometry.getIndex();

				if ( vertices === undefined ) {

					return;

				}

				vertexCount += vertices.count;
				faceCount += indices ? indices.count / 3 : vertices.count / 3;

				if ( normals !== undefined ) includeNormals = true;

				if ( uvs !== undefined ) includeUVs = true;

				if ( colors !== undefined ) includeColors = true;

			}

		} );

		var includeIndices = excludeAttributes.indexOf( 'index' ) === - 1;
		includeNormals = includeNormals && excludeAttributes.indexOf( 'normal' ) === - 1;
		includeColors = includeColors && excludeAttributes.indexOf( 'color' ) === - 1;
		includeUVs = includeUVs && excludeAttributes.indexOf( 'uv' ) === - 1;


		if ( includeIndices && faceCount !== Math.floor( faceCount ) ) {

			// point cloud meshes will not have an index array and may not have a
			// number of vertices that is divisble by 3 (and therefore representable
			// as triangles)
			console.error(

				'PLYExporter: Failed to generate a valid PLY file with triangle indices because the ' +
				'number of indices is not divisible by 3.'

			);

			return null;

		}

		var indexByteCount = 4;

		var header =
			'ply\n' +
			`format ${ options.binary ? ( options.littleEndian ? 'binary_little_endian' : 'binary_big_endian' ) : 'ascii' } 1.0\n` +
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
				'property list uchar int vertex_index\n';

		}

		header += 'end_header\n';


		// Generate attribute data
		var vertex = new THREE.Vector3();
		var normalMatrixWorld = new THREE.Matrix3();
		var result = null;

		if ( options.binary === true ) {

			// Binary File Generation
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
			traverseMeshes( function ( mesh, geometry ) {

				var vertices = geometry.getAttribute( 'position' );
				var normals = geometry.getAttribute( 'normal' );
				var uvs = geometry.getAttribute( 'uv' );
				var colors = geometry.getAttribute( 'color' );
				var indices = geometry.getIndex();

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				for ( var i = 0, l = vertices.count; i < l; i ++ ) {

					vertex.x = vertices.getX( i );
					vertex.y = vertices.getY( i );
					vertex.z = vertices.getZ( i );

					vertex.applyMatrix4( mesh.matrixWorld );


					// Position information
					output.setFloat32( vOffset, vertex.x, options.littleEndian );
					vOffset += 4;

					output.setFloat32( vOffset, vertex.y, options.littleEndian );
					vOffset += 4;

					output.setFloat32( vOffset, vertex.z, options.littleEndian );
					vOffset += 4;

					// Normal information
					if ( includeNormals === true ) {

						if ( normals != null ) {

							vertex.x = normals.getX( i );
							vertex.y = normals.getY( i );
							vertex.z = normals.getZ( i );

							vertex.applyMatrix3( normalMatrixWorld ).normalize();

							output.setFloat32( vOffset, vertex.x, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, vertex.y, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, vertex.z, options.littleEndian );
							vOffset += 4;

						} else {

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

						}

					}

					// UV information
					if ( includeUVs === true ) {

						if ( uvs != null ) {

							output.setFloat32( vOffset, uvs.getX( i ), options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, uvs.getY( i ), options.littleEndian );
							vOffset += 4;

						} else if ( includeUVs !== false ) {

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, 0, options.littleEndian );
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

					if ( indices !== null ) {

						for ( var i = 0, l = indices.count; i < l; i += 3 ) {

							output.setUint8( fOffset, 3 );
							fOffset += 1;

							output.setUint32( fOffset, indices.getX( i + 0 ) + writtenVertices, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, indices.getX( i + 1 ) + writtenVertices, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, indices.getX( i + 2 ) + writtenVertices, options.littleEndian );
							fOffset += indexByteCount;

						}

					} else {

						for ( var i = 0, l = vertices.count; i < l; i += 3 ) {

							output.setUint8( fOffset, 3 );
							fOffset += 1;

							output.setUint32( fOffset, writtenVertices + i, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, writtenVertices + i + 1, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, writtenVertices + i + 2, options.littleEndian );
							fOffset += indexByteCount;

						}

					}

				}


				// Save the amount of verts we've already written so we can offset
				// the face index on the next mesh
				writtenVertices += vertices.count;

			} );

			result = output.buffer;

		} else {

			// Ascii File Generation
			// count the number of vertices
			var writtenVertices = 0;
			var vertexList = '';
			var faceList = '';

			traverseMeshes( function ( mesh, geometry ) {

				var vertices = geometry.getAttribute( 'position' );
				var normals = geometry.getAttribute( 'normal' );
				var uvs = geometry.getAttribute( 'uv' );
				var colors = geometry.getAttribute( 'color' );
				var indices = geometry.getIndex();

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

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

							vertex.applyMatrix3( normalMatrixWorld ).normalize();

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

							faceList += `3 ${ indices.getX( i + 0 ) + writtenVertices }`;
							faceList += ` ${ indices.getX( i + 1 ) + writtenVertices }`;
							faceList += ` ${ indices.getX( i + 2 ) + writtenVertices }\n`;

						}

					} else {

						for ( var i = 0, l = vertices.count; i < l; i += 3 ) {

							faceList += `3 ${ writtenVertices + i } ${ writtenVertices + i + 1 } ${ writtenVertices + i + 2 }\n`;

						}

					}

					faceCount += indices ? indices.count / 3 : vertices.count / 3;

				}

				writtenVertices += vertices.count;

			} );

			result = `${ header }${vertexList}${ includeIndices ? `${faceList}\n` : '\n' }`;

		}

		if ( typeof onDone === 'function' ) requestAnimationFrame( () => onDone( result ) );
		return result;

	}

};
