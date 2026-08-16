import {
	Box3,
	BufferAttribute,
	InstancedBufferGeometry,
	Matrix4,
	Mesh,
	NodeMaterial,
	Sphere,
	StorageBufferAttribute,
	Vector2,
	Vector3
} from 'three/webgpu';

import {
	Discard,
	Fn,
	If,
	atan,
	cameraProjectionMatrix,
	cos,
	dot,
	exp,
	float,
	highpModelViewMatrix,
	instanceIndex,
	max,
	min,
	normalize,
	positionGeometry,
	screenSize,
	sin,
	sqrt,
	storage,
	uint,
	uniform,
	unpackUnorm4x8,
	varyingProperty,
	vec2,
	vec3,
	vec4
} from 'three/tsl';

import { CountingSort } from '../gpgpu/CountingSort.js';
import {
	SH_BAND_COMPONENTS,
	SH_BAND_WORDS,
	getSphericalHarmonicsDegree
} from '../utils/GaussianSplatUtils.js';

const BIN_COUNT = 4096;
const WORKGROUP_SIZE = 256;
const SORT_DIRECTION_THRESHOLD = 0.9995;
const KERNEL_2D_SIZE = 0.3;
const SPLAT_KERNEL_CUTOFF = 2;
const MAX_SCREEN_SPACE_SPLAT_SIZE = 1024;
const CLIP_XY = 1.4;

const _worldCenter = /*@__PURE__*/ new Vector3();
const _viewCenter = /*@__PURE__*/ new Vector3();
const _worldScale = /*@__PURE__*/ new Vector3();
const _sortDirection = /*@__PURE__*/ new Vector3();
const _sortDepthRange = /*@__PURE__*/ new Vector2();
const _worldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _modelViewMatrix = /*@__PURE__*/ new Matrix4();
const _vector = /*@__PURE__*/ new Vector3();

/**
 * A minimal renderer for 3D Gaussian splat geometry.
 *
 * Note that this class can only be used with {@link WebGPURenderer}. The
 * `forceWebGL` fallback of {@link WebGPURenderer} is supported, but
 * {@link WebGLRenderer} is not. Import maps or package exports must resolve
 * both `three/webgpu` and `three/tsl`.
 *
 * ```js
 * const splats = new GaussianSplatMesh( geometry );
 * scene.add( splats );
 * ```
 *
 * @augments Mesh
 * @three_import import { GaussianSplatMesh } from 'three/addons/objects/GaussianSplatMesh.js';
 */
class GaussianSplatMesh extends Mesh {

