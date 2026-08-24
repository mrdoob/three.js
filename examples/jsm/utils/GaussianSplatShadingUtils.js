import {
	BufferAttribute,
	InstancedBufferGeometry,
	Matrix3,
	Matrix4,
	NodeMaterial,
	StorageBufferAttribute,
	Vector3
} from 'three/webgpu';

import {
	Discard,
	Fn,
	If,
	atan,
	cameraProjectionMatrix,
	cos,
	covarianceFromMatrix,
	covarianceToMatrix,
	dot,
	exp,
	float,
	highpModelViewMatrix,
	instanceIndex,
	mat3,
	mat4,
	max,
	min,
	normalize,
	positionGeometry,
	screenSize,
	sin,
	sphericalHarmonicsRadianceBand1,
	sphericalHarmonicsRadianceBand2,
	sphericalHarmonicsRadianceBand3,
	sqrt,
	storage,
	transformCovariance,
	uint,
	unpackUnorm4x8,
	varyingProperty,
	vec2,
	vec3,
	vec4
} from 'three/tsl';

import { SH_BAND_COMPONENTS, SH_BAND_WORDS } from './GaussianSplatUtils.js';

/**
 * Geometry, storage buffers, and NodeMaterial shading shared by
 * {@link GaussianSplat} and {@link GaussianSplatGroup}.
 */

const BIN_COUNT = 4096;
const WORKGROUP_SIZE = 256;
const SORT_DIRECTION_THRESHOLD = 0.9995;
const KERNEL_2D_SIZE = 0.3;
const SPLAT_KERNEL_CUTOFF = 2;
const COVARIANCE_FLATNESS = 1e-4;
const MIN_RAYCAST_OPACITY = 0.2;
const MAX_SCREEN_SPACE_SPLAT_SIZE = 1024;
const CLIP_XY = 1.4;

const _vector = /*@__PURE__*/ new Vector3();
const _covarianceMatrix = /*@__PURE__*/ new Matrix3();
const _originOffset = /*@__PURE__*/ new Vector3();
const _mDirection = /*@__PURE__*/ new Vector3();
const _mOriginOffset = /*@__PURE__*/ new Vector3();

const _modelViewMatrix = /*@__PURE__*/ new Matrix4();
const _sortDirection = /*@__PURE__*/ new Vector3();
const _worldCenter = /*@__PURE__*/ new Vector3();
const _viewCenter = /*@__PURE__*/ new Vector3();
const _worldScale = /*@__PURE__*/ new Vector3();

function packSplatStorage( centerArray, covarianceArray, colorArray, sourceIndex, targetIndex, positions, covariances, colors, recordIndex = 0 ) {

	const source3 = sourceIndex * 3;
	const source4 = sourceIndex * 4;
	const source6 = sourceIndex * 6;
	const target4 = targetIndex * 4;
	const target8 = targetIndex * 8;

	centerArray[ target4 ] = positions[ source3 ];
	centerArray[ target4 + 1 ] = positions[ source3 + 1 ];
	centerArray[ target4 + 2 ] = positions[ source3 + 2 ];
	centerArray[ target4 + 3 ] = recordIndex;

	covarianceArray[ target8 ] = covariances[ source6 ];
	covarianceArray[ target8 + 1 ] = covariances[ source6 + 1 ];
	covarianceArray[ target8 + 2 ] = covariances[ source6 + 2 ];
	covarianceArray[ target8 + 3 ] = covariances[ source6 + 3 ];
	covarianceArray[ target8 + 4 ] = covariances[ source6 + 4 ];
	covarianceArray[ target8 + 5 ] = covariances[ source6 + 5 ];
	covarianceArray[ target8 + 6 ] = 0;
	covarianceArray[ target8 + 7 ] = 0;

	colorArray[ targetIndex ] = ( colors[ source4 ] |
		colors[ source4 + 1 ] << 8 |
		colors[ source4 + 2 ] << 16 |
		colors[ source4 + 3 ] << 24 ) >>> 0;

}

/**
 * Returns whether the camera has turned far enough since the last sort to
 * need a new one.
 *
 * @param {Camera} camera - The camera used for rendering.
 * @param {Matrix4} worldMatrix - The world matrix of the splat cloud or group.
 * @param {Vector3} lastSortDirection - The view direction as of the last sort.
 * @return {boolean} Whether a new sort is needed.
 */
