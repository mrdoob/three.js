import { BufferGeometry } from '../core/BufferGeometry';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function DecalGeometry( mesh, position, rotation, dimensions, check ) {

	BufferGeometry.call( this );

	this.type = 'DecalGeometry';

	check = check || new Vector3( 1, 1, 1 );

	// buffers

	var vertices = [];
	var normals = [];
	var uvs = [];

	// helpers

	var projectorMatrix = new Matrix4();
	projectorMatrix.makeRotationFromEuler( rotation );
	projectorMatrix.setPosition( position );

	var projectorMatrixInverse = new Matrix4().getInverse( projectorMatrix );

	var plane = new Vector3();

	// generate buffers

	generate();

	// build geometry

	this.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	function generate() {

		var i, j, faceVertices;
		var geometry = new BufferGeometry();

		var vertex = new Vector3();
		var normal = new Vector3();

		// handle Geometry

		if ( mesh.geometry.isGeometry ) {

			geometry.fromGeometry( mesh.geometry );

		} else {

			geometry.copy( mesh.geometry );

		}

		var positionAttribute = geometry.attributes.position;
		var normalAttribute = geometry.attributes.normal;

		if ( geometry.index !== null ) {

			// indexed BufferGeometry

			var index = geometry.index;

			for ( i = 0; i < index.count; i += 3 ) {

				faceVertices = [];

				for ( j = 0; j < 3; j ++ ) {

					vertex.fromBufferAttribute( positionAttribute, index[ i + j ] );
					normal.fromBufferAttribute( normalAttribute, index[ i + j ] );

					vertex.applyMatrix4( mesh.matrix );
					vertex.applyMatrix4( projectorMatrixInverse );

					faceVertices.push( new DecalVertex( vertex.clone(), normal.clone() ) );

				}

				processFace( faceVertices );

			}

		} else {

			// non-indexed BufferGeometry

			for ( i = 0; i < positionAttribute.count; i += 3 ) {

				faceVertices = [];

				for ( j = 0; j < 3; j ++ ) {

					vertex.fromBufferAttribute( positionAttribute, i + j );
					normal.fromBufferAttribute( normalAttribute, i + j );

					vertex.applyMatrix4( mesh.matrix );
					vertex.applyMatrix4( projectorMatrixInverse );

					faceVertices.push( new DecalVertex( vertex.clone(), normal.clone() ) );

				}

				processFace( faceVertices );

			}

		}

	}

	function processFace( faceVertices ) {

		if ( check.x ) {

			faceVertices = clipFace( faceVertices, plane.set( 1, 0, 0 ) );
			faceVertices = clipFace( faceVertices, plane.set( - 1, 0, 0 ) );

		}
		if ( check.y ) {

			faceVertices = clipFace( faceVertices, plane.set( 0, 1, 0 ) );
			faceVertices = clipFace( faceVertices, plane.set( 0, - 1, 0 ) );

		}
		if ( check.z ) {

			faceVertices = clipFace( faceVertices, plane.set( 0, 0, 1 ) );
			faceVertices = clipFace( faceVertices, plane.set( 0, 0, - 1 ) );

		}

		if ( faceVertices.length === 0 ) return;

		// generate vertices, normals and uvs

		for ( var i = 0; i < faceVertices.length; i ++ ) {

			var decalVertex = faceVertices[ i ];

			uvs.push(
				0.5 + ( decalVertex.position.x / dimensions.x ),
				0.5 + ( decalVertex.position.y / dimensions.y )
			);

			decalVertex.position.applyMatrix4( projectorMatrix );

			vertices.push( decalVertex.position.x, decalVertex.position.y, decalVertex.position.z );
			normals.push( decalVertex.normal.x, decalVertex.normal.y, decalVertex.normal.z );

		}

	}

	function clipFace ( inVertices, plane ) {

		var outVertices = [];

		var size = 0.5 * Math.abs( dimensions.dot( plane ) );

		for ( var j = 0; j < inVertices.length; j += 3 ) {

			var v1Out, v2Out, v3Out, total = 0;
			var nV1, nV2, nV3, nV4;

			var d1 = inVertices[ j + 0 ].position.dot( plane ) - size;
			var d2 = inVertices[ j + 1 ].position.dot( plane ) - size;
			var d3 = inVertices[ j + 2 ].position.dot( plane ) - size;

			v1Out = d1 > 0;
			v2Out = d2 > 0;
			v3Out = d3 > 0;

			total = ( v1Out ? 1 : 0 ) + ( v2Out ? 1 : 0 ) + ( v3Out ? 1 : 0 );

			switch ( total ) {

				case 0: {

					outVertices.push( inVertices[ j ] );
					outVertices.push( inVertices[ j + 1 ] );
					outVertices.push( inVertices[ j + 2 ] );
					break;

				}

				case 1: {

					if ( v1Out ) {

						nV1 = inVertices[ j + 1 ];
						nV2 = inVertices[ j + 2 ];
						nV3 = clip( inVertices[ j ], nV1, plane, size );
						nV4 = clip( inVertices[ j ], nV2, plane, size );

					}

					if ( v2Out ) {

						nV1 = inVertices[ j ];
						nV2 = inVertices[ j + 2 ];
						nV3 = clip( inVertices[ j + 1 ], nV1, plane, size );
						nV4 = clip( inVertices[ j + 1 ], nV2, plane, size );

						outVertices.push( nV3 );
						outVertices.push( nV2.clone() );
						outVertices.push( nV1.clone() );

						outVertices.push( nV2.clone() );
						outVertices.push( nV3.clone() );
						outVertices.push( nV4 );
						break;

					}

					if ( v3Out ) {

						nV1 = inVertices[ j ];
						nV2 = inVertices[ j + 1 ];
						nV3 = clip( inVertices[ j + 2 ], nV1, plane, size );
						nV4 = clip( inVertices[ j + 2 ], nV2, plane, size );

					}

					outVertices.push( nV1.clone() );
					outVertices.push( nV2.clone() );
					outVertices.push( nV3 );

					outVertices.push( nV4 );
					outVertices.push( nV3.clone() );
					outVertices.push( nV2.clone() );

					break;

				}

				case 2: {

					if ( ! v1Out ) {

						nV1 = inVertices[ j ].clone();
						nV2 = clip( nV1, inVertices[ j + 1 ], plane, size );
						nV3 = clip( nV1, inVertices[ j + 2 ], plane, size );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}

					if ( ! v2Out ) {

						nV1 = inVertices[ j + 1 ].clone();
						nV2 = clip( nV1, inVertices[ j + 2 ], plane, size );
						nV3 = clip( nV1, inVertices[ j ], plane, size );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}

					if ( ! v3Out ) {

						nV1 = inVertices[ j + 2 ].clone();
						nV2 = clip( nV1, inVertices[ j ], plane, size );
						nV3 = clip( nV1, inVertices[ j + 1 ], plane, size );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}

					break;

				}

				case 3: {

					break;

				}

			}

		}

		return outVertices;

	}

	function clip( v0, v1, p, size ) {

		var d0 = v0.position.dot( p ) - size;
		var d1 = v1.position.dot( p ) - size;

		var s = d0 / ( d0 - d1 );
		var v = new DecalVertex(
			new Vector3(
				v0.position.x + s * ( v1.position.x - v0.position.x ),
				v0.position.y + s * ( v1.position.y - v0.position.y ),
				v0.position.z + s * ( v1.position.z - v0.position.z )
			),
			new Vector3(
				v0.normal.x + s * ( v1.normal.x - v0.normal.x ),
				v0.normal.y + s * ( v1.normal.y - v0.normal.y ),
				v0.normal.z + s * ( v1.normal.z - v0.normal.z )
			)
		);

		// need to clip more values (texture coordinates)? do it this way:
		// intersectpoint.value = a.value + s * ( b.value - a.value );

		return v;

	}

}

DecalGeometry.prototype = Object.create( BufferGeometry.prototype );
DecalGeometry.prototype.constructor = DecalGeometry;

function DecalVertex( position, normal ) {

	this.position = position;
	this.normal = normal;

}

DecalVertex.prototype.clone = function() {

	return new DecalVertex( this.position.clone(), this.normal.clone() );

};


export { DecalGeometry };
