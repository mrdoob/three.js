import {
	BufferGeometry,
	Float32BufferAttribute,
	Mesh,
	mat3GetNormalMatrix,
	mat4Create,
	mat4Invert,
	mat4MakeRotationFromEuler,
	mat4SetPosition,
	vec3ApplyMatrix4,
	vec3ApplyNormalMatrix,
	vec3Copy,
	vec3Create,
	vec3Dot,
	vec3FromBufferAttribute,
	vec3Set
} from 'three';

/**
 * This class can be used to create a decal mesh that serves different kinds of purposes e.g.
 * adding unique details to models, performing dynamic visual environmental changes or covering seams.
 *
 * Please not that decal projections can be distorted when used around corners. More information at
 * this GitHub issue: [Decal projections without distortions](https://github.com/mrdoob/three.js/issues/21187).
 *
 * Reference: [How to project decals](http://blog.wolfire.com/2009/06/how-to-project-decals/)
 *
 * ```js
 * const geometry = new DecalGeometry( mesh, position, orientation, size );
 * const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 * ```
 *
 * @augments BufferGeometry
 * @three_import import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
 */
class DecalGeometry extends BufferGeometry {

	/**
	 * Constructs a new decal geometry.
	 *
	 * @param {Mesh} [mesh] - The base mesh the decal should be projected on.
	 * @param {Vector3Like} [position] - The position of the decal projector.
	 * @param {EulerLike} [orientation] - The orientation of the decal projector.
	 * @param {Vector3Like} [size] - The scale of the decal projector.
	 */
	constructor( mesh = new Mesh(), position = vec3Create(), orientation = { x: 0, y: 0, z: 0, order: 'XYZ' }, size = vec3Set( vec3Create(), 1, 1, 1 ) ) {

		super();

		// buffers

		const vertices = [];
		const normals = [];
		const uvs = [];

		// helpers

		const plane = vec3Create();

		const normalMatrix = mat3GetNormalMatrix( mesh.matrixWorld );

		// this matrix represents the transformation of the decal projector

		const projectorMatrix = mat4Create();
		mat4MakeRotationFromEuler( orientation, projectorMatrix );
		mat4SetPosition( projectorMatrix, position.x, position.y, position.z, projectorMatrix );

		const projectorMatrixInverse = mat4Invert( projectorMatrix );

		// generate buffers

		generate();

		// build geometry

		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		if ( normals.length > 0 ) {

			this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

		}

		//

		function generate() {

			let decalVertices = [];

			const vertex = vec3Create();
			const normal = vec3Create();

			// handle different geometry types

			const geometry = mesh.geometry;

			const positionAttribute = geometry.attributes.position;
			const normalAttribute = geometry.attributes.normal;

			// first, create an array of 'DecalVertex' objects
			// three consecutive 'DecalVertex' objects represent a single face
			//
			// this data structure will be later used to perform the clipping

			if ( geometry.index !== null ) {

				// indexed BufferGeometry

				const index = geometry.index;

				for ( let i = 0; i < index.count; i ++ ) {

					vec3FromBufferAttribute( positionAttribute, index.getX( i ), vertex );

					if ( normalAttribute ) {

						vec3FromBufferAttribute( normalAttribute, index.getX( i ), normal );
						pushDecalVertex( decalVertices, vertex, normal );

					} else {

						pushDecalVertex( decalVertices, vertex );

					}

				}

			} else {

				if ( positionAttribute === undefined ) return; // empty geometry

				// non-indexed BufferGeometry

				for ( let i = 0; i < positionAttribute.count; i ++ ) {

					vec3FromBufferAttribute( positionAttribute, i, vertex );

					if ( normalAttribute ) {

						vec3FromBufferAttribute( normalAttribute, i, normal );
						pushDecalVertex( decalVertices, vertex, normal );

					} else {

						pushDecalVertex( decalVertices, vertex );

					}

				}

			}

			// second, clip the geometry so that it doesn't extend out from the projector

			decalVertices = clipGeometry( decalVertices, vec3Set( plane, 1, 0, 0 ) );
			decalVertices = clipGeometry( decalVertices, vec3Set( plane, - 1, 0, 0 ) );
			decalVertices = clipGeometry( decalVertices, vec3Set( plane, 0, 1, 0 ) );
			decalVertices = clipGeometry( decalVertices, vec3Set( plane, 0, - 1, 0 ) );
			decalVertices = clipGeometry( decalVertices, vec3Set( plane, 0, 0, 1 ) );
			decalVertices = clipGeometry( decalVertices, vec3Set( plane, 0, 0, - 1 ) );

			// third, generate final vertices, normals and uvs

			for ( let i = 0; i < decalVertices.length; i ++ ) {

				const decalVertex = decalVertices[ i ];

				// create texture coordinates (we are still in projector space)

				uvs.push(
					0.5 + ( decalVertex.position.x / size.x ),
					0.5 + ( decalVertex.position.y / size.y )
				);

				// transform the vertex back to world space

				vec3ApplyMatrix4( decalVertex.position, projectorMatrix, decalVertex.position );

				// now create vertex and normal buffer data

				vertices.push( decalVertex.position.x, decalVertex.position.y, decalVertex.position.z );

				if ( decalVertex.normal !== null ) {

					normals.push( decalVertex.normal.x, decalVertex.normal.y, decalVertex.normal.z );

				}

			}

		}

		function pushDecalVertex( decalVertices, vertex, normal = null ) {

			// transform the vertex to world space, then to projector space

			vec3ApplyMatrix4( vertex, mesh.matrixWorld, vertex );
			vec3ApplyMatrix4( vertex, projectorMatrixInverse, vertex );

			if ( normal ) {

				vec3ApplyNormalMatrix( normal, normalMatrix, normal );
				decalVertices.push( new DecalVertex( vec3Copy( vertex ), vec3Copy( normal ) ) );

			} else {

				decalVertices.push( new DecalVertex( vec3Copy( vertex ) ) );

			}

		}

		function clipGeometry( inVertices, plane ) {

			const outVertices = [];

			const s = 0.5 * Math.abs( vec3Dot( size, plane ) );

			// a single iteration clips one face,
			// which consists of three consecutive 'DecalVertex' objects

			for ( let i = 0; i < inVertices.length; i += 3 ) {

				let total = 0;
				let nV1;
				let nV2;
				let nV3;
				let nV4;

				const d1 = vec3Dot( inVertices[ i + 0 ].position, plane ) - s;
				const d2 = vec3Dot( inVertices[ i + 1 ].position, plane ) - s;
				const d3 = vec3Dot( inVertices[ i + 2 ].position, plane ) - s;

				const v1Out = d1 > 0;
				const v2Out = d2 > 0;
				const v3Out = d3 > 0;

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

			const d0 = vec3Dot( v0.position, p ) - s;
			const d1 = vec3Dot( v1.position, p ) - s;

			const s0 = d0 / ( d0 - d1 );

			const position = vec3Set(
				vec3Create(),
				v0.position.x + s0 * ( v1.position.x - v0.position.x ),
				v0.position.y + s0 * ( v1.position.y - v0.position.y ),
				v0.position.z + s0 * ( v1.position.z - v0.position.z )
			);

			let normal = null;

			if ( v0.normal !== null && v1.normal !== null ) {

				normal = vec3Set(
					vec3Create(),
					v0.normal.x + s0 * ( v1.normal.x - v0.normal.x ),
					v0.normal.y + s0 * ( v1.normal.y - v0.normal.y ),
					v0.normal.z + s0 * ( v1.normal.z - v0.normal.z )
				);

			}

			const v = new DecalVertex( position, normal );

			// need to clip more values (texture coordinates)? do it this way:
			// intersectpoint.value = a.value + s * ( b.value - a.value );

			return v;

		}

	}

}

// helper

class DecalVertex {

	constructor( position, normal = null ) {

		this.position = position;
		this.normal = normal;

	}

	clone() {

		const position = vec3Copy( this.position );
		const normal = ( this.normal !== null ) ? vec3Copy( this.normal ) : null;

		return new this.constructor( position, normal );

	}

}

export { DecalGeometry, DecalVertex };