function needsSort( camera, worldMatrix, lastSortDirection ) {

	_modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, worldMatrix );

	const e = _modelViewMatrix.elements;
	_sortDirection.set( e[ 2 ], e[ 6 ], e[ 10 ] ).normalize();

	return _sortDirection.dot( lastSortDirection ) < SORT_DIRECTION_THRESHOLD;

}

/**
 * Stores the view direction of the sort just issued. Call after {@link needsSort}.
 *
 * @param {Vector3} lastSortDirection - Updated in place to the current sort direction.
 */
function updateLastSortDirection( lastSortDirection ) {

	lastSortDirection.copy( _sortDirection );

}

/**
 * Writes the view-space near/far depth of `boundingSphere` into `sortDepthRangeValue` as `( near, far )`.
 *
 * @param {Camera} camera - The camera used for rendering.
 * @param {Matrix4} worldMatrix - The world matrix of the splat cloud or group.
 * @param {Sphere} boundingSphere - The bounding sphere, in local space.
 * @param {Vector2} sortDepthRangeValue - Updated in place with the new depth range.
 */
function updateSortDepthRange( camera, worldMatrix, boundingSphere, sortDepthRangeValue ) {

	_worldCenter.copy( boundingSphere.center ).applyMatrix4( worldMatrix );
	_viewCenter.copy( _worldCenter ).applyMatrix4( camera.matrixWorldInverse );

	_worldScale.setFromMatrixScale( worldMatrix );

	const radius = boundingSphere.radius * Math.max( _worldScale.x, _worldScale.y, _worldScale.z );
	const depth = - _viewCenter.z;
	const nearDepth = Math.max( camera.near, depth - radius );
	const farDepth = Math.max( nearDepth + 0.0001, depth + radius );

	sortDepthRangeValue.set( nearDepth, farDepth );

}

/**
 * Creates the instanced quad drawn once per splat.
 *
 * @param {number} count - The number of splats to draw.
 * @return {InstancedBufferGeometry} The geometry.
 */
function createGeometry( count ) {

	const geometry = new InstancedBufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [
		- 2, - 2, 0,
		2, - 2, 0,
		2, 2, 0,
		- 2, 2, 0
	] ), 3 ) );
	geometry.setIndex( [ 0, 1, 2, 0, 2, 3 ] );
	geometry.instanceCount = count;

	return geometry;

}

/**
 * Packs splat attribute arrays into the GPU storage buffers used for shading.
 *
 * @param {number} count - The number of splats.
 * @param {Float32Array} centers - Splat centers, 3 floats per splat.
 * @param {Float32Array} covariances - Splat covariances, 6 floats per splat (upper triangle).
 * @param {Uint8Array|Uint8ClampedArray} colors - Splat RGBA colors, 4 bytes per splat.
 * @param {Object} [sphericalHarmonics={}] - `{ degree, sh1, sh2, sh3 }`, packed uint32 SH bands.
 * @return {Object} The storage buffer state used by {@link GaussianSplat} and {@link GaussianSplatGroup}.
 */
function createStorageBuffers( count, centers, covariances, colors, sphericalHarmonics = {} ) {

	const centerData = new Float32Array( count * 4 );
	const covarianceData = new Float32Array( count * 8 );
	const colorData = new Uint32Array( count );
	const sphericalHarmonicsDegree = sphericalHarmonics.degree || 0;

	for ( let i = 0; i < count; i ++ ) {

		packSplatStorage( centerData, covarianceData, colorData, i, i, centers, covariances, colors );

	}

	const centerAttribute = new StorageBufferAttribute( centerData, 4 );
	const covarianceAttribute = new StorageBufferAttribute( covarianceData, 4 );
	const colorAttribute = new StorageBufferAttribute( colorData, 1 );

	const buffers = {
		count,
		sphericalHarmonicsDegree,
		webGLBuffersEnabled: false,
		centerRead: storage( centerAttribute, 'vec4', count ).toReadOnly(),
		covarianceRead: storage( covarianceAttribute, 'vec4', count * 2 ).toReadOnly(),
		colorRead: storage( colorAttribute, 'uint', count ).toReadOnly()
	};

	for ( let degree = 1; degree <= sphericalHarmonicsDegree; degree ++ ) {

		const words = SH_BAND_WORDS[ degree ];
		const attribute = new StorageBufferAttribute( sphericalHarmonics[ `sh${ degree }` ], 1 );

		buffers[ `sphericalHarmonics${ degree }Attribute` ] = attribute;
		buffers[ `sphericalHarmonics${ degree }Read` ] = storage( attribute, 'uint', count * words ).toReadOnly();
		buffers[ `sphericalHarmonics${ degree }Words` ] = words;

	}

	return buffers;

}

