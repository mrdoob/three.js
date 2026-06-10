import {
	Matrix3,
	Vector3,
	Color,
	ColorManagement,
	SRGBColorSpace
} from 'three';

/**
 * An exporter for PLY.
 *
 * PLY (Polygon or Stanford Triangle Format) is a file format for efficient delivery and
 * loading of simple, static 3D content in a dense format. Both binary and ascii formats are
 * supported. PLY can store vertex positions, colors, normals and uv coordinates. No textures
 * or texture references are saved.
 *
 * ```js
 * const exporter = new PLYExporter();
 * const data = exporter.parse( scene, options );
 * ```
 *
 * @three_import import { PLYExporter } from 'three/addons/exporters/PLYExporter.js';
 */
class PLYExporter {

	/**
	 * Parses the given 3D object and generates the PLY output.
	 *
	 * If the 3D object is composed of multiple children and geometry, they are merged into a single mesh in the file.
	 *
	 * @param {Object3D} object - The 3D object to export.
	 * @param {PLYExporter~OnDone} onDone - A callback function that is executed when the export has finished.
	 * @param {PLYExporter~Options} options - The export options.
	 * @return {?(string|ArrayBuffer)} The exported PLY.
	 */
	parse( object, onDone, options = {} ) {

		// reference https://github.com/gkjohnson/ply-exporter-js

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
			littleEndian: false,
			customPropertyMapping: {}
		};

		options = Object.assign( defaultOptions, options );

		const excludeAttributes = options.excludeAttributes;
		const customPropertyMapping = options.customPropertyMapping;
		const customAttributeNames = Object.keys( customPropertyMapping );
		let includeIndices = true;
		let includeNormals = false;
		let includeColors = false;
		let includeUVs = false;

		// derive types from the attribtue's typed array (the exporter assumes
		// all attributes of the same group e.g. "position" share the same data type)
		let positionType = 'float';
		let normalType = 'float';
		let uvType = 'float';
		let colorType = 'uchar';

		const customTypes = {};
		for ( const name of customAttributeNames ) customTypes[ name ] = 'float';

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

				positionType = getPlyType( vertices.array );

				if ( normals !== undefined ) {

					includeNormals = true;
					normalType = getPlyType( normals.array );

				}

				if ( uvs !== undefined ) {

					includeUVs = true;
					uvType = getPlyType( uvs.array );

				}

				if ( colors !== undefined ) {

					includeColors = true;
					colorType = getPlyType( colors.array );

				}