	/**
	 * Constructs a new Gaussian splat mesh.
	 *
	 * @param {BufferGeometry} splatGeometry - The splat geometry to render. Higher-order spherical harmonics attributes must use packed `Uint32Array` words from {@link createGaussianSplatGeometry} (`SH_BAND_WORDS[ degree ]` words per splat, four clamped-byte coefficients per word).
	 * @param {Object} [options] - Options.
	 * @param {boolean} [options.autoSort=true] - Whether to sort automatically in `onBeforeRender`.
	 */
	constructor( splatGeometry, { autoSort = true } = {} ) {

		const positionAttribute = splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = splatGeometry.getAttribute( 'covariance' );
		const colorAttribute = splatGeometry.getAttribute( 'color' );
		const sphericalHarmonicsDegree = getSphericalHarmonicsDegree( splatGeometry );
		const count = positionAttribute.count;

		if ( splatGeometry.boundingBox === null ) splatGeometry.computeBoundingBox();
		if ( splatGeometry.boundingSphere === null ) splatGeometry.computeBoundingSphere();

		const geometry = createGeometry( count );
		const buffers = createStorageBuffers( count, positionAttribute.array, covarianceAttribute.array, colorAttribute.array, {
			degree: sphericalHarmonicsDegree,
			sh1: sphericalHarmonicsDegree >= 1 ? splatGeometry.getAttribute( 'sphericalHarmonics1' ).array : undefined,
			sh2: sphericalHarmonicsDegree >= 2 ? splatGeometry.getAttribute( 'sphericalHarmonics2' ).array : undefined,
			sh3: sphericalHarmonicsDegree >= 3 ? splatGeometry.getAttribute( 'sphericalHarmonics3' ).array : undefined
		} );
		const localCameraPosition = uniform( new Vector3() );
		const sphericalHarmonicsComputeNode = createSphericalHarmonicsComputeNode( buffers, localCameraPosition );
		const sort = new CountingSort( count, { binCount: BIN_COUNT, workgroupSize: WORKGROUP_SIZE } );
		const materialNodes = createMaterialNodes( buffers, sort, localCameraPosition );
		const material = createMaterial( materialNodes.vertexNode, materialNodes.fragmentNode );

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isGaussianSplatMesh = true;

		this.type = 'GaussianSplatMesh';

		/**
		 * The source splat geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.splatGeometry = splatGeometry;

		/**
		 * The bounding box of the splats. Can be computed via {@link GaussianSplatMesh#computeBoundingBox}.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * The bounding sphere of the splats. Can be computed via {@link GaussianSplatMesh#computeBoundingSphere}.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

		/**
		 * Whether to sort automatically in `onBeforeRender`.
		 *
		 * @type {boolean}
		 */
		this.autoSort = autoSort;

		this._buffers = buffers;
		this._sort = sort;
		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );
		this._sortInitialized = false;
		this._lastSortDirection = new Vector3();
		this._localCameraPosition = localCameraPosition;
		this._sphericalHarmonicsComputeNode = sphericalHarmonicsComputeNode;
		this._sphericalHarmonicsInitialized = false;
		this._lastSphericalHarmonicsCameraMatrix = new Matrix4();
		this._lastSphericalHarmonicsWorldMatrix = new Matrix4();
		this._sphericalHarmonicsVertexNode = materialNodes.sphericalHarmonicsVertexNode;
		this._precomputedSphericalHarmonicsVertexNode = materialNodes.vertexNode;
		this._positionAttribute = positionAttribute;

		const centerRead = buffers.centerRead;
		const sortMatrix = this._sortMatrix;
		const sortDepthRange = this._sortDepthRange;

		sort.setBinNode( () => {

			const center = centerRead.element( instanceIndex ).xyz.toVar( 'center' );
			const viewCenter = sortMatrix.mul( vec4( center, 1 ) ).xyz.toVar( 'viewCenter' );
			const depth = viewCenter.z.negate().toVar( 'depth' );
			const range = max( sortDepthRange.y.sub( sortDepthRange.x ), 0.0001 ).toVar( 'range' );
			const normalized = depth.sub( sortDepthRange.x ).div( range ).clamp( 0, 1 ).toVar( 'normalized' );
			const depthBin = uint( normalized.mul( BIN_COUNT - 1 ) ).toVar( 'depthBin' );

			return uint( BIN_COUNT - 1 ).sub( depthBin );

		} );