/**
 * Frees the GPU buffers created by {@link createStorageBuffers}.
 *
 * @param {Object} buffers - A storage buffer state returned by {@link createStorageBuffers}.
 */
function disposeStorageBuffers( buffers ) {

	buffers.centerRead.value.dispose();
	buffers.covarianceRead.value.dispose();
	buffers.colorRead.value.dispose();

	for ( let degree = 1; degree <= buffers.sphericalHarmonicsDegree; degree ++ ) {

		buffers[ `sphericalHarmonics${ degree }Read` ].value.dispose();

	}

	if ( buffers.sphericalHarmonicsContributionRead !== undefined ) {

		buffers.sphericalHarmonicsContributionRead.value.dispose();

	}

}

/**
 * Lazily allocates the buffer that holds one precomputed spherical harmonics
 * RGB contribution per splat (the WebGPU path only - see {@link createSphericalHarmonicsComputeNode}).
 *
 * @param {Object} buffers - A storage buffer state returned by {@link createStorageBuffers}.
 */
function ensureSphericalHarmonicsContributionBuffer( buffers ) {

	if ( buffers.sphericalHarmonicsContributionRead !== undefined ) return;

	// WebGPU stores one precomputed SH contribution per splat. The WebGL
	// fallback evaluates SH in the vertex shader because its transform-feedback
	// compute path cannot perform the packed buffer's indexed reads, so allocate
	// this additional buffer lazily only when the WebGPU pre-pass runs.
	const attribute = new StorageBufferAttribute( new Float32Array( buffers.count * 4 ), 4 );

	buffers.sphericalHarmonicsContributionRead = storage( attribute, 'vec4', buffers.count ).toReadOnly();
	buffers.sphericalHarmonicsContributionWrite = storage( attribute, 'vec4', buffers.count );

}

/**
 * Enables the WebGL-specific storage buffer path (PBO) for a storage buffer state.
 * Only needed when the WebGL backend of {@link WebGPURenderer} is used.
 *
 * @param {Object} buffers - A storage buffer state returned by {@link createStorageBuffers}.
 */
function enableWebGLBuffers( buffers ) {

	if ( buffers.webGLBuffersEnabled === true ) return;

	buffers.centerRead.setPBO( true );
	buffers.covarianceRead.setPBO( true );
	buffers.colorRead.setPBO( true );

	for ( let degree = 1; degree <= buffers.sphericalHarmonicsDegree; degree ++ ) {

		buffers[ `sphericalHarmonics${ degree }Read` ].setPBO( true );

	}

	buffers.webGLBuffersEnabled = true;

}

function unpackSphericalHarmonicsCoefficients( buffer, splatIndex, words, componentCount ) {

	const coefficients = [];
	let remaining = componentCount;

	for ( let word = 0; word < words && remaining > 0; word ++ ) {

		const packed = buffer.element( splatIndex.mul( words ).add( word ) ).toVar();
		const bytesInWord = Math.min( 4, remaining );

		for ( let byteIndex = 0; byteIndex < bytesInWord; byteIndex ++ ) {

			const byte = packed.shiftRight( byteIndex * 8 ).bitAnd( 0xff );
			coefficients.push( float( byte ).sub( 128 ).div( 128 ) );

		}

		remaining -= bytesInWord;

	}

	return coefficients;

}

function assembleSphericalHarmonicsVectors( coefficients, name ) {

	const vectors = [];
	const vectorCount = coefficients.length / 3;

	for ( let i = 0; i < vectorCount; i ++ ) {

		const offset = i * 3;
		vectors.push( vec3(
			coefficients[ offset ],
			coefficients[ offset + 1 ],
			coefficients[ offset + 2 ]
		).toVar( `${ name }${ i }` ) );

	}

	return vectors;

}

