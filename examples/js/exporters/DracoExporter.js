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
 *  - quantization, indicates the presision of each type of data stored in the draco file
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
				quantization: [ 16, 8, 8, 8, 16 ]

			};

		}


		var dracoEncoder = DracoEncoderModule();

		var encoder = new dracoEncoder.Encoder();
		var builder = new dracoEncoder.MeshBuilder();
		var mesh = new dracoEncoder.Mesh();

		if ( geometry.isBufferGeometry === true ) {

			var vertices = geometry.getAttribute( 'position' );
			var faces = geometry.getIndex();
			var normals = geometry.getAttribute( 'normal' );
			var uvs = geometry.getAttribute( 'uv' );

			console.log(vertices, faces, normals, uvs);

			return new THREE.Geometry();

			var numFaces = faces.length;
			var numPoints = vertices.length;
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

			// vertices

			if ( vertices !== undefined ) {

				for ( i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

					vertex.x = vertices.getX( i );
					vertex.y = vertices.getY( i );
					vertex.z = vertices.getZ( i );

					// transfrom the vertex to world space
					vertex.applyMatrix4( mesh.matrixWorld );

					// transform the vertex to export format
					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

				}

			}

			// uvs

			if ( uvs !== undefined ) {

				for ( i = 0, l = uvs.count; i < l; i ++, nbVertexUvs ++ ) {

					uv.x = uvs.getX( i );
					uv.y = uvs.getY( i );

					// transform the uv to export format
					output += 'vt ' + uv.x + ' ' + uv.y + '\n';

				}

			}

			// normals

			if ( normals !== undefined ) {

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				for ( i = 0, l = normals.count; i < l; i ++, nbNormals ++ ) {

					normal.x = normals.getX( i );
					normal.y = normals.getY( i );
					normal.z = normals.getZ( i );

					// transfrom the normal to world space
					normal.applyMatrix3( normalMatrixWorld );

					// transform the normal to export format
					output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

				}

			}

			// faces

			if ( indices !== null ) {

				for ( i = 0, l = indices.count; i < l; i += 3 ) {

					for ( m = 0; m < 3; m ++ ) {

						j = indices.getX( i + m ) + 1;

						face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

					}

					// transform the face to export format
					output += 'f ' + face.join( ' ' ) + "\n";

				}

			} else {

				for ( i = 0, l = vertices.count; i < l; i += 3 ) {

					for ( m = 0; m < 3; m ++ ) {

						j = i + m + 1;

						face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

					}

					// transform the face to export format
					output += 'f ' + face.join( ' ' ) + "\n";

				}

			}

			/*
			var convert = new THREE.Geometry();
			convert.fromBufferGeometry( geometry );
			geometry = convert;

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
			*/

		} else if ( geometry.isGeometry === true ) {

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

			throw new Error( 'THREE.DRACOExporter: Draco encoding failed' );

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
