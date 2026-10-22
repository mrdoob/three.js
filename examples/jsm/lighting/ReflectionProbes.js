import {
	Box3,
	CubeArrayTexture,
	CubeReflectionMapping,
	HalfFloatType,
	LinearMipmapLinearFilter,
	MathUtils,
	Object3D,
	PMREMGenerator,
	RenderTarget,
	Scene,
	Vector3
} from 'three/webgpu';

const _position = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector3();
const _region = /*@__PURE__*/ new Box3();
const _destination = /*@__PURE__*/ new Vector3();

/**
 * A local reflection volume. Add it to a {@link ReflectionProbes} container.
 *
 * The volumes are axis-aligned boxes centered on the probe. They follow the
 * probe's world position and scale; rotation is ignored.
 *
 * @augments Object3D
 * @three_import import { ReflectionProbe } from 'three/addons/lighting/ReflectionProbes.js';
 */
class ReflectionProbe extends Object3D {

	/**
	 * Constructs a new reflection probe.
	 *
	 * @param {number} [width=1] - Width of the influence volume along X.
	 * @param {number} [height=1] - Height of the influence volume along Y.
	 * @param {number} [depth=1] - Depth of the influence volume along Z.
	 */
	constructor( width = 1, height = 1, depth = 1 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReflectionProbe = true;

		this.type = 'ReflectionProbe';

		/**
		 * Size of the influence volume. Surfaces inside it use this probe.
		 *
		 * @type {Vector3}
		 */
		this.influenceSize = new Vector3( width, height, depth );

		/**
		 * Size of the box that reflections are projected onto, usually the room's
		 * walls. `null` uses `influenceSize`.
		 *
		 * @type {?Vector3}
		 * @default null
		 */
		this.projectionSize = null;

		/**
		 * Offset of the projection box's center from the probe, in the probe's
		 * local space. Use it when the capture point isn't at the room's center.
		 *
		 * @type {Vector3}
		 */
		this.projectionOffset = new Vector3();

		/**
		 * Distance over which the influence fades in from the volume's faces.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.blendDistance = 0.5;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.influenceSize.copy( source.influenceSize );
		this.projectionSize = source.projectionSize === null ? null : source.projectionSize.clone();
		this.projectionOffset.copy( source.projectionOffset );
		this.blendDistance = source.blendDistance;

		return this;

	}

}

/**
 * A set of {@link ReflectionProbe} children baked into one cube-array texture.
 *
 * Assign `reflectionProbes( probes )` to `scene.environmentNode` and every
 * physical material samples the probes with its own roughness and normal.
 * Smaller volumes take priority over larger ones; uncovered surfaces fall
 * back to `scene.environment`. Requires the WebGPU backend.
 *
 * ```js
 * const probes = new ReflectionProbes();
 * const probe = new ReflectionProbe( 8, 5, 8 );
 * probes.add( probe );
 * scene.add( probes );
 *
 * probes.bake( renderer, scene );
 * scene.environmentNode = reflectionProbes( probes ); // from three/addons/tsl/lighting/ReflectionProbesNode.js
 * ```
 *
 * @augments Object3D
 * @three_import import { ReflectionProbes } from 'three/addons/lighting/ReflectionProbes.js';
 */
class ReflectionProbes extends Object3D {

	/**
	 * Constructs a new reflection probe set.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReflectionProbes = true;

		this.type = 'ReflectionProbes';

		/**
		 * Whether the probes use box projection.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.boxProjection = true;

		/**
		 * The baked cube-array texture: the environment, then one cube per probe.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.texture = null;

		/**
		 * The probes in baked order, smallest volume first.
		 *
		 * @type {Array<ReflectionProbe>}
		 */
		this.bakedProbes = [];

		/**
		 * Whether a bake is in progress. Probes then contribute only the environment.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.capturing = false;

		this._renderTarget = null;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		// the baked texture isn't shared, so bake the copy before use
		this.boxProjection = source.boxProjection;

		return this;

	}

	/**
	 * Captures every probe and `scene.environment` into the cube array. Hide
	 * helpers and objects that should not appear in reflections first.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to capture.
	 * @param {Object} [options] - Bake options.
	 * @param {number} [options.resolution=256] - Cube face size, rounded down to a power of two and at least 256.
	 * @param {number} [options.near=0.1] - Near plane of the capture camera.
	 * @param {number} [options.far=100] - Far plane of the capture camera.
	 */
	bake( renderer, scene, options = {} ) {

		// cube arrays can't be emulated on WebGL 2
		if ( renderer.backend.isWebGPUBackend !== true ) throw new Error( 'ReflectionProbes: .bake() requires the WebGPU backend.' );

		const { near = 0.1, far = 100 } = options;

		// match the size PMREMGenerator renders at
		const resolution = Math.max( 256, MathUtils.floorPowerOfTwo( options.resolution ?? 256 ) );

		this.updateWorldMatrix( true, true );

		const probes = this.children.filter( ( child ) => child.isReflectionProbe ).sort( ( a, b ) => volume( a ) - volume( b ) );
		const maxLod = Math.log2( resolution ) - 3;

		const renderTarget = new RenderTarget( resolution, resolution, {
			depth: ( probes.length + 1 ) * 6,
			type: HalfFloatType,
			depthBuffer: false,
			generateMipmaps: false,
			minFilter: LinearMipmapLinearFilter,
			mapping: CubeReflectionMapping
		} );

		renderTarget.texture = new CubeArrayTexture().copy( renderTarget.texture );
		renderTarget.texture.name = 'ReflectionProbes';

		for ( let lod = 0; lod <= maxLod; lod ++ ) {

			renderTarget.texture.mipmaps.push( { width: resolution >> lod, height: resolution >> lod } );

		}

		renderer.initRenderTarget( renderTarget );

		const generator = new PMREMGenerator( renderer );
		const environment = new Scene();
		environment.background = scene.environment;

		const previousTexture = this.texture;

		let pmrem = null;
		let baked = false;
		const shadowStates = [];

		const capture = ( source, position, index ) => {

			pmrem = generator.fromScene( source, 0, near, far, { size: resolution, position, renderTarget: pmrem } );

			for ( let lod = 0; lod <= maxLod; lod ++ ) {

				const size = resolution >> lod;

				_region.min.set( 0, 0, 0 );
				_region.max.set( size, size, 6 );
				_destination.set( 0, 0, index * 6 );

				renderer.copyTextureToTexture( pmrem.texture, renderTarget.texture, _region, _destination, lod, lod );

			}

		};

		this.capturing = true;

		try {

			// Reuse camera-independent shadow maps throughout the capture.

			scene.traverse( ( object ) => {

				if ( object.castShadow === true && ( object.isPointLight === true || object.isSpotLight === true || object.isDirectionalLight === true ) ) {

					const shadow = object.shadow;

					if ( shadow.autoUpdate === true ) {

						shadowStates.push( shadow );
						shadow.autoUpdate = false;
						shadow.needsUpdate = true;

					}

				}

			} );

			// Unfilled cubes stay black, so an empty environment needs no capture.

			if ( scene.environment !== null ) capture( environment, _position.set( 0, 0, 0 ), 0 );

			// captures sample only the environment, so let them see the new one
			this.texture = renderTarget.texture;

			for ( let i = 0; i < probes.length; i ++ ) {

				capture( scene, probes[ i ].getWorldPosition( _position ), i + 1 );

			}

			baked = true;

		} finally {

			for ( const shadow of shadowStates ) shadow.autoUpdate = true;

			this.capturing = false;

			if ( pmrem !== null ) pmrem.dispose();
			generator.dispose();

			if ( baked === false ) {

				renderTarget.dispose();
				this.texture = previousTexture;

			}

		}

		if ( this._renderTarget !== null ) this._renderTarget.dispose();

		this._renderTarget = renderTarget;
		this.bakedProbes = probes;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance.
	 */
	dispose() {

		if ( this._renderTarget !== null ) this._renderTarget.dispose();

		this._renderTarget = null;
		this.texture = null;

	}

}

function volume( probe ) {

	probe.getWorldScale( _size ).multiply( probe.influenceSize );

	return _size.x * _size.y * _size.z;

}

export { ReflectionProbe, ReflectionProbes };
