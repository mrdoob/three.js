import {
	BufferAttribute,
	DynamicDrawUsage,
	InstancedBufferGeometry,
	Matrix4,
	Mesh,
	NodeMaterial,
	StorageBufferAttribute,
	Vector2,
	Vector3
} from 'three/webgpu';

import {
	Discard,
	Fn,
	If,
	Loop,
	atan,
	atomicAdd,
	atomicLoad,
	atomicStore,
	cameraProjectionMatrix,
	cos,
	dot,
	exp,
	float,
	highpModelViewMatrix,
	instanceIndex,
	max,
	min,
	positionGeometry,
	screenSize,
	sin,
	sqrt,
	storage,
	uint,
	uniform,
	varyingProperty,
	vec2,
	vec3,
	vec4
} from 'three/tsl';

const BIN_COUNT = 4096;
const WORKGROUP_SIZE = 256;
const SORT_DIRECTION_THRESHOLD = 0.9995;
const SORT_POSITION_THRESHOLD = 0.0025;
const KERNEL_2D_SIZE = 0.3;
const MAX_SCREEN_SPACE_SPLAT_SIZE = 1024;
const CLIP_XY = 1.4;

const _worldCenter = /*@__PURE__*/ new Vector3();
const _viewCenter = /*@__PURE__*/ new Vector3();
const _worldScale = /*@__PURE__*/ new Vector3();
const _cameraPosition = /*@__PURE__*/ new Vector3();
const _cameraDirection = /*@__PURE__*/ new Vector3();
const _sortDepthRange = /*@__PURE__*/ new Vector2();

