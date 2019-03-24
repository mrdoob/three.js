'use strict';

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
 *
 * @class DRACOExporter
 * @author tentone
 */

THREE.DRACOExporter = function () {};

THREE.DRACOExporter.prototype = {

	constructor: THREE.DRACOExporter,

	parse: function ( geometry, options ) {


		if ( DracoEncoderModule === undefined ) {

			throw new Error( 'THREE.DRACOExporter: required the draco_decoder to work.' );

		}

		if ( options === undefined ) {

			options = {

				decodeSpeed: 5,
				encodeSpeed: 5,
				encoderMethod: THREE.DRACOExporter.MESH_EDGEBREAKER_ENCODING,
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

		console.log( dracoEncoder, geometry );

		if ( geometry.isGeometry === true ) {

			// Faces

			var faces = new Uint32Array( geometry.faces.length * 3 );

			for ( var i = 0; i < geometry.faces.length; i ++ ) {

				var index = i * 3;
				faces[ index ] = geometry.faces[ i ].a;
				faces[ index + 1 ] = geometry.faces[ i ].b;
				faces[ index + 2 ] = geometry.faces[ i ].c;

			}

			builder.AddFacesToMesh( mesh, geometry.faces.length, faces );

			// Vertex

			var vertices = new Float32Array( geometry.vertices.length * 3 );

			for ( var i = 0; i < geometry.vertices.length; i ++ ) {

				var index = i * 3;
				vertices[ index ] = geometry.vertices[ i ].x;
				vertices[ index + 1 ] = geometry.vertices[ i ].y;
				vertices[ index + 2 ] = geometry.vertices[ i ].z;

			}

			builder.AddFloatAttributeToMesh( mesh, dracoEncoder.POSITION, geometry.vertices.length, 3, vertices );

			// Normals

			if ( options.exportNormals === true ) {

				var normals = new Float32Array( geometry.vertices.length * 3 );

				for ( var face of geometry.faces ) {

					normals[ face.a * 3 ] = face.vertexNormals[ 0 ].x;
					normals[ ( face.a * 3 ) + 1 ] = face.vertexNormals[ 0 ].y;
					normals[ ( face.a * 3 ) + 2 ] = face.vertexNormals[ 0 ].z;

					normals[ face.b * 3 ] = face.vertexNormals[ 1 ].x;
					normals[ ( face.b * 3 ) + 1 ] = face.vertexNormals[ 1 ].y;
					normals[ ( face.b * 3 ) + 2 ] = face.vertexNormals[ 1 ].z;

					normals[ face.c * 3 ] = face.vertexNormals[ 2 ].x;
					normals[ ( face.c * 3 ) + 1 ] = face.vertexNormals[ 2 ].y;
					normals[ ( face.c * 3 ) + 2 ] = face.vertexNormals[ 2 ].z;

				}

				builder.AddFloatAttributeToMesh( mesh, dracoEncoder.NORMAL, geometry.vertices.length, 3, normals );

			}

			// Uvs

			if ( options.exportUvs === true ) {


				var uvs = new Uint32Array( geometry.faceVertexUvs.length * 6 );

				for ( var i = 0; i < geometry.faceVertexUvs.length; i ++ ) {

					var index = i * 6;
					var faceUvs = geometry.faceVertexUvs[ i ];

					uvs[ index ] = faceUvs[ 0 ].x;
					uvs[ index + 1 ] = faceUvs[ 0 ].y;

					uvs[ index + 2 ] = faceUvs[ 1 ].x;
					uvs[ index + 3 ] = faceUvs[ 1 ].y;

					uvs[ index + 4 ] = faceUvs[ 2 ].x;
					uvs[ index + 5 ] = faceUvs[ 2 ].y;

				}

				builder.AddFloatAttributeToMesh( mesh, dracoEncoder.TEX_COORD, geometry.vertices.length, 2, uvs );

			}

			// Color

			if ( options.exportColor === true ) {

				var colors = new Uint32Array( geometry.colors.length * 3 );

				for ( var i = 0; i < geometry.colors.length; i ++ ) {

					var index = i * 3;
					colors[ index ] = geometry.colors[ i ].x;
					colors[ index + 1 ] = geometry.colors[ i ].y;
					colors[ index + 2 ] = geometry.colors[ i ].z;

				}

				builder.AddFloatAttributeToMesh( mesh, dracoEncoder.COLOR, geometry.vertices.length, 3, colors );

			}

		} else if ( geometry.isBufferGeometry === true ) {

			var vertices = geometry.getAttribute( 'position' );
			builder.AddFloatAttributeToMesh( mesh, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array );

			var faces = geometry.getIndex();

			if ( faces !== null ) {
				
				builder.AddFacesToMesh( mesh, faces.count, faces.array );

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

		for ( var i = 0; i < 5; i ++ ) {

			if ( options.quantization[ i ] !== undefined ) {

				encoder.SetAttributeQuantization( i, options.quantization[ i ] );

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

THREE.DRACOExporter.MESH_EDGEBREAKER_ENCODING = 1;
THREE.DRACOExporter.MESH_SEQUENTIAL_ENCODING = 0;

// Geometry type

THREE.DRACOExporter.POINT_CLOUD = 0;
THREE.DRACOExporter.TRIANGULAR_MESH = 1;

// Attribute type

THREE.DRACOExporter.INVALID = - 1;
THREE.DRACOExporter.POSITION = 0;
THREE.DRACOExporter.NORMAL = 1;
THREE.DRACOExporter.COLOR = 2;
THREE.DRACOExporter.TEX_COORD = 3;
THREE.DRACOExporter.GENERIC = 4;