		this.onBeforeRender = ( renderer, scene, camera ) => {

			const vertexNode = renderer.backend && renderer.backend.isWebGLBackend === true ?
				this._sphericalHarmonicsVertexNode :
				this._precomputedSphericalHarmonicsVertexNode;

			if ( vertexNode !== null && material.vertexNode !== vertexNode ) {

				material.vertexNode = vertexNode;
				material.needsUpdate = true;

			}

			this.updateSphericalHarmonics( renderer, camera );

			if ( this.autoSort === true ) {

				this.updateSort( renderer, camera );

			}

		};

	}

	/**
	 * Updates the view-dependent spherical harmonics colors if the camera or
	 * mesh transform has changed.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Camera} camera - The camera used for rendering.
	 * @return {boolean} Whether a compute pass was dispatched this call.
	 */
	updateSphericalHarmonics( renderer, camera ) {

		if ( this._sphericalHarmonicsComputeNode === null ) return false;

		const isWebGLBackend = renderer.backend && renderer.backend.isWebGLBackend === true;

		if ( this._sphericalHarmonicsInitialized === true &&
			camera.matrixWorld.equals( this._lastSphericalHarmonicsCameraMatrix ) &&
			this.matrixWorld.equals( this._lastSphericalHarmonicsWorldMatrix ) &&
			( isWebGLBackend === true || this._buffers.sphericalHarmonicsContributionRead !== undefined ) ) {

			return false;

		}

		if ( isWebGLBackend === true ) {

			enableWebGLBuffers( this._buffers );

		}

		_worldMatrixInverse.copy( this.matrixWorld ).invert();
		this._localCameraPosition.value.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _worldMatrixInverse );

		this._lastSphericalHarmonicsCameraMatrix.copy( camera.matrixWorld );
		this._lastSphericalHarmonicsWorldMatrix.copy( this.matrixWorld );
		this._sphericalHarmonicsInitialized = true;

		if ( isWebGLBackend === true ) return false;

		ensureSphericalHarmonicsContributionBuffer( this._buffers );
		renderer.compute( this._sphericalHarmonicsComputeNode );

		return true;

	}

	/**
	 * Computes the bounding box of the splats, updating {@link GaussianSplatMesh#boundingBox}.
	 *
	 * Each splat is expanded by its own extent rather than treated as a point, so the bounds cover
	 * what is drawn.
	 */
	computeBoundingBox() {

		if ( this.boundingBox === null ) this.boundingBox = new Box3();

		this.boundingBox.makeEmpty();

		const positionAttribute = this.splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = this.splatGeometry.getAttribute( 'covariance' );
		const count = positionAttribute.count;

		for ( let i = 0; i < count; i ++ ) {

			const x = positionAttribute.getX( i );
			const y = positionAttribute.getY( i );
			const z = positionAttribute.getZ( i );

			const c00 = covarianceAttribute.getComponent( i, 0 );
			const c11 = covarianceAttribute.getComponent( i, 3 );
			const c22 = covarianceAttribute.getComponent( i, 5 );

			// the radius of the drawn largest extent
			const radius = SPLAT_KERNEL_CUTOFF * Math.sqrt( Math.max( c00, c11, c22 ) );

			this.boundingBox.expandByPoint( _vector.set( x - radius, y - radius, z - radius ) );
			this.boundingBox.expandByPoint( _vector.set( x + radius, y + radius, z + radius ) );

		}

	}

	/**
	 * Computes the bounding sphere of the splats, updating {@link GaussianSplatMesh#boundingSphere}.
	 *
	 * Each splat is expanded by its own extent rather than treated as a point, so the bounds cover
	 * what is drawn.
	 */
	computeBoundingSphere() {

		if ( this.boundingSphere === null ) this.boundingSphere = new Sphere();

		this.computeBoundingBox();
		this.boundingBox.getBoundingSphere( this.boundingSphere );

		const positionAttribute = this.splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = this.splatGeometry.getAttribute( 'covariance' );
		const count = positionAttribute.count;
		const center = this.boundingSphere.center;

		let maxRadius = 0;

		for ( let i = 0; i < count; i ++ ) {

			const x = positionAttribute.getX( i );
			const y = positionAttribute.getY( i );
			const z = positionAttribute.getZ( i );

			const c00 = covarianceAttribute.getComponent( i, 0 );
			const c11 = covarianceAttribute.getComponent( i, 3 );
			const c22 = covarianceAttribute.getComponent( i, 5 );

			// the radius of the drawn largest extent
			const radius = SPLAT_KERNEL_CUTOFF * Math.sqrt( Math.max( c00, c11, c22 ) );

			maxRadius = Math.max( maxRadius, center.distanceTo( _vector.set( x, y, z ) ) + radius );

		}

		this.boundingSphere.radius = maxRadius;

	}

	/**
	 * Updates the draw order if the camera or mesh orientation has changed enough
	 * to need a new sort.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Camera} camera - The camera used for rendering.
	 * @return {boolean} Whether a sort was dispatched this call.
	 */
	updateSort( renderer, camera ) {

		this.updateWorldMatrix( true, false );

		const needsSort = this._needsSort( camera );

		if ( this._sortInitialized === false || needsSort === true ) {

			this._updateSortUniforms( camera );

			if ( renderer.backend && renderer.backend.isWebGLBackend === true ) {

				enableWebGLBuffers( this._buffers );
				this._sort.enableWebGLBuffers();
				this._sortCPU();

			} else {

				this._sort.compute( renderer );

			}

			this._sortInitialized = true;
			this._lastSortDirection.copy( _sortDirection );

			return true;

		}

		return false;

	}

	_needsSort( camera ) {

		_modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		const e = _modelViewMatrix.elements;
		_sortDirection.set( e[ 2 ], e[ 6 ], e[ 10 ] ).normalize();

		return _sortDirection.dot( this._lastSortDirection ) < SORT_DIRECTION_THRESHOLD;

	}

	_updateSortUniforms( camera ) {

		this._sortMatrix.value.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_worldCenter.copy( this.boundingSphere.center ).applyMatrix4( this.matrixWorld );
		_viewCenter.copy( _worldCenter ).applyMatrix4( camera.matrixWorldInverse );

		_worldScale.setFromMatrixScale( this.matrixWorld );

		const radius = this.boundingSphere.radius * Math.max( _worldScale.x, _worldScale.y, _worldScale.z );
		const depth = - _viewCenter.z;
		const nearDepth = Math.max( camera.near, depth - radius );
		const farDepth = Math.max( nearDepth + 0.0001, depth + radius );

		_sortDepthRange.set( nearDepth, farDepth );
		this._sortDepthRange.value.copy( _sortDepthRange );

	}

	_sortCPU() {

		const centers = this._positionAttribute.array;
		const matrix = this._sortMatrix.value.elements;
		const nearDepth = this._sortDepthRange.value.x;
		const range = Math.max( this._sortDepthRange.value.y - nearDepth, 0.0001 );
		const scale = ( BIN_COUNT - 1 ) / range;

		this._sort.computeCPU( ( i ) => {

			const i3 = i * 3;
			const depth = - ( matrix[ 2 ] * centers[ i3 ] + matrix[ 6 ] * centers[ i3 + 1 ] + matrix[ 10 ] * centers[ i3 + 2 ] + matrix[ 14 ] );
			const depthBin = Math.min( BIN_COUNT - 1, Math.max( 0, Math.floor( ( depth - nearDepth ) * scale ) ) );

			return BIN_COUNT - 1 - depthBin;

		} );

	}

}

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