/**
 * Adds this splat's view-dependent spherical harmonics contribution to `rgb`, reading
 * band coefficients from `buffers` (a storage buffer state - see {@link createStorageBuffers} -
 * or an equivalent minimal stand-in exposing the same `sphericalHarmonics{1,2,3}Read`/
 * `sphericalHarmonics{1,2,3}Words`/`sphericalHarmonicsDegree` fields).
 *
 * @param {Node<vec3>} rgb - The color accumulator, mutated in place via `.addAssign`.
 * @param {Node<vec3>} center - The splat's center, in the same space as `localCameraPosition`.
 * @param {Node<vec3>} localCameraPosition - The camera position, in the same local space as `center`.
 * @param {Node<uint>} splatIndex - The splat's index into `buffers`.
 * @param {Object} buffers - A storage buffer state, or equivalent stand-in - see above.
 */
function applySphericalHarmonics( rgb, center, localCameraPosition, splatIndex, buffers ) {

	const viewDirection = normalize( center.sub( localCameraPosition ) ).toVar( 'sphericalHarmonicsViewDirection' );
	const sh1 = assembleSphericalHarmonicsVectors(
		unpackSphericalHarmonicsCoefficients(
			buffers.sphericalHarmonics1Read,
			splatIndex,
			buffers.sphericalHarmonics1Words,
			SH_BAND_COMPONENTS[ 1 ]
		),
		'sh1_'
	);

	rgb.addAssign( sphericalHarmonicsRadianceBand1( sh1[ 0 ].negate(), sh1[ 1 ], sh1[ 2 ].negate(), viewDirection ) );

	if ( buffers.sphericalHarmonicsDegree >= 2 ) {

		const sh2 = assembleSphericalHarmonicsVectors(
			unpackSphericalHarmonicsCoefficients(
				buffers.sphericalHarmonics2Read,
				splatIndex,
				buffers.sphericalHarmonics2Words,
				SH_BAND_COMPONENTS[ 2 ]
			),
			'sh2_'
		);

		rgb.addAssign( sphericalHarmonicsRadianceBand2( sh2[ 0 ], sh2[ 1 ].negate(), sh2[ 2 ], sh2[ 3 ].negate(), sh2[ 4 ], viewDirection ) );

		if ( buffers.sphericalHarmonicsDegree >= 3 ) {

			const sh3 = assembleSphericalHarmonicsVectors(
				unpackSphericalHarmonicsCoefficients(
					buffers.sphericalHarmonics3Read,
					splatIndex,
					buffers.sphericalHarmonics3Words,
					SH_BAND_COMPONENTS[ 3 ]
				),
				'sh3_'
			);

			rgb.addAssign( sphericalHarmonicsRadianceBand3( sh3[ 0 ], sh3[ 1 ], sh3[ 2 ], sh3[ 3 ], sh3[ 4 ], sh3[ 5 ], sh3[ 6 ], viewDirection ) );

		}

	}

}

function createLinearMatrix3( row0, row1, row2, name ) {

	return mat3(
		vec3( row0.x, row1.x, row2.x ),
		vec3( row0.y, row1.y, row2.y ),
		vec3( row0.z, row1.z, row2.z )
	).toVar( name );

}

function createAffineMatrix4( row0, row1, row2, name ) {

	return mat4(
		vec4( row0.x, row1.x, row2.x, 0 ),
		vec4( row0.y, row1.y, row2.y, 0 ),
		vec4( row0.z, row1.z, row2.z, 0 ),
		vec4( row0.w, row1.w, row2.w, 1 )
	).toVar( name );

}

function transformPackedCovariance( covA, covB, matrix, name ) {

	const covariance = covarianceToMatrix( covA, covB ).toVar( `${ name }InputCovariance` );
	const transformed = transformCovariance( covariance, matrix ).toVar( `${ name }Covariance` );
	const packed = covarianceFromMatrix( transformed );

	return {
		matrix: transformed,
		covA: packed.covA.toVar( `${ name }CovA` ),
		covB: packed.covB.toVar( `${ name }CovB` )
	};

}

