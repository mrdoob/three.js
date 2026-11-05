import {
	AlwaysDepth,
	ArrayCamera,
	BasicShadowMap,
	Box3,
	Compatibility,
	DepthTexture,
	DoubleSide,
	GreaterEqualCompare,
	InstancedMesh,
	LessEqualCompare,
	LinearFilter,
	MathUtils,
	Matrix4,
	NearestFilter,
	NoBlending,
	NodeMaterial,
	OrthographicCamera,
	PerspectiveCamera,
	PlaneGeometry,
	ReadbackBuffer,
	RendererUtils,
	Scene,
	ShadowBaseNode,
	Sphere,
	StorageBufferAttribute,
	UnsignedIntType,
	Vector2,
	Vector3,
	Vector4,
	VSMShadowMap,
	warnOnce
} from 'three/webgpu';

import {
	BasicShadowFilter,
	Break,
	Fn,
	If,
	Loop,
	PCFShadowFilter,
	abs,
	atomicLoad,
	atomicOr,
	atomicStore,
	cameraPosition,
	exp2,
	float,
	instanceIndex,
	instancedArray,
	int,
	log2,
	max,
	mix,
	normalWorld,
	pointShadow,
	positionGeometry,
	reference,
	renderGroup,
	shadow,
	shadowPositionWorld,
	storage,
	texture,
	uint,
	uniform,
	uniformArray,
	vec2,
	vec3,
	vec4,
	viewZToLogarithmicDepth
} from 'three/tsl';

const { resetRendererAndSceneState, restoreRendererAndSceneState } = RendererUtils;

let _rendererState;

const DIRECTIONAL = 0;
const SPOT = 1;
const POINT = 2;

// Point lights: one face for each axis direction, in the order +X, -X, +Y, -Y, +Z, -Z.

const _faceDirections = [
	/*@__PURE__*/ new Vector3( 1, 0, 0 ), /*@__PURE__*/ new Vector3( - 1, 0, 0 ), /*@__PURE__*/ new Vector3( 0, 1, 0 ),
	/*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, 1 ), /*@__PURE__*/ new Vector3( 0, 0, - 1 )
];

const _faceUps = [
	/*@__PURE__*/ new Vector3( 0, 1, 0 ), /*@__PURE__*/ new Vector3( 0, 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, - 1 ),
	/*@__PURE__*/ new Vector3( 0, 0, 1 ), /*@__PURE__*/ new Vector3( 0, 1, 0 ), /*@__PURE__*/ new Vector3( 0, 1, 0 )
];

const _lightPosition = /*@__PURE__*/ new Vector3();
const _targetPosition = /*@__PURE__*/ new Vector3();
const _cameraPosition = /*@__PURE__*/ new Vector3();
const _pageCenter = /*@__PURE__*/ new Vector3();
const _drawingBufferSize = /*@__PURE__*/ new Vector2();
const _lookAt = /*@__PURE__*/ new Matrix4();
const _sphere = /*@__PURE__*/ new Sphere();
const _box = /*@__PURE__*/ new Box3();
const _corner = /*@__PURE__*/ new Vector4();
const _rect = /*@__PURE__*/ new Vector4();
const _versions = [];

/**
 * Computes the world space bounding sphere of an object.
 *
 * @private
 * @param {Object3D} object - The object.
 * @param {Sphere} target - The result.
 * @return {boolean} Whether the object has a bounding sphere.
 */
function getWorldSphere( object, target ) {

	if ( object.isSkinnedMesh === true || object.isInstancedMesh === true || object.isBatchedMesh === true ) {

		object.computeBoundingSphere();
		if ( object.boundingSphere === null ) return false;

		target.copy( object.boundingSphere );

	} else {

		const geometry = object.geometry;
		if ( geometry === undefined ) return false;

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		target.copy( geometry.boundingSphere );

	}

	if ( target.isEmpty() ) return false;

	target.applyMatrix4( object.matrixWorld );

	return true;

}

/**
 * Reads the versions of the data that changes the shape of a shadow caster.
 *
 * @private
 * @param {Object3D} object - The shadow caster.
 * @param {Array<number>} target - The result.
 * @return {Array<number>} The versions.
 */
function readVersions( object, target ) {

	target.length = 0;

	const geometry = object.geometry;

	if ( geometry !== undefined ) {

		const position = geometry.attributes.position;

		target.push( position ? position.version : - 1, geometry.index ? geometry.index.version : - 1 );

	}

	if ( object.isInstancedMesh === true ) target.push( object.instanceMatrix.version, object.count );
	if ( object.morphTargetInfluences !== undefined ) target.push( ...object.morphTargetInfluences );

	return target;

}

/**
 * Whether the versions of a shadow caster changed.
 *
 * @private
 * @param {Object3D} object - The shadow caster.
 * @param {Array<number>} versions - The stored versions.
 * @return {boolean} Whether the versions changed.
 */
function versionsChanged( object, versions ) {

	readVersions( object, _versions );

	if ( _versions.length !== versions.length ) return true;

	for ( let i = 0; i < versions.length; i ++ ) {

		if ( _versions[ i ] !== versions[ i ] ) return true;

	}

	return false;

}

/**
 * Returns the positive remainder of a division.
 *
 * @private
 * @param {number} value - The dividend.
 * @param {number} divisor - The divisor.
 * @return {number} The remainder.
 */
function wrap( value, divisor ) {

	return ( ( value % divisor ) + divisor ) % divisor;

}

/**
 * A shadow node that implements virtual shadow maps for directional, spot and point lights.
 *
 * A virtual shadow map is a very large shadow map that is split into pages. Only the pages
 * that visible surfaces sample are allocated in a smaller physical atlas and rendered.
 * Rendered pages stay in the atlas between frames. A page renders again only when it is new,
 * or when a shadow caster in it moves.
 *
 * - Directional lights use clipmap levels around the camera. Each level covers twice the area of
 * the previous level, with the same number of pages.
 * - Spot lights use a mip chain of the shadow camera frustum. Each level has half the pages of
 * the previous level along each axis.
 * This includes the spot light subclasses `IESSpotLight` and `ProjectorLight`.
 * - Point lights use a mip chain for each of the six cube faces.
 *
 * The lighting shader selects the level that gives about one shadow texel for each screen pixel,
 * and marks the pages it needs in a request buffer. The node reads this buffer back asynchronously,
 * so new pages appear one to three frames later. Until then, the shader uses the next coarser
 * resident level.
 *
 * Requires the WebGPU backend. With the WebGL 2 backend, the node uses the default shadow of the light.
 * `BasicShadowMap` and `PCFShadowMap` are supported. `VSMShadowMap` (variance shadow maps) is not
 * supported, `PCFShadowMap` is used instead.
 *
 * ```js
 * const light = new THREE.DirectionalLight( 0xffffff, 3 );
 * light.castShadow = true;
 * light.shadow.shadowNode = new VirtualShadowNode( light );
 * ```
 *
 * @augments ShadowBaseNode
 * @three_import import { VirtualShadowNode } from 'three/addons/tsl/shadows/VirtualShadowNode.js';
 */
