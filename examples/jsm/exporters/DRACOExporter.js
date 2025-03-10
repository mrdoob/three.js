import { Color, ColorManagement, SRGBColorSpace } from 'three';

/* global DracoEncoderModule */

/**
 * An exporter to compress geometry with the Draco library.
 *
 * [Draco]{@link https://google.github.io/draco/} is an open source library for compressing and
 * decompressing 3D meshes and point clouds. Compressed geometry can be significantly smaller,
 * at the cost of additional decoding time on the client device.
 *
 * Standalone Draco files have a `.drc` extension, and contain vertex positions,
 * normals, colors, and other attributes. Draco files *do not* contain materials,
 * textures, animation, or node hierarchies – to use these features, embed Draco geometry
 * inside of a glTF file. A normal glTF file can be converted to a Draco-compressed glTF file
 * using [glTF-Pipeline]{@link https://github.com/AnalyticalGraphicsInc/gltf-pipeline}.
 *
 * ```js
 * const exporter = new DRACOExporter();
 * const data = exporter.parse( mesh, options );
 * ```
 */
class DRACOExporter {

	/**
	 * Parses the given mesh or point cloud and generates the Draco output.
	 *
	 * @param {(Mesh|Points)} object - The mesh or point cloud to export.
	 * @param {DRACOExporter~Options} options - The export options.
	 * @return {ArrayBuffer} The exported Draco.
	 */
	parse( object, options = {} ) {

		options = Object.assign( {
			decodeSpeed: 5,
			encodeSpeed: 5,
			encoderMethod: DRACOExporter.MESH_EDGEBREAKER_ENCODING,
			quantization: [ 16, 8, 8, 8, 8 ],
			exportUvs: true,
			exportNormals: true,
			exportColor: false,
		}, options );

		if ( DracoEncoderModule === undefined ) {

			throw new Error( 'THREE.DRACOExporter: required the draco_encoder to work.' );

		}

		const geometry = object.geometry;

		const dracoEncoder = DracoEncoderModule();
		const encoder = new dracoEncoder.Encoder();
		let builder;
		let dracoObject;

		if ( object.isMesh === true ) {

			builder = new dracoEncoder.MeshBuilder();
			dracoObject = new dracoEncoder.Mesh();

			const vertices = geometry.getAttribute( 'position' );
			builder.AddFloatAttributeToMesh( dracoObject, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array );

			const faces = geometry.getIndex();

			if ( faces !== null ) {

				builder.AddFacesToMesh( dracoObject, faces.count / 3, faces.array );

			} else {

				const faces = new ( vertices.count > 65535 ? Uint32Array : Uint16Array )( vertices.count );

				for ( let i = 0; i < faces.length; i ++ ) {

					faces[ i ] = i;

				}

				builder.AddFacesToMesh( dracoObject, vertices.count, faces );

			}

			if ( options.exportNormals === true ) {

				const normals = geometry.getAttribute( 'normal' );

				if ( normals !== undefined ) {

					builder.AddFloatAttributeToMesh( dracoObject, dracoEncoder.NORMAL, normals.count, normals.itemSize, normals.array );

				}

			}

			if ( options.exportUvs === true ) {

				const uvs = geometry.getAttribute( 'uv' );

				if ( uvs !== undefined ) {

					builder.AddFloatAttributeToMesh( dracoObject, dracoEncoder.TEX_COORD, uvs.count, uvs.itemSize, uvs.array );

				}

			}

			if ( options.exportColor === true ) {

				const colors = geometry.getAttribute( 'color' );

				if ( colors !== undefined ) {

					const array = createVertexColorSRGBArray( colors );

					builder.AddFloatAttributeToMesh( dracoObject, dracoEncoder.COLOR, colors.count, colors.itemSize, array );

				}

			}

		} else if ( object.isPoints === true ) {

			builder = new dracoEncoder.PointCloudBuilder();
			dracoObject = new dracoEncoder.PointCloud();

			const vertices = geometry.getAttribute( 'position' );
			builder.AddFloatAttribute( dracoObject, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array );

			if ( options.exportColor === true ) {

				const colors = geometry.getAttribute( 'color' );

				if ( colors !== undefined ) {

					const array = createVertexColorSRGBArray( colors );

					builder.AddFloatAttribute( dracoObject, dracoEncoder.COLOR, colors.count, colors.itemSize, array );

				}

			}

		} else {

			throw new Error( 'DRACOExporter: Unsupported object type.' );

		}

		//Compress using draco encoder

		const encodedData = new dracoEncoder.DracoInt8Array();

		//Sets the desired encoding and decoding speed for the given options from 0 (slowest speed, but the best compression) to 10 (fastest, but the worst compression).

		const encodeSpeed = ( options.encodeSpeed !== undefined ) ? options.encodeSpeed : 5;
		const decodeSpeed = ( options.decodeSpeed !== undefined ) ? options.decodeSpeed : 5;

		encoder.SetSpeedOptions( encodeSpeed, decodeSpeed );

		// Sets the desired encoding method for a given geometry.

		if ( options.encoderMethod !== undefined ) {

			encoder.SetEncodingMethod( options.encoderMethod );

		}

		// Sets the quantization (number of bits used to represent) compression options for a named attribute.
		// The attribute values will be quantized in a box defined by the maximum extent of the attribute values.
		if ( options.quantization !== undefined ) {

			for ( let i = 0; i < 5; i ++ ) {

				if ( options.quantization[ i ] !== undefined ) {

					encoder.SetAttributeQuantization( i, options.quantization[ i ] );

				}

			}

		}

		let length;

		if ( object.isMesh === true ) {

			length = encoder.EncodeMeshToDracoBuffer( dracoObject, encodedData );

		} else {

			length = encoder.EncodePointCloudToDracoBuffer( dracoObject, true, encodedData );

		}

		dracoEncoder.destroy( dracoObject );

		if ( length === 0 ) {

			throw new Error( 'THREE.DRACOExporter: Draco encoding failed.' );

		}

		//Copy encoded data to buffer.
		const outputData = new Int8Array( new ArrayBuffer( length ) );

		for ( let i = 0; i < length; i ++ ) {

			outputData[ i ] = encodedData.GetValue( i );

		}

		dracoEncoder.destroy( encodedData );
		dracoEncoder.destroy( encoder );
		dracoEncoder.destroy( builder );

		return outputData;

	}

}