/**
 * Builds the compute kernel that precomputes one SH RGB contribution per splat
 * (the WebGPU path - see {@link ensureSphericalHarmonicsContributionBuffer}).
 * Returns `null` for degree-0 buffers, which have no SH data to precompute.
 *
 * @param {Object} buffers - A storage buffer state returned by {@link createStorageBuffers}.
 * @param {UniformNode<vec3>} localCameraPosition - The camera position, in the same local space as `buffers.centerRead`.
 * @return {?ComputeNode} The compute node, or `null`.
 */
function createSphericalHarmonicsComputeNode( buffers, localCameraPosition ) {

	if ( buffers.sphericalHarmonicsDegree === 0 ) return null;

	return Fn( () => {

		const splatIndex = instanceIndex;
		const center = buffers.centerRead.element( splatIndex ).xyz.toVar( 'center' );
		const rgb = vec3( 0 ).toVar( 'sphericalHarmonicsContribution' );

		applySphericalHarmonics( rgb, center, localCameraPosition, splatIndex, buffers );
		buffers.sphericalHarmonicsContributionWrite.element( splatIndex ).assign( vec4( rgb, 0 ) );

	} )().compute( buffers.count, [ WORKGROUP_SIZE ] ).setName( 'GaussianSplatSphericalHarmonics' );

}

/**
 * Builds the vertex/fragment `NodeMaterial` nodes shared by every splat draw: projects
 * each splat's 3D covariance into a 2D screen-space ellipse (the standard Gaussian
 * splatting rasterization approach) and draws it as an alpha-blended, view-facing quad.
 *
 * @param {Object} buffers - A storage buffer state returned by {@link createStorageBuffers}.
 * @param {CountingSort} sort - The sort whose `orderRead` determines draw order (back-to-front).
 * @param {UniformNode<vec3>} localCameraPosition - The camera position, in the same local space as `buffers.centerRead`. Only read when `usePrecomputedSphericalHarmonics` is `false`.
 * @param {?Object} [recordTransform=null] - Optional per-splat record transform storage used by `GaussianSplatGroup`.
 * @return {{vertexNode: Node, sphericalHarmonicsVertexNode: ?Node, fragmentNode: Node}} The material nodes. `sphericalHarmonicsVertexNode` is `null` for degree-0 buffers.
 */