class VirtualShadowNode extends ShadowBaseNode {

	static get type() {

		return 'VirtualShadowNode';

	}

	/**
	 * Constructs a new virtual shadow node.
	 *
	 * @param {DirectionalLight|SpotLight|PointLight} light - The shadow casting light.
	 * @param {Object} [options={}] - The options.
	 * @param {number} [options.pageSize=256] - The size of a page in texels.
	 * @param {number} [options.virtualPages=32] - The number of pages along one axis of a level, a power of two. The virtual resolution is `pageSize * virtualPages`.
	 * @param {number} [options.physicalPages=16] - The number of physical pages along one axis of the atlas.
	 * @param {number} [options.levels=10] - The number of clipmap levels of a directional light. Spot and point lights use `log2( virtualPages ) + 1` mip levels.
	 * @param {number} [options.firstLevelSize] - The world size of the first clipmap level of a directional light. Default is the width of the shadow camera.
	 * @param {number} [options.maxPagesPerFrame=32] - The maximum number of pages that render in one frame.
	 * @param {number} [options.lodBias=0] - Added to the selected level. A positive value selects coarser levels.
	 * @param {number} [options.depthType=UnsignedIntType] - The type of the atlas depth texture.
	 * @param {boolean} [options.autoInvalidate=true] - Whether moved, added or removed shadow casters invalidate their pages automatically.
	 */
	constructor( light, options = {} ) {

		super( light );

		let mode;

		if ( light.isDirectionalLight === true ) mode = DIRECTIONAL;
		else if ( light.isSpotLight === true ) mode = SPOT;
		else if ( light.isPointLight === true ) mode = POINT;
		else throw new Error( 'THREE.VirtualShadowNode: Only directional, spot and point lights are supported.' );

		const virtualPages = options.virtualPages || 32;

		if ( MathUtils.isPowerOfTwo( virtualPages ) === false ) {

			throw new Error( 'THREE.VirtualShadowNode: virtualPages must be a power of two.' );

		}

		const shadowCamera = light.shadow.camera;

		/**
		 * The size of a page in texels.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.pageSize = options.pageSize || 256;

		/**
		 * The number of pages along one axis of a level.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.virtualPages = virtualPages;

		/**
		 * The number of physical pages along one axis of the atlas.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.physicalPages = options.physicalPages || 16;

		/**
		 * The number of levels.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.levels = mode === DIRECTIONAL ? ( options.levels || 10 ) : Math.log2( virtualPages ) + 1;

		/**
		 * The world size of the first clipmap level of a directional light.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.firstLevelSize = options.firstLevelSize || ( shadowCamera.isOrthographicCamera ? shadowCamera.right - shadowCamera.left : 0 );

		/**
		 * The maximum number of pages that render in one frame.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.maxPagesPerFrame = options.maxPagesPerFrame || 32;

		/**
		 * The type of the atlas depth texture.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.depthType = options.depthType || UnsignedIntType;

		/**
		 * Whether moved, added or removed shadow casters invalidate their pages automatically.
		 * This traverses the scene each frame. For large static scenes, set it to `false`
		 * and call {@link VirtualShadowNode#invalidateObject} for the casters that change.
		 * `light.shadow.autoUpdate = false` also stops it, and `light.shadow.needsUpdate = true`
		 * invalidates all pages once.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoInvalidate = options.autoInvalidate !== undefined ? options.autoInvalidate : true;

		/**
		 * Added to the selected level. A positive value selects coarser levels.
		 *
		 * @type {UniformNode<float>}
		 */
		this.lodBias = uniform( options.lodBias || 0 ).setGroup( renderGroup );

		this._showLevels = uniform( 0 ).setGroup( renderGroup );

		/**
		 * Statistics of the last update, for debugging.
		 *
		 * @type {{residentPages: number, renderedPages: number, pendingPages: number, invalidPages: number}}
		 */
		this.stats = { residentPages: 0, renderedPages: 0, pendingPages: 0, invalidPages: 0 };

		/**
		 * The physical atlas. Created in `setup()`.
		 *
		 * @type {?RenderTarget}
		 * @default null
		 */
		this.shadowMap = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVirtualShadowNode = true;

		this._mode = mode;
		this._faces = mode === POINT ? 6 : 1;

		// Page layout: entry = ( ( face * levels + level ) * virtualPages + y ) * virtualPages + x

		this._pagesPerLevel = virtualPages * virtualPages;
		this._entryCount = this._faces * this.levels * this._pagesPerLevel;
		this._requestWords = Math.ceil( this._entryCount / 32 );
		this._slotCount = this.physicalPages * this.physicalPages;
		this._border = 0;
		this._slotSize = 0;

		// Page table: value = physical slot + 1, 0 = not resident. Materials without node properties
		// do not refresh their storage buffers each frame. So the page table uploads with a compute
		// pass, which always refreshes its bindings.

		this._pageTable = new Uint32Array( this._entryCount );
		this._pageTableDirty = true;
		this._atlasNeedsClear = true;
		this._pageTableStaging = new StorageBufferAttribute( this._pageTable, 1 );

		const pageTableAttribute = new StorageBufferAttribute( new Uint32Array( this._entryCount ), 1 );

		this._pageTableNode = storage( pageTableAttribute, 'uint', this._entryCount ).toReadOnly();

		const pageTableTarget = storage( pageTableAttribute, 'uint', this._entryCount );
		const pageTableSource = storage( this._pageTableStaging, 'uint', this._entryCount ).toReadOnly();

		this._uploadPageTableNode = Fn( () => {

			pageTableTarget.element( instanceIndex ).assign( pageTableSource.element( instanceIndex ) );

		} )().compute( this._entryCount );

		// Page requests: one bit for each entry

		this._requestNode = instancedArray( this._requestWords, 'uint' ).toAtomic();

		this._clearRequestsNode = Fn( () => {

			atomicStore( this._requestNode.element( instanceIndex ), uint( 0 ) );

		} )().compute( this._requestWords );

		this._readbackBuffer = new ReadbackBuffer( this._requestWords * 4 );
		this._readbackPending = false;
		this._receivedRequests = null;

		// Physical slots

		this._slotEntry = new Int32Array( this._slotCount ).fill( - 1 );
		this._slotEpoch = new Int32Array( this._slotCount );
		this._slotPageX = new Int32Array( this._slotCount );
		this._slotPageY = new Int32Array( this._slotCount );
		this._epoch = 0;
		this._pendingEntries = new Set();
		this._dirtySlots = new Set();

		// Shadow casters of the last frame: object -> { frameId, matrix, sphere, geometry, versions }

		this._casters = new Map();
		this._casterFrame = 0;

		// Light space. Uniforms of the default object group do not update for materials without
		// node properties, so the uniforms use the render group, as the uniforms of ShadowNode.

		this._lightKey = [];
		this._lightPositionNode = uniform( new Vector3() ).setGroup( renderGroup );
		this._lodScale = uniform( 0 ).setGroup( renderGroup );
		this._lodOffset = uniform( 1 ).setGroup( renderGroup );

		if ( mode === DIRECTIONAL ) {

			this._lightMatrix = uniform( new Matrix4() ).setGroup( renderGroup ); // world to light space, rotation only
			this._lightRotation = new Matrix4(); // light space to world
			this._lightPlane = uniform( 0 ).setGroup( renderGroup ); // light space z of the light position

			this._levelOrigins = [];

			for ( let i = 0; i < this.levels; i ++ ) this._levelOrigins.push( new Vector2() );

			this._levelOriginsNode = uniformArray( this._levelOrigins, 'vec2' ).setGroup( renderGroup );

		} else {

			// Spot lights use the shadow camera. Point lights use one camera for each face.

			this._faceCameras = mode === SPOT ? [ shadowCamera ] : _faceDirections.map( () => new PerspectiveCamera( 90, 1 ) );
			this._faceMatrices = this._faceCameras.map( () => new Matrix4() );
			this._faceMatricesNode = uniformArray( this._faceMatrices, 'mat4' ).setGroup( renderGroup );

		}

		// Page rendering

		this._pageCameras = [];

		for ( let i = 0; i < this.maxPagesPerFrame; i ++ ) {

			const camera = mode === DIRECTIONAL ? new OrthographicCamera() : new PerspectiveCamera();
			camera.viewport = new Vector4();
			camera.layers.mask = 0;
			this._pageCameras.push( camera );

		}

		this._arrayCamera = new ArrayCamera( this._pageCameras );

		// New pages clear with one quad each, as rectangles in normalized device coordinates.

		this._clearRects = [];

		for ( let i = 0; i < this.maxPagesPerFrame; i ++ ) this._clearRects.push( new Vector4() );

		this._clearRectsNode = uniformArray( this._clearRects, 'vec4' );

		const clearMaterial = new NodeMaterial();
		clearMaterial.name = 'VirtualShadowClear';
		clearMaterial.fragmentNode = vec4( 0 ); // transmitted shadows clear to a zero alpha
		clearMaterial.blending = NoBlending;
		clearMaterial.depthFunc = AlwaysDepth;
		clearMaterial.side = DoubleSide;
		clearMaterial.fog = false;
		clearMaterial.lights = false;

		this._clearMesh = new InstancedMesh( new PlaneGeometry( 2, 2 ), clearMaterial, this.maxPagesPerFrame );
		this._clearMesh.frustumCulled = false;

		this._clearScene = new Scene();
		this._clearScene.add( this._clearMesh );
		this._clearCamera = new OrthographicCamera();

		this._atlasShadow = null;
		this._fallbackNode = null;
		this._cameraFrameId = new WeakMap();

	}