/**
 * A minimal WebGPU/TSL renderer for 3D Gaussian splat data.
 *
 * ```js
 * const splats = new GaussianSplatMesh( data );
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
	 * @param {GaussianSplatData} splatData - The splat data to render.
	 * @param {Object} [options] - Options.
	 * @param {boolean} [options.autoSort=true] - Whether to sort automatically in `onBeforeRender`.
	 */
	constructor( splatData, { autoSort = true } = {} ) {

		const geometry = createGeometry( splatData.count );
		const buffers = createStorageBuffers( splatData );
		const material = createMaterial( buffers );

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
		 * The source splat data.
		 *
		 * @type {GaussianSplatData}
		 */
		this.splatData = splatData;

		/**
		 * Whether to sort automatically in `onBeforeRender`.
		 *
		 * @type {boolean}
		 */
		this.autoSort = autoSort;

		this.frustumCulled = false;

		this._buffers = buffers;
		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );
		this._sortInitialized = false;
		this._lastSortPosition = new Vector3( Infinity, Infinity, Infinity );
		this._lastSortDirection = new Vector3( 0, 0, - 1 );
		this._webGLSortBins = new Uint32Array( splatData.count );
		this._webGLSortCounts = new Uint32Array( BIN_COUNT );
		this._webGLSortOffsets = new Uint32Array( BIN_COUNT );

		createSortNodes( this );

		this.onBeforeRender = ( renderer, scene, camera ) => {

			if ( this.autoSort === true ) {

				this.updateSort( renderer, camera );

			}

		};

	}

	/**
	 * Updates the draw order if the camera has moved enough to need a new sort.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Camera} camera - The camera used for rendering.
	 * @return {boolean} Whether a sort was dispatched this call.
	 */
	updateSort( renderer, camera ) {

		if ( this._sortInitialized === false || this._needsSort( camera ) === true ) {

			this._updateSortUniforms( camera );

			if ( renderer.backend && renderer.backend.isWebGLBackend === true ) {

				enableWebGLBuffers( this._buffers );
				this._sortCPU();

			} else {

				renderer.compute( this._resetHistogramNode );
				renderer.compute( this._histogramNode );
				renderer.compute( this._prefixNode );
				renderer.compute( this._scatterNode );

			}

			this._sortInitialized = true;

			return true;

		}

		return false;

	}

	_needsSort( camera ) {

		_cameraPosition.setFromMatrixPosition( camera.matrixWorld );

		const e = camera.matrixWorld.elements;
		_cameraDirection.set( - e[ 8 ], - e[ 9 ], - e[ 10 ] ).normalize();

		const positionChanged = _cameraPosition.distanceToSquared( this._lastSortPosition ) > SORT_POSITION_THRESHOLD * SORT_POSITION_THRESHOLD;
		const directionChanged = _cameraDirection.dot( this._lastSortDirection ) < SORT_DIRECTION_THRESHOLD;

		if ( positionChanged === true || directionChanged === true ) {

			this._lastSortPosition.copy( _cameraPosition );
			this._lastSortDirection.copy( _cameraDirection );
			return true;

		}

		return false;

	}

	_updateSortUniforms( camera ) {

		this.updateWorldMatrix( true, false );

		this._sortMatrix.value.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		_worldCenter.copy( this.splatData.boundingSphere.center ).applyMatrix4( this.matrixWorld );
		_viewCenter.copy( _worldCenter ).applyMatrix4( camera.matrixWorldInverse );
		this.getWorldScale( _worldScale );

		const radius = this.splatData.boundingSphere.radius * Math.max( _worldScale.x, _worldScale.y, _worldScale.z );
		const depth = - _viewCenter.z;
		const nearDepth = Math.max( camera.near, depth - radius );
		const farDepth = Math.max( nearDepth + 0.0001, depth + radius );

		_sortDepthRange.set( nearDepth, farDepth );
		this._sortDepthRange.value.copy( _sortDepthRange );

	}

	_sortCPU() {

		const buffers = this._buffers;
		const centers = this.splatData.centers;
		const order = buffers.orderAttribute.array;
		const bins = this._webGLSortBins;
		const counts = this._webGLSortCounts;
		const offsets = this._webGLSortOffsets;
		const matrix = this._sortMatrix.value.elements;
		const nearDepth = this._sortDepthRange.value.x;
		const range = Math.max( this._sortDepthRange.value.y - nearDepth, 0.0001 );
		const scale = ( BIN_COUNT - 1 ) / range;

		counts.fill( 0 );

		for ( let i = 0, l = buffers.count; i < l; i ++ ) {

			const i3 = i * 3;
			const depth = - ( matrix[ 2 ] * centers[ i3 ] + matrix[ 6 ] * centers[ i3 + 1 ] + matrix[ 10 ] * centers[ i3 + 2 ] + matrix[ 14 ] );
			const depthBin = Math.min( BIN_COUNT - 1, Math.max( 0, Math.floor( ( depth - nearDepth ) * scale ) ) );
			const bin = BIN_COUNT - 1 - depthBin;

			bins[ i ] = bin;
			counts[ bin ] ++;

		}

		let sum = 0;

		for ( let i = 0; i < BIN_COUNT; i ++ ) {

			offsets[ i ] = sum;
			sum += counts[ i ];

		}

		for ( let i = 0, l = buffers.count; i < l; i ++ ) {

			order[ offsets[ bins[ i ] ] ++ ] = i;

		}

		buffers.orderAttribute.needsUpdate = true;

		if ( buffers.orderAttribute.pbo !== undefined ) {

			buffers.orderAttribute.pbo.needsUpdate = true;

		}

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

function createStorageBuffers( splatData ) {

	const { count, centers, covariances, colors } = splatData;
	const centerData = new Float32Array( count * 4 );
	const covarianceAData = new Float32Array( count * 4 );
	const covarianceBData = new Float32Array( count * 4 );
	const colorData = new Float32Array( count * 4 );
	const orderData = new Uint32Array( count );
	const binData = new Uint32Array( count );

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

		colorData[ i4 ] = colors[ i4 ] / 255;
		colorData[ i4 + 1 ] = colors[ i4 + 1 ] / 255;
		colorData[ i4 + 2 ] = colors[ i4 + 2 ] / 255;
		colorData[ i4 + 3 ] = colors[ i4 + 3 ] / 255;

		orderData[ i ] = i;

	}

	const centerAttribute = new StorageBufferAttribute( centerData, 4 );
	const covarianceAAttribute = new StorageBufferAttribute( covarianceAData, 4 );
	const covarianceBAttribute = new StorageBufferAttribute( covarianceBData, 4 );
	const colorAttribute = new StorageBufferAttribute( colorData, 4 );
	const orderAttribute = new StorageBufferAttribute( orderData, 1, Uint32Array );
	const binAttribute = new StorageBufferAttribute( binData, 1, Uint32Array );
	const histogramAttribute = new StorageBufferAttribute( new Uint32Array( BIN_COUNT ), 1, Uint32Array );
	const offsetAttribute = new StorageBufferAttribute( new Uint32Array( BIN_COUNT ), 1, Uint32Array );

	return {
		count,
		orderAttribute,
		webGLBuffersEnabled: false,
		centerRead: storage( centerAttribute, 'vec4', count ).toReadOnly(),
		covarianceARead: storage( covarianceAAttribute, 'vec4', count ).toReadOnly(),
		covarianceBRead: storage( covarianceBAttribute, 'vec4', count ).toReadOnly(),
		colorRead: storage( colorAttribute, 'vec4', count ).toReadOnly(),
		orderRead: storage( orderAttribute, 'uint', count ).toReadOnly(),
		orderWrite: storage( orderAttribute, 'uint', count ),
		binRead: storage( binAttribute, 'uint', count ).toReadOnly(),
		binWrite: storage( binAttribute, 'uint', count ),
		histogramAtomic: storage( histogramAttribute, 'uint', BIN_COUNT ).toAtomic(),
		offsetAtomic: storage( offsetAttribute, 'uint', BIN_COUNT ).toAtomic()
	};

}

