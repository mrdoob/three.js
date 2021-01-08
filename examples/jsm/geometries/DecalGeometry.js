import {
	BufferGeometry,
	Float32BufferAttribute,
	Matrix4,
	Vector3
} from '../../../build/three.module.js';

/**
 * You can use this geometry to create a decal mesh, that serves different kinds of purposes.
 * e.g. adding unique details to models, performing dynamic visual environmental changes or covering seams.
 *
 * Constructor parameter:
 *
 * mesh — Any mesh object
 * position — Position of the decal projector
 * orientation — Orientation of the decal projector
 * size — Size of the decal projector
 *
 * reference: http://blog.wolfire.com/2009/06/how-to-project-decals/
 *
 */

var DecalGeometry = function ( mesh, position, orientation, size ) {

	BufferGeometry.call( this );

	// buffers

	var vertices = [];
	var normals = [];
	var uvs = [];

	// helpers

	var plane = new Vector3();

	// this matrix represents the transformation of the decal projector

	var projectorMatrix = new Matrix4();
	projectorMatrix.makeRotationFromEuler( orientation );
	projectorMatrix.setPosition( position );

	var projectorMatrixInverse = new Matrix4();
	projectorMatrixInverse.copy( projectorMatrix ).invert();

	// generate buffers

	generate();

	// build geometry

	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	function generate() {

		var i;

		var decalVertices = [];

		var vertex = new Vector3();
		var normal = new Vector3();

		// handle different geometry types

		if ( mesh.geometry.isGeometry === true ) {

			console.error( 'THREE.DecalGeometry no longer supports THREE.Geometry. Use BufferGeometry instead.' );
			return;

		}

		var geometry = mesh.geometry;

		var positionAttribute = geometry.attributes.position;
		var normalAttribute = geometry.attributes.normal;

		// first, create an array of 'DecalVertex' objects
		// three consecutive 'DecalVertex' objects represent a single face
		//
		// this data structure will be later used to perform the clipping

		if ( geometry.index !== null ) {

			// indexed BufferGeometry

			var index = geometry.index;

			for ( i = 0; i < index.count; i ++ ) {

				vertex.fromBufferAttribute( positionAttribute, index.getX( i ) );
				normal.fromBufferAttribute( normalAttribute, index.getX( i ) );

				pushDecalVertex( decalVertices, vertex, normal );

			}

		} else {

			// non-indexed BufferGeometry

			for ( i = 0; i < positionAttribute.count; i ++ ) {

				vertex.fromBufferAttribute( positionAttribute, i );
				normal.fromBufferAttribute( normalAttribute, i );

				pushDecalVertex( decalVertices, vertex, normal );

			}

		}

		// second, clip the geometry so that it doesn't extend out from the projector

		decalVertices = clipGeometry( decalVertices, plane.set( 1, 0, 0 ) );
		decalVertices = clipGeometry( decalVertices, plane.set( - 1, 0, 0 ) );
		decalVertices = clipGeometry( decalVertices, plane.set( 0, 1, 0 ) );
		decalVertices = clipGeometry( decalVertices, plane.set( 0, - 1, 0 ) );
		decalVertices = clipGeometry( decalVertices, plane.set( 0, 0, 1 ) );
		decalVertices = clipGeometry( decalVertices, plane.set( 0, 0, - 1 ) );

		// third, generate final vertices, normals and uvs

		for ( i = 0; i < decalVertices.length; i ++ ) {

			var decalVertex = decalVertices[ i ];

			// create texture coordinates (we are still in projector space)

			uvs.push(
				0.5 + ( decalVertex.position.x / size.x ),
				0.5 + ( decalVertex.position.y / size.y )
			);

			// transform the vertex back to world space

			decalVertex.position.applyMatrix4( projectorMatrix );

			// now create vertex and normal buffer data

			vertices.push( decalVertex.position.x, decalVertex.position.y, decalVertex.position.z );
			normals.push( decalVertex.normal.x, decalVertex.normal.y, decalVertex.normal.z );

		}

	}

	function pushDecalVertex( decalVertices, vertex, normal ) {

		// transform the vertex to world space, then to projector space

		vertex.applyMatrix4( mesh.matrixWorld );
		vertex.applyMatrix4( projectorMatrixInverse );

		normal.transformDirection( mesh.matrixWorld );

		decalVertices.push( new DecalVertex( vertex.clone(), normal.clone() ) );

	}

	function clipGeometry( inVertices, plane ) {

		var outVertices = [];

		var s = 0.5 * Math.abs( size.dot( plane ) );

		// a single iteration clips one face,
		// which consists of three consecutive 'DecalVertex' objects

		for ( var i = 0; i < inVertices.length; i += 3 ) {

			var v1Out, v2Out, v3Out, total = 0;
			var nV1, nV2, nV3, nV4;

			var d1 = inVertices[ i + 0 ].position.dot( plane ) - s;
			var d2 = inVertices[ i + 1 ].position.dot( plane ) - s;
			var d3 = inVertices[ i + 2 ].position.dot( plane ) - s;

			v1Out = d1 > 0;
			v2Out = d2 > 0;
			v3Out = d3 > 0;

			// calculate, how many vertices of the face lie outside of the clipping plane

			total = ( v1Out ? 1 : 0 ) + ( v2Out ? 1 : 0 ) + ( v3Out ? 1 : 0 );

			switch ( total ) {

				case 0: {

					// the entire face lies inside of the plane, no clipping needed

					outVertices.push( inVertices[ i ] );
					outVertices.push( inVertices[ i + 1 ] );
					outVertices.push( inVertices[ i + 2 ] );
					break;

				}

				case 1: {

					// one vertex lies outside of the plane, perform clipping

					if ( v1Out ) {

						nV1 = inVertices[ i + 1 ];
						nV2 = inVertices[ i + 2 ];
						nV3 = clip( inVertices[ i ], nV1, plane, s );
						nV4 = clip( inVertices[ i ], nV2, plane, s );

					}

					if ( v2Out ) {

						nV1 = inVertices[ i ];
						nV2 = inVertices[ i + 2 ];
						nV3 = clip( inVertices[ i + 1 ], nV1, plane, s );
						nV4 = clip( inVertices[ i + 1 ], nV2, plane, s );

						outVertices.push( nV3 );
						outVertices.push( nV2.clone() );
						outVertices.push( nV1.clone() );

						outVertices.push( nV2.clone() );
						outVertices.push( nV3.clone() );
						outVertices.push( nV4 );
						break;

					}

					if ( v3Out ) {

						nV1 = inVertices[ i ];
						nV2 = inVertices[ i + 1 ];
						nV3 = clip( inVertices[ i + 2 ], nV1, plane, s );
						nV4 = clip( inVertices[ i + 2 ], nV2, plane, s );

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

					// two vertices lies outside of the plane, perform clipping

					if ( ! v1Out ) {

						nV1 = inVertices[ i ].clone();
						nV2 = clip( nV1, inVertices[ i + 1 ], plane, s );
						nV3 = clip( nV1, inVertices[ i + 2 ], plane, s );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}

					if ( ! v2Out ) {

						nV1 = inVertices[ i + 1 ].clone();
						nV2 = clip( nV1, inVertices[ i + 2 ], plane, s );
						nV3 = clip( nV1, inVertices[ i ], plane, s );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}

					if ( ! v3Out ) {

						nV1 = inVertices[ i + 2 ].clone();
						nV2 = clip( nV1, inVertices[ i ], plane, s );
						nV3 = clip( nV1, inVertices[ i + 1 ], plane, s );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}

					break;

				}

				case 3: {

					// the entire face lies outside of the plane, so let's discard the corresponding vertices

					break;

				}

			}

		}

		return outVertices;

	}

	function clip( v0, v1, p, s ) {

		var d0 = v0.position.dot( p ) - s;
		var d1 = v1.position.dot( p ) - s;

		var s0 = d0 / ( d0 - d1 );

		var v = new DecalVertex(
			new Vector3(
				v0.position.x + s0 * ( v1.position.x - v0.position.x ),
				v0.position.y + s0 * ( v1.position.y - v0.position.y ),
				v0.position.z + s0 * ( v1.position.z - v0.position.z )
			),
			new Vector3(
				v0.normal.x + s0 * ( v1.normal.x - v0.normal.x ),
				v0.normal.y + s0 * ( v1.normal.y - v0.normal.y ),
				v0.normal.z + s0 * ( v1.normal.z - v0.normal.z )
			)
		);

		// need to clip more values (texture coordinates)? do it this way:
		// intersectpoint.value = a.value + s * ( b.value - a.value );

		return v;

	}

};

DecalGeometry.prototype = Object.create( BufferGeometry.prototype );
DecalGeometry.prototype.constructor = DecalGeometry;

// helper

var DecalVertex = function ( position, normal ) {

	this.position = position;
	this.normal = normal;

};

DecalVertex.prototype.clone = function () {

	return new this.constructor( this.position.clone(), this.normal.clone() );

};

export { DecalGeometry, DecalVertex };