	/**
	 * Whether the shadow receivers show the color of the sampled level, for debugging.
	 * Surfaces without a resident page are white.
	 *
	 * @type {boolean}
	 * @default false
	 */
	get showLevels() {

		return this._showLevels.value === 1;

	}

	set showLevels( value ) {

		this._showLevels.value = value ? 1 : 0;

	}

	/**
	 * Marks all pages as invalid. They render again when visible surfaces request them.
	 */
	invalidate() {

		this._pageTable.fill( 0 );
		this._pageTableDirty = true;
		this._atlasNeedsClear = true;
		this._slotEntry.fill( - 1 );
		this._pendingEntries.clear();
		this._dirtySlots.clear();

	}

	/**
	 * Marks the pages that a world space sphere covers as invalid. They render again in the next frames.
	 *
	 * @param {Sphere} sphere - The sphere in world space.
	 */
	invalidateSphere( sphere ) {

		if ( this._mode === DIRECTIONAL ) {

			this._invalidateDirectional( sphere );

		} else {

			for ( let face = 0; face < this._faces; face ++ ) {

				if ( this._getFaceRect( face, sphere, _rect ) ) this._invalidateRect( face, _rect );

			}

		}

	}

	/**
	 * Marks the pages that a shadow caster covers as invalid, at its current position.
	 * If `autoInvalidate` is `false`, call this method before and after a change of the caster.
	 *
	 * @param {Object3D} object - The shadow caster.
	 */
	invalidateObject( object ) {

		if ( getWorldSphere( object, _sphere ) ) this.invalidateSphere( _sphere );

	}

	/**
	 * Marks the resident pages of a directional light that a sphere covers as invalid.
	 *
	 * @private
	 * @param {Sphere} sphere - The sphere in world space.
	 */
	_invalidateDirectional( sphere ) {

		const center = _pageCenter.copy( sphere.center ).applyMatrix4( this._lightMatrix.value );
		const virtualPages = this.virtualPages;

		for ( let level = 0; level < this.levels; level ++ ) {

			const pageWorldSize = this.firstLevelSize * Math.pow( 2, level ) / virtualPages;

			// The border of the neighbor pages also covers the sphere.

			const radius = sphere.radius + pageWorldSize * this._border / this.pageSize;
			const origin = this._levelOrigins[ level ];

			// Page rows go down, light space y goes up.

			const minX = Math.max( Math.floor( ( center.x - radius ) / pageWorldSize ), origin.x );
			const maxX = Math.min( Math.floor( ( center.x + radius ) / pageWorldSize ), origin.x + virtualPages - 1 );
			const minY = Math.max( Math.floor( ( - center.y - radius ) / pageWorldSize ), origin.y );
			const maxY = Math.min( Math.floor( ( - center.y + radius ) / pageWorldSize ), origin.y + virtualPages - 1 );

			for ( let y = minY; y <= maxY; y ++ ) {

				for ( let x = minX; x <= maxX; x ++ ) {

					this._invalidateEntry( this._getEntry( 0, level, wrap( x, virtualPages ), wrap( y, virtualPages ) ) );

				}

			}

		}

	}

	/**
	 * Computes the rectangle that a sphere covers on a face, in texture coordinates.
	 *
	 * @private
	 * @param {number} face - The face.
	 * @param {Sphere} sphere - The sphere in world space.
	 * @param {Vector4} target - The result as ( minU, minV, maxU, maxV ).
	 * @return {boolean} Whether the sphere is on the face.
	 */
	_getFaceRect( face, sphere, target ) {

		const matrix = this._faceMatrices[ face ];

		sphere.getBoundingBox( _box );

		target.set( Infinity, Infinity, - Infinity, - Infinity );

		for ( let i = 0; i < 8; i ++ ) {

			_corner.set(
				i & 1 ? _box.max.x : _box.min.x,
				i & 2 ? _box.max.y : _box.min.y,
				i & 4 ? _box.max.z : _box.min.z,
				1
			).applyMatrix4( matrix );

			// A box behind the light plane can cover any part of the face.

			if ( _corner.w <= 0 ) {

				target.set( 0, 0, 1, 1 );
				return true;

			}

			const u = _corner.x / _corner.w * 0.5 + 0.5;
			const v = 0.5 - _corner.y / _corner.w * 0.5;

			target.x = Math.min( target.x, u );
			target.y = Math.min( target.y, v );
			target.z = Math.max( target.z, u );
			target.w = Math.max( target.w, v );

		}

		if ( target.z < 0 || target.w < 0 || target.x > 1 || target.y > 1 ) return false;

		target.set( Math.max( target.x, 0 ), Math.max( target.y, 0 ), Math.min( target.z, 1 ), Math.min( target.w, 1 ) );

		return true;

	}