function createMaterialNodes( buffers, sort, localCameraPosition, recordTransform = null ) {

	const splatUv = varyingProperty( 'vec2', 'vSplatUv' );
	const splatColor = varyingProperty( 'vec4', 'vSplatColor' );

	const createVertexNode = ( usePrecomputedSphericalHarmonics ) => Fn( () => {

		const splatIndex = sort.orderRead.element( instanceIndex ).toVar( 'splatIndex' );
		const covarianceIndex = splatIndex.mul( 2 ).toVar( 'covarianceIndex' );
		const centerRecord = buffers.centerRead.element( splatIndex ).toVar( 'centerRecord' );
		let center = centerRecord.xyz.toVar( 'center' );
		let covA = buffers.covarianceRead.element( covarianceIndex ).toVar( 'covA' );
		let covB = buffers.covarianceRead.element( covarianceIndex.add( 1 ) ).toVar( 'covB' );
		const color = unpackUnorm4x8( buffers.colorRead.element( splatIndex ) ).toVar( 'splatColor' );
		const rgb = color.rgb.toVar( 'splatRgb' );
		let shLocalCameraPosition = localCameraPosition;
		let shCenter = center;

		if ( recordTransform !== null ) {

			const recordIndex = uint( centerRecord.w.add( 0.5 ) ).toVar( 'recordIndex' );
			const recordDataIndex = recordIndex.mul( 4 ).toVar( 'recordDataIndex' );
			const matrix0 = recordTransform.recordDataRead.element( recordDataIndex ).toVar( 'recordMatrix0' );
			const matrix1 = recordTransform.recordDataRead.element( recordDataIndex.add( 1 ) ).toVar( 'recordMatrix1' );
			const matrix2 = recordTransform.recordDataRead.element( recordDataIndex.add( 2 ) ).toVar( 'recordMatrix2' );
			const localCenter = center.toVar( 'localCenter' );
			shCenter = localCenter;
			const recordTransformMatrix = createAffineMatrix4( matrix0, matrix1, matrix2, 'recordTransformMatrix' );
			const recordLinearMatrix = createLinearMatrix3( matrix0.xyz, matrix1.xyz, matrix2.xyz, 'recordLinearMatrix' );
			const transformedCovariance = transformPackedCovariance( covA, covB, recordLinearMatrix, 'record' );

			center = recordTransformMatrix.mul( vec4( localCenter, 1 ) ).xyz.toVar( 'transformedCenter' );
			covA = transformedCovariance.covA;
			covB = transformedCovariance.covB;
			shLocalCameraPosition = recordTransform.recordDataRead.element( recordDataIndex.add( 3 ) ).xyz;

		}

		if ( buffers.sphericalHarmonicsDegree > 0 ) {

			if ( usePrecomputedSphericalHarmonics === true ) {

				rgb.addAssign( buffers.sphericalHarmonicsContributionRead.element( splatIndex ).rgb );

			} else {

				applySphericalHarmonics( rgb, shCenter, shLocalCameraPosition, splatIndex, buffers );

			}

		}

		splatUv.assign( positionGeometry.xy );

		const viewCenter4 = highpModelViewMatrix.mul( vec4( center, 1 ) ).toVar( 'viewCenter4' );
		const viewCenter = viewCenter4.xyz.toVar( 'viewCenter' );
		const centerClip = cameraProjectionMatrix.mul( viewCenter4 ).toVar( 'centerClip' );

		const viewLinearMatrix = mat3( highpModelViewMatrix ).toVar( 'viewLinearMatrix' );
		const viewCovariance = transformPackedCovariance( covA, covB, viewLinearMatrix, 'view' );

		const z = min( viewCenter.z, - 0.01 ).toVar( 'z' );
		const invZ = float( 1 ).div( z ).toVar( 'invZ' );
		const invZ2 = invZ.mul( invZ ).toVar( 'invZ2' );
		const focal = screenSize.mul( 0.5 ).mul( vec2( cameraProjectionMatrix[ 0 ].x, cameraProjectionMatrix[ 1 ].y ) ).toVar( 'focal' );

		const j00 = focal.x.negate().mul( invZ ).toVar( 'j00' );
		const j11 = focal.y.negate().mul( invZ ).toVar( 'j11' );
		const j02 = focal.x.mul( viewCenter.x ).mul( invZ2 ).toVar( 'j02' );
		const j12 = focal.y.mul( viewCenter.y ).mul( invZ2 ).toVar( 'j12' );
		const projectionJacobian = mat3(
			vec3( j00, 0, 0 ),
			vec3( 0, j11, 0 ),
			vec3( j02, j12, 0 )
		).toVar( 'projectionJacobian' );
		const covariance2d = projectionJacobian.mul( viewCovariance.matrix ).mul( projectionJacobian.transpose() ).toVar( 'covariance2d' );
		const aBase = covariance2d[ 0 ].x.toVar( 'cov2dABase' );
		const b = covariance2d[ 1 ].x.toVar( 'cov2dB' );
		const cBase = covariance2d[ 1 ].y.toVar( 'cov2dCBase' );
		const a = aBase.add( KERNEL_2D_SIZE ).toVar( 'cov2dA' );
		const c = cBase.add( KERNEL_2D_SIZE ).toVar( 'cov2dC' );
		const detBase = aBase.mul( cBase ).sub( b.mul( b ) ).toVar( 'detBase' );
		const det = a.mul( c ).sub( b.mul( b ) ).toVar( 'det' );
		const alphaScale = sqrt( max( detBase.div( max( det, 0.000001 ) ), 0 ) ).toVar( 'alphaScale' );

		splatColor.assign( vec4( rgb.clamp( 0, 1 ), color.a.mul( alphaScale ) ) );

		const halfTrace = a.add( c ).mul( 0.5 ).toVar( 'halfTrace' );
		const radius = sqrt( max( a.sub( c ).mul( 0.5 ).pow2().add( b.mul( b ) ), 0.0000001 ) ).toVar( 'radius' );
		const lambda1 = max( halfTrace.add( radius ), 0.0000001 ).toVar( 'lambda1' );
		const lambda2 = max( halfTrace.sub( radius ), 0.0000001 ).toVar( 'lambda2' );
		const axis1 = vec2( 1, 0 ).toVar( 'axis1' );

		If( radius.greaterThan( 0.00001 ), () => {

			const angle = atan( b.mul( 2 ), a.sub( c ) ).mul( 0.5 ).toVar( 'angle' );
			axis1.assign( vec2( cos( angle ), sin( angle ) ) );

		} );

		const axis2 = vec2( axis1.y.negate(), axis1.x ).toVar( 'axis2' );

		const scale1 = min( sqrt( lambda1 ), MAX_SCREEN_SPACE_SPLAT_SIZE ).toVar( 'scale1' );
		const scale2 = min( sqrt( lambda2 ), MAX_SCREEN_SPACE_SPLAT_SIZE ).toVar( 'scale2' );
		const offsetPixels = axis1.mul( positionGeometry.x ).mul( scale1 ).add( axis2.mul( positionGeometry.y ).mul( scale2 ) ).toVar( 'offsetPixels' );
		const offsetNdc = offsetPixels.mul( 2 ).div( screenSize ).toVar( 'offsetNdc' );
		const clip = centerClip.add( vec4( offsetNdc.mul( centerClip.w ), 0, 0 ) ).toVar( 'clip' );

		const clipLimit = centerClip.w.mul( CLIP_XY ).toVar( 'clipLimit' );

		If( viewCenter.z.greaterThanEqual( - 0.01 )
			.or( centerClip.z.lessThan( centerClip.w.negate() ) )
			.or( centerClip.z.greaterThan( centerClip.w ) )
			.or( centerClip.x.lessThan( clipLimit.negate() ) )
			.or( centerClip.x.greaterThan( clipLimit ) )
			.or( centerClip.y.lessThan( clipLimit.negate() ) )
			.or( centerClip.y.greaterThan( clipLimit ) ), () => {

			clip.assign( vec4( 2, 2, 2, 1 ) );

		} );

		return clip;

	} )();

	const vertexNode = createVertexNode( recordTransform === null );
	const sphericalHarmonicsVertexNode = buffers.sphericalHarmonicsDegree > 0 ? createVertexNode( false ) : null;

	const fragmentNode = Fn( () => {

		const r2 = dot( splatUv, splatUv ).toVar( 'r2' );

		If( r2.greaterThan( 4 ), () => {

			Discard();

		} );

		return vec4( splatColor.rgb, exp( r2.mul( - 0.5 ) ).mul( splatColor.a ) );

	} )();

	return { vertexNode, sphericalHarmonicsVertexNode, fragmentNode };

}