function createStorageBuffers( count, centers, covariances, colors, sphericalHarmonics ) {

	const centerData = new Float32Array( count * 4 );
	const covarianceAData = new Float32Array( count * 4 );
	const covarianceBData = new Float32Array( count * 4 );
	const colorData = new Uint32Array( count );
	const sphericalHarmonicsDegree = sphericalHarmonics.degree;

	for ( let i = 0; i < count; i ++ ) {

		const i3 = i * 3;
		const i4 = i * 4;
		const i6 = i * 6;

		centerData[ i4 ] = centers[ i3 ];
		centerData[ i4 + 1 ] = centers[ i3 + 1 ];
		centerData[ i4 + 2 ] = centers[ i3 + 2 ];

		covarianceAData[ i4 ] = covariances[ i6 ];
		covarianceAData[ i4 + 1 ] = covariances[ i6 + 1 ];
		covarianceAData[ i4 + 2 ] = covariances[ i6 + 2 ];
		covarianceAData[ i4 + 3 ] = covariances[ i6 + 3 ];

		covarianceBData[ i4 ] = covariances[ i6 + 4 ];
		covarianceBData[ i4 + 1 ] = covariances[ i6 + 5 ];

		colorData[ i ] = ( colors[ i4 ] |
			colors[ i4 + 1 ] << 8 |
			colors[ i4 + 2 ] << 16 |
			colors[ i4 + 3 ] << 24 ) >>> 0;

	}

	const centerAttribute = new StorageBufferAttribute( centerData, 4 );
	const covarianceAAttribute = new StorageBufferAttribute( covarianceAData, 4 );
	const covarianceBAttribute = new StorageBufferAttribute( covarianceBData, 4 );
	const colorAttribute = new StorageBufferAttribute( colorData, 1 );

	const buffers = {
		count,
		sphericalHarmonicsDegree,
		webGLBuffersEnabled: false,
		centerRead: storage( centerAttribute, 'vec4', count ).toReadOnly(),
		covarianceARead: storage( covarianceAAttribute, 'vec4', count ).toReadOnly(),
		covarianceBRead: storage( covarianceBAttribute, 'vec4', count ).toReadOnly(),
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

function enableWebGLBuffers( buffers ) {

	if ( buffers.webGLBuffersEnabled === true ) return;

	buffers.centerRead.setPBO( true );
	buffers.covarianceARead.setPBO( true );
	buffers.covarianceBRead.setPBO( true );
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

function accumulateSphericalHarmonics( vectors, weights ) {

	let result = vectors[ 0 ].mul( weights[ 0 ] );

	for ( let i = 1; i < vectors.length; i ++ ) {

		result = result.add( vectors[ i ].mul( weights[ i ] ) );

	}

	return result;

}

function applySphericalHarmonicsBand( buffer, splatIndex, words, componentCount, name, weights ) {

	const coefficients = unpackSphericalHarmonicsCoefficients( buffer, splatIndex, words, componentCount );
	const vectors = assembleSphericalHarmonicsVectors( coefficients, name );

	return accumulateSphericalHarmonics( vectors, weights );

}

function applySphericalHarmonics( rgb, center, localCameraPosition, splatIndex, buffers ) {

	const viewDirection = normalize( center.sub( localCameraPosition ) ).toVar( 'sphericalHarmonicsViewDirection' );
	const x = viewDirection.x;
	const y = viewDirection.y;
	const z = viewDirection.z;

	rgb.addAssign( applySphericalHarmonicsBand(
		buffers.sphericalHarmonics1Read,
		splatIndex,
		buffers.sphericalHarmonics1Words,
		SH_BAND_COMPONENTS[ 1 ],
		'sh1_',
		[
			y.mul( - 0.4886025 ),
			z.mul( 0.4886025 ),
			x.mul( - 0.4886025 )
		]
	) );

	if ( buffers.sphericalHarmonicsDegree >= 2 ) {

		const xx = x.mul( x ).toVar( 'shXX' );
		const yy = y.mul( y ).toVar( 'shYY' );
		const zz = z.mul( z ).toVar( 'shZZ' );

		rgb.addAssign( applySphericalHarmonicsBand(
			buffers.sphericalHarmonics2Read,
			splatIndex,
			buffers.sphericalHarmonics2Words,
			SH_BAND_COMPONENTS[ 2 ],
			'sh2_',
			[
				x.mul( y ).mul( 1.0925484 ),
				y.mul( z ).mul( - 1.0925484 ),
				zz.mul( 2 ).sub( xx ).sub( yy ).mul( 0.3153915 ),
				x.mul( z ).mul( - 1.0925484 ),
				xx.sub( yy ).mul( 0.5462742 )
			]
		) );

		if ( buffers.sphericalHarmonicsDegree >= 3 ) {

			const xy = x.mul( y ).toVar( 'shXY' );

			rgb.addAssign( applySphericalHarmonicsBand(
				buffers.sphericalHarmonics3Read,
				splatIndex,
				buffers.sphericalHarmonics3Words,
				SH_BAND_COMPONENTS[ 3 ],
				'sh3_',
				[
					y.mul( xx.mul( 3 ).sub( yy ) ).mul( - 0.5900436 ),
					xy.mul( z ).mul( 2.8906114 ),
					y.mul( zz.mul( 4 ).sub( xx ).sub( yy ) ).mul( - 0.4570458 ),
					z.mul( zz.mul( 2 ).sub( xx.mul( 3 ) ).sub( yy.mul( 3 ) ) ).mul( 0.3731763 ),
					x.mul( zz.mul( 4 ).sub( xx ).sub( yy ) ).mul( - 0.4570458 ),
					z.mul( xx.sub( yy ) ).mul( 1.4453057 ),
					x.mul( xx.sub( yy.mul( 3 ) ) ).mul( - 0.5900436 )
				]
			) );

		}

	}

}

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

function createMaterialNodes( buffers, sort, localCameraPosition ) {

	const splatUv = varyingProperty( 'vec2', 'vSplatUv' );
	const splatColor = varyingProperty( 'vec4', 'vSplatColor' );

	const createVertexNode = ( usePrecomputedSphericalHarmonics ) => Fn( () => {

		const splatIndex = sort.orderRead.element( instanceIndex ).toVar( 'splatIndex' );
		const center = buffers.centerRead.element( splatIndex ).xyz.toVar( 'center' );
		const covA = buffers.covarianceARead.element( splatIndex ).toVar( 'covA' );
		const covB = buffers.covarianceBRead.element( splatIndex ).toVar( 'covB' );
		const color = unpackUnorm4x8( buffers.colorRead.element( splatIndex ) ).toVar( 'splatColor' );
		const rgb = color.rgb.toVar( 'splatRgb' );

		if ( buffers.sphericalHarmonicsDegree > 0 ) {

			if ( usePrecomputedSphericalHarmonics === true ) {

				rgb.addAssign( buffers.sphericalHarmonicsContributionRead.element( splatIndex ).rgb );

			} else {

				applySphericalHarmonics( rgb, center, localCameraPosition, splatIndex, buffers );

			}

		}

		splatUv.assign( positionGeometry.xy );

		const viewCenter4 = highpModelViewMatrix.mul( vec4( center, 1 ) ).toVar( 'viewCenter4' );
		const viewCenter = viewCenter4.xyz.toVar( 'viewCenter' );
		const centerClip = cameraProjectionMatrix.mul( viewCenter4 ).toVar( 'centerClip' );

		const m = highpModelViewMatrix;
		const r0 = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x ).toVar( 'r0' );
		const r1 = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y ).toVar( 'r1' );
		const r2 = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z ).toVar( 'r2' );

		const cov0 = vec3( covA.x, covA.y, covA.z ).toVar( 'cov0' );
		const cov1 = vec3( covA.y, covA.w, covB.x ).toVar( 'cov1' );
		const cov2 = vec3( covA.z, covB.x, covB.y ).toVar( 'cov2' );

		const vc0 = vec3( dot( r0, cov0 ), dot( r0, cov1 ), dot( r0, cov2 ) ).toVar( 'vc0' );
		const vc1 = vec3( dot( r1, cov0 ), dot( r1, cov1 ), dot( r1, cov2 ) ).toVar( 'vc1' );
		const vc2 = vec3( dot( r2, cov0 ), dot( r2, cov1 ), dot( r2, cov2 ) ).toVar( 'vc2' );

		const c00 = dot( vc0, r0 ).toVar( 'c00' );
		const c01 = dot( vc0, r1 ).toVar( 'c01' );
		const c02 = dot( vc0, r2 ).toVar( 'c02' );
		const c11 = dot( vc1, r1 ).toVar( 'c11' );
		const c12 = dot( vc1, r2 ).toVar( 'c12' );
		const c22 = dot( vc2, r2 ).toVar( 'c22' );

		const z = min( viewCenter.z, - 0.01 ).toVar( 'z' );
		const invZ = float( 1 ).div( z ).toVar( 'invZ' );
		const invZ2 = invZ.mul( invZ ).toVar( 'invZ2' );
		const focal = screenSize.mul( 0.5 ).mul( vec2( cameraProjectionMatrix[ 0 ].x, cameraProjectionMatrix[ 1 ].y ) ).toVar( 'focal' );

		const j00 = focal.x.negate().mul( invZ ).toVar( 'j00' );
		const j11 = focal.y.negate().mul( invZ ).toVar( 'j11' );
		const j02 = focal.x.mul( viewCenter.x ).mul( invZ2 ).toVar( 'j02' );
		const j12 = focal.y.mul( viewCenter.y ).mul( invZ2 ).toVar( 'j12' );

		const aBase = j00.mul( j00 ).mul( c00 )
			.add( j00.mul( j02 ).mul( c02 ).mul( 2 ) )
			.add( j02.mul( j02 ).mul( c22 ) )
			.toVar( 'cov2dABase' );
		const b = j00.mul( j11 ).mul( c01 )
			.add( j00.mul( j12 ).mul( c02 ) )
			.add( j02.mul( j11 ).mul( c12 ) )
			.add( j02.mul( j12 ).mul( c22 ) )
			.toVar( 'cov2dB' );
		const cBase = j11.mul( j11 ).mul( c11 )
			.add( j11.mul( j12 ).mul( c12 ).mul( 2 ) )
			.add( j12.mul( j12 ).mul( c22 ) )
			.toVar( 'cov2dCBase' );
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

	const vertexNode = createVertexNode( true );
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

export { GaussianSplatMesh };