	/**
	 * Marks the resident pages of a face in a rectangle as invalid, on all levels.
	 *
	 * @private
	 * @param {number} face - The face.
	 * @param {Vector4} rect - The rectangle as ( minU, minV, maxU, maxV ).
	 */
	_invalidateRect( face, rect ) {

		for ( let level = 0; level < this.levels; level ++ ) {

			const pages = this.virtualPages >> level;

			// The border of the neighbor pages also covers the rectangle.

			const margin = this._border / ( this.pageSize * pages );

			const minX = Math.max( Math.floor( ( rect.x - margin ) * pages ), 0 );
			const maxX = Math.min( Math.floor( ( rect.z + margin ) * pages ), pages - 1 );
			const minY = Math.max( Math.floor( ( rect.y - margin ) * pages ), 0 );
			const maxY = Math.min( Math.floor( ( rect.w + margin ) * pages ), pages - 1 );

			for ( let y = minY; y <= maxY; y ++ ) {

				for ( let x = minX; x <= maxX; x ++ ) {

					this._invalidateEntry( this._getEntry( face, level, x, y ) );

				}

			}

		}

	}

	/**
	 * Marks the page of an entry as invalid, if it is resident.
	 *
	 * @private
	 * @param {number} entry - The entry.
	 */
	_invalidateEntry( entry ) {

		const value = this._pageTable[ entry ];

		if ( value > 0 ) this._dirtySlots.add( value - 1 );

	}

	/**
	 * Returns the page table entry of a page.
	 *
	 * @private
	 * @param {number} face - The face.
	 * @param {number} level - The level.
	 * @param {number} x - The wrapped page column.
	 * @param {number} y - The wrapped page row.
	 * @return {number} The entry.
	 */
	_getEntry( face, level, x, y ) {

		return ( ( face * this.levels + level ) * this.virtualPages + y ) * this.virtualPages + x;

	}