/**
 * Builds the shared splat `NodeMaterial`.
 *
 * @param {?Node} vertexNode - The vertex node, or `null` to build a placeholder material (e.g. before any splats exist).
 * @param {?Node} fragmentNode - The fragment (color) node, or `null` for a placeholder material.
 * @return {NodeMaterial} The material.
 */
function createMaterial( vertexNode, fragmentNode ) {

	const material = new NodeMaterial();
	material.vertexNode = vertexNode;
	material.colorNode = fragmentNode;
	material.transparent = true;
	material.depthWrite = false;
	material.depthTest = true;
	material.forceSinglePass = true;
	material.fog = false;

	return material;

}

/**
 * Intersects a ray with the ellipsoid a splat's covariance describes, which reduces to a
 * quadratic in `t` whose smaller root is the near surface. Used by both
 * `GaussianSplat#raycast` and `GaussianSplatGroup#raycast`.
 *
 * @param {BufferAttribute} positionAttribute - The splat centers.
 * @param {BufferAttribute} covarianceAttribute - The splat covariances (upper triangle, 6 components).
 * @param {BufferAttribute} colorAttribute - The splat colors (used for the opacity pre-rejection).
 * @param {number} index - The splat's index.
 * @param {Matrix4} matrixWorld - The world matrix to transform the intersection point by.
 * @param {Ray} localRay - `raycaster.ray`, already transformed into the same local space as `positionAttribute`/`matrixWorld`'s inverse.
 * @param {Raycaster} raycaster - The raycaster.
 * @param {Array<Object>} intersects - The target array intersections are pushed onto.
 * @param {Object3D} object - The object reported on each pushed intersection.
 */
