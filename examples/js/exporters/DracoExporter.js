'use strict';

/**
 * Export draco compressed files from threejs geometry objects.
 *
 * Draco files are compressed and usually are smaller than conventional 3D file formats.
 *
 * @class DracoExporter
 * @author tentone
 * @author syed-usman
 */

THREE.DracoExporter = function () {};

THREE.DracoExporter.prototype = {

	constructor: THREE.DracoExporter,

	parse: function ( geometry, options ) {

		if ( DracoEncoderModule === undefined ) {

			throw new Error( 'THREE.DracoExporter: required the draco_decoder to work.' );

		}

		if ( options === undefined ) {

			options = {

				decodeSpeed: 5,
				encodeSpeed: 5,
				encoderMethod: THREE.DracoExporter.MESH_EDGEBREAKER_ENCODING,
				quantization: [ 16, 8, 8, 8, 16 ]

			};

		}

		if ( geometry.isBufferGeometry === true ) {

			var convert = new THREE.Geometry();
			convert.fromBufferGeometry( geometry );
			geometry = convert;

		}

		var dracoEncoder = DracoEncoderModule();

		var encoder = new dracoEncoder.Encoder();
		var builder = new dracoEncoder.MeshBuilder();
		var mesh = new dracoEncoder.Mesh();

		var numFaces = geometry.faces.length;
		var numPoints = geometry.vertices.length;
		var numIndices = numFaces * 3;

		var indices = new Uint32Array( numIndices );
		var vertices = new Float32Array( geometry.vertices.length * 3 );
		var normals = new Float32Array( geometry.vertices.length * 3 );

		// Faces

		for ( var i = 0; i < numFaces; i ++ ) {

			var index = i * 3;
			indices[ index ] = geometry.faces[ i ].a;
			indices[ index + 1 ] = geometry.faces[ i ].b;
			indices[ index + 2 ] = geometry.faces[ i ].c;

		}

		builder.AddFacesToMesh( mesh, numFaces, indices );

		// Vertex

		for ( var i = 0; i < geometry.vertices.length; i ++ ) {

			var index = i * 3;
			vertices[ index ] = geometry.vertices[ i ].x;
			vertices[ index + 1 ] = geometry.vertices[ i ].y;
			vertices[ index + 2 ] = geometry.vertices[ i ].z;

		}

		builder.AddFloatAttributeToMesh( mesh, dracoEncoder.POSITION, numPoints, 3, vertices );

		// Normals

		for ( var face of geometry.faces ) {

			normals[ face[ 'a' ] * 3 ] = face.vertexNormals[ 0 ].x;
			normals[ ( face[ 'a' ] * 3 ) + 1 ] = face.vertexNormals[ 0 ].y;
			normals[ ( face[ 'a' ] * 3 ) + 2 ] = face.vertexNormals[ 0 ].z;

			normals[ face[ 'b' ] * 3 ] = face.vertexNormals[ 1 ].x;
			normals[ ( face[ 'b' ] * 3 ) + 1 ] = face.vertexNormals[ 1 ].y;
			normals[ ( face[ 'b' ] * 3 ) + 2 ] = face.vertexNormals[ 1 ].z;

			normals[ face[ 'c' ] * 3 ] = face.vertexNormals[ 2 ].x;
			normals[ ( face[ 'c' ] * 3 ) + 1 ] = face.vertexNormals[ 2 ].y;
			normals[ ( face[ 'c' ] * 3 ) + 2 ] = face.vertexNormals[ 2 ].z;

		}

		builder.AddFloatAttributeToMesh( mesh, dracoEncoder.NORMAL, numPoints, 3, normals );

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

			throw new Error( 'THREE.DracoExporter: Draco encoding failed' );

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

THREE.DracoExporter.MESH_EDGEBREAKER_ENCODING = 1;
THREE.DracoExporter.MESH_SEQUENTIAL_ENCODING = 0;

// Geometry type

THREE.DracoExporter.POINT_CLOUD = 0;
THREE.DracoExporter.TRIANGULAR_MESH = 1;

// Attribute type

THREE.DracoExporter.INVALID = - 1;
THREE.DracoExporter.POSITION = 0;
THREE.DracoExporter.NORMAL = 1;
THREE.DracoExporter.COLOR = 2;
THREE.DracoExporter.TEX_COORD = 3;
THREE.DracoExporter.GENERIC = 4;