	/**
	 * Creates the physical atlas and the resources for a build.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	_init( builder ) {

		const { renderer } = builder;
		const shadow = this.light.shadow;

		this._disposeAtlas();

		// The border keeps the filter taps inside the page.

		this._border = Math.ceil( shadow.radius ) + 1;
		this._slotSize = this.pageSize + this._border * 2;

		const atlasSize = this._slotSize * this.physicalPages;

		const depthTexture = new DepthTexture( atlasSize, atlasSize, this.depthType );
		depthTexture.name = 'VirtualShadowDepthTexture';
		depthTexture.compareFunction = renderer.reversedDepthBuffer ? GreaterEqualCompare : LessEqualCompare;

		// The color attachment is only sampled for transmitted shadows.

		const count = renderer.shadowMap.transmitted === true ? 1 : 0;

		const shadowMap = builder.createRenderTarget( atlasSize, atlasSize, { count } );
		shadowMap.depthTexture = depthTexture;

		if ( count > 0 ) shadowMap.texture.name = 'VirtualShadowTexture';

		this.shadowMap = shadowMap;

		// The filters read the texel size and the radius from this shadow.

		this._atlasShadow = shadow.clone();
		this._atlasShadow.mapSize.set( atlasSize, atlasSize );

		const rect = this._clearRectsNode.element( instanceIndex );
		const corner = positionGeometry.xy.mul( 0.5 ).add( 0.5 );

		this._clearMesh.material.vertexNode = vec4( mix( rect.xy, rect.zw, corner ), renderer.reversedDepthBuffer ? 0 : 1, 1 );

		const cameras = [ ...this._pageCameras ];

		if ( this._mode !== DIRECTIONAL ) cameras.push( ...this._faceCameras );

		for ( const camera of cameras ) {

			camera.coordinateSystem = renderer.coordinateSystem;
			camera._reversedDepth = renderer.reversedDepthBuffer;
			camera.updateProjectionMatrix();

		}

		this.invalidate();

	}

	/**
	 * Sets up the shadow output node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {?Node} The shadow output node.
	 */
	setup( builder ) {

		const { renderer } = builder;

		if ( renderer.shadowMap.enabled === false ) return;

		if ( renderer.backend.isWebGPUBackend !== true ) {

			warnOnce( 'VirtualShadowNode: Requires the WebGPU backend. The default shadow of the light is used.' );

			if ( this._fallbackNode === null ) this._fallbackNode = this._mode === POINT ? pointShadow( this.light ) : shadow( this.light );

			return this._fallbackNode;

		}

		const shadowType = renderer.shadowMap.type;

		if ( shadowType === VSMShadowMap ) {

			warnOnce( 'VirtualShadowNode: VSMShadowMap is not supported. PCFShadowMap is used.' );

		}

		const transmitted = renderer.shadowMap.transmitted === true;

		if ( this.shadowMap === null || this._border !== Math.ceil( this.light.shadow.radius ) + 1 || ( this.shadowMap.textures.length > 0 ) !== transmitted ) {

			this._init( builder );

		}

		// Hardware-filtered depth comparisons for PCF, as in ShadowNode.

		const filter = shadowType !== BasicShadowMap && renderer.hasCompatibility( Compatibility.TEXTURE_COMPARE ) ? LinearFilter : NearestFilter;
		const depthTexture = this.shadowMap.depthTexture;

		if ( depthTexture.magFilter !== filter ) {

			depthTexture.minFilter = filter;
			depthTexture.magFilter = filter;

			this.shadowMap.dispose();
			this.invalidate();

		}

		const lightShadow = this.light.shadow;
		const filterFn = lightShadow.filterNode || ( shadowType === BasicShadowMap ? BasicShadowFilter : PCFShadowFilter );

		const mode = this._mode;
		const reversedDepth = renderer.reversedDepthBuffer;
		const logarithmicDepth = renderer.logarithmicDepthBuffer;
		const pageSize = this.pageSize;
		const virtualPages = this.virtualPages;
		const physicalPages = this.physicalPages;
		const border = this._border;
		const slotSize = this._slotSize;
		const atlasSize = slotSize * physicalPages;
		const levels = this.levels;

		const bias = lightShadow.biasNode || reference( 'bias', 'float', lightShadow ).setGroup( renderGroup );
		const normalBias = reference( 'normalBias', 'float', lightShadow ).setGroup( renderGroup );
		const intensity = reference( 'intensity', 'float', lightShadow ).setGroup( renderGroup );
		const near = reference( 'near', 'float', lightShadow.camera ).setGroup( renderGroup );
		const far = reference( 'far', 'float', lightShadow.camera ).setGroup( renderGroup );

		const requests = this._requestNode;
		const pageTable = this._pageTableNode;

		const requestPage = ( entry ) => {

			const word = requests.element( entry.shiftRight( 5 ) );
			const bit = uint( 1 ).shiftLeft( entry.bitAnd( 31 ) );

			// A load first avoids most of the atomic writes.

			If( atomicLoad( word ).bitAnd( bit ).equal( 0 ), () => {

				atomicOr( word, bit );

			} );

		};

		return Fn( ( builder ) => {

			this.setupShadowPosition( builder );

			// Level of detail: about one shadow texel for each screen pixel.

			const pixelSize = shadowPositionWorld.sub( cameraPosition ).length().mul( this._lodScale ).add( this._lodOffset );
			const texelSize = mode === DIRECTIONAL ? pixelSize : pixelSize.div( max( shadowPositionWorld.sub( this._lightPositionNode ).length(), 1e-4 ) );
			const lod = log2( texelSize ).add( this.lodBias ).floor().clamp( 0, levels - 1 );

			const position = shadowPositionWorld.add( normalWorld.mul( normalBias ).mul( exp2( lod ) ) );

			// Position on the first level in pages, with rows that go down, and depth.

			let face, firstLevelCoord, depth, viewZ, inFrustum;

			if ( mode === DIRECTIONAL ) {

				const lightPosition = this._lightMatrix.mul( vec4( position, 1 ) ).xyz;

				face = int( 0 );
				firstLevelCoord = vec2( lightPosition.x, lightPosition.y.negate() ).div( this.firstLevelSize / virtualPages );
				viewZ = lightPosition.z.sub( this._lightPlane );
				depth = viewZ.negate().sub( near ).div( far.sub( near ) );
				if ( reversedDepth ) depth = depth.oneMinus();
				inFrustum = viewZ.negate().greaterThanEqual( near ).and( viewZ.negate().lessThanEqual( far ) );

			} else {

				if ( mode === POINT ) {

					// The face of the major axis.

					const direction = position.sub( this._lightPositionNode );
					const absolute = abs( direction );

					face = absolute.x.greaterThanEqual( absolute.y.max( absolute.z ) ).select(
						direction.x.greaterThanEqual( 0 ).select( int( 0 ), int( 1 ) ),
						absolute.y.greaterThanEqual( absolute.z ).select(
							direction.y.greaterThanEqual( 0 ).select( int( 2 ), int( 3 ) ),
							direction.z.greaterThanEqual( 0 ).select( int( 4 ), int( 5 ) )
						)
					);

				} else {

					face = int( 0 );

				}

				const clip = this._faceMatricesNode.element( face ).mul( vec4( position, 1 ) );
				const ndc = clip.xyz.div( clip.w );
				const uv = vec2( ndc.x.mul( 0.5 ).add( 0.5 ), ndc.y.mul( - 0.5 ).add( 0.5 ) );

				firstLevelCoord = uv.mul( virtualPages );
				viewZ = clip.w.negate();
				depth = ndc.z;
				inFrustum = clip.w.greaterThanEqual( near ).and( uv.x.greaterThanEqual( 0 ) ).and( uv.y.greaterThanEqual( 0 ) ).and( uv.x.lessThanEqual( 1 ) ).and( uv.y.lessThanEqual( 1 ) ).and( depth.lessThanEqual( 1 ) );

			}

			// The page render with an array camera, so a logarithmic depth buffer applies to all light types.

			if ( logarithmicDepth ) depth = viewZToLogarithmicDepth( viewZ, near, far );

			const coordZ = reversedDepth ? depth.sub( bias ) : depth.add( bias );

			const found = float( 0 ).toVar( 'virtualShadowFound' );
			const foundLevel = float( 0 ).toVar( 'virtualShadowLevel' );
			const requested = float( 0 ).toVar( 'virtualShadowRequested' );
			const atlasCoord = vec2( 0 ).toVar( 'virtualShadowCoord' );

			const getEntry = ( level, page ) => {

				// Directional pages wrap around, the clipmap levels move with the camera.

				const wrapped = mode === DIRECTIONAL ? page.sub( page.div( virtualPages ).floor().mul( virtualPages ) ) : page;

				return uint( face.mul( levels ).add( level ).mul( virtualPages ).add( int( wrapped.y ) ).mul( virtualPages ).add( int( wrapped.x ) ) );

			};

			const isInLevel = ( level, page ) => {

				const local = mode === DIRECTIONAL ? page.sub( this._levelOriginsNode.element( level ) ) : page;
				const pages = mode === DIRECTIONAL ? float( virtualPages ) : exp2( float( level ).negate() ).mul( virtualPages );

				return local.x.greaterThanEqual( 0 ).and( local.y.greaterThanEqual( 0 ) ).and( local.x.lessThan( pages ) ).and( local.y.lessThan( pages ) );

			};

			// From the selected level to coarser levels, use the first resident page.

			If( inFrustum, () => {

				Loop( { start: int( lod ), end: int( levels ), type: 'int', condition: '<' }, ( { i } ) => {

					const pageCoord = firstLevelCoord.div( exp2( float( i ) ) );
					const page = pageCoord.floor();

					If( isInLevel( i, page ), () => {

						const entry = getEntry( i, page );

						If( requested.equal( 0 ), () => {

							requestPage( entry );
							requested.assign( 1 );

						} );

						const value = pageTable.element( entry );

						If( value.greaterThan( 0 ), () => {

							const slot = value.sub( 1 );
							const slotCoord = vec2( float( slot.mod( physicalPages ) ), float( slot.div( physicalPages ) ) );

							atlasCoord.assign( slotCoord.mul( slotSize ).add( border ).add( pageCoord.fract().mul( pageSize ) ).div( atlasSize ) );
							found.assign( 1 );
							foundLevel.assign( float( i ) );

							Break();

						} );

					} );

				} );

				// The coarsest level is always requested, so a fallback is available.

				const coarsestLevel = int( levels - 1 );
				const coarsestPage = firstLevelCoord.div( exp2( float( levels - 1 ) ) ).floor();

				If( isInLevel( coarsestLevel, coarsestPage ), () => {

					requestPage( getEntry( coarsestLevel, coarsestPage ) );

				} );

			} );

			// Sampled outside of the branches, depth comparisons need uniform control flow.

			const shadowValue = filterFn( { depthTexture, shadowCoord: vec3( atlasCoord, coordZ ), shadow: this._atlasShadow } );
			const visibility = mix( 1, shadowValue, found );

			let shadowOutput;

			if ( transmitted ) {

				// As in ShadowNode. A missing page gives a zero alpha, so no shadow.

				const shadowColor = texture( this.shadowMap.texture, atlasCoord ).level( 0 ).mul( found );

				shadowOutput = mix( 1, visibility.mix( shadowColor.rgb, 1 ), intensity.mul( shadowColor.a ) ).toVar( 'virtualShadowValue' );

			} else {

				shadowOutput = mix( 1, visibility, intensity ).toVar( 'virtualShadowValue' );

			}

			// A hue for each level, white if no page is resident.

			const levelColor = mix( vec3( 1 ), vec3( 0, 0.33, 0.67 ).add( foundLevel.div( levels ) ).mul( Math.PI * 2 ).cos().mul( 0.5 ).add( 0.5 ), found );

			shadowOutput = mix( vec3( shadowOutput ), levelColor.mul( shadowOutput ), this._showLevels );

			if ( builder.material.receivedShadowNode ) {

				shadowOutput = builder.material.receivedShadowNode( shadowOutput );

			}

			return shadowOutput;

		} )();

	}

