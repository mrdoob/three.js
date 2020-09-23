import {
	BufferGeometry
} from "../../../build/three.module.js";
/**
 * Export draco compressed files from threejs geometry objects.
 *
 * Draco files are compressed and usually are smaller than conventional 3D file formats.
 *
 * The exporter receives a options object containing
 *  - decodeSpeed, indicates how to tune the encoder regarding decode speed (0 gives better speed but worst quality)
 *  - encodeSpeed, indicates how to tune the encoder parameters (0 gives better speed but worst quality)
 *  - encoderMethod
 *  - quantization, indicates the presision of each type of data stored in the draco file in the order (POSITION, NORMAL, COLOR, TEX_COORD, GENERIC)
 *  - exportUvs
 *  - exportNormals
 */

/* global DracoEncoderModule */

var DRACOExporter = function () {};

DRACOExporter.prototype = {

	constructor: DRACOExporter,

	parse: function ( geometry, options ) {


		if ( DracoEncoderModule === undefined ) {

			throw new Error( 'THREE.DRACOExporter: required the draco_decoder to work.' );

		}

		if ( options === undefined ) {

			options = {

				decodeSpeed: 5,
				encodeSpeed: 5,
				encoderMethod: DRACOExporter.MESH_EDGEBREAKER_ENCODING,
				quantization: [ 16, 8, 8, 8, 8 ],
				exportUvs: true,
				exportNormals: true,
				exportColor: false,

			};

		}

		var dracoEncoder = DracoEncoderModule();
		var encoder = new dracoEncoder.Encoder();
		var builder = new dracoEncoder.MeshBuilder();
		var mesh = new dracoEncoder.Mesh();

		if ( geometry.isGeometry === true ) {

			var bufferGeometry = new BufferGeometry();
			bufferGeometry.fromGeometry( geometry );
			geometry = bufferGeometry;

		}

		if ( geometry.isBufferGeometry !== true ) {

			throw new Error( 'THREE.DRACOExporter.parse(geometry, options): geometry is not a THREE.Geometry or BufferGeometry instance.' );

		}

		var vertices = geometry.getAttribute( 'position' );
		builder.AddFloatAttributeToMesh( mesh, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array );

		var faces = geometry.getIndex();

		if ( faces !== null ) {

			builder.AddFacesToMesh( mesh, faces.count / 3, faces.array );

		} else {

			var faces = new ( vertices.count > 65535 ? Uint32Array : Uint16Array )( vertices.count );

			for ( var i = 0; i < faces.length; i ++ ) {

				faces[ i ] = i;

			}

			builder.AddFacesToMesh( mesh, vertices.count, faces );

		}

		if ( options.exportNormals === true ) {

			var normals = geometry.getAttribute( 'normal' );

			if ( normals !== undefined ) {

				builder.AddFloatAttributeToMesh( mesh, dracoEncoder.NORMAL, normals.count, normals.itemSize, normals.array );

			}

		}

		if ( options.exportUvs === true ) {

			var uvs = geometry.getAttribute( 'uv' );

			if ( uvs !== undefined ) {

				builder.AddFloatAttributeToMesh( mesh, dracoEncoder.TEX_COORD, uvs.count, uvs.itemSize, uvs.array );

			}

		}

		if ( options.exportColor === true ) {

			var colors = geometry.getAttribute( 'color' );

			if ( colors !== undefined ) {

				builder.AddFloatAttributeToMesh( mesh, dracoEncoder.COLOR, colors.count, colors.itemSize, colors.array );

			}

		}

		//Compress using draco encoder

		var encodedData = new dracoEncoder.DracoInt8Array();

		//Sets the desired encoding and decoding speed for the given options from 0 (slowest speed, but the best compression) to 10 (fastest, but the worst compression).

		encoder.SetSpeedOptions( options.encodeSpeed || 5, options.decodeSpeed || 5 );

		// Sets the desired encoding method for a given geometry.

		if ( options.encoderMethod !== undefined ) {

			encoder.SetEncodingMethod( options.encoderMethod );

		}

		// Sets the quantization (number of bits used to represent) compression options for a named attribute.
		// The attribute values will be quantized in a box defined by the maximum extent of the attribute values.
		if ( options.quantization !== undefined ) {

			for ( var i = 0; i < 5; i ++ ) {

				if ( options.quantization[ i ] !== undefined ) {

					encoder.SetAttributeQuantization( i, options.quantization[ i ] );

				}

			}

		}

		var length = encoder.EncodeMeshToDracoBuffer( mesh, encodedData );
		dracoEncoder.destroy( mesh );

		if ( length === 0 ) {

			throw new Error( 'THREE.DRACOExporter: Draco encoding failed.' );

		}

		//Copy encoded data to buffer.
		var outputData = new Int8Array( new ArrayBuffer( length ) );

		for ( var i = 0; i < length; i ++ ) {

			outputData[ i ] = encodedData.GetValue( i );

		}

		dracoEncoder.destroy( encodedData );
		dracoEncoder.destroy( encoder );
		dracoEncoder.destroy( builder );

		return outputData;

	}

};

// Encoder methods

DRACOExporter.MESH_EDGEBREAKER_ENCODING = 1;
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

export { DRACOExporter };
