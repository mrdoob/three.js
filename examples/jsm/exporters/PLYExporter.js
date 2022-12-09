import {
	Matrix3,
	Vector3,
	Color
} from 'three';

/**
 * https://github.com/gkjohnson/ply-exporter-js
 *
 * Usage:
 *  const exporter = new PLYExporter();
 *
 *  // second argument is a list of options
 *  exporter.parse(mesh, data => console.log(data), { binary: true, excludeAttributes: [ 'color' ], littleEndian: true });
 *
 * Format Definition:
 * http://paulbourke.net/dataformats/ply/
 */

class PLYExporter {

	parse( object, onDone, options = {} ) {

		// Iterate over the valid meshes in the object
		function traverseMeshes( cb ) {

			object.traverse( function ( child ) {

				if ( child.isMesh === true || child.isPoints ) {

					const mesh = child;
					const geometry = mesh.geometry;

					if ( geometry.hasAttribute( 'position' ) === true ) {

						cb( mesh, geometry );

					}

				}

			} );

		}

		// Default options
		const defaultOptions = {
			binary: false,
			excludeAttributes: [], // normal, uv, color, index
			littleEndian: false
		};

		options = Object.assign( defaultOptions, options );

		const excludeAttributes = options.excludeAttributes;
		let includeIndices = true;
		let includeNormals = false;
		let includeColors = false;
		let includeUVs = false;

		// count the vertices, check which properties are used,
		// and cache the BufferGeometry
		let vertexCount = 0;
		let faceCount = 0;

		object.traverse( function ( child ) {

			if ( child.isMesh === true ) {

				const mesh = child;
				const geometry = mesh.geometry;

				const vertices = geometry.getAttribute( 'position' );
				const normals = geometry.getAttribute( 'normal' );
				const uvs = geometry.getAttribute( 'uv' );
				const colors = geometry.getAttribute( 'color' );
				const indices = geometry.getIndex();

				if ( vertices === undefined ) {

					return;

				}

				vertexCount += vertices.count;
				faceCount += indices ? indices.count / 3 : vertices.count / 3;

				if ( normals !== undefined ) includeNormals = true;

				if ( uvs !== undefined ) includeUVs = true;

				if ( colors !== undefined ) includeColors = true;

			} else if ( child.isPoints ) {

				const mesh = child;
				const geometry = mesh.geometry;

				const vertices = geometry.getAttribute( 'position' );
				vertexCount += vertices.count;

				includeIndices = false;

			}

		} );

		const tempColor = new Color();
		includeIndices = includeIndices && excludeAttributes.indexOf( 'index' ) === - 1;
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

		const indexByteCount = 4;

		let header =
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
		const vertex = new Vector3();
		const normalMatrixWorld = new Matrix3();
		let result = null;

		if ( options.binary === true ) {

			// Binary File Generation
			const headerBin = new TextEncoder().encode( header );

			// 3 position values at 4 bytes
			// 3 normal values at 4 bytes
			// 3 color channels with 1 byte
			// 2 uv values at 4 bytes
			const vertexListLength = vertexCount * ( 4 * 3 + ( includeNormals ? 4 * 3 : 0 ) + ( includeColors ? 3 : 0 ) + ( includeUVs ? 4 * 2 : 0 ) );

			// 1 byte shape desciptor
			// 3 vertex indices at ${indexByteCount} bytes
			const faceListLength = includeIndices ? faceCount * ( indexByteCount * 3 + 1 ) : 0;
			const output = new DataView( new ArrayBuffer( headerBin.length + vertexListLength + faceListLength ) );
			new Uint8Array( output.buffer ).set( headerBin, 0 );


			let vOffset = headerBin.length;
			let fOffset = headerBin.length + vertexListLength;
			let writtenVertices = 0;
			traverseMeshes( function ( mesh, geometry ) {

				const vertices = geometry.getAttribute( 'position' );
				const normals = geometry.getAttribute( 'normal' );
				const uvs = geometry.getAttribute( 'uv' );
				const colors = geometry.getAttribute( 'color' );
				const indices = geometry.getIndex();

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				for ( let i = 0, l = vertices.count; i < l; i ++ ) {

					vertex.fromBufferAttribute( vertices, i );

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

							vertex.fromBufferAttribute( normals, i );

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

						} else {

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

						}

					}

					// Color information
					if ( includeColors === true ) {

						if ( colors != null ) {

							tempColor
								.fromBufferAttribute( colors, i )
								.convertLinearToSRGB();

							output.setUint8( vOffset, Math.floor( tempColor.r * 255 ) );
							vOffset += 1;

							output.setUint8( vOffset, Math.floor( tempColor.g * 255 ) );
							vOffset += 1;

							output.setUint8( vOffset, Math.floor( tempColor.b * 255 ) );
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

						for ( let i = 0, l = indices.count; i < l; i += 3 ) {

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

						for ( let i = 0, l = vertices.count; i < l; i += 3 ) {

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
			let writtenVertices = 0;
			let vertexList = '';
			let faceList = '';

			traverseMeshes( function ( mesh, geometry ) {

				const vertices = geometry.getAttribute( 'position' );
				const normals = geometry.getAttribute( 'normal' );
				const uvs = geometry.getAttribute( 'uv' );
				const colors = geometry.getAttribute( 'color' );
				const indices = geometry.getIndex();

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				// form each line
				for ( let i = 0, l = vertices.count; i < l; i ++ ) {

					vertex.fromBufferAttribute( vertices, i );

					vertex.applyMatrix4( mesh.matrixWorld );


					// Position information
					let line =
						vertex.x + ' ' +
						vertex.y + ' ' +
						vertex.z;

					// Normal information
					if ( includeNormals === true ) {

						if ( normals != null ) {

							vertex.fromBufferAttribute( normals, i );

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

						} else {

							line += ' 0 0';

						}

					}

					// Color information
					if ( includeColors === true ) {

						if ( colors != null ) {

							tempColor
								.fromBufferAttribute( colors, i )
								.convertLinearToSRGB();

							line += ' ' +
								Math.floor( tempColor.r * 255 ) + ' ' +
								Math.floor( tempColor.g * 255 ) + ' ' +
								Math.floor( tempColor.b * 255 );

						} else {

							line += ' 255 255 255';

						}

					}

					vertexList += line + '\n';

				}

				// Create the face list
				if ( includeIndices === true ) {

					if ( indices !== null ) {

						for ( let i = 0, l = indices.count; i < l; i += 3 ) {

							faceList += `3 ${ indices.getX( i + 0 ) + writtenVertices }`;
							faceList += ` ${ indices.getX( i + 1 ) + writtenVertices }`;
							faceList += ` ${ indices.getX( i + 2 ) + writtenVertices }\n`;

						}

					} else {

						for ( let i = 0, l = vertices.count; i < l; i += 3 ) {

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

}

export { PLYExporter };