	/**
	 * Updates the light, the levels and the pages.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		if ( this._fallbackNode !== null || this.shadowMap === null ) return;

		// The node frame is shared, nested renders and computes change it. Read it once.

		const { renderer, scene, camera } = frame;

		if ( camera === null ) return;

		// Do not render shadow maps during precompilation.

		if ( renderer._precompilationState !== null ) return;

		if ( this._cameraFrameId.get( camera ) === frame.frameId ) return;

		this._cameraFrameId.set( camera, frame.frameId );

		this._updateLight();
		this._updateLevels( camera, renderer );

		// As with default shadows: `needsUpdate` renders all pages again, `autoUpdate` follows the casters.

		const lightShadow = this.light.shadow;

		if ( lightShadow.needsUpdate === true ) {

			this.invalidate();
			lightShadow.needsUpdate = false;

		}

		if ( this.autoInvalidate === true && lightShadow.autoUpdate === true ) this._updateCasters( scene );

		this._processRequests();
		this._requestReadback( renderer );

		const pages = this._allocatePages();

		if ( pages.length > 0 ) this._renderPages( renderer, scene, camera, pages );

		if ( this._pageTableDirty === true ) {

			this._pageTableStaging.needsUpdate = true;
			renderer.compute( this._uploadPageTableNode );

			this._pageTableDirty = false;

		}

		this._atlasShadow.radius = this.light.shadow.radius;

		let resident = 0;

		for ( let slot = 0; slot < this._slotCount; slot ++ ) {

			if ( this._slotEntry[ slot ] !== - 1 ) resident ++;

		}

		this.stats.residentPages = resident;
		this.stats.renderedPages = pages.length;
		this.stats.pendingPages = this._pendingEntries.size;
		this.stats.invalidPages = this._dirtySlots.size;

	}

	/**
	 * Updates the light matrices. Invalidates all pages when they change.
	 *
	 * @private
	 */
	_updateLight() {

		const light = this.light;
		const shadowCamera = light.shadow.camera;
		const values = [ shadowCamera.near, shadowCamera.far ];

		light.getWorldPosition( _lightPosition );
		this._lightPositionNode.value.copy( _lightPosition );

		if ( this._mode === DIRECTIONAL ) {

			light.target.getWorldPosition( _targetPosition );

			_lookAt.lookAt( _lightPosition, _targetPosition, light.up );
			this._lightRotation.extractRotation( _lookAt );
			this._lightMatrix.value.copy( this._lightRotation ).transpose();

			// Only the direction and the depth range matter. A move across the light direction keeps the pages.

			this._lightPlane.value = _lightPosition.applyMatrix4( this._lightMatrix.value ).z;

			values.push( ...this._lightMatrix.value.elements, this._lightPlane.value );

		} else if ( this._mode === SPOT ) {

			light.shadow.updateMatrices( light );

			this._faceMatrices[ 0 ].multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );

			values.push( ...this._faceMatrices[ 0 ].elements );

		} else {

			for ( let face = 0; face < 6; face ++ ) {

				const camera = this._faceCameras[ face ];

				camera.near = shadowCamera.near;
				camera.far = shadowCamera.far;
				camera.updateProjectionMatrix();

				camera.position.copy( _lightPosition );
				camera.up.copy( _faceUps[ face ] );
				camera.lookAt( _targetPosition.copy( _lightPosition ).add( _faceDirections[ face ] ) );
				camera.updateMatrixWorld( true );

				this._faceMatrices[ face ].multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

			}

			values.push( _lightPosition.x, _lightPosition.y, _lightPosition.z );

		}

		const key = this._lightKey;
		let changed = key.length !== values.length;

		for ( let i = 0; i < values.length; i ++ ) {

			if ( key[ i ] !== values[ i ] ) {

				key[ i ] = values[ i ];
				changed = true;

			}

		}

		key.length = values.length;