function enableWebGLBuffers( buffers ) {

	if ( buffers.webGLBuffersEnabled === true ) return;

	buffers.orderAttribute.setUsage( DynamicDrawUsage );
	buffers.centerRead.setPBO( true );
	buffers.covarianceARead.setPBO( true );
	buffers.covarianceBRead.setPBO( true );
	buffers.colorRead.setPBO( true );
	buffers.orderRead.setPBO( true );
	buffers.webGLBuffersEnabled = true;

}

function createMaterial( buffers ) {

	const splatUv = varyingProperty( 'vec2', 'vSplatUv' );
	const splatColor = varyingProperty( 'vec4', 'vSplatColor' );

	const vertexNode = Fn( () => {

		const splatIndex = buffers.orderRead.element( instanceIndex ).toVar( 'splatIndex' );
		const center = buffers.centerRead.element( splatIndex ).xyz.toVar( 'center' );
		const covA = buffers.covarianceARead.element( splatIndex ).toVar( 'covA' );
		const covB = buffers.covarianceBRead.element( splatIndex ).toVar( 'covB' );
		const color = buffers.colorRead.element( splatIndex ).toVar( 'splatColor' );

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

		splatColor.assign( vec4( color.rgb, color.a.mul( alphaScale ) ) );

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

	const fragmentNode = Fn( () => {

		const r2 = dot( splatUv, splatUv ).toVar( 'r2' );

		If( r2.greaterThan( 4 ), () => {

			Discard();

		} );

		return vec4( splatColor.rgb, exp( r2.mul( - 0.5 ) ).mul( splatColor.a ) );

	} )();

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

function createSortNodes( mesh ) {

	const { _buffers: buffers } = mesh;
	const sortMatrix = mesh._sortMatrix;
	const sortDepthRange = mesh._sortDepthRange;

	mesh._resetHistogramNode = Fn( () => {

		atomicStore( buffers.histogramAtomic.element( instanceIndex ), uint( 0 ) );
		atomicStore( buffers.offsetAtomic.element( instanceIndex ), uint( 0 ) );

	} )().compute( BIN_COUNT, [ WORKGROUP_SIZE ] ).setName( 'GaussianSplatSortReset' );

	mesh._histogramNode = Fn( () => {

		const center = buffers.centerRead.element( instanceIndex ).xyz.toVar( 'center' );
		const viewCenter = sortMatrix.mul( vec4( center, 1 ) ).xyz.toVar( 'viewCenter' );
		const depth = viewCenter.z.negate().toVar( 'depth' );
		const range = max( sortDepthRange.y.sub( sortDepthRange.x ), 0.0001 ).toVar( 'range' );
		const normalized = depth.sub( sortDepthRange.x ).div( range ).clamp( 0, 1 ).toVar( 'normalized' );
		const depthBin = uint( normalized.mul( BIN_COUNT - 1 ) ).toVar( 'depthBin' );
		const bin = uint( BIN_COUNT - 1 ).sub( depthBin ).toVar( 'bin' );

		buffers.binWrite.element( instanceIndex ).assign( bin );
		atomicAdd( buffers.histogramAtomic.element( bin ), uint( 1 ) );

	} )().compute( buffers.count, [ WORKGROUP_SIZE ] ).setName( 'GaussianSplatSortHistogram' );

	mesh._prefixNode = Fn( () => {

		const sum = uint( 0 ).toVar( 'sum' );

		Loop( { start: 0, end: BIN_COUNT, type: 'uint', name: 'bin', condition: '<' }, ( { bin } ) => {

			const count = atomicLoad( buffers.histogramAtomic.element( bin ) ).toVar( 'count' );
			atomicStore( buffers.offsetAtomic.element( bin ), sum );
			sum.addAssign( count );

		} );

	} )().compute( 1 ).setName( 'GaussianSplatSortPrefix' );

	mesh._scatterNode = Fn( () => {

		const bin = buffers.binRead.element( instanceIndex ).toVar( 'bin' );
		const targetIndex = atomicAdd( buffers.offsetAtomic.element( bin ), uint( 1 ) ).toVar( 'targetIndex' );
		buffers.orderWrite.element( targetIndex ).assign( instanceIndex );

	} )().compute( buffers.count, [ WORKGROUP_SIZE ] ).setName( 'GaussianSplatSortScatter' );

}

export { GaussianSplatMesh };