				for ( const name of customAttributeNames ) {

					const attr = geometry.getAttribute( name );
					if ( attr !== undefined ) customTypes[ name ] = getPlyType( attr.array );

				}

			} else if ( child.isPoints ) {

				const mesh = child;
				const geometry = mesh.geometry;

				const vertices = geometry.getAttribute( 'position' );
				const normals = geometry.getAttribute( 'normal' );
				const colors = geometry.getAttribute( 'color' );

				vertexCount += vertices.count;

				positionType = getPlyType( vertices.array );

				if ( normals !== undefined ) {

					includeNormals = true;
					normalType = getPlyType( normals.array );

				}

				if ( colors !== undefined ) {

					includeColors = true;
					colorType = getPlyType( colors.array );

				}

				for ( const name of customAttributeNames ) {

					const attr = geometry.getAttribute( name );
					if ( attr !== undefined ) customTypes[ name ] = getPlyType( attr.array );

				}

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
			// number of vertices that is divisible by 3 (and therefore representable
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
			`property ${positionType} x\n` +
			`property ${positionType} y\n` +
			`property ${positionType} z\n`;

		if ( includeNormals === true ) {

			// normal
			header +=
				`property ${normalType} nx\n` +
				`property ${normalType} ny\n` +
				`property ${normalType} nz\n`;

		}

		if ( includeUVs === true ) {

			// uvs
			header +=
				`property ${uvType} s\n` +
				`property ${uvType} t\n`;

		}

		if ( includeColors === true ) {

			// colors
			header +=
				`property ${colorType} red\n` +
				`property ${colorType} green\n` +
				`property ${colorType} blue\n`;

		}

		// custom attributes

		for ( const name of customAttributeNames ) {

			const type = customTypes[ name ];
			for ( const propName of customPropertyMapping[ name ] ) {

				header += `property ${type} ${propName}\n`;

			}

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

			const posWriter = getBinaryWriter( positionType );
			const normalWriter = includeNormals ? getBinaryWriter( normalType ) : null;
			const uvWriter = includeUVs ? getBinaryWriter( uvType ) : null;
			const colorWriter = includeColors ? getBinaryWriter( colorType ) : null;
			const colorIsFloat = isFloatType( colorType );
			const colorScale = getColorScale( colorType );

			const customWriters = {};
			const customIsFloat = {};
			let customStride = 0;

			for ( const name of customAttributeNames ) {

				const type = customTypes[ name ];
				const writer = getBinaryWriter( type );
				customWriters[ name ] = writer;
				customIsFloat[ name ] = isFloatType( type );
				customStride += customPropertyMapping[ name ].length * writer.size;

			}

			const vertexListLength = vertexCount * (
				3 * posWriter.size +
				( includeNormals ? 3 * normalWriter.size : 0 ) +
				( includeUVs ? 2 * uvWriter.size : 0 ) +
				( includeColors ? 3 * colorWriter.size : 0 ) +
				customStride
			);

			// 1 byte shape descriptor
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
					posWriter.write( output, vOffset, vertex.x, options.littleEndian );
					vOffset += posWriter.size;

					posWriter.write( output, vOffset, vertex.y, options.littleEndian );
					vOffset += posWriter.size;

					posWriter.write( output, vOffset, vertex.z, options.littleEndian );
					vOffset += posWriter.size;

					// Normal information
					if ( includeNormals === true ) {

						if ( normals != null ) {

							vertex.fromBufferAttribute( normals, i );

							vertex.applyMatrix3( normalMatrixWorld ).normalize();

							normalWriter.write( output, vOffset, vertex.x, options.littleEndian );
							vOffset += normalWriter.size;

							normalWriter.write( output, vOffset, vertex.y, options.littleEndian );
							vOffset += normalWriter.size;

							normalWriter.write( output, vOffset, vertex.z, options.littleEndian );
							vOffset += normalWriter.size;

						} else {

							normalWriter.write( output, vOffset, 0, options.littleEndian );
							vOffset += normalWriter.size;

							normalWriter.write( output, vOffset, 0, options.littleEndian );
							vOffset += normalWriter.size;

							normalWriter.write( output, vOffset, 0, options.littleEndian );
							vOffset += normalWriter.size;

						}

					}

					// UV information
					if ( includeUVs === true ) {

						if ( uvs != null ) {

							uvWriter.write( output, vOffset, uvs.getX( i ), options.littleEndian );
							vOffset += uvWriter.size;

							uvWriter.write( output, vOffset, uvs.getY( i ), options.littleEndian );
							vOffset += uvWriter.size;

						} else {

							uvWriter.write( output, vOffset, 0, options.littleEndian );
							vOffset += uvWriter.size;

							uvWriter.write( output, vOffset, 0, options.littleEndian );
							vOffset += uvWriter.size;

						}

					}

					// Color information
					if ( includeColors === true ) {

						if ( colors != null ) {

							tempColor.fromBufferAttribute( colors, i );

							ColorManagement.workingToColorSpace( tempColor, SRGBColorSpace );

							const r = colorIsFloat ? tempColor.r : Math.round( tempColor.r * colorScale );
							const g = colorIsFloat ? tempColor.g : Math.round( tempColor.g * colorScale );
							const b = colorIsFloat ? tempColor.b : Math.round( tempColor.b * colorScale );

							colorWriter.write( output, vOffset, r, options.littleEndian );
							vOffset += colorWriter.size;

							colorWriter.write( output, vOffset, g, options.littleEndian );
							vOffset += colorWriter.size;

							colorWriter.write( output, vOffset, b, options.littleEndian );
							vOffset += colorWriter.size;

						} else {

							const white = colorIsFloat ? 1 : colorScale;

							colorWriter.write( output, vOffset, white, options.littleEndian );
							vOffset += colorWriter.size;

							colorWriter.write( output, vOffset, white, options.littleEndian );
							vOffset += colorWriter.size;

							colorWriter.write( output, vOffset, white, options.littleEndian );
							vOffset += colorWriter.size;

						}

					}

					// Custom attributes

					for ( const name of customAttributeNames ) {

						const writer = customWriters[ name ];
						const propCount = customPropertyMapping[ name ].length;
						const attr = geometry.getAttribute( name );
						const isFloat = customIsFloat[ name ];

						for ( let c = 0; c < propCount; c ++ ) {

							const raw = attr != null ? getAttributeComponent( attr, i, c ) : 0;
							writer.write( output, vOffset, isFloat ? raw : Math.round( raw ), options.littleEndian );
							vOffset += writer.size;

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

			const positionIsFloat = isFloatType( positionType );
			const normalIsFloat = isFloatType( normalType );
			const uvIsFloat = isFloatType( uvType );
			const colorIsFloat = isFloatType( colorType );
			const colorScale = getColorScale( colorType );

			const customIsFloat = {};
			for ( const name of customAttributeNames ) customIsFloat[ name ] = isFloatType( customTypes[ name ] );

			const encode = ( v, isFloat ) => isFloat ? v : Math.round( v );

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
						encode( vertex.x, positionIsFloat ) + ' ' +
						encode( vertex.y, positionIsFloat ) + ' ' +
						encode( vertex.z, positionIsFloat );

					// Normal information
					if ( includeNormals === true ) {

						if ( normals != null ) {

							vertex.fromBufferAttribute( normals, i );

							vertex.applyMatrix3( normalMatrixWorld ).normalize();

							line += ' ' +
								encode( vertex.x, normalIsFloat ) + ' ' +
								encode( vertex.y, normalIsFloat ) + ' ' +
								encode( vertex.z, normalIsFloat );

						} else {

							line += ' 0 0 0';

						}

					}

					// UV information
					if ( includeUVs === true ) {

						if ( uvs != null ) {

							line += ' ' +
								encode( uvs.getX( i ), uvIsFloat ) + ' ' +
								encode( uvs.getY( i ), uvIsFloat );

						} else {

							line += ' 0 0';

						}

					}

					// Color information
					if ( includeColors === true ) {

						if ( colors != null ) {

							tempColor.fromBufferAttribute( colors, i );

							ColorManagement.workingToColorSpace( tempColor, SRGBColorSpace );

							const r = colorIsFloat ? tempColor.r : Math.round( tempColor.r * colorScale );
							const g = colorIsFloat ? tempColor.g : Math.round( tempColor.g * colorScale );
							const b = colorIsFloat ? tempColor.b : Math.round( tempColor.b * colorScale );

							line += ` ${r} ${g} ${b}`;

						} else {

							const white = colorIsFloat ? 1 : colorScale;
							line += ` ${white} ${white} ${white}`;

						}

					}

					// Custom attributes

					for ( const name of customAttributeNames ) {

						const propCount = customPropertyMapping[ name ].length;
						const attr = geometry.getAttribute( name );
						const isFloat = customIsFloat[ name ];

						for ( let c = 0; c < propCount; c ++ ) {

							const raw = attr != null ? getAttributeComponent( attr, i, c ) : 0;
							line += ' ' + encode( raw, isFloat );

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

function getPlyType( array ) {

	if ( array instanceof Int8Array ) return 'char';
	if ( array instanceof Uint8Array || array instanceof Uint8ClampedArray ) return 'uchar';
	if ( array instanceof Int16Array ) return 'short';
	if ( array instanceof Uint16Array ) return 'ushort';
	if ( array instanceof Int32Array ) return 'int';
	if ( array instanceof Uint32Array ) return 'uint';
	if ( array instanceof Float32Array ) return 'float';
	if ( array instanceof Float64Array ) return 'double';
	return 'float';

}

function getBinaryWriter( type ) {

	switch ( type ) {

		case 'char':	return { write: ( dv, at, v ) => dv.setInt8( at, v ), size: 1 };
		case 'uchar':	return { write: ( dv, at, v ) => dv.setUint8( at, v ), size: 1 };
		case 'short':	return { write: ( dv, at, v, le ) => dv.setInt16( at, v, le ), size: 2 };
		case 'ushort':	return { write: ( dv, at, v, le ) => dv.setUint16( at, v, le ), size: 2 };
		case 'int':		return { write: ( dv, at, v, le ) => dv.setInt32( at, v, le ), size: 4 };
		case 'uint':	return { write: ( dv, at, v, le ) => dv.setUint32( at, v, le ), size: 4 };
		case 'float':	return { write: ( dv, at, v, le ) => dv.setFloat32( at, v, le ), size: 4 };
		case 'double':	return { write: ( dv, at, v, le ) => dv.setFloat64( at, v, le ), size: 8 };

	}

}

function isFloatType( type ) {

	return type === 'float' || type === 'double';

}

function getAttributeComponent( attr, i, c ) {

	switch ( c ) {

		case 0: return attr.getX( i );
		case 1: return attr.getY( i );
		case 2: return attr.getZ( i );
		case 3: return attr.getW( i );

	}

}

function getColorScale( type ) {

	switch ( type ) {

		case 'uchar':	return 255;
		case 'ushort':	return 65535;
		default:		return 1;

	}

}

/**
 * Export options of `PLYExporter`.
 *
 * @typedef {Object} PLYExporter~Options
 * @property {boolean} [binary=false] - Whether to export in binary format or ASCII.
 * @property {Array<string>} [excludeAttributes] - Which properties to explicitly exclude from
 * the exported PLY file. Valid values are `'color'`, `'normal'`, `'uv'`, and `'index'`. If triangle
 * indices are excluded, then a point cloud is exported.
 * @property {boolean} [littleEndian=false] - Whether the binary export uses little or big endian.
 * @property {Object<string, Array<string>>} [customPropertyMapping] - A mapping that allows
 * exporting custom buffer attributes as PLY vertex properties. Each entry maps a buffer attribute
 * name to an array of PLY property names. The number of property names must match the item size
 * of the buffer attribute. This is the inverse of `PLYLoader.setCustomPropertyNameMapping()`.
 **/

/**
 * onDone callback of `PLYExporter`.
 *
 * @callback PLYExporter~OnDone
 * @param {string|ArrayBuffer} result - The generated PLY ascii or binary.
 */

export { PLYExporter };