		if ( changed ) this.invalidate();

	}

	/**
	 * Updates the level of detail. For directional lights, centers the clipmap levels on the
	 * camera and frees the pages that left their level.
	 *
	 * @private
	 * @param {Camera} camera - The camera of the current render.
	 * @param {Renderer} renderer - The renderer.
	 */
	_updateLevels( camera, renderer ) {

		const virtualPages = this.virtualPages;
		const virtualSize = virtualPages * this.pageSize;

		// The size of a texel of the first level: in world units for directional lights,
		// for each unit of distance to the light for spot and point lights.

		let firstTexelSize;

		if ( this._mode === DIRECTIONAL ) {

			firstTexelSize = this.firstLevelSize / virtualSize;

			const firstPageSize = this.firstLevelSize / virtualPages;

			camera.getWorldPosition( _cameraPosition ).applyMatrix4( this._lightMatrix.value );

			for ( let level = 0; level < this.levels; level ++ ) {

				const pageWorldSize = firstPageSize * Math.pow( 2, level );

				this._levelOrigins[ level ].set(
					Math.floor( _cameraPosition.x / pageWorldSize ) - virtualPages / 2,
					Math.floor( - _cameraPosition.y / pageWorldSize ) - virtualPages / 2
				);

			}

			// Free the pages outside of their level.

			for ( let slot = 0; slot < this._slotCount; slot ++ ) {

				const entry = this._slotEntry[ slot ];

				if ( entry === - 1 ) continue;

				const origin = this._levelOrigins[ Math.floor( entry / this._pagesPerLevel ) ];
				const x = this._slotPageX[ slot ] - origin.x;
				const y = this._slotPageY[ slot ] - origin.y;

				if ( x < 0 || y < 0 || x >= virtualPages || y >= virtualPages ) this._freeSlot( slot );

			}

		} else {

			const fov = this._faceCameras[ 0 ].getEffectiveFOV();

			firstTexelSize = 2 * Math.tan( MathUtils.DEG2RAD * fov / 2 ) / virtualSize;

		}

		// The size of a screen pixel at a distance from the camera.

		const height = renderer.getDrawingBufferSize( _drawingBufferSize ).y || 1;

		if ( camera.isPerspectiveCamera ) {

			const pixelSize = 2 * Math.tan( MathUtils.DEG2RAD * camera.fov / 2 ) / ( camera.zoom * height );

			this._lodScale.value = pixelSize / firstTexelSize;
			this._lodOffset.value = 0;

		} else if ( camera.isOrthographicCamera ) {

			const pixelSize = ( camera.top - camera.bottom ) / ( camera.zoom * height );

			this._lodScale.value = 0;
			this._lodOffset.value = pixelSize / firstTexelSize;

		} else {

			this._lodScale.value = 0;
			this._lodOffset.value = 1;

		}

	}

	/**
	 * Invalidates the pages of shadow casters that moved, changed, appeared or disappeared since the last frame.
	 *
	 * @private
	 * @param {Scene} scene - The scene of the current render.
	 */
	_updateCasters( scene ) {

		const casters = this._casters;
		const frameId = ++ this._casterFrame;

		scene.traverseVisible( ( object ) => {

			if ( object.castShadow !== true || ( object.isMesh !== true && object.isLine !== true && object.isPoints !== true ) ) return;

			let caster = casters.get( object );

			if ( caster === undefined ) {

				caster = { frameId, matrix: new Matrix4(), sphere: new Sphere(), geometry: null, versions: [] };
				casters.set( object, caster );

				this._updateCaster( object, caster );

				return;

			}

			caster.frameId = frameId;

			if ( object.isSkinnedMesh === true || caster.matrix.equals( object.matrixWorld ) === false || caster.geometry !== object.geometry || versionsChanged( object, caster.versions ) ) {

				this.invalidateSphere( caster.sphere );
				this._updateCaster( object, caster );

			}

		} );

		for ( const [ object, caster ] of casters ) {

			if ( caster.frameId !== frameId ) {

				this.invalidateSphere( caster.sphere );
				casters.delete( object );

			}

		}

	}

	/**
	 * Stores the current state of a shadow caster and invalidates its pages.
	 *
	 * @private
	 * @param {Object3D} object - The shadow caster.
	 * @param {Object} caster - The stored state.
	 */
	_updateCaster( object, caster ) {

		caster.matrix.copy( object.matrixWorld );
		caster.geometry = object.geometry;
		readVersions( object, caster.versions );

		if ( getWorldSphere( object, caster.sphere ) ) {

			this.invalidateSphere( caster.sphere );

		} else {

			caster.sphere.makeEmpty();

		}

	}

	/**
	 * Processes the last request buffer that the GPU returned.
	 *
	 * @private
	 */
	_processRequests() {

		const requests = this._receivedRequests;

		if ( requests === null ) return;

		this._receivedRequests = null;
		this._epoch ++;

		const pageTable = this._pageTable;

		for ( let word = 0; word < requests.length; word ++ ) {

			let bits = requests[ word ];

			while ( bits !== 0 ) {

				const bit = 31 - Math.clz32( bits );
				bits &= ~ ( 1 << bit );

				const entry = word * 32 + bit;

				if ( entry >= this._entryCount ) continue;

				const value = pageTable[ entry ];

				if ( value > 0 ) {

					this._slotEpoch[ value - 1 ] = this._epoch;

				} else {

					this._pendingEntries.add( entry );

				}

			}

		}

	}

	/**
	 * Copies the request buffer to the CPU and clears it. Only one copy is in progress at a time.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 */
	_requestReadback( renderer ) {

		if ( this._readbackPending === true ) return;

		this._readbackPending = true;

		const readbackBuffer = this._readbackBuffer;

		renderer.getArrayBufferAsync( this._requestNode.value, readbackBuffer ).then( () => {

			this._receivedRequests = new Uint32Array( readbackBuffer.buffer ).slice();
			readbackBuffer.release();
			this._readbackPending = false;

		} ).catch( () => {

			this._readbackPending = false;

		} );

		// The copy is already submitted, so the clear runs after it.

		renderer.compute( this._clearRequestsNode );

	}

	/**
	 * Selects the pages to render: invalid pages and new pages, which get physical slots, coarse levels first.
	 *
	 * @private
	 * @return {Array<{entry: number, slot: number}>} The pages to render.
	 */
	_allocatePages() {

		const pages = [];
		const maxPages = this.maxPagesPerFrame;

		// Invalid pages that the last request buffer did not request are freed. Invalid pages and
		// new pages share the budget, so a moving caster does not stop new pages.

		for ( const slot of this._dirtySlots ) {

			if ( this._slotEpoch[ slot ] < this._epoch ) this._freeSlot( slot );

		}

		const dirtyBudget = this._pendingEntries.size > 0 ? Math.ceil( maxPages / 2 ) : maxPages;

		this._renderDirtySlots( pages, dirtyBudget );

		if ( this._pendingEntries.size === 0 ) return pages;

		const virtualPages = this.virtualPages;
		const levels = this.levels;
		const entries = Array.from( this._pendingEntries ).sort( ( a, b ) => this._getLevel( b ) - this._getLevel( a ) );

		for ( const entry of entries ) {

			if ( pages.length >= maxPages ) break;

			const slot = this._findSlot();

			if ( slot === - 1 ) break;

			const index = entry % this._pagesPerLevel;
			const x = index % virtualPages;
			const y = Math.floor( index / virtualPages );

			if ( this._mode === DIRECTIONAL ) {

				// The entry has the wrapped page coordinates. The level origin gives the page.

				const origin = this._levelOrigins[ Math.floor( entry / this._pagesPerLevel ) % levels ];

				this._slotPageX[ slot ] = origin.x + wrap( x - origin.x, virtualPages );
				this._slotPageY[ slot ] = origin.y + wrap( y - origin.y, virtualPages );

			} else {

				this._slotPageX[ slot ] = x;
				this._slotPageY[ slot ] = y;

			}

			this._slotEntry[ slot ] = entry;
			this._slotEpoch[ slot ] = this._epoch;

			this._pageTable[ entry ] = slot + 1;
			this._pendingEntries.delete( entry );

			pages.push( { entry, slot } );

		}

		if ( pages.length > 0 ) this._pageTableDirty = true;

		this._renderDirtySlots( pages, maxPages );

		return pages;

	}

	/**
	 * Adds invalid slots to the pages to render. They render again in place.
	 *
	 * @private
	 * @param {Array<{entry: number, slot: number}>} pages - The pages to render.
	 * @param {number} maxPages - The maximum length of `pages`.
	 */
	_renderDirtySlots( pages, maxPages ) {

		for ( const slot of this._dirtySlots ) {

			if ( pages.length >= maxPages ) break;

			this._dirtySlots.delete( slot );

			pages.push( { entry: this._slotEntry[ slot ], slot } );

		}

	}

	/**
	 * Returns the level of an entry.
	 *
	 * @private
	 * @param {number} entry - The entry.
	 * @return {number} The level.
	 */
	_getLevel( entry ) {

		return Math.floor( entry / this._pagesPerLevel ) % this.levels;

	}

	/**
	 * Returns a free slot, or the least recently requested slot that the last request buffer did not request.
	 *
	 * @private
	 * @return {number} The slot, or `-1` if no slot is available.
	 */
	_findSlot() {

		let candidate = - 1;
		let candidateEpoch = this._epoch;

		for ( let slot = 0; slot < this._slotCount; slot ++ ) {

			if ( this._slotEntry[ slot ] === - 1 ) return slot;

			if ( this._slotEpoch[ slot ] < candidateEpoch ) {

				candidate = slot;
				candidateEpoch = this._slotEpoch[ slot ];

			}

		}

		if ( candidate !== - 1 ) this._freeSlot( candidate );

		return candidate;

	}

	/**
	 * Removes the page of a slot from the page table.
	 *
	 * @private
	 * @param {number} slot - The slot.
	 */
	_freeSlot( slot ) {

		const entry = this._slotEntry[ slot ];

		if ( entry !== - 1 && this._pageTable[ entry ] === slot + 1 ) {

			this._pageTable[ entry ] = 0;
			this._pageTableDirty = true;

		}

		this._slotEntry[ slot ] = - 1;
		this._dirtySlots.delete( slot );

	}

	/**
	 * Sets up the camera of a page.
	 *
	 * @private
	 * @param {Camera} pageCamera - The camera of the page.
	 * @param {number} entry - The entry of the page.
	 * @param {number} slot - The slot of the page.
	 */
	_setupPageCamera( pageCamera, entry, slot ) {

		const level = this._getLevel( entry );
		const border = this._border;
		const pageSize = this.pageSize;
		const x = this._slotPageX[ slot ];
		const y = this._slotPageY[ slot ];
		const shadowCamera = this.light.shadow.camera;

		if ( this._mode === DIRECTIONAL ) {

			const pageWorldSize = this.firstLevelSize * Math.pow( 2, level ) / this.virtualPages;
			const halfSize = pageWorldSize * ( pageSize + border * 2 ) / pageSize / 2;

			// Page rows go down, light space y goes up.

			_pageCenter.set( ( x + 0.5 ) * pageWorldSize, - ( y + 0.5 ) * pageWorldSize, this._lightPlane.value ).applyMatrix4( this._lightRotation );

			pageCamera.position.copy( _pageCenter );
			pageCamera.quaternion.setFromRotationMatrix( this._lightRotation );
			pageCamera.left = - halfSize;
			pageCamera.right = halfSize;
			pageCamera.top = halfSize;
			pageCamera.bottom = - halfSize;
			pageCamera.near = shadowCamera.near;
			pageCamera.far = shadowCamera.far;

		} else {

			// A part of the face camera frustum, with the border.

			const face = Math.floor( entry / ( this.levels * this._pagesPerLevel ) );
			const faceCamera = this._faceCameras[ face ];
			const levelSize = ( this.virtualPages >> level ) * pageSize;

			faceCamera.matrixWorld.decompose( pageCamera.position, pageCamera.quaternion, pageCamera.scale );

			pageCamera.fov = faceCamera.fov;
			pageCamera.aspect = faceCamera.aspect;
			pageCamera.zoom = faceCamera.zoom;
			pageCamera.near = faceCamera.near;
			pageCamera.far = faceCamera.far;
			pageCamera.setViewOffset( levelSize, levelSize, x * pageSize - border, y * pageSize - border, pageSize + border * 2, pageSize + border * 2 );

		}

		pageCamera.updateProjectionMatrix();
		pageCamera.updateMatrixWorld( true );

	}

	/**
	 * Renders pages into their slots of the atlas.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 * @param {Scene} scene - The scene of the current render.
	 * @param {Camera} camera - The camera of the current render.
	 * @param {Array<{entry: number, slot: number}>} pages - The pages to render.
	 */
	_renderPages( renderer, scene, camera, pages ) {

		const light = this.light;
		const shadowCamera = light.shadow.camera;
		const slotSize = this._slotSize;
		const atlasSize = slotSize * this.physicalPages;

		const layers = ( shadowCamera.layers.mask & 0xFFFFFFFE ) === 0 ? camera.layers.mask : shadowCamera.layers.mask;

		for ( let i = 0; i < this._pageCameras.length; i ++ ) {

			const pageCamera = this._pageCameras[ i ];
			const page = pages[ i ];

			// Cameras without layers draw nothing.

			if ( page === undefined ) {

				pageCamera.layers.mask = 0;
				continue;

			}

			this._setupPageCamera( pageCamera, page.entry, page.slot );

			pageCamera.layers.mask = layers;

			const viewport = pageCamera.viewport.set(
				( page.slot % this.physicalPages ) * slotSize,
				Math.floor( page.slot / this.physicalPages ) * slotSize,
				slotSize,
				slotSize
			);

			// Viewports start at the top, normalized device coordinates at the bottom.

			this._clearRects[ i ].set(
				viewport.x / atlasSize * 2 - 1,
				1 - ( viewport.y + viewport.w ) / atlasSize * 2,
				( viewport.x + viewport.z ) / atlasSize * 2 - 1,
				1 - viewport.y / atlasSize * 2
			);

		}

		this._clearMesh.count = pages.length;

		// A logarithmic depth buffer uses the near and far planes of the array camera.

		const arrayCamera = this._arrayCamera;
		arrayCamera.layers.mask = layers;
		arrayCamera.near = shadowCamera.near;
		arrayCamera.far = shadowCamera.far;

		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		_rendererState = resetRendererAndSceneState( renderer, scene, _rendererState );

		// Clear the rendered pages only, the other pages stay valid. After an invalidation, clear all.

		renderer.autoClear = this._atlasNeedsClear;
		renderer.setClearColor( 0x000000, 0 );
		renderer.setRenderTarget( this.shadowMap );
		renderer.render( this._clearScene, this._clearCamera );
		renderer.autoClear = false;

		this._atlasNeedsClear = false;

		scene.overrideMaterial = this.getShadowMaterial();
		renderer.setRenderObjectFunction( this.getShadowRenderObjectFunction( renderer ) );

		const currentMatrixWorldAutoUpdate = scene.matrixWorldAutoUpdate;
		const currentSceneName = scene.name;

		// The scene was already updated by the enclosing render.

		scene.matrixWorldAutoUpdate = false;
		scene.name = `Virtual Shadow Map [ ${ light.name || 'ID: ' + light.id } ]`;

		renderer.render( scene, arrayCamera );

		scene.matrixWorldAutoUpdate = currentMatrixWorldAutoUpdate;
		scene.name = currentSceneName;

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		restoreRendererAndSceneState( renderer, scene, _rendererState );

	}

	/**
	 * Disposes the atlas.
	 *
	 * @private
	 */
	_disposeAtlas() {

		if ( this.shadowMap !== null ) {

			this.shadowMap.dispose();
			this.shadowMap = null;

		}

	}

	/**
	 * Frees the GPU resources of this node.
	 */
	dispose() {

		this._disposeAtlas();
		this.disposeShadowMaterial();

		this._readbackBuffer.dispose();
		this._clearMesh.geometry.dispose();
		this._clearMesh.material.dispose();
		this._casters.clear();

		if ( this._fallbackNode !== null ) {

			this._fallbackNode.dispose();
			this._fallbackNode = null;

		}

		super.dispose();

	}

}

export { VirtualShadowNode };