function createVertexColorSRGBArray( attribute ) {

	// While .drc files do not specify colorspace, the only 'official' tooling
	// is PLY and OBJ converters, which use sRGB. We'll assume sRGB is expected
	// for .drc files, but note that Draco buffers embedded in glTF files will
	// be Linear-sRGB instead.

	const _color = new Color();

	const count = attribute.count;
	const itemSize = attribute.itemSize;
	const array = new Float32Array( count * itemSize );

	for ( let i = 0, il = count; i < il; i ++ ) {

		_color.fromBufferAttribute( attribute, i );

		ColorManagement.fromWorkingColorSpace( _color, SRGBColorSpace );

		array[ i * itemSize ] = _color.r;
		array[ i * itemSize + 1 ] = _color.g;
		array[ i * itemSize + 2 ] = _color.b;

		if ( itemSize === 4 ) {

			array[ i * itemSize + 3 ] = attribute.getW( i );

		}

	}

	return array;

}

// Encoder methods

/**
 * Edgebreaker encoding.
 *
 * @static
 * @constant
 * @type {number}
 * @default 1
 */
DRACOExporter.MESH_EDGEBREAKER_ENCODING = 1;

/**
 * Sequential encoding.
 *
 * @static
 * @constant
 * @type {number}
 * @default 0
 */
DRACOExporter.MESH_SEQUENTIAL_ENCODING = 0;

// Geometry type

DRACOExporter.POINT_CLOUD = 0;
DRACOExporter.TRIANGULAR_MESH = 1;

// Attribute type

DRACOExporter.INVALID = - 1;
DRACOExporter.POSITION = 0;
DRACOExporter.NORMAL = 1;
DRACOExporter.COLOR = 2;
DRACOExporter.TEX_COORD = 3;
DRACOExporter.GENERIC = 4;

/**
 * Export options of `DRACOExporter`.
 *
 * @typedef {Object} DRACOExporter~Options
 * @property {number} [decodeSpeed=5] - Indicates how to tune the encoder regarding decode speed (0 gives better speed but worst quality).
 * @property {number} [encodeSpeed=5] - Indicates how to tune the encoder parameters (0 gives better speed but worst quality).
 * @property {number} [encoderMethod=1] - Either sequential (very little compression) or Edgebreaker. Edgebreaker traverses the triangles of the mesh in a deterministic, spiral-like way which provides most of the benefits of this data format.
 * @property {Array<number>} [quantization=[ 16, 8, 8, 8, 8 ]] - Indicates the precision of each type of data stored in the draco file in the order (POSITION, NORMAL, COLOR, TEX_COORD, GENERIC).
 * @property {boolean} [exportUvs=true] - Whether to export UVs or not.
 * @property {boolean} [exportNormals=true] - Whether to export normals or not.
 * @property {boolean} [exportColor=false] - Whether to export colors or not.
 **/

export { DRACOExporter };