function computeRayIntersection( positionAttribute, covarianceAttribute, colorAttribute, index, matrixWorld, localRay, raycaster, intersects, object ) {

	// skip faint splats - cheapest possible rejection, a single attribute read
	if ( colorAttribute.getW( index ) < MIN_RAYCAST_OPACITY ) {

		return;

	}

	// the diagonal of the covariance bounds the splat's drawn extent (same radius used by
	// computeBoundingBox/computeBoundingSphere); reject rays that don't pass near the splat
	// at all before doing any of the more expensive matrix work below
	const c00 = covarianceAttribute.getComponent( index, 0 );
	const c11 = covarianceAttribute.getComponent( index, 3 );
	const c22 = covarianceAttribute.getComponent( index, 5 );
	const maxVariance = Math.max( c00, c11, c22 );

	if ( maxVariance <= 0 ) {

		return;

	}

	const center = _vector.fromBufferAttribute( positionAttribute, index );
	const boundingRadius = SPLAT_KERNEL_CUTOFF * Math.sqrt( maxVariance );

	if ( localRay.distanceSqToPoint( center ) > boundingRadius * boundingRadius ) {

		return;

	}

	// the attribute holds the upper triangle of the symmetric covariance
	const c01 = covarianceAttribute.getComponent( index, 1 );
	const c02 = covarianceAttribute.getComponent( index, 2 );
	const c12 = covarianceAttribute.getComponent( index, 4 );

	// splats are often flat enough to make the covariance singular, so the thinnest axis is floored
	// relative to the widest to keep the quadratic solvable
	const minVariance = maxVariance * COVARIANCE_FLATNESS;

	_covarianceMatrix.set(
		c00 + minVariance, c01, c02,
		c01, c11 + minVariance, c12,
		c02, c12, c22 + minVariance
	);

	const determinant = _covarianceMatrix.determinant();

	if ( determinant <= 0 ) {

		return;

	}

	// inverse( covariance ), applied below to the ray direction and to the origin offset
	_covarianceMatrix.invert();

	_mDirection.copy( localRay.direction ).applyMatrix3( _covarianceMatrix );

	// squared length of the ray direction in the ellipsoid's metric; must be positive for a valid covariance
	const a = localRay.direction.dot( _mDirection );

	if ( a <= 0 ) {

		return;

	}

	_originOffset.copy( localRay.origin ).sub( center );
	_mOriginOffset.copy( _originOffset ).applyMatrix3( _covarianceMatrix );

	const b = 2 * _originOffset.dot( _mDirection );
	const c = _originOffset.dot( _mOriginOffset ) - SPLAT_KERNEL_CUTOFF * SPLAT_KERNEL_CUTOFF;
	const discriminant = b * b - 4 * a * c;

	if ( discriminant < 0 ) {

		return;

	}

	const sqrtDiscriminant = Math.sqrt( discriminant );
	let t = ( - b - sqrtDiscriminant ) / ( 2 * a );

	// the near surface is behind the origin when the ray starts inside the splat
	if ( t < 0 ) {

		t = ( - b + sqrtDiscriminant ) / ( 2 * a );

	}

	if ( t < 0 ) {

		return;

	}

	const intersectPoint = new Vector3();
	localRay.at( t, intersectPoint ).applyMatrix4( matrixWorld );

	const distance = raycaster.ray.origin.distanceTo( intersectPoint );
	if ( distance < raycaster.near || distance > raycaster.far ) {

		return;

	}

	intersects.push( {

		distance: distance,
		point: intersectPoint,
		index: index,
		face: null,
		faceIndex: null,
		barycoord: null,
		object: object

	} );

}

export {
	BIN_COUNT,
	WORKGROUP_SIZE,
	SORT_DIRECTION_THRESHOLD,
	SPLAT_KERNEL_CUTOFF,
	MIN_RAYCAST_OPACITY,
	createGeometry,
	createMaterial,
	createMaterialNodes,
	createSphericalHarmonicsComputeNode,
	createStorageBuffers,
	disposeStorageBuffers,
	applySphericalHarmonics,
	enableWebGLBuffers,
	ensureSphericalHarmonicsContributionBuffer,
	computeRayIntersection,
	createAffineMatrix4,
	createLinearMatrix3,
	needsSort,
	updateLastSortDirection,
	updateSortDepthRange
};
