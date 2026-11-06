import { BackSide, Box3, BufferAttribute, BufferGeometry, DepthTexture, EquirectangularReflectionMapping, EquirectangularRefractionMapping, FloatType, FrontSide, HalfFloatType, Matrix4, NodeMaterial, QuadMesh, ReadbackBuffer, RenderTarget, Sphere, StorageBufferAttribute, StorageTexture, Vector2, Vector3, Vector4 } from 'three/webgpu';
import { Break, Fn, If, LTC_Evaluate, Loop, abs, atan, atomicAdd, atomicLoad, atomicMax, atomicMin, atomicStore, cameraPosition, ceil, clamp, cos, cross, diffuseColor, dot, equirectUV, exp, exp2, float, floatBitsToUint, floor, fract, getDistanceAttenuation, getViewPosition, hash, instanceIndex, int, isBackgroundDepth, ivec2, ivec3, ivec4, log2, mat3, max, min, mix, mrt, normalWorldGeometry, normalize, output, pmremTexture, positionWorld, screenUV, select, sharedUniformGroup, sin, smoothstep, sqrt, step, storage, texture, textureStore, uint, uintBitsToFloat, uniform, uniformArray, uv, uvec2, uvec3, vec2, vec3, vec4, velocity } from 'three/tsl';

import { MeshBVH, SAH } from 'three-mesh-bvh';
import { BVHComputeData, rayIntersectionResultStruct, rayStruct, wgslTagFn } from 'three-mesh-bvh/webgpu';

// empty slots of the hash tables, and missing probes

const EMPTY = 0xffffffff;
const NONE = 0xffffffff;

// the most slots a hash table lookup or insertion probes, the tables are at most a quarter full

const MAX_PROBES = 64;

// the deposits of a frame are summed as fixed point integers, since WGSL has no float atomics: the
// radiance per channel, the rays that pass the interval and the rays of a bin

const SCALE = 2 ** 14;
const WORDS = 5;

// a bin takes at most this many rays per frame, so that the sums of the clamped radiance of its rays fit in
// 32 bits: close to the camera, a probe covers thousands of pixels

const MAX_RAYS = 512;

// surfaces select their cells from a point this share of the spacing in front of them: the positions of the
// G-buffer come from a depth buffer, so a surface on a cell boundary, e.g. a floor at y = 0, would select the
// cells on both sides of it from pixel to pixel

const KEY_OFFSET = 0.25;

// fixed point increments of the R2 low-discrepancy sequence, as in chandra

const R2 = [ 3242174889, 2447445413 ];

// the texels of the octahedral irradiance maps of the probes along each axis

const IRRADIANCE_SIZE = 6;
const IRRADIANCE_TEXELS = IRRADIANCE_SIZE * IRRADIANCE_SIZE;

// the counters of a frame, per cascade: the slots allocated, the slots freed for the next frame and the probes;
// then the probes allocated in the finest cascade and the rays of the coarsest probes

const ALLOCATED = 0, FREED = 1, PROBES = 2;

// the most point and spot lights, and the most rect area lights, that light the hits: every hit weighs all of them

const MAX_LIGHTS = 256;

// the share of the light of a hit below which the lights trace their shadow ray only sometimes, see _lightRadiance()

const LIGHT_SHARE = 0.1;

// the refresh rates that the adaptive quality targets: the common ones of displays, and 30 Hz of browsers that throttle
// the animation loop. Rarer ones are left out, as the jitter of the frames at one rate can match another, e.g. 72 Hz at 60

const REFRESH_RATES = [ 30, 60, 120, 144, 240 ];

const _position = /*@__PURE__*/ new Vector3();
const _direction = /*@__PURE__*/ new Vector3();
const _rotation = /*@__PURE__*/ new Matrix4();
const _entry = /*@__PURE__*/ new Float32Array( 8 );
const _size = /*@__PURE__*/ new Vector2();

/**
 * Real-time diffuse global illumination with "Split Radiance Cascades" (Freeman, Sannikov and Pitt-Francis,
 * 2026), following its reference implementation [chandra]{@link https://github.com/entropylost/chandra} as
 * closely as WebGPU allows.
 *
 * Every frame:
 *
 * - The scene is rendered into a G-buffer of the lit color, the diffuse color, the geometry normal, depth
 * and, with `velocity`, the velocity.
 * - Every visible surface allocates the probe of its cell in sparse hash tables, one per cascade. The cells
 * grow with the Chebyshev distance to the camera in levels of detail, and near the boundary of a level the
 * surfaces use both levels ("blending radius"). Secondary probes, two levels coarser, sit at the hits of the
 * rays of the last frame. The coarser cascades halve the cells of the finer ones.
 * - The probes keep their slot, and so their history, while they live: primary probes as long as a pixel
 * lands in them, secondary ones for 10 frames after a hit landed in them, coarser ones as long as a finer
 * probe in them does. Freed slots go to a free list.
 * - Every pixel traces a ray through a {@link https://github.com/gkjohnson/three-mesh-bvh three-mesh-bvh} BVH of the scene, in a direction of an
 * R2 sequence over the rays of its probes, and every hit of the last frame traces a secondary ray. A hit adds
 * its emission, the light of the sun, which a shadow ray or the shadow map of the sun (`useShadowMap`) occludes,
 * the light of one of the point, spot and rect area lights, picked in proportion to its light at the hit, which a
 * shadow ray occludes, and the irradiance of its secondary probe ("infinite bounces"). A ray adds its radiance to the cascade whose interval holds its hit distance, and its
 * transmittance to the cascades below ("ray splitting").
 * - The bins sum their rays, and decay their sums by `qualityDecay` every frame. The probes count their rays
 * likewise ("quality"), which weighs them in the merge and the final gather.
 * - The cascades are merged from the coarsest one down, and the probes of the finest one are projected into
 * octahedral maps of their irradiance, which the pixels interpolate.
 *
 * Differences from chandra, due to WebGPU: the hash tables only hold 32-bit keys, with the cells modulo 512,
 * and are rebuilt every frame with lock-free insertions by `atomicMin()`, since TSL has no compare-exchange;
 * the probes find their slot of the last frame in the last frame's table. The deposits are summed in fixed
 * point, since WGSL has no float atomics, and the radiance of a ray is clamped to `maxRadiance`. Rays start
 * a share of the probe spacing off the surface, since the G-buffer positions come from a depth buffer.
 *
 * The options are properties that can change at any time, they apply in the next `update()`, or before it in
 * `getCompositeNode()`, `getIrradianceNode()` and `getTextureNode()`: the ones of the probe layout and of the
 * levels of detail (`spacing`, `levelDistance`, `levels`, `cascades`, `directions`, `maxProbes`,
 * `orientations`) clear the probes and rebuild the passes, `secondary`, `useQualityWeight`,
 * `velocity` and `useShadowMap` rebuild the passes, the others are uniforms. `velocity` also replaces the G-buffer.
 * Fetch the nodes again after the passes were rebuilt, before `update()`, which renders the G-buffer they read.
 *
 * The geometry of the scene is static, see `setScene()` and `setSceneData()`. The camera, the lights and the colors
 * of the materials can change every frame: the sun, see `sun`, and the visible point, spot and rect area lights of
 * the scene of `update()`, at most 256 of each. The direct light of the analytic lights is left to the materials of
 * the G-buffer, the cascades add its bounces; emissive surfaces and the sky, an equirectangular or cube texture in
 * `scene.background`, light the scene only through the cascades. The rays see the colors and the emissive colors of
 * the materials, not their texture maps. Meshes parented to a light, e.g. its helper or bulb, are left out, and the
 * shadow rays see every other mesh, so a light inside a closed mesh does not bounce.
 *
 * A hit that the lights reach traces a shadow ray to one of them, and every hit weighs all of them. Point and spot
 * lights reach everything by default: give local ones a `distance`, beyond which they reach nothing, so that the hits
 * beyond it trace no shadow ray for them. Lights that add less than a tenth of the light of a hit trace it only
 * sometimes.
 *
 * This class can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @three_import import { RealtimeRadianceCascades } from 'three/addons/lighting/RealtimeRadianceCascades.js';
 */
class RealtimeRadianceCascades {

	/**
	 * Constructs new real-time radiance cascades.
	 *
	 * @param {Object} [options] - The options.
	 * @param {number} [options.spacing=0.0625] - The probe spacing of the finest cascade in the first level of detail, in world units.
	 * @param {number} [options.levelDistance=4] - The Chebyshev distance from the camera that the first level of detail covers, every
	 * further level doubles it and the spacing. `2 * levelDistance / spacing` must stay below 510.
	 * @param {number} [options.levels=16] - The levels of detail, at most 16, surfaces beyond the last one get no light.
	 * @param {number} [options.blendingRadius=1.1] - Surfaces within this factor of the distance of the next level of detail use both
	 * levels, `1` uses one level, `2` blends across the whole level.
	 * @param {number} [options.cascades=4] - The cascades.
	 * @param {number} [options.directions=4] - The directions of the finest cascade along the polar axis, there are twice as many
	 * around it, so 4 gives 32 directions. Every cascade doubles them along both axes.
	 * @param {number} [options.maxProbes=32768] - The most probes of the finest cascade, every coarser one has 1.25 / 3^n as many.
	 * @param {number} [options.rayStride=1] - The size of the cells of pixels of which a random pixel traces a ray every frame, `1`
	 * traces a ray from every pixel, as in chandra. Lower qualities widen the cells, see `quality`.
	 * @param {boolean} [options.secondary=true] - Whether the hits of the rays get the light of secondary probes.
	 * @param {number} [options.qualityDecay=0.97] - The factor of the sums of the bins and of the ray counts of the probes per frame.
	 * @param {number} [options.minDirectionWeight=2] - The sums of a bin with at most this many rays do not decay.
	 * @param {boolean} [options.useQualityWeight=true] - Whether the probes are weighted by their ray counts in the merge and the
	 * final gather.
	 * @param {number} [options.maxLifetime=1] - The frames a primary probe lives after a ray of a pixel was deposited into it.
	 * @param {boolean} [options.orientations=false] - Whether the probes of a cell are split by the dominant axis of the normals, so
	 * that e.g. a floor and a wall meeting in a cell do not share probes. chandra does not split them.
	 * @param {number} [options.secondaryLifetime=10] - The frames a secondary probe lives after a hit landed in it.
	 * @param {number} [options.maxRadiance=500] - The radiance of a ray is clamped to this, for the fixed point sums.
	 * @param {boolean} [options.adaptiveLOD=true] - Whether the levels of detail coarsen while the cascades are nearly full, so that
	 * views that need more probes than `maxProbes` get coarser probes instead of none, see `lodBias`.
	 * @param {boolean} [options.velocity=false] - Whether the G-buffer has a velocity texture, e.g. for {@link TRAANode}. TRAA jitters
	 * the camera in the render pipeline, so call `update()` there too, e.g. from `OnBeforeFrameUpdate()` in a `Fn()` that
	 * returns the composite.
	 * @param {boolean} [options.useShadowMap=true] - Whether the hits read the light of the sun from its shadow map, where the map
	 * covers them, instead of tracing a shadow ray. The sun must cast shadows.
	 * @param {number} [options.quality=1] - The share of the rays and the fineness of the probes, from 0 to 1, see `quality`.
	 * @param {boolean} [options.halfResolution=false] - Whether the pixels interpolate the light of a grid of 2x2 pixels, see `halfResolution`.
	 * @param {boolean} [options.adaptiveQuality=false] - Whether `quality` adapts to the frame time, see `adaptiveQuality`.
	 * @param {number} [options.targetFrameTime=0] - The frame time in milliseconds that `quality` adapts to, or 0 for the display's.
	 */
	constructor( { spacing = 0.0625, levelDistance = 4, levels = 16, blendingRadius = 1.1, cascades = 4, directions = 4, maxProbes = 32768, rayStride = 1, secondary = true, qualityDecay = 0.97, minDirectionWeight = 2, useQualityWeight = true, maxLifetime = 1, secondaryLifetime = 10, orientations = false, maxRadiance = 500, adaptiveLOD = true, velocity = false, useShadowMap = true, quality = 1, halfResolution = false, adaptiveQuality = false, targetFrameTime = 0 } = {} ) {

		this._blendingOctaves = uniform( 0 );
		this._maxLifetime = uniform( 1, 'uint' );
		this._secondaryLifetime = uniform( 10, 'uint' );

		this.spacing = spacing;
		this.levelDistance = levelDistance;
		this.levels = levels;
		this.blendingRadius = blendingRadius;
		this.cascades = cascades;
		this.directions = directions;
		this.maxProbes = maxProbes;
		this.rayStride = rayStride;
		this.secondary = secondary;
		this.useQualityWeight = useQualityWeight;
		this.maxLifetime = maxLifetime;
		this.secondaryLifetime = secondaryLifetime;
		this.orientations = orientations;
		this.adaptiveLOD = adaptiveLOD;
		this.velocity = velocity;
		this.useShadowMap = useShadowMap;

		/**
		 * The octaves added to the distances of the levels of detail. With `adaptiveLOD`, it rises while a cascade
		 * wants more than 85% of its probes, by half of the octaves that would bring it to 75%, and falls by 0.01 while
		 * all have less than 70%, so that it returns after a spike of probes, after the probe counts of a frame are read
		 * back. A level of detail has about a quarter of the probes of the one before, and the blending of the levels
		 * hides the fractional steps. Below `quality` 1, the finest cascade counts against its share of the probes at that
		 * quality, a quarter per octave, so that the bias does not undo the coarser levels of the quality.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.lodBias = 0;

		/**
		 * The quality of the light for its cost, from 0 to 1. Every frame, a pixel of each cell of
		 * `rayStride * 2 ** ( 2 * ( 1 - quality ) )` pixels traces a ray, so a sixteenth as many rays at 0, and the
		 * levels of detail are `1 - quality` octaves coarser, as with `lodBias`, so a quarter as many probes. The
		 * tracing costs in proportion to the rays and most other passes to the probes. Lower qualities are noisier and
		 * blurrier, and the light takes longer to settle. With `adaptiveQuality`, it adapts.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.quality = quality;

		/**
		 * Whether the pixels interpolate the light of a grid of cells of 2x2 pixels, by their planes and normals,
		 * instead of gathering their own, and the probes are inserted from its points: a quarter of the cost of the
		 * passes of the pixels, for little change to the smooth light. With `adaptiveQuality`, it is the first step
		 * down and the last step up.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.halfResolution = halfResolution;

		/**
		 * Whether `quality` adapts to the frame time, see `targetFrameTime`. It measures the frames of `update()` over a
		 * quarter of a second, by the timestamps of the animation frames and by when the GPU finishes them, since a
		 * browser may run the animation loop faster than the GPU, showing only some of its frames. The quality starts
		 * at 0 at `halfResolution` and rises while the frames keep up with the target, in steps that double, but only
		 * slowly back to the quality at which they last took longer, and falls while they take longer, by more the
		 * longer they take. If lowering it by 0.2 did not shorten them, it compares them back at the quality above: if
		 * they are not longer there, something else limits them, e.g. the display or the CPU, and it stays there for a
		 * while. At quality 1, it tries the full resolution, and goes back to half if the frames do not keep up, for 10
		 * seconds, twice as long each time; at the full resolution, half is the first step down.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.adaptiveQuality = adaptiveQuality;

		/**
		 * The frame time in milliseconds that `quality` adapts to, e.g. `1000 / 60`, or 0 for the display's: taken as
		 * 60 Hz at first, and as 120, 144 or 240 Hz if a quarter of the frames come at that rate, in two measurements in a
		 * row. While even quality 0 takes longer, the target is a multiple of it, up to the time of 30 Hz. While the
		 * frames take longer however low the quality, at a steady 30, 60, 120 or 144 Hz, e.g. because the browser runs
		 * the animation loop at 30 Hz in a low power mode, the target is their time, for a while. See
		 * `activeTargetFrameTime`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.targetFrameTime = targetFrameTime;

		/**
		 * The frame time in milliseconds that `quality` adapts to at the moment, see `targetFrameTime`.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.activeTargetFrameTime = targetFrameTime > 0 ? targetFrameTime : 1000 / 60;


		/**
		 * The factor of the interval lengths between cascades.
		 *
		 * @type {number}
		 * @default 4
		 */
		this.lengthScale = 4;

		/**
		 * The length of the interval of the finest cascade over its probe spacing: the spacing of the ends of
		 * its rays then equals the probe spacing.
		 *
		 * @type {number}
		 */
		this.intervalScale = 0;

		/**
		 * The bytes of the storage buffers.
		 *
		 * @type {number}
		 */
		this.memory = 0;

		/**
		 * The probes of each cascade in the last frame, see `readStats()`.
		 *
		 * @type {Array<number>}
		 */
		this.probes = [];

		/**
		 * The most probes of each cascade.
		 *
		 * @type {Array<number>}
		 */
		this.capacities = [];

		/**
		 * The probes of the finest cascade allocated in the last frame, see `readStats()`.
		 *
		 * @type {number}
		 */
		this.newProbes = 0;

		/**
		 * What the composite shows: `0` the lit scene, `1` the indirect light only, `2` the irradiance,
		 * `3` the probes of the finest cascade, `4` the levels of detail and their cells.
		 *
		 * @type {UniformNode<int>}
		 */
		this.mode = uniform( 0, 'int' );

		/**
		 * The radiance of the sky without an environment map.
		 *
		 * @type {UniformNode<color>}
		 */
		this.skyColor = uniform( new Vector3( 0, 0, 0 ) );

		/**
		 * The scale of the indirect light in the composite.
		 *
		 * @type {UniformNode<float>}
		 */
		this.intensity = uniform( 1 );

		/**
		 * The directional light that lights the hits, see `useShadowMap`: `undefined` takes the first visible
		 * directional light of the scene, `null` none.
		 *
		 * @type {DirectionalLight|null|undefined}
		 * @default undefined
		 */
		this.sun = undefined;

		// the scene that the rays trace: its BVH, the material of each triangle, the materials and the sky

		this._bvh = null;
		this._sceneData = null;
		this._collectedGeometry = null;
		this._materials = [];
		this._materialData = null;
		this._triangleOffset = 0;
		this._trace = null;
		this._faceNormal = null;
		this._visibility = null;
		this._environment = null;
		this._environmentIntensity = uniform( 1 );
		this._environmentRotation = uniform( new Matrix4() );
		this._skyTarget = null;
		this._gbuffer = null;
		this._gbuffers = [ null, null ];
		this._mrts = [ null, null ];
		this._hits = null;
		this._kernels = null;
		this._frameKernels = null;
		this._compositeNode = null;
		this._irradianceNode = null;
		this._frame = 0;
		this._layout = null;
		this._buffers = [];
		this._bufferKey = null;
		this._kernelKey = null;
		this._hitCapacity = 0;
		this._shadowTexture = null;

		this._parity = uniform( 0, 'uint' );
		this._frameNode = uniform( 0, 'uint' );
		this._jitter = uniform( new Vector2() );
		this._cameraPosition = uniform( new Vector3() );
		this._projectionInverse = uniform( new Matrix4() );
		this._cameraWorld = uniform( new Matrix4() );
		this._resolution = uniform( new Vector2() );
		this._qualityDecay = uniform( qualityDecay );
		this._minDirectionWeight = uniform( minDirectionWeight );
		this._maxRadiance = uniform( maxRadiance );
		this._sunDirection = uniform( new Vector3( 0, 1, 0 ) );
		this._sunColor = uniform( new Vector3() );
		this._shadowMatrix = uniform( new Matrix4() );
		this._shadowSize = uniform( new Vector2() );
		this._shadowOffset = uniform( 0 );
		this._shadowSign = uniform( 1 );
		this._lights = null;
		this._lightCount = uniform( 0, 'uint' );
		this._sceneLights = [];
		this._rectLights = null;
		this._rectLightCount = uniform( 0, 'uint' );
		this._sceneRectLights = [];
		this._lodBias = uniform( 0 );
		this._screenWidth = uniform( 1, 'uint' );
		this._screenHeight = uniform( 1, 'uint' );

		// the rays of this frame and of the last one: the size of the cells of pixels that trace one, the cells per
		// row and the rays, see _createFrameKernels()

		this._rays = uniform( new Vector3( 0, 1, 0 ) );
		this._previousRays = uniform( new Vector3( 0, 1, 0 ) );

		// the grid on which the pixels gather the light: the size of its cells, the cells per row and the cells, and the
		// light of its points, see _createFrameKernels() and getIrradianceNode()

		this._shading = uniform( new Vector3( 1, 1, 0 ) );
		this._shadeTexture = new StorageTexture( 1, 1 );
		this._shadeTexture.type = HalfFloatType;
		this._shadeTexture.name = 'RealtimeRadianceCascades.irradiance';
		this._shadeTexture.generateMipmaps = false;
		this._passes = null;
		this._timestampUID = null;

		// the uniforms that change from frame to frame are written once per frame, see update(), into a buffer for each
		// set of them that a shader reads, instead of into a buffer of every pass

		this._frameUniforms = sharedUniformGroup( 'radianceCascades' );

		for ( const node of [ this._parity, this._frameNode, this._jitter, this._cameraPosition, this._projectionInverse, this._cameraWorld, this._resolution, this._rays, this._previousRays, this._shading, this._lodBias, this._screenWidth, this._screenHeight, this._sunDirection, this._sunColor, this._shadowMatrix, this._shadowSize, this._shadowOffset, this._shadowSign, this._lightCount, this._rectLightCount ] ) {

			node.setGroup( this._frameUniforms );

		}

		// the state of the adaptive quality, see _adaptQuality()

		this._lastUpdate = null;
		this._frameTimes = [];
		this._qualityLimit = 1;
		this._descent = null;
		this._probe = null;
		this._holdUntil = 0;
		this._holdTime = 0;
		this._adaptAfter = 0;
		this._skipFrames = 5;
		this._lastStamp = null;
		this._stampedAt = - Infinity;
		this._stampPending = false;
		this._fences = [];
		this._reading = false;
		this._readback = null;
		this._gpuFrameTime = 0;
		this._started = false;
		this._fullTrial = false;
		this._fullHoldUntil = 0;
		this._fullHoldTime = 0;
		this._fullSince = 0;
		this._rise = 0.02;
		this._floorOvers = 0;
		this._fasterDisplay = null;
		this._displayTime = 1000 / 60;
		this._divisor = 1;
		this._capTime = 0;
		this._capUntil = 0;

		this._applyChanges();

	}

	/**
	 * Surfaces within this factor of the distance of the next level of detail use both levels, `1` uses one level,
	 * `2` blends across the whole level.
	 *
	 * @type {number}
	 */
	get blendingRadius() {

		return this._blendingRadius;

	}

	set blendingRadius( value ) {

		this._blendingRadius = value;
		this._blendingOctaves.value = Math.log2( Math.max( value, 1 ) );

	}

	/**
	 * The factor of the sums of the bins and of the ray counts of the probes per frame: the light of the probes is
	 * an average over about `1 / ( 1 - qualityDecay )` frames, 33 for chandra's 0.97. Lower values follow changes of
	 * the light faster and are noisier. Every bounce of the secondary probes adds such a delay.
	 *
	 * @type {number}
	 */
	get qualityDecay() {

		return this._qualityDecay.value;

	}

	set qualityDecay( value ) {

		this._qualityDecay.value = value;

	}

	/**
	 * The sums of a bin with at most this many rays do not decay, so that bins with few rays keep their light.
	 *
	 * @type {number}
	 */
	get minDirectionWeight() {

		return this._minDirectionWeight.value;

	}

	set minDirectionWeight( value ) {

		this._minDirectionWeight.value = value;

	}

	/**
	 * The frames a primary probe lives after a ray of a pixel was deposited into it.
	 *
	 * @type {number}
	 */
	get maxLifetime() {

		return this._maxLifetime.value;

	}

	set maxLifetime( value ) {

		this._maxLifetime.value = Math.max( Math.round( value ), 1 );

	}

	/**
	 * The frames a secondary probe lives after a hit landed in it.
	 *
	 * @type {number}
	 */
	get secondaryLifetime() {

		return this._secondaryLifetime.value;

	}

	set secondaryLifetime( value ) {

		this._secondaryLifetime.value = Math.max( Math.round( value ), 1 );

	}

	/**
	 * Builds the BVH of the visible meshes of a scene, which the rays trace, and takes the sky from its background.
	 * Call it again after changing the geometry or assigning other materials, their colors are read every frame.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 */
	setScene( renderer, scene ) {

		const data = this._collect( scene );

		this.setSceneData( renderer, data, scene );

		// the geometry is the cascades', disposed with the scene

		this._collectedGeometry = data.geometry;

	}

	/**
	 * Sets the triangles that the rays trace from data instead of the meshes of a scene, e.g. with a BVH that was
	 * built in a worker or loaded. Call it again after changing the geometry.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Object} data - The triangles.
	 * @param {BufferGeometry} data.geometry - The triangles in world space, one per three vertices: a non-indexed
	 * geometry, or one whose index was the identity before its BVH sorted it. Its `boundsTree`, a `MeshBVH`, is built
	 * if it has none.
	 * @param {Array<Material>} data.materials - The materials, which the rays see as in `setScene()`. Objects with the
	 * `color`, `emissive`, `emissiveIntensity`, `metalness` and `side` of a material will do.
	 * @param {?(Array<number>|Uint8Array|Uint16Array|Uint32Array)} [data.materialIndices=null] - The index of the
	 * material of each triangle, or null for the first material.
	 * @param {?Scene} [scene=null] - The scene whose background is the sky.
	 */
	setSceneData( renderer, { geometry, materials, materialIndices = null }, scene = null ) {

		this._clearScene();
		this._setEnvironment( scene );

		// the BVH sorts the triangles of its index but the vertices keep their order, so the first vertex of a hit
		// gives its triangle. A SAH tree with small leaves traces the rays faster than the default one

		geometry.boundsTree ??= new MeshBVH( geometry, { strategy: SAH, targetLeafSize: 4 } );

		const bvh = new BVHComputeData( geometry, { attributes: { position: 'vec4f' } } );
		bvh.update();

		// one buffer, which saves a binding: the materials as the bits of floats, see materialEntry(), then the
		// material of each triangle

		const offset = materials.length * 8;
		const sceneArray = new Uint32Array( offset + Math.max( geometry.getAttribute( 'position' ).count / 3, 1 ) );
		const materialData = new Float32Array( sceneArray.buffer, 0, offset );

		materials.forEach( ( material, i ) => materialEntry( material, materialData.subarray( i * 8, i * 8 + 8 ) ) );

		if ( materialIndices !== null ) sceneArray.set( materialIndices, offset );

		this._bvh = bvh;
		this._sceneData = storage( new StorageBufferAttribute( sceneArray, 1 ), 'uint' ).toReadOnly();
		this._materials = materials.slice();
		this._materialData = materialData;
		this._triangleOffset = offset;

		this._createTrace( geometry.boundsTree.getBoundingBox( new Box3() ).getBoundingSphere( new Sphere() ) );
		this._createSky( renderer );

		// the probes of the last scene are cleared, and the passes trace the new BVH

		this._bufferKey = this._kernelKey = null;
		this._applyChanges();

	}

	/**
	 * Returns a texture of the G-buffer: `'output'`, `'albedo'`, `'normal'`, `'depth'` or, with `velocity`,
	 * `'velocity'`, e.g. for {@link TRAANode}.
	 *
	 * @param {string} name - The name of the texture.
	 * @return {TextureNode} The texture.
	 */
	getTextureNode( name ) {

		this._applyChanges();

		if ( name === 'velocity' && ! this.velocity ) throw new Error( 'THREE.RealtimeRadianceCascades: The G-buffer has a velocity texture only with the velocity option.' );

		const gbuffer = this._getGBuffer( 1, 1 );

		return texture( name === 'depth' ? gbuffer.depthTexture : gbuffer.textures.find( ( map ) => map.name === name ) );

	}

	/**
	 * Returns the node of the indirect light at the pixels of the G-buffer, at their screen position: the radiance
	 * that a white diffuse surface reflects, times `intensity`. Times the diffuse color, it is the light that the
	 * composite adds, so materials can light themselves with it in a pass of their own.
	 *
	 * @return {Node<vec3>} The indirect light.
	 */
	getIrradianceNode() {

		this._applyChanges();

		if ( this._irradianceNode ) return this._irradianceNode;

		const gbuffer = this._getGBuffer( 1, 1 );
		const normalMap = texture( gbuffer.textures[ 2 ] );
		const depthMap = texture( gbuffer.depthTexture );

		const shadeMap = texture( this._shadeTexture );

		this._irradianceNode = Fn( () => {

			const result = vec3( 0 ).toVar();
			const depth = depthMap.sample( screenUV ).x.toVar();

			If( isBackgroundDepth( depth ).not(), () => {

				const position = this._worldPosition( screenUV, depth ).toVar();
				const normal = this._facingNormal( normalMap.sample( screenUV ).xyz ).toVar();
				const shading = this._shading;
				const grid = screenUV.mul( this._resolution ).div( shading.x ).sub( 0.5 ).toVar();
				const sum = vec4( 0 ).toVar();
				const plain = vec4( 0 ).toVar();

				If( shading.x.greaterThanEqual( 1.5 ), () => {

					// the 4 points of the grid around the pixel, weighted by their distance on the screen and by how close
					// they lie to the plane and the normal of the pixel, within 2% of its distance to the camera

					const lower = ivec2( floor( grid ) ).toVar();
					const f = fract( grid ).toVar();
					const last = ivec2( int( shading.y ).sub( 1 ), int( ceil( this._resolution.y.div( shading.x ) ) ).sub( 1 ) ).toVar();
					const tolerance = position.sub( this._cameraPosition ).length().mul( 0.02 ).max( 1e-4 ).toVar();

					for ( let corner = 0; corner < 4; corner ++ ) {

						const cell = lower.add( ivec2( corner & 1, corner >> 1 ) ).clamp( ivec2( 0 ), last ).toVar();
						const light = shadeMap.load( cell ).toVar();
						const pixel = ivec2( vec2( cell ).add( 0.5 ).mul( shading.x ) ).min( ivec2( this._resolution ).sub( 1 ) ).toVar();
						const point = this._worldPosition( vec2( pixel ).add( 0.5 ).div( this._resolution ), depthMap.load( pixel ).x );
						const pointNormal = this._facingNormal( normalMap.load( pixel ).xyz );
						const bilinear = ( corner & 1 ? f.x : f.x.oneMinus() ).mul( corner & 2 ? f.y : f.y.oneMinus() ).mul( light.w.greaterThan( 0 ) ).toVar();
						const geometry = exp( abs( dot( normal, point.sub( position ) ) ).div( tolerance ).negate() ).mul( dot( normal, pointNormal ).max( 0 ).pow( 4 ) );

						sum.addAssign( vec4( light.rgb, 1 ).mul( bilinear.mul( geometry ) ) );
						plain.addAssign( vec4( light.rgb, 1 ).mul( bilinear ) );

					}

				} );

				// a pixel of fine cells, or unlike the points around it, e.g. of a thin object, gathers its own light, or else
				// takes theirs

				If( sum.w.greaterThan( 1e-3 ), () => {

					result.assign( sum.rgb.div( sum.w ) );

				} ).Else( () => {

					const light = this._gather( position, normal ).toVar();

					result.assign( select( light.w.greaterThan( 0 ), light.rgb, plain.rgb.div( plain.w.max( 1e-5 ) ) ) );

				} );

				result.mulAssign( this.intensity );

			} );

			return result;

		} )();

		return this._irradianceNode;

	}

	/**
	 * Returns the node that composites the lit scene and the indirect light, e.g. for the `outputNode` of a
	 * {@link RenderPipeline}.
	 *
	 * @return {Node<vec4>} The composite.
	 */
	getCompositeNode() {

		this._applyChanges();

		if ( this._compositeNode ) return this._compositeNode;

		const gbuffer = this._getGBuffer( 1, 1 );
		const color = texture( gbuffer.textures[ 0 ] );
		const albedo = texture( gbuffer.textures[ 1 ] );
		const normalMap = texture( gbuffer.textures[ 2 ] );
		const depthMap = texture( gbuffer.depthTexture );
		const irradiance = this.getIrradianceNode();

		this._compositeNode = Fn( () => {

			const lit = color.sample( screenUV ).rgb.toVar();
			const result = lit.toVar();
			const depth = depthMap.sample( screenUV ).x.toVar();

			If( isBackgroundDepth( depth ).not(), () => {

				const position = this._worldPosition( screenUV, depth ).toVar();
				const normal = this._facingNormal( normalMap.sample( screenUV ).xyz ).toVar();
				const diffuse = albedo.sample( screenUV ).rgb.toVar();
				const radiance = irradiance.toVar();

				If( this.mode.equal( 0 ), () => {

					result.assign( lit.add( diffuse.mul( radiance ) ) );

				} ).ElseIf( this.mode.equal( 1 ), () => {

					result.assign( diffuse.mul( radiance ) );

				} ).ElseIf( this.mode.equal( 2 ), () => {

					result.assign( radiance );

				} ).ElseIf( this.mode.equal( 3 ), () => {

					// the probe of the cell

					const level = this._primaryLevel( position ).toVar();
					const slot = uint( NONE ).toVar();

					If( level.greaterThanEqual( 0 ), () => {

						slot.assign( this._lookup( 0, this._keyOf( this._surfaceCell( position, normal, level, 0 ), level ), this._groupOf( normal ) ) );

					} );

					result.assign( select( slot.equal( NONE ), vec3( 1, 0, 1 ), vec3( hash( slot ), hash( slot.add( 7 ) ), hash( slot.add( 13 ) ) ) ) );

				} ).ElseIf( this.mode.equal( 4 ), () => {

					// a color per level of detail, with the edges of the cells

					const level = this._primaryLevel( position ).toVar();
					const tint = cos( vec3( 0, 0.33, 0.67 ).add( float( level ).mul( 0.17 ) ).mul( 2 * Math.PI ) ).mul( 0.5 ).add( 0.5 );
					const spacing = this._spacingOf( level.max( 0 ), 0 ).toVar();
					const f = fract( position.add( normal.mul( spacing.mul( KEY_OFFSET ) ) ).div( spacing ) ).toVar();
					const edge = min( f.oneMinus(), f ).toVar();
					const line = select( min( edge.x, min( edge.y, edge.z ) ).lessThan( 0.03 ), float( 0.4 ), float( 1 ) );

					result.assign( select( level.greaterThanEqual( 0 ), tint.mul( line ).mul( lit.dot( vec3( 0.3, 0.6, 0.1 ) ).min( 1 ).mul( 0.6 ).add( 0.4 ) ), vec3( 0 ) ) );

				} );

			} );

			return vec4( result, 1 );

		} )();

		return this._compositeNode;

	}

	/**
	 * Renders the G-buffer, then allocates the probes, traces the rays, and accumulates and merges the cascades
	 * for a frame.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 */
	update( renderer, scene, camera ) {

		this._applyChanges();
		this._adaptQuality();

		const size = renderer.getDrawingBufferSize( _size );
		const width = Math.max( Math.floor( size.x ), 1 ), height = Math.max( Math.floor( size.y ), 1 );
		const gbuffer = this._getGBuffer( width, height );
		const pixels = width * height;

		// the passes read the size of the screen from uniforms, only the buffer of the hits of the pixels grows

		if ( width !== gbuffer.width || height !== gbuffer.height ) gbuffer.setSize( width, height );

		if ( pixels > this._hitCapacity ) {

			this._hitCapacity = Math.ceil( pixels * 1.25 );
			this._disposeKernels( false );

		}

		this._screenWidth.value = width;
		this._screenHeight.value = height;

		// a pixel of each cell of rayStride x rayStride pixels traces a ray, up to 4 times as wide at lower qualities

		const quality = Math.min( Math.max( this.quality, 0 ), 1 );
		const cell = this.rayStride * 2 ** ( 2 * ( 1 - quality ) );
		const columns = Math.ceil( width / cell );
		const rays = columns * Math.ceil( height / cell );
		const previousRays = this._rays.value.z;

		// at half resolution, the pixels interpolate the light of a grid of cells of 2 pixels, and the probes are inserted
		// from its points. With cells of 1 pixel, the pixels gather their own light, which costs less than the grid. Its
		// texture holds the grid of cells of one pixel

		const shadingCell = this.halfResolution ? 2 : 1;
		const shadingColumns = Math.ceil( width / shadingCell );
		const shadingPoints = shadingColumns * Math.ceil( height / shadingCell );

		this._shading.value.set( shadingCell, shadingColumns, shadingPoints );
		this._shadeTexture.setSize( width, height );

		// the G-buffer

		const previousTarget = renderer.getRenderTarget();
		const previousMRT = renderer.getMRT();

		renderer.setRenderTarget( gbuffer );
		renderer.setMRT( this._mrt );
		renderer.render( scene, camera );
		renderer.setMRT( previousMRT );
		renderer.setRenderTarget( previousTarget );

		// the uniforms of the frame

		camera.updateMatrixWorld();

		this._frame ++;
		this._frameNode.value = this._frame;
		this._parity.value = this._frame & 1;

		this._cameraPosition.value.setFromMatrixPosition( camera.matrixWorld );
		this._projectionInverse.value.copy( camera.projectionMatrixInverse );
		this._cameraWorld.value.copy( camera.matrixWorld );
		this._resolution.value.set( width, height );

		// the random offset of the directions of the frame, pcg3df( tick, 29, 968 ) in chandra

		const random = pcg3d( this._frame, 29, 968 );
		this._jitter.value.set( random[ 0 ] / 0xffffffff, random[ 1 ] / 0xffffffff );

		this._previousRays.value.copy( this._rays.value );
		this._rays.value.set( cell, columns, rays );

		// the passes are built after the G-buffer, whose render creates the shadow map of the sun

		this._updateMaterials();

		const shadowTexture = this._updateLights( renderer, scene );

		if ( shadowTexture !== this._shadowTexture ) {

			this._shadowTexture = shadowTexture;
			this._disposeKernels( false );

		}

		if ( this._kernels === null ) this._kernels = this._createKernels();
		if ( this._frameKernels === null ) this._frameKernels = this._createFrameKernels();

		this._lodBias.value = this.lodBias + 1 - quality;

		// the passes of the frame, in one submission. The passes of the pixels and of the rays run over as many threads
		// as they have

		if ( this._passes === null ) {

			this._passes = this._createPasses();

			// the adaptive quality waits for a second for the new passes to compile and the probes to fill

			this._frameTimes.length = 0;
			this._adaptAfter = performance.now() + 1000;

		}

		const frameKernels = this._frameKernels;

		frameKernels.gather.dispatchSize = shadingPoints;
		frameKernels.shade.dispatchSize = shadingCell === 1 ? 1 : shadingPoints;
		frameKernels.count.dispatchSize = rays;
		frameKernels.trace.dispatchSize = rays;

		if ( this.secondary ) frameKernels.gatherSecondary.dispatchSize = frameKernels.traceSecondary.dispatchSize = Math.max( previousRays, 1 );

		// the uniforms of the frame are set: their buffers are written when the passes and the irradiance bind them next

		this._frameUniforms.needsUpdate = true;

		renderer.compute( this._passes );

		if ( renderer.backend.trackTimestamp === true ) this._timestampUID = renderer.backend.getTimestampUID( this._passes );

		if ( this.adaptiveLOD || this.adaptiveQuality ) this._readCounters( renderer );

	}

	/**
	 * Returns the passes of a frame in order.
	 *
	 * @private
	 * @return {Array<ComputeNode>} The passes.
	 */
	_createPasses() {

		const kernels = this._kernels;
		const frameKernels = this._frameKernels;

		// the probes of the pixels and of the hits of the last frame, then the offsets of their rays in the R2 sequence

		const passes = [ kernels.clear, frameKernels.gather, frameKernels.gatherSecondary, kernels.keep, kernels.assign[ 0 ] ];

		for ( let n = 1; n < this.cascades; n ++ ) passes.push( kernels.fill[ n ], kernels.assign[ n ] );

		passes.push( ...kernels.free, frameKernels.count, ...kernels.countUp.slice( 1 ), ...kernels.offsets.slice().reverse() );

		// the rays, their light in the probes, the merge of the cascades from the coarsest, and the irradiance

		passes.push( frameKernels.traceSecondary, frameKernels.trace, ...kernels.accumulate, ...kernels.merge.slice().reverse() );
		passes.push( kernels.irradiance, frameKernels.shade );

		const result = passes.filter( ( kernel ) => kernel );
		result.name = 'RealtimeRadianceCascades';

		return result;

	}

	/**
	 * Adapts `quality` to the target frame time by the mean time between the last calls of `update()`, see
	 * `adaptiveQuality` and `targetFrameTime`.
	 *
	 * @private
	 */
	_adaptQuality() {

		const now = performance.now();

		if ( this.adaptiveQuality !== true ) {

			this._lastUpdate = this._lastStamp = null;
			this._started = false;
			return;

		}

		// from quality 0 up, so that slow devices do not start with slow frames

		if ( this._started === false ) {

			this._started = true;
			this.quality = 0;
			this.halfResolution = true;
			this._qualityLimit = 1;
			this._rise = 0.02;

		}

		// the frame times from the timestamps of the animation frames, which step by whole frame times of the display,
		// from a callback every frame while update() is called. Without them, e.g. in XR, from the time between the
		// calls of update()

		if ( typeof requestAnimationFrame === 'function' && this._stampPending === false ) {

			this._stampPending = true;

			const onFrame = ( stamp ) => {

				if ( this._lastStamp !== null ) this._addFrameTime( stamp - this._lastStamp );

				this._lastStamp = stamp;
				this._stampedAt = performance.now();

				if ( this.adaptiveQuality === true && this._stampedAt - this._lastUpdate < 250 ) {

					requestAnimationFrame( onFrame );

				} else {

					this._stampPending = false;
					this._lastStamp = null;

				}

			};

			requestAnimationFrame( onFrame );

		}

		if ( now - this._stampedAt > 250 && this._lastUpdate !== null ) this._addFrameTime( now - this._lastUpdate );

		this._lastUpdate = now;

		if ( now < this._adaptAfter ) {

			this._frameTimes.length = 0;
			return;

		}

		// the frames of a quarter of a second, half a second for a window back up, at least 8, without the first ones
		// after a change: 5 after a step down, which are still in flight, and 12 after a step up, whose new finer probes
		// cost more at first

		const times = this._frameTimes.slice( this._skipFrames );
		const span = times.reduce( ( sum, t ) => sum + t, 0 );

		if ( times.length < 8 || span < ( this._probe !== null ? 500 : 250 ) ) return;

		// the mean, since without vsync the frames can alternate between fast ones and ones that wait for the GPU, or
		// the GPU's frame time if longer: the time between the reads that wait for it, over the frames between them

		const fences = this._fences.filter( ( [ frame ] ) => frame >= this._frame - times.length );

		this._gpuFrameTime = fences.length > 1 ? ( fences[ fences.length - 1 ][ 1 ] - fences[ 0 ][ 1 ] ) / ( fences[ fences.length - 1 ][ 0 ] - fences[ 0 ][ 0 ] ) : 0;
		this._fences = this._fences.slice( - 1 );

		const frameTime = Math.max( span / times.length, this._gpuFrameTime );
		const quality = this.quality;
		const auto = ! ( this.targetFrameTime > 0 );

		this._frameTimes.length = 0;

		// the frame time of the display: a quarter of the frames come at a faster common refresh rate, in two windows in
		// a row, as the timestamps are coarse and jitter in some browsers

		if ( auto ) {

			const fast = times.slice().sort( ( a, b ) => a - b )[ times.length >> 2 ];
			const display = refreshTime( fast );

			if ( display !== fast && display < this._displayTime * 0.95 ) {

				if ( this._fasterDisplay === display ) {

					this._displayTime = display;
					this._divisor = 1;

				}

				this._fasterDisplay = display;

			} else {

				this._fasterDisplay = null;

			}

		}

		const target = this.activeTargetFrameTime = auto ? Math.max( this._displayTime * this._divisor, now < this._capUntil ? this._capTime : 0 ) : this.targetFrameTime;

		// a window back up after steps down lowered the quality by 0.2 but did not shorten the frames by 15%: unless
		// they take 15% longer there, the quality does not limit them, something else does, e.g. the display or the
		// CPU. It stays up for 10 seconds, twice as long each time, and the display's target is their time meanwhile

		if ( this._probe !== null ) {

			const probe = this._probe;

			this._probe = null;
			this._rise = 0.02;

			if ( frameTime < probe.time * 1.15 ) {

				this._descent = null;
				this._qualityLimit = quality;
				this._holdTime = Math.min( this._holdTime * 2 || 10000, 160000 );
				this._holdUntil = now + this._holdTime;

				// a cap below the display's frame rate, e.g. a low power mode, if the timestamps step by it frame after frame

				const cap = steadyFrameTime( times );

				if ( cap !== null && cap > this._displayTime * 1.05 ) {

					this._capTime = cap;
					this._capUntil = this._holdUntil;

				}

			} else {

				this._descent = probe;
				this.quality = probe.quality;
				this._skipFrames = 5;

			}

			return;

		}

		if ( frameTime > target * 1.1 ) {

			// at the full resolution, half is the first step down, and the next try of the full resolution waits for 10
			// seconds, twice as long each time

			if ( this.halfResolution === false && ( this._fullTrial || now >= this._holdUntil ) ) {

				this._fullTrial = false;
				this.halfResolution = true;
				this._fullHoldTime = Math.min( this._fullHoldTime * 2 || 10000, 160000 );
				this._fullHoldUntil = now + this._fullHoldTime;
				this._rise = 0.02;
				this._skipFrames = 5;

				return;

			}

			if ( now < this._holdUntil ) return;

			// the steps so far paid off, the next ones are compared with here

			if ( this._descent !== null && frameTime <= this._descent.time * 0.85 ) this._descent = { quality, time: frameTime };

			if ( this._descent !== null && this._descent.quality - quality >= 0.2 && frameTime > this._descent.time * 0.85 ) {

				this._probe = { quality, time: frameTime };
				this.quality = this._descent.quality;
				this._skipFrames = 12;

				return;

			}

			// even quality 0 is too slow for the display's frame time, twice: half the frame rate, down to 30 Hz

			if ( quality === 0 ) {

				if ( ++ this._floorOvers >= 2 && auto && this._displayTime * this._divisor * 2 <= 1000 / 30 * 1.01 ) {

					this._divisor *= 2;
					this._floorOvers = 0;

				}

				return;

			}

			// down by the octaves that the frames take longer than the target, about 1.5 per quality between 1 and 0,
			// at most by half

			const step = Math.min( Math.max( Math.log2( frameTime / target ) / 1.5, 0.03 ), 0.5 );

			this._rise = 0.02;
			this._descent ??= { quality, time: frameTime };
			this._qualityLimit = Math.min( this._qualityLimit, quality - 0.02 );
			this.quality = Math.max( quality - step, 0 );
			this._skipFrames = 5;

		} else if ( frameTime <= target * 1.05 ) {

			// at full quality with half the frame time, the display's full frame rate again

			if ( this._divisor > 1 && quality === 1 && frameTime <= target * 0.55 ) this._divisor /= 2;

			// up while the frames are fast enough, within the jitter of the display, in steps that double, and only
			// slowly back to where they last were not

			const step = Math.min( Math.max( Math.log2( target / frameTime ) / 3, this._rise ), 0.25 );

			this._rise = Math.min( this._rise * 2, 0.25 );
			this._floorOvers = 0;
			this._descent = null;
			this._holdTime = 0;
			this._qualityLimit = Math.min( this._qualityLimit + 0.002, 1 );
			this.quality = Math.min( quality + step, Math.max( this._qualityLimit, quality ) );
			this._skipFrames = this.quality > quality ? 12 : 5;

			// a try of the full resolution held, the wait for the next one is short again after 30 seconds of it, and at
			// quality 1 the full resolution is the last step up

			if ( this._fullTrial ) this._fullSince = now;
			if ( this.halfResolution === false && now - this._fullSince > 30000 ) this._fullHoldTime = 0;

			this._fullTrial = false;

			if ( quality === 1 && this.halfResolution && now >= this._fullHoldUntil ) {

				this.halfResolution = false;
				this._fullTrial = true;
				this._skipFrames = 12;

			}

		}

	}

	/**
	 * Adds the time of a frame to the measurement of the adaptive quality, or starts it again after a pause, e.g. a
	 * hidden page or a new scene.
	 *
	 * @private
	 * @param {number} time - The frame time in milliseconds.
	 */
	_addFrameTime( time ) {

		if ( time > 250 ) this._frameTimes.length = 0;
		else if ( time > 0 ) this._frameTimes.push( time );

	}

	/**
	 * Reads back the counters after the passes of the frame, one read at a time. Their probe counts adapt `lodBias`,
	 * and when the read finished tells when the GPU finished the frame, for the adaptive quality.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 */
	_readCounters( renderer ) {

		if ( this._reading ) return;

		this._reading = true;

		const frame = this._frame;
		const quality = Math.min( Math.max( this.quality, 0 ), 1 );
		const atomics = this._atomics;
		const byteLength = this._layout.counters * 8;
		const readback = this._readback ??= new ReadbackBuffer( byteLength );

		renderer.getArrayBufferAsync( atomics.value, readback, 0, byteLength ).then( () => {

			const counts = new Uint32Array( readback.buffer.slice( 0, byteLength ) );

			readback.release();
			this._reading = false;

			if ( this._atomics !== atomics ) return;

			if ( this.adaptiveQuality && this._fences.length < 1000 ) this._fences.push( [ frame, performance.now() ] );
			if ( this.adaptiveLOD ) this._adaptLOD( counts, frame, quality );

		} ).catch( () => {

			// disposed

			this._reading = false;

		} );

	}

	/**
	 * Adapts `lodBias` to how full the cascades were in a frame (after zalo's adaptive LOD bias for chandra).
	 *
	 * @private
	 * @param {Uint32Array} counts - The counters read after the frame.
	 * @param {number} frame - The frame.
	 * @param {number} quality - The quality of the frame.
	 */
	_adaptLOD( counts, frame, quality ) {

		const base = ( frame & 1 ) * this._layout.counters;
		const previous = ( ( frame + 1 ) & 1 ) * this._layout.counters;
		const capacities = this.capacities;
		const cascades = this.cascades;

		// the probes a cascade wanted: the ones it has, and the new ones beyond the free slots of the last frame. Below
		// quality 1, the levels of detail are 1 - quality octaves coarser, a quarter of the probes per octave, which
		// would let the bias fall by as much and undo them: the finest cascade counts against that share of its
		// capacity. The coarser ones cover the view with few probes, which hardly shrink with the levels

		const share = 4 ** ( quality - 1 );

		let fullness = 0;

		for ( let n = 0; n < cascades; n ++ ) {

			const failed = Math.max( counts[ base + ALLOCATED * cascades + n ] - counts[ previous + FREED * cascades + n ], 0 );

			fullness = Math.max( fullness, ( counts[ base + PROBES * cascades + n ] + failed ) / ( capacities[ n ] * ( n === 0 ? share : 1 ) ) );

		}

		// a level of detail has about a quarter of the probes of the one before: up by half of the octaves that
		// would bring the cascades to 75%, at least 0.05, and down slowly until they are close to it, so that they
		// do not stay coarse after a spike of probes

		if ( fullness > 0.85 ) this.lodBias += Math.max( Math.log2( fullness / 0.75 ) / 4, 0.05 );
		else if ( fullness < 0.7 ) this.lodBias = Math.max( this.lodBias - 0.01, 0 );

	}

	/**
	 * Reads back the probe counts of the cascades into `probes`, and the probes allocated in the finest one into
	 * `newProbes`.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @return {Promise<Array<number>>} The counts.
	 */
	async readStats( renderer ) {

		const counters = new Uint32Array( await renderer.getArrayBufferAsync( this._atomics.value, null, 0, this._layout.counters * 8 ) );
		const base = ( this._frame & 1 ) * this._layout.counters;

		this.probes = Array.from( { length: this.cascades }, ( _, n ) => counters[ base + PROBES * this.cascades + n ] );
		this.newProbes = counters[ base + 3 * this.cascades ];

		return this.probes;

	}

	/**
	 * Returns the GPU time of the passes of the last frame in milliseconds. The renderer must track timestamps.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @return {Promise<?number>} The time, or null if it is missing.
	 */
	async readGPUTime( renderer ) {

		const uid = this._timestampUID;

		await renderer.resolveTimestampsAsync( 'compute' );

		// other readers of the timestamps, e.g. the inspector, may have taken it

		const pool = renderer.backend.timestampQueryPool.compute;

		if ( uid === null || pool?.hasTimestampQuery( uid ) !== true ) return null;

		return pool.getTimestamp( uid );

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._clearScene();
		this._skyTarget?.dispose();
		for ( const gbuffer of this._gbuffers ) gbuffer?.dispose();
		this._shadeTexture.dispose();

		this._disposeKernels();
		this._disposeBuffers();

	}

	/**
	 * Applies changed options: rebuilds the buffers if the layout of the probes or the levels of detail changed,
	 * which clears the probes, and the passes if they depend on a changed option.
	 *
	 * @private
	 */
	_applyChanges() {

		const bufferKey = [ this.spacing, this.levelDistance, this.levels, this.cascades, this.directions, this.maxProbes, this.orientations ].join();
		const kernelKey = [ bufferKey, this.secondary, this.useQualityWeight, this.velocity ].join();

		if ( kernelKey === this._kernelKey ) return;

		if ( bufferKey !== this._bufferKey ) {

			// the cells of a level of detail must span less than 512 cells along each axis, see _keyOf()

			const span = 2 * this.levelDistance / this.spacing + 4;

			if ( span >= 510 ) throw new Error( 'THREE.RealtimeRadianceCascades: The levels of detail span too many cells, increase spacing or decrease levelDistance.' );
			if ( this.levels > 16 ) throw new Error( 'THREE.RealtimeRadianceCascades: At most 16 levels of detail.' );

			this._disposeBuffers();

			this.intervalScale = Math.sqrt( 2 * this.directions * this.directions / ( 4 * Math.PI ) );
			this._layout = this._createLayout();
			this.capacities = this._layout.cascades.map( ( cascade ) => cascade.capacity );
			this._createBuffers();
			this._bufferKey = bufferKey;

		}

		// the passes and the composite read the textures of the G-buffer, which has a velocity texture or not

		// the G-buffers with and without the velocity stay, so that the render objects of the scene for them do too,
		// but the textures of the one that is not used are freed

		if ( this._gbuffer !== null && this._gbuffer.textures.length !== ( this.velocity ? 4 : 3 ) ) {

			this._gbuffer.dispose();
			this._gbuffer = null;

		}

		this._disposeKernels();
		this._compositeNode = this._irradianceNode = null;
		this._kernelKey = kernelKey;

	}

	/**
	 * Frees the storage buffers of the probes.
	 *
	 * @private
	 */
	_disposeBuffers() {

		for ( const buffer of this._buffers ) buffer.value.dispose();

		// the readback of the counters has their size, the reads in flight finish with an error

		this._readback?.dispose();
		this._readback = null;

		this._buffers = [];
		this.memory = 0;

	}

	/**
	 * Frees the pipelines of the passes, and the per pixel buffer of the passes that depend on the size of the
	 * screen. They are created again in the next update.
	 *
	 * @private
	 * @param {boolean} [all=true] - Whether to free the passes that do not depend on the size of the screen too.
	 */
	_disposeKernels( all = true ) {

		for ( const kernels of all ? [ this._kernels, this._frameKernels ] : [ this._frameKernels ] ) {

			for ( const kernel of Object.values( kernels ?? {} ).flat() ) kernel?.dispose();

		}

		if ( all ) this._kernels = null;

		this._frameKernels = null;
		this._passes = null;
		this._hits?.value.dispose();
		this._hits = null;

	}

	/**
	 * Returns the sizes and offsets of the cascades in the buffers.
	 *
	 * @private
	 * @return {Object} The layout.
	 */
	_createLayout() {

		const cascades = [];
		const groups = this.orientations ? 6 : 1;
		let tables = 0, slots = 0, bins = 0, merged = 0;

		for ( let n = 0; n < this.cascades; n ++ ) {

			const theta = this.directions * 2 ** n;
			// a coarser cell holds about four finer probes on a surface, but fewer at edges, on thin geometry and with
			// the orientations split: about three in the courtyard

			const capacity = n === 0 ? this.maxProbes : Math.max( Math.ceil( this.maxProbes * 1.25 / 3 ** n ), 64 );
			// a table per orientation, which holds a share of the probes

			const tableSize = 2 ** Math.ceil( Math.log2( capacity * ( groups > 1 ? 2 : 4 ) ) );
			const binCount = 2 * theta * theta;

			// the merged radiance of the finest cascade at full resolution, of the coarser ones averaged over the
			// four bins within each bin of the next finer one

			const outputs = n === 0 ? binCount : binCount / 4;

			cascades.push( { theta, capacity, tableSize, bins: binCount, outputs, tableOffset: tables, slotOffset: slots, binOffset: bins, mergedOffset: merged } );

			tables += tableSize * groups;
			slots += capacity;
			bins += capacity * binCount;
			merged += capacity * outputs;

		}

		return { cascades, groups, tables, slots, bins, merged, counters: 3 * this.cascades + 2 };

	}

	/**
	 * Creates the storage buffers. The probes keep their slots while they live, the hash tables alternate
	 * between the current frame's and the last frame's.
	 *
	 * WebGPU limits the storage buffers of a shader stage, to 8 by default and at most 10 in Chrome on macOS, so
	 * they are three pools, the atomic words, the words and the vectors, and each buffer is a view of a range of
	 * its pool. The keys, qualities and weights are stored as the bits of words.
	 *
	 * @private
	 */
	_createBuffers() {

		const { cascades, tables, slots, bins, merged, counters } = this._layout;

		const rangesOf = ( sizes ) => {

			const ranges = { length: 0 };

			for ( const name in sizes ) {

				ranges[ name ] = ranges.length;
				ranges.length += sizes[ name ];

			}

			return ranges;

		};

		// the counters come first, so that they are read back alone

		const atomics = rangesOf( { counters: counters * 2, table: tables * 2, expiry: slots, deposited: slots, rayCount: slots, rayIndex: cascades[ 0 ].capacity, deposits: bins * WORDS } );
		const words = rangesOf( { slotOf: tables * 2, freeList: slots, born: slots, alive: slots, rayOffset: slots, keys: slots * 4, quality: slots, weights: bins } );
		const vectors = rangesOf( { fluence: bins, merged, irradiance: cascades[ 0 ].capacity * IRRADIANCE_TEXELS } );

		const atomicArray = new Uint32Array( atomics.length );
		const wordArray = new Uint32Array( words.length );

		// the tables start empty, and the free lists with all slots, and the counts of free slots of both frames
		// with the capacities

		atomicArray.fill( EMPTY, atomics.table, atomics.table + tables * 2 );
		wordArray.fill( NONE, words.slotOf, words.slotOf + tables * 2 );

		for ( let n = 0; n < this.cascades; n ++ ) {

			const { capacity, slotOffset } = cascades[ n ];

			for ( let i = 0; i < capacity; i ++ ) wordArray[ words.freeList + slotOffset + i ] = i;

			atomicArray[ atomics.counters + FREED * this.cascades + n ] = capacity;
			atomicArray[ atomics.counters + counters + FREED * this.cascades + n ] = capacity;

		}

		this._atomics = storage( new StorageBufferAttribute( atomicArray, 1 ), 'uint', atomics.length ).toAtomic();
		this._words = storage( new StorageBufferAttribute( wordArray, 1 ), 'uint', words.length );
		this._vectors = storage( new StorageBufferAttribute( new Float32Array( vectors.length * 4 ), 4 ), 'vec4', vectors.length );

		const view = ( pool, offset ) => ( { element: ( index ) => pool.element( offset === 0 ? index : ( typeof index === 'number' ? index + offset : index.add( offset ) ) ) } );

		this._counters = view( this._atomics, atomics.counters );
		this._table = view( this._atomics, atomics.table );
		this._expiry = view( this._atomics, atomics.expiry );
		this._deposited = view( this._atomics, atomics.deposited );
		this._rayCount = view( this._atomics, atomics.rayCount );
		this._rayIndex = view( this._atomics, atomics.rayIndex );
		this._deposits = view( this._atomics, atomics.deposits );

		// per slot: its free list entry, the frames it was allocated and last alive, its first ray in the R2
		// sequence of the probe, its cell and level, and its quality. Per bin: the weights of the fluence

		this._slotOf = view( this._words, words.slotOf );
		this._freeList = view( this._words, words.freeList );
		this._born = view( this._words, words.born );
		this._alive = view( this._words, words.alive );
		this._rayOffset = view( this._words, words.rayOffset );
		this._ranges = words;

		// per bin: the weighted fluence, and the merged radiance; per texel of the finest probes: the irradiance

		this._fluence = view( this._vectors, vectors.fluence );
		this._merged = view( this._vectors, vectors.merged );
		this._irradiance = view( this._vectors, vectors.irradiance );

		this._buffers = [ this._atomics, this._words, this._vectors ];
		this.memory = this._buffers.reduce( ( total, buffer ) => total + buffer.value.array.byteLength, 0 );

	}

	/**
	 * The cell and level of the probe in a slot.
	 *
	 * @private
	 */
	_key( slot ) {

		const base = uint( slot ).mul( 4 ).add( this._ranges.keys ).toVar();

		return ivec4( ...[ 0, 1, 2, 3 ].map( ( k ) => int( this._words.element( base.add( k ) ) ) ) );

	}

	/**
	 * Stores the cell and level of the probe in a slot.
	 *
	 * @private
	 */
	_setKey( slot, key ) {

		const base = uint( slot ).mul( 4 ).add( this._ranges.keys ).toVar();
		const value = ivec4( key ).toVar();

		for ( const [ k, c ] of [ 'x', 'y', 'z', 'w' ].entries() ) this._words.element( base.add( k ) ).assign( uint( value[ c ] ) );

	}

	/**
	 * The quality of the probe in a slot, or the weight of the fluence of a bin.
	 *
	 * @private
	 */
	_float( name, index ) {

		return uintBitsToFloat( this._words.element( uint( index ).add( this._ranges[ name ] ) ) );

	}

	/**
	 * Stores the quality of the probe in a slot, or the weight of the fluence of a bin.
	 *
	 * @private
	 */
	_setFloat( name, index, value ) {

		this._words.element( uint( index ).add( this._ranges[ name ] ) ).assign( floatBitsToUint( float( value ) ) );

	}

	/**
	 * Returns the G-buffer, created on first use.
	 *
	 * @private
	 */
	_getGBuffer( width, height ) {

		if ( this._gbuffer !== null ) return this._gbuffer;

		const index = this.velocity ? 1 : 0;

		if ( this._gbuffers[ index ] !== null ) {

			this._mrt = this._mrts[ index ];

			return this._gbuffer = this._gbuffers[ index ];

		}

		const gbuffer = new RenderTarget( width, height, { count: this.velocity ? 4 : 3, type: HalfFloatType } );
		gbuffer.textures[ 0 ].name = 'output';
		gbuffer.textures[ 1 ].name = 'albedo';
		gbuffer.textures[ 2 ].name = 'normal';
		if ( this.velocity ) gbuffer.textures[ 3 ].name = 'velocity';
		gbuffer.depthTexture = new DepthTexture( width, height, FloatType );

		// the vertex normal on the side of the visible face, the flat normal of the triangle towards the camera: the back
		// faces of double sided materials and normals against the winding are flipped, but not smooth normals that point
		// a little away from the camera at grazing angles. Zero normals, which normalize to NaN, take the flat normal

		const flat = cross( positionWorld.dFdx(), positionWorld.dFdy() );
		const facing = select( dot( flat, cameraPosition.sub( positionWorld ) ).lessThan( 0 ), flat.negate(), flat );
		const oriented = select( dot( normalWorldGeometry, facing ).lessThan( 0 ), normalWorldGeometry.negate(), normalWorldGeometry );
		const normal = select( dot( normalWorldGeometry, normalWorldGeometry ).greaterThan( 0.25 ), oriented, normalize( facing ) );

		this._gbuffer = gbuffer;
		// the velocity needs the transforms of the last frame of every object, so it is only there on request

		const outputs = { output, albedo: vec4( diffuseColor.rgb, 1 ), normal: vec4( normal, 1 ) };
		if ( this.velocity ) outputs.velocity = velocity;

		this._mrt = this._mrts[ index ] = mrt( outputs );
		this._gbuffers[ index ] = gbuffer;

		return gbuffer;

	}

	/**
	 * Disposes the BVH and the buffers of the scene.
	 *
	 * @private
	 */
	_clearScene() {

		this._bvh?.dispose();
		this._sceneData?.value.dispose();
		this._collectedGeometry?.dispose();

		this._bvh = this._sceneData = this._materialData = this._collectedGeometry = null;
		this._materials = [];

	}

	/**
	 * Takes the sky from the background of a scene: an equirectangular or cube texture, oriented like the rendered
	 * background.
	 *
	 * @private
	 * @param {?Scene} scene - The scene.
	 */
	_setEnvironment( scene ) {

		const background = scene !== null ? scene.background : null;

		if ( background !== null && ( background.isCubeTexture === true || background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) ) {

			this._environment = background;
			this._environmentIntensity.value = scene.backgroundIntensity;
			this._environmentRotation.value.makeRotationFromEuler( scene.backgroundRotation ).transpose();

		} else {

			this._environment = null;

		}

	}

	/**
	 * Merges the visible meshes of a scene into one world space geometry, with the material of each triangle, see
	 * `setSceneData()`.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 * @return {{geometry: BufferGeometry, materials: Array<Material>, materialIndices: Uint32Array}} The triangles.
	 */
	_collect( scene ) {

		scene.updateMatrixWorld();

		const positions = [];
		const materialIndices = [];
		const materials = [];
		const indices = new Map();

		scene.traverseVisible( ( object ) => {

			if ( object.isMesh !== true || object.isSkinnedMesh === true || object.isInstancedMesh === true || object.isBatchedMesh === true ) return;

			// the meshes of a light, e.g. its helper or bulb, would add its light again and occlude its shadow rays

			for ( let parent = object.parent; parent !== null; parent = parent.parent ) if ( parent.isLight === true ) return;

			const geometry = object.geometry;
			const position = geometry.getAttribute( 'position' );
			const index = geometry.getIndex();

			// mirrored transforms flip the winding of the world space triangles

			const order = object.matrixWorld.determinant() < 0 ? [ 0, 2, 1 ] : [ 0, 1, 2 ];

			const count = index !== null ? index.count : position.count;
			const drawStart = Math.max( 0, geometry.drawRange.start );
			const drawEnd = Math.min( count, geometry.drawRange.start + geometry.drawRange.count );

			// geometry groups only apply to material arrays

			const groups = Array.isArray( object.material ) ? geometry.groups : [ { start: 0, count: Infinity, materialIndex: 0 } ];

			for ( const group of groups ) {

				const material = Array.isArray( object.material ) ? object.material[ group.materialIndex ] : object.material;

				if ( material === undefined || material.visible === false ) continue;

				if ( indices.has( material ) === false ) {

					indices.set( material, materials.length );
					materials.push( material );

				}

				const materialIndex = indices.get( material );
				const start = Math.max( drawStart, group.start );
				const end = Math.min( drawEnd, group.start + group.count );

				for ( let i = start; i + 2 < end; i += 3 ) {

					for ( const v of order ) {

						_position.fromBufferAttribute( position, index !== null ? index.getX( i + v ) : i + v ).applyMatrix4( object.matrixWorld );
						positions.push( _position.x, _position.y, _position.z );

					}

					materialIndices.push( materialIndex );

				}

			}

		} );

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.setIndex( new BufferAttribute( new Uint32Array( positions.length / 3 ).map( ( value, i ) => i ), 1 ) );

		return { geometry, materials, materialIndices: new Uint32Array( materialIndices ) };

	}

	/**
	 * Creates the functions that trace rays through the BVH.
	 *
	 * @private
	 * @param {Sphere} sphere - The bounding sphere of the scene.
	 */
	_createTrace( sphere ) {

		const { raycastFirstHit } = this._bvh.fns;
		const { attributes } = this._bvh.storage;
		const { center, radius } = sphere;

		// whether a ray is traced: not if it isn't finite, as it passes every bounds test and walks the whole BVH,
		// which can hang the GPU (the exponent bits are tested since WGSL may assume that there are no NaNs), nor if
		// it starts far outside the scene, from where the boxes of the BVH collapse within the precision of a float
		// and a ray toward the scene walks it all too, though the scene covers a negligible part of its sky

		const traceable = wgslTagFn/* wgsl */`
			// fn
			fn realtimeRadianceCascadesTraceable( origin: vec3f, direction: vec3f ) -> bool {

				let infinite = vec3u( 0x7f800000u );

				if ( any( ( bitcast<vec3u>( origin ) & infinite ) == infinite ) || any( ( bitcast<vec3u>( direction ) & infinite ) == infinite ) ) {

					return false;

				}

				return distance( origin, vec3f( ${ center.x }, ${ center.y }, ${ center.z } ) ) < ${ radius * 100 };

			}
		`;

		// traces a ray and returns the barycentric coordinates of the closest hit, its triangle plus one, negated
		// for back faces, and its distance, or zeros if nothing is hit

		this._trace = wgslTagFn/* wgsl */`
			// fn
			fn realtimeRadianceCascadesTrace( origin: vec3f, direction: vec3f ) -> vec4f {

				if ( ! ${ traceable }( origin, direction ) ) {

					return vec4f( 0.0 );

				}

				var ray: ${ rayStruct };
				ray.origin = origin;
				ray.direction = direction;
				ray.maxDist = 0.0;

				var hit: ${ rayIntersectionResultStruct };
				${ raycastFirstHit }( ray, &hit );

				if ( ! hit.didHit ) {

					return vec4f( 0.0 );

				}

				return vec4f( hit.barycoord.yz, hit.side * ( f32( hit.indices.x / 3u ) + 1.0 ), hit.dist );

			}
		`;

		// the normal of the face that a ray hit, on the side the ray came from

		this._faceNormal = wgslTagFn/* wgsl */`
			// fn
			fn realtimeRadianceCascadesFaceNormal( hit: vec4f, direction: vec3f ) -> vec3f {

				let vertex = ( u32( abs( hit.z ) ) - 1u ) * 3u;
				let a = ${ attributes }[ vertex ].position.xyz;
				let b = ${ attributes }[ vertex + 1u ].position.xyz;
				let c = ${ attributes }[ vertex + 2u ].position.xyz;
				let face = cross( b - a, c - a ) / max( length( cross( b - a, c - a ) ), 1e-20 );

				return select( face, - face, dot( face, direction ) > 0.0 );

			}
		`;

		// whether a shadow ray reaches a distance, zero means unbounded

		this._visibility = wgslTagFn/* wgsl */`
			// fn
			fn realtimeRadianceCascadesVisibility( origin: vec3f, direction: vec3f, maxDist: f32 ) -> f32 {

				if ( ! ${ traceable }( origin, direction ) ) {

					return 0.0;

				}

				var ray: ${ rayStruct };
				ray.origin = origin;
				ray.direction = direction;
				ray.maxDist = maxDist;

				var hit: ${ rayIntersectionResultStruct };

				return select( 1.0, 0.0, ${ raycastFirstHit }( ray, &hit ) );

			}
		`;

	}

	/**
	 * The radiance of the sky in a world direction.
	 *
	 * @private
	 * @param {Node<vec3>} direction - The direction.
	 * @return {Node<vec3>} The radiance.
	 */
	_skyRadiance( direction ) {

		return pmremTexture( this._environment, this._environmentRotation.mul( vec4( direction, 0 ) ).xyz, float( 0 ) ).rgb.mul( this._environmentIntensity );

	}

	/**
	 * The material of a hit: whether its side is visible, its diffuse color and its emitted radiance.
	 *
	 * @private
	 * @param {Node<vec4>} hit - The hit, see `_trace`.
	 * @return {{facing: Node<float>, albedo: Node<vec3>, emission: Node<vec3>}} The material.
	 */
	_hitMaterial( hit ) {

		const data = this._sceneData;
		const entry = data.element( uint( abs( hit.z ) ).add( this._triangleOffset - 1 ) ).mul( 8 ).toVar();
		const word = ( i ) => uintBitsToFloat( data.element( entry.add( i ) ) );

		return {
			facing: select( hit.z.lessThan( 0 ), word( 7 ), word( 3 ) ),
			albedo: vec3( word( 0 ), word( 1 ), word( 2 ) ),
			emission: vec3( word( 4 ), word( 5 ), word( 6 ) )
		};

	}

	/**
	 * Renders the sky of the scene background into an equirectangular texture, which the rays sample:
	 * compute shaders can not sample a PMREM, whose cube texture defaults to the reflection vector of the camera.
	 *
	 * @private
	 */
	_createSky( renderer ) {

		this._skyTarget?.dispose();
		this._skyTarget = null;

		if ( this._environment === null ) return;

		const target = new RenderTarget( 256, 128, { type: HalfFloatType, depthBuffer: false } );
		const material = new NodeMaterial();

		material.fragmentNode = Fn( () => {

			const phi = uv().x.sub( 0.5 ).mul( 2 * Math.PI );
			const theta = uv().y.sub( 0.5 ).mul( Math.PI );
			const direction = vec3( cos( theta ).mul( cos( phi ) ), sin( theta ), cos( theta ).mul( sin( phi ) ) );

			return vec4( this._skyRadiance( direction ), 1 );

		} )();

		const quad = new QuadMesh( material );
		const previousTarget = renderer.getRenderTarget();

		renderer.setRenderTarget( target );
		quad.render( renderer );
		renderer.setRenderTarget( previousTarget );

		material.dispose();

		this._skyTarget = target;

	}

	/**
	 * Copies the colors of the materials that changed into the scene buffer.
	 *
	 * @private
	 */
	_updateMaterials() {

		const data = this._materialData;

		if ( data === null ) return;

		let changed = false;

		for ( let i = 0; i < this._materials.length; i ++ ) {

			materialEntry( this._materials[ i ], _entry );

			for ( let k = 0; k < 8; k ++ ) {

				if ( data[ i * 8 + k ] !== _entry[ k ] ) {

					data[ i * 8 + k ] = _entry[ k ];
					changed = true;

				}

			}

		}

		if ( changed ) {

			const attribute = this._sceneData.value;

			attribute.clearUpdateRanges();
			attribute.addUpdateRange( 0, data.length );
			attribute.needsUpdate = true;

		}

	}

	/**
	 * Returns a uniform array with room for some lights, three vectors each: the given one if it has room, else a
	 * larger one, which rebuilds the passes. The room only grows, so that lights that come and go do not rebuild them.
	 *
	 * @private
	 * @param {?UniformArrayNode} lights - The uniform array of the lights, or null.
	 * @param {number} count - The lights.
	 * @return {?UniformArrayNode} The uniform array, or null without lights.
	 */
	_fitLights( lights, count ) {

		if ( count <= ( lights !== null ? lights.array.length / 3 : 0 ) ) return lights;

		this._disposeKernels( false );

		const capacity = Math.min( 2 ** Math.ceil( Math.log2( count ) ), MAX_LIGHTS );

		return uniformArray( Array.from( { length: capacity * 3 }, () => new Vector4() ), 'vec4' ).setGroup( this._frameUniforms );

	}

	/**
	 * Copies the visible point, spot and rect area lights into the light uniforms, and the sun, see `sun`, into the
	 * sun uniforms, with its shadow map for `useShadowMap`.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 * @return {?DepthTexture} The shadow map of the sun that the passes read, or null.
	 */
	_updateLights( renderer, scene ) {

		const lights = this._sceneLights;
		const rectLights = this._sceneRectLights;
		let sun = this.sun ?? null;

		lights.length = 0;
		rectLights.length = 0;

		scene.traverseVisible( ( object ) => {

			if ( sun === null && this.sun === undefined && object.isDirectionalLight === true ) sun = object;
			if ( ( object.isPointLight === true || object.isSpotLight === true ) && lights.length < MAX_LIGHTS ) lights.push( object );
			if ( object.isRectAreaLight === true && rectLights.length < MAX_LIGHTS ) rectLights.push( object );

		} );

		this._lights = this._fitLights( this._lights, lights.length );
		this._rectLights = this._fitLights( this._rectLights, rectLights.length );

		// three vectors per light: its position and cut-off distance, its color times its intensity and its decay, and
		// the axis of a spot light and the cosine of its cone, scaled so that the dot product of the axis and the
		// direction from the light, minus the cosine, goes from 0 at the edge of the cone to 1 inside its penumbra

		for ( let i = 0; i < lights.length; i ++ ) {

			const light = lights[ i ];
			const array = this._lights.array;

			_position.setFromMatrixPosition( light.matrixWorld );

			array[ i * 3 ].set( _position.x, _position.y, _position.z, light.distance );
			array[ i * 3 + 1 ].set( light.color.r * light.intensity, light.color.g * light.intensity, light.color.b * light.intensity, light.decay );

			if ( light.isSpotLight === true ) {

				light.target.updateMatrixWorld();

				const coneCos = Math.cos( light.angle );
				const scale = 1 / Math.max( Math.cos( light.angle * ( 1 - light.penumbra ) ) - coneCos, 1e-4 );

				_direction.setFromMatrixPosition( light.target.matrixWorld ).sub( _position ).normalize().multiplyScalar( scale );
				array[ i * 3 + 2 ].set( _direction.x, _direction.y, _direction.z, coneCos * scale );

			} else {

				array[ i * 3 + 2 ].set( 0, 0, 0, - 1 );

			}

		}

		// three vectors per rect area light: its center, half width and half height, which it shines away from on the
		// side of its local -z, with its color times its intensity in their fourth components

		for ( let i = 0; i < rectLights.length; i ++ ) {

			const light = rectLights[ i ];
			const array = this._rectLights.array;
			const { r, g, b } = light.color;

			_rotation.extractRotation( light.matrixWorld );
			_position.setFromMatrixPosition( light.matrixWorld );
			array[ i * 3 ].set( _position.x, _position.y, _position.z, r * light.intensity );

			_direction.set( light.width * 0.5, 0, 0 ).applyMatrix4( _rotation );
			array[ i * 3 + 1 ].set( _direction.x, _direction.y, _direction.z, g * light.intensity );

			_direction.set( 0, light.height * 0.5, 0 ).applyMatrix4( _rotation );
			array[ i * 3 + 2 ].set( _direction.x, _direction.y, _direction.z, b * light.intensity );

		}

		this._lightCount.value = lights.length;
		this._rectLightCount.value = rectLights.length;

		if ( sun === null ) {

			this._sunColor.value.set( 0, 0, 0 );
			return null;

		}

		sun.updateMatrixWorld();
		sun.target.updateMatrixWorld();

		this._sunDirection.value.setFromMatrixPosition( sun.matrixWorld ).sub( _position.setFromMatrixPosition( sun.target.matrixWorld ) ).normalize();
		this._sunColor.value.set( sun.color.r, sun.color.g, sun.color.b ).multiplyScalar( sun.intensity );

		// the shadow map of the last render of the scene, see ShadowNode

		const shadow = sun.shadow;
		const camera = shadow.camera;
		const map = this.useShadowMap && sun.castShadow && renderer.shadowMap.enabled ? shadow.map?.depthTexture ?? null : null;

		if ( map === null || map.isArrayTexture === true || camera.isOrthographicCamera !== true ) return null;

		this._shadowMatrix.value.copy( shadow.matrix );
		this._shadowSize.value.set( map.image.width, map.image.height );
		this._shadowOffset.value = Math.max( ( camera.right - camera.left ) / map.image.width, ( camera.top - camera.bottom ) / map.image.height ) / camera.zoom;
		this._shadowSign.value = renderer.reversedDepthBuffer ? - 1 : 1;

		return map;

	}

	// --- shader helpers ---

	/**
	 * The world position of a screen coordinate and depth.
	 *
	 * @private
	 */
	_worldPosition( uv, depth ) {

		const view = getViewPosition( uv, depth, this._projectionInverse );

		return this._cameraWorld.mul( vec4( view, 1 ) ).xyz;

	}

	/**
	 * The normal of a pixel of the G-buffer, which is on the side of the visible face. Flipping it towards the camera
	 * instead would turn smooth normals that point a little away from it at grazing angles into the surface, whose
	 * pixels would then gather the light behind it.
	 *
	 * @private
	 */
	_facingNormal( normal ) {

		return normalize( normal );

	}

	/**
	 * The surface of a pixel of the G-buffer.
	 *
	 * @private
	 */
	_pixelSurface( pixel ) {

		const depth = texture( this._gbuffer.depthTexture ).load( pixel ).x.toVar();
		const uv = vec2( pixel ).add( 0.5 ).div( this._resolution.xy );
		const position = this._worldPosition( uv, depth ).toVar();
		const normal = this._facingNormal( texture( this._gbuffer.textures[ 2 ] ).load( pixel ).xyz ).toVar();

		return { valid: isBackgroundDepth( depth ).not(), position, normal };

	}

	/**
	 * The continuous level of detail of a position: the octaves of its Chebyshev distance to the camera over
	 * `levelDistance`.
	 *
	 * @private
	 */
	_levelIndex( position ) {

		const offset = abs( position.sub( this._cameraPosition ) ).toVar();

		return log2( max( offset.x, max( offset.y, offset.z ) ).div( this.levelDistance ).max( 1e-6 ) ).add( this._lodBias );

	}

	/**
	 * The level of detail of a position, or -1 beyond the last: `estimate_lod()` in chandra.
	 *
	 * @private
	 */
	_levelOf( position ) {

		const level = int( ceil( this._levelIndex( position ).max( 0 ) ) ).toVar();

		return select( level.greaterThanEqual( this.levels ), int( - 1 ), level );

	}

	/**
	 * The levels of detail of a position and their weights: near the boundary of the next level both, see
	 * `blendingRadius` (`iter_lods()` in chandra). The second weight is zero if there is one level. The first
	 * level is -1 beyond the last.
	 *
	 * @private
	 */
	_levelsOf( position ) {

		const index = this._levelIndex( position ).max( - 0.9 ).toVar();
		const lower = int( ceil( index ) ).toVar();
		const valid = lower.greaterThanEqual( 0 ).and( lower.lessThan( this.levels ) ).toVar();

		// the weight of the finer level falls from 1 to 0 over the last log2( blendingRadius ) of its octave of the
		// distance

		const finer = float( 1 ).sub( index.sub( float( lower ).sub( 1 ) ) ).div( this._blendingOctaves.max( 1e-3 ) ).clamp( 0, 1 ).toVar();

		return [
			{ level: lower, weight: select( valid, finer, float( 0 ) ) },
			{ level: lower.add( 1 ), weight: select( valid.and( lower.add( 1 ).lessThan( this.levels ) ), finer.oneMinus(), float( 0 ) ) }
		];

	}

	/**
	 * The level of detail of a position with the larger weight, or -1 beyond the last, which always has probes:
	 * the pixels count and trace their rays in its probes (`estimate_lod()` in chandra, whose finer level always
	 * has some weight).
	 *
	 * @private
	 */
	_primaryLevel( position ) {

		const [ first, second ] = this._levelsOf( position );

		return select( first.weight.add( second.weight ).greaterThan( 0 ), select( first.weight.greaterThanEqual( second.weight ), first.level, second.level ), int( - 1 ) );

	}

	/**
	 * The probe spacing of a cascade in a level of detail.
	 *
	 * @private
	 */
	_spacingOf( level, n ) {

		return exp2( float( level ).add( n ) ).mul( this.spacing );

	}

	/**
	 * The cell of a position in a cascade and level of detail.
	 *
	 * @private
	 */
	_cellOf( position, level, n ) {

		return ivec3( floor( position.div( this._spacingOf( level, n ) ) ) );

	}

	/**
	 * The cell of a surface in a cascade and level of detail, from a point in front of it, see `KEY_OFFSET`.
	 *
	 * @private
	 */
	_surfaceCell( position, normal, level, n ) {

		return this._cellOf( position.add( normal.mul( this._spacingOf( level, 0 ).mul( KEY_OFFSET ) ) ), level, n );

	}

	/**
	 * The orientation of a normal: its dominant axis times two, plus one for the negative side, see
	 * `orientations`.
	 *
	 * @private
	 */
	_groupOf( normal ) {

		if ( this.orientations === false ) return uint( 0 );

		const a = abs( normal ).toVar();
		const axis = select( a.x.greaterThanEqual( a.y ).and( a.x.greaterThanEqual( a.z ) ), uint( 0 ), select( a.y.greaterThanEqual( a.z ), uint( 1 ), uint( 2 ) ) ).toVar();
		const component = select( axis.equal( 0 ), normal.x, select( axis.equal( 1 ), normal.y, normal.z ) );

		return axis.mul( 2 ).add( select( component.lessThan( 0 ), uint( 1 ), uint( 0 ) ) );

	}

	/**
	 * The key of a cell in a level of detail: its coordinates modulo 512, which are unique within a level,
	 * and the level.
	 *
	 * @private
	 */
	_keyOf( cell, level ) {

		const c = uint( cell.x ).bitAnd( 511 ).bitOr( uint( cell.y ).bitAnd( 511 ).shiftLeft( 9 ) ).bitOr( uint( cell.z ).bitAnd( 511 ).shiftLeft( 18 ) );

		return c.bitOr( uint( level ).shiftLeft( 27 ) );

	}

	/**
	 * The cell and level of detail of a key in a cascade: the nearest cell to the camera with its coordinates
	 * modulo 512.
	 *
	 * @private
	 */
	_decodeKey( key, n ) {

		const level = int( key.shiftRight( 27 ) ).toVar();
		const wrapped = ivec3( int( key.bitAnd( 511 ) ), int( key.shiftRight( 9 ).bitAnd( 511 ) ), int( key.shiftRight( 18 ).bitAnd( 511 ) ) );
		const camera = this._cellOf( this._cameraPosition, level, n ).toVar();
		const delta = wrapped.sub( camera ).add( 256 ).bitAnd( ivec3( 511 ) ).sub( 256 );

		return { cell: camera.add( delta ), level };

	}

	/**
	 * A counter of the current or last frame.
	 *
	 * @private
	 */
	_counter( index, previous = false ) {

		const half = previous ? uint( 1 ).sub( this._parity ) : this._parity;

		return this._counters.element( half.mul( this._layout.counters ).add( index ) );

	}

	/**
	 * Whether a slot of a cascade holds a probe of this frame.
	 *
	 * @private
	 */
	_isAlive( n, slot ) {

		return this._alive.element( slot.add( this._layout.cascades[ n ].slotOffset ) ).equal( this._frameNode );

	}

	/**
	 * Inserts a key into the current table of a cascade and orientation.
	 *
	 * @private
	 */
	_insert( n, key, group ) {

		const cascade = this._layout.cascades[ n ];
		const base = this._parity.mul( this._layout.tables ).add( cascade.tableOffset ).add( uint( group ).mul( cascade.tableSize ) );

		this._insertInto( this._table, base, cascade.tableSize, key );

	}

	/**
	 * Inserts a key into a hash table at an offset: lock-free, an insertion that meets a larger key takes its
	 * slot and inserts that key further along.
	 *
	 * @private
	 */
	_insertInto( table, offset, size, key ) {

		const mask = size - 1;
		const base = offset.toVar();
		const item = key.toVar();
		const slot = mixKey( item ).bitAnd( mask ).toVar();

		Loop( MAX_PROBES, () => {

			const previous = atomicMin( table.element( base.add( slot ) ), item ).toVar();

			If( previous.equal( EMPTY ).or( previous.equal( item ) ), () => {

				Break();

			} );

			If( previous.greaterThan( item ), () => {

				item.assign( previous );

			} );

			slot.assign( slot.add( 1 ).bitAnd( mask ) );

		} );

	}

	/**
	 * Returns the slot of a key in the current or last table of a cascade and orientation, or `NONE`.
	 *
	 * @private
	 */
	_lookup( n, key, group, previous = false ) {

		const cascade = this._layout.cascades[ n ];
		const mask = cascade.tableSize - 1;

		return Fn( () => {

			const half = previous ? uint( 1 ).sub( this._parity ) : this._parity;
			const base = half.mul( this._layout.tables ).add( cascade.tableOffset ).add( uint( group ).mul( cascade.tableSize ) ).toVar();
			const slot = mixKey( key ).bitAnd( mask ).toVar();
			const probe = uint( NONE ).toVar();

			Loop( MAX_PROBES, () => {

				const entry = atomicLoad( this._table.element( base.add( slot ) ) ).toVar();

				If( entry.equal( key ), () => {

					probe.assign( this._slotOf.element( base.add( slot ) ) );
					Break();

				} );

				If( entry.equal( EMPTY ), () => {

					Break();

				} );

				slot.assign( slot.add( 1 ).bitAnd( mask ) );

			} );

			return probe;

		} )();

	}

	/**
	 * The bin of a direction in a cascade, by its equal-area coordinates (`SphericalEncoder` in chandra).
	 *
	 * @private
	 */
	_binOf( direction, n ) {

		const theta = this._layout.cascades[ n ].theta;
		const u = fract( atan( direction.y, direction.x ).div( 2 * Math.PI ) );
		const v = direction.z.mul( 0.5 ).add( 0.5 ).clamp( 0, 0.9999999 );
		const i = uint( u.mul( 2 * theta ) ).min( 2 * theta - 1 );
		const j = uint( v.mul( theta ) ).min( theta - 1 );

		return j.mul( 2 * theta ).add( i );

	}

	/**
	 * The average radiance over the cosine lobe of a normal at a position: the octahedral irradiance maps of the
	 * probes of the finest cascade around it, weighted by their trilinear weights and their ray counts, within each
	 * level of detail, then blended by the weights of the levels (`shade_optimized_32()` in chandra, which weights the
	 * levels by their ray counts too), and the weight of the levels with probes, 0 without any.
	 *
	 * @private
	 */
	_gather( position, normal ) {

		// the texels of the normal in the octahedral maps

		const texel = octahedralEncode( normal ).mul( IRRADIANCE_SIZE ).sub( 0.5 ).toVar();
		const lowerTexel = ivec2( floor( texel ) ).toVar();
		const t = texel.sub( vec2( lowerTexel ) ).toVar();
		const texels = [];

		for ( let corner = 0; corner < 4; corner ++ ) {

			const index = octahedralTexel( lowerTexel.add( ivec2( corner & 1, corner >> 1 ) ) );
			const weight = ( corner & 1 ? t.x : t.x.oneMinus() ).mul( corner & 2 ? t.y : t.y.oneMinus() );

			texels.push( { index: index.toVar(), weight: weight.toVar() } );

		}

		const group = this._groupOf( normal ).toVar();
		const levels = this._levelsOf( position );
		const sums = levels.map( () => vec4( 0 ).toVar() );

		levels.forEach( ( { level, weight: levelWeight }, i ) => {

			If( levelWeight.greaterThan( 0 ), () => {

				const spacing = this._spacingOf( level, 0 ).toVar();
				const point = position.add( normal.mul( spacing.mul( KEY_OFFSET ) ) ).toVar();
				const lower = ivec3( floor( point.sub( spacing.mul( 0.5 ) ).div( spacing ) ) ).toVar();
				const f = fract( point.div( spacing ).sub( 0.5 ) ).toVar();

				Loop( 8, ( { i: corner } ) => {

					const offset = ivec3( corner.bitAnd( 1 ), corner.shiftRight( 1 ).bitAnd( 1 ), corner.shiftRight( 2 ).bitAnd( 1 ) ).toVar();
					const slot = this._lookup( 0, this._keyOf( lower.add( offset ), level ), group ).toVar();

					If( slot.notEqual( NONE ), () => {

						const w = mix( f.oneMinus(), f, vec3( offset ) );
						const quality = this.useQualityWeight ? this._float( 'quality', slot ) : float( 1 );
						const weight = w.x.mul( w.y ).mul( w.z ).mul( quality ).toVar();
						const base = slot.mul( IRRADIANCE_TEXELS ).toVar();

						for ( const { index, weight: texelWeight } of texels ) {

							sums[ i ].addAssign( this._irradiance.element( base.add( index ) ).mul( texelWeight.mul( weight ) ) );

						}

					} );

				} );

			} );

		} );

		// the probes of the finer level have about a quarter of the rays of the coarser ones, so weighting the levels
		// by their ray counts too would hand most of the weight to the coarser level

		const sum = vec4( 0 ).toVar();

		levels.forEach( ( { weight }, i ) => {

			If( sums[ i ].w.greaterThan( 0 ), () => {

				sum.addAssign( vec4( sums[ i ].rgb.div( sums[ i ].w ), 1 ).mul( weight ) );

			} );

		} );

		return vec4( sum.rgb.div( sum.w.max( 1e-5 ) ), sum.w );

	}

	/**
	 * The average radiance over the cosine lobe of a normal at a hit, from the merged radiance of the last frame
	 * of its secondary probe, two levels coarser (`sample_secondary()` in chandra).
	 *
	 * @private
	 */
	_sampleSecondary( position, normal ) {

		const first = this._layout.cascades[ 0 ];
		const sum = vec4( 0 ).toVar();
		const level = this._levelOf( position ).add( 2 ).toVar();

		If( level.greaterThanEqual( 2 ).and( level.lessThan( this.levels ) ), () => {

			const slot = this._lookup( 0, this._keyOf( this._surfaceCell( position, normal, level, 0 ), level ), this._groupOf( normal ) ).toVar();

			// a probe allocated this frame has no light yet

			If( slot.notEqual( NONE ).and( this._born.element( slot ).notEqual( this._frameNode ) ), () => {

				Loop( { start: 0, end: first.bins, type: 'uint', condition: '<', name: 'bin' }, ( { bin } ) => {

					const weight = dot( binDirection( bin, first.theta ), normal ).toVar();
					const radiance = this._merged.element( slot.mul( first.bins ).add( bin ) ).toVar();

					If( weight.greaterThan( 0 ).and( radiance.w.greaterThan( 0 ) ), () => {

						sum.addAssign( vec4( radiance.rgb, 1 ).mul( weight ) );

					} );

				} );

			} );

		} );

		return sum.rgb.div( sum.w.max( 1e-5 ) );

	}

	// --- passes ---

	/**
	 * Creates the passes that do not depend on the resolution.
	 *
	 * @private
	 */
	_createKernels() {

		const layout = this._layout;
		const cascades = layout.cascades;
		const first = cascades[ 0 ];

		// clears the current table and node set and the counters of the frame

		const clear = Fn( () => {

			If( instanceIndex.lessThan( layout.tables ), () => {

				atomicStore( this._table.element( this._parity.mul( layout.tables ).add( instanceIndex ) ), uint( EMPTY ) );

			} );

			If( instanceIndex.lessThan( layout.counters ), () => {

				atomicStore( this._counter( instanceIndex ), uint( 0 ) );

			} );

		} )().compute( layout.tables ).setName( 'RC.Clear' );

		// the probes of the finest cascade of the last frame that still live, e.g. the secondary ones

		const keep = Fn( () => {

			const slot = instanceIndex;

			If( this._alive.element( slot ).equal( this._frameNode.sub( 1 ) ).and( atomicLoad( this._expiry.element( slot ) ).greaterThanEqual( this._frameNode ) ), () => {

				const key = this._key( slot ).toVar();

				this._insert( 0, this._keyOf( key.xyz, key.w.bitAnd( 15 ) ), uint( key.w.shiftRight( 4 ) ) );

			} );

		} )().compute( first.capacity ).setName( 'RC.Keep' );

		const assign = [], fill = [], free = [], countUp = [], offsets = [], accumulate = [], merge = [];

		for ( let n = 0; n < this.cascades; n ++ ) {

			assign.push( this._createAssign( n ) );
			fill.push( n > 0 ? this._createFill( n ) : null );
			free.push( this._createFree( n ) );
			countUp.push( n > 0 ? this._createCountUp( n ) : null );
			offsets.push( this._createOffsets( n ) );
			accumulate.push( this._createAccumulate( n ) );
			merge.push( this._createMerge( n ) );

		}

		// the octahedral irradiance maps of the probes of the finest cascade: per texel, the merged radiance of the
		// bins weighted by their cosine to the texel's direction, and the sum of the weights

		const irradiance = Fn( () => {

			const slot = instanceIndex.div( IRRADIANCE_TEXELS ).toVar();
			const texel = instanceIndex.mod( IRRADIANCE_TEXELS ).toVar();

			If( this._isAlive( 0, slot ), () => {

				const direction = octahedralDecode( vec2( float( texel.mod( IRRADIANCE_SIZE ) ), float( texel.div( IRRADIANCE_SIZE ) ) ).add( 0.5 ).div( IRRADIANCE_SIZE ) ).toVar();
				const sum = vec4( 0 ).toVar();

				Loop( { start: 0, end: first.bins, type: 'uint', condition: '<', name: 'bin' }, ( { bin } ) => {

					const radiance = this._merged.element( slot.mul( first.bins ).add( bin ) ).toVar();

					If( radiance.w.greaterThan( 0 ), () => {

						sum.addAssign( vec4( radiance.rgb, 1 ).mul( dot( direction, binDirection( bin, first.theta ) ).max( 0 ) ) );

					} );

				} );

				this._irradiance.element( instanceIndex ).assign( sum );

			} );

		} )().compute( first.capacity * IRRADIANCE_TEXELS ).setName( 'RC.Irradiance' );

		return { clear, keep, assign, fill, free, countUp, offsets, accumulate, merge, irradiance };

	}

	/**
	 * Creates the pass that gives the keys of the current table of a cascade their slots: the slot of the last
	 * frame for keys that were in its table, a free slot for new ones.
	 *
	 * @private
	 */
	_createAssign( n ) {

		const cascade = this._layout.cascades[ n ];
		const groups = this._layout.groups;

		return Fn( () => {

			const bucket = instanceIndex;
			const group = bucket.div( cascade.tableSize ).toVar();

			If( bucket.lessThan( cascade.tableSize * groups ), () => {

				const index = this._parity.mul( this._layout.tables ).add( cascade.tableOffset ).add( bucket ).toVar();
				const key = atomicLoad( this._table.element( index ) ).toVar();

				this._slotOf.element( index ).assign( uint( NONE ) );

				If( key.notEqual( EMPTY ), () => {

					const slot = this._lookup( n, key, group, true ).toVar();

					If( slot.equal( NONE ), () => {

						const allocation = atomicAdd( this._counter( ALLOCATED * this.cascades + n ), uint( 1 ) );

						If( allocation.lessThan( atomicLoad( this._counter( FREED * this.cascades + n, true ) ) ), () => {

							slot.assign( this._freeList.element( allocation.add( cascade.slotOffset ) ) );

							const global = slot.add( cascade.slotOffset );

							this._born.element( global ).assign( this._frameNode );
							this._setFloat( 'quality', global, 0 );
							atomicStore( this._expiry.element( global ), uint( 0 ) );

							if ( n === 0 ) atomicAdd( this._counter( 3 * this.cascades ), uint( 1 ) );

						} );

					} );

					If( slot.notEqual( NONE ), () => {

						const global = slot.add( cascade.slotOffset ).toVar();
						const decoded = this._decodeKey( key, n );

						this._slotOf.element( index ).assign( slot );
						this._setKey( global, ivec4( decoded.cell, decoded.level.bitOr( int( group ).shiftLeft( 4 ) ) ) );
						this._alive.element( global ).assign( this._frameNode );

						atomicAdd( this._counter( PROBES * this.cascades + n ), uint( 1 ) );

					} );

				} );

			} );

		} )().compute( cascade.tableSize * groups ).setName( 'RC.Assign' + n );

	}

	/**
	 * Creates the pass that inserts the probes of a cascade: the cells that hold the probes of the finer one.
	 *
	 * @private
	 */
	_createFill( n ) {

		const finer = this._layout.cascades[ n - 1 ];

		return Fn( () => {

			const slot = instanceIndex;

			If( this._isAlive( n - 1, slot ), () => {

				const key = this._key( slot.add( finer.slotOffset ) ).toVar();

				this._insert( n, this._keyOf( ivec3( floor( vec3( key.xyz ).mul( 0.5 ) ) ), key.w.bitAnd( 15 ) ), uint( key.w.shiftRight( 4 ) ) );

			} );

		} )().compute( finer.capacity ).setName( 'RC.Fill' + n );

	}

	/**
	 * Creates the pass that lists the slots of a cascade without a probe this frame, for the next frame, and
	 * resets the ray counts of the slots.
	 *
	 * @private
	 */
	_createFree( n ) {

		const cascade = this._layout.cascades[ n ];

		return Fn( () => {

			const slot = instanceIndex;
			const global = slot.add( cascade.slotOffset ).toVar();

			atomicStore( this._rayCount.element( global ), uint( 0 ) );

			if ( n === 0 ) atomicStore( this._rayIndex.element( slot ), uint( 0 ) );

			If( this._isAlive( n, slot ).not(), () => {

				const index = atomicAdd( this._counter( FREED * this.cascades + n ), uint( 1 ) );

				this._freeList.element( index.add( cascade.slotOffset ) ).assign( slot );

			} );

		} )().compute( cascade.capacity ).setName( 'RC.Free' + n );

	}

	/**
	 * Creates the pass that adds the rays of the probes of a cascade to the next coarser one.
	 *
	 * @private
	 */
	_createCountUp( n ) {

		const finer = this._layout.cascades[ n - 1 ];
		const cascade = this._layout.cascades[ n ];

		return Fn( () => {

			const slot = instanceIndex;

			If( this._isAlive( n - 1, slot ), () => {

				const global = slot.add( finer.slotOffset ).toVar();
				const rays = atomicLoad( this._rayCount.element( global ) ).toVar();

				If( rays.greaterThan( 0 ), () => {

					const key = this._key( global ).toVar();
					const parent = this._lookup( n, this._keyOf( ivec3( floor( vec3( key.xyz ).mul( 0.5 ) ) ), key.w.bitAnd( 15 ) ), uint( key.w.shiftRight( 4 ) ) ).toVar();

					If( parent.notEqual( NONE ), () => {

						atomicAdd( this._rayCount.element( parent.add( cascade.slotOffset ) ), rays );

					} );

				} );

			} );

		} )().compute( finer.capacity ).setName( 'RC.CountUp' + n );

	}

	/**
	 * Creates the pass that gives the probes of a cascade their contiguous ranges of the R2 sequence: the
	 * coarsest ones from a counter, the finer ones split the range of the coarser probe around them
	 * (`compute_ray_offset()` in chandra).
	 *
	 * @private
	 */
	_createOffsets( n ) {

		const cascades = this._layout.cascades;
		const last = n === this.cascades - 1;
		const cascade = last ? cascades[ n ] : cascades[ n + 1 ];

		return Fn( () => {

			const slot = instanceIndex;

			if ( last ) {

				If( this._isAlive( n, slot ), () => {

					const global = slot.add( cascade.slotOffset ).toVar();
					const rays = atomicLoad( this._rayCount.element( global ) );

					this._rayOffset.element( global ).assign( atomicAdd( this._counter( 3 * this.cascades + 1 ), rays ) );

				} );

			} else {

				const finer = cascades[ n ];

				If( this._isAlive( n + 1, slot ), () => {

					const global = slot.add( cascade.slotOffset ).toVar();
					const key = this._key( global ).toVar();
					const offset = this._rayOffset.element( global ).toVar();

					Loop( 8, ( { i } ) => {

						const corner = ivec3( i.bitAnd( 1 ), i.shiftRight( 1 ).bitAnd( 1 ), i.shiftRight( 2 ).bitAnd( 1 ) );
						const child = this._lookup( n, this._keyOf( key.xyz.mul( 2 ).add( corner ), key.w.bitAnd( 15 ) ), uint( key.w.shiftRight( 4 ) ) ).toVar();

						If( child.notEqual( NONE ), () => {

							const childGlobal = child.add( finer.slotOffset ).toVar();

							this._rayOffset.element( childGlobal ).assign( offset );
							offset.addAssign( atomicLoad( this._rayCount.element( childGlobal ) ) );

						} );

					} );

				} );

			}

		} )().compute( cascade.capacity ).setName( 'RC.Offsets' + n );

	}

	/**
	 * Creates the pass that adds the rays of a frame to the bins of a cascade, after decaying their sums, and
	 * updates the ray counts of the probes.
	 *
	 * @private
	 */
	_createAccumulate( n ) {

		const cascade = this._layout.cascades[ n ];

		// a group of up to 64 threads per slot, each with some of its bins, so that the threads of a slot without a
		// probe stop at once

		const lanes = Math.min( cascade.bins, 64 );

		return Fn( () => {

			const slot = instanceIndex.div( lanes ).toVar();
			const lane = instanceIndex.mod( lanes ).toVar();

			If( this._isAlive( n, slot ), () => {

				const global = slot.add( cascade.slotOffset ).toVar();
				const born = this._born.element( global ).equal( this._frameNode ).toVar();

				Loop( { start: uint( 0 ), end: uint( cascade.bins / lanes ), type: 'uint', condition: '<', name: 'j' }, ( { j } ) => {

					const bin = lane.add( j.mul( lanes ) ).toVar();
					const index = slot.mul( cascade.bins ).add( bin ).add( cascade.binOffset ).toVar();
					const base = index.mul( WORDS ).toVar();
					const fluence = vec4( 0 ).toVar();
					const weight = float( 0 ).toVar();

					// the decay of the last frame's sums, which chandra applies after the merge

					If( born.not(), () => {

						fluence.assign( this._fluence.element( index ) );
						weight.assign( this._float( 'weights', index ) );

						If( weight.greaterThan( this._minDirectionWeight ), () => {

							fluence.mulAssign( this._qualityDecay );
							weight.mulAssign( this._qualityDecay );

						} );

					} );

					const rays = atomicLoad( this._deposits.element( base.add( 4 ) ) ).min( MAX_RAYS ).toVar();

					If( rays.greaterThan( 0 ), () => {

						const word = ( k ) => float( atomicLoad( this._deposits.element( base.add( k ) ) ) );

						fluence.addAssign( vec4( vec3( word( 0 ), word( 1 ), word( 2 ) ).div( SCALE ), word( 3 ) ) );
						weight.addAssign( float( rays ) );

						for ( let k = 0; k < WORDS; k ++ ) atomicStore( this._deposits.element( base.add( k ) ), uint( 0 ) );

					} );

					this._fluence.element( index ).assign( fluence );
					this._setFloat( 'weights', index, weight );

					If( bin.equal( 0 ), () => {

						const quality = select( born, float( 0 ), this._float( 'quality', global ).mul( this._qualityDecay ) );

						this._setFloat( 'quality', global, quality.add( float( atomicLoad( this._deposited.element( global ) ) ) ) );
						atomicStore( this._deposited.element( global ), uint( 0 ) );

					} );

				} );

			} );

		} )().compute( cascade.capacity * lanes ).setName( 'RC.Accumulate' + n );

	}

	/**
	 * Creates the pass that merges a cascade with the next coarser one: the mean radiance of the interval of a
	 * bin, plus the light beyond it times its mean transmittance, interpolated from the 8 coarser probes around
	 * weighted by their ray counts. Bins without rays have no light. The coarser cascades store the mean of the
	 * bins with light within each bin of the next finer one (`merge_cache_raw()` in chandra).
	 *
	 * @private
	 */
	_createMerge( n ) {

		const layout = this._layout;
		const cascade = layout.cascades[ n ];
		const coarser = layout.cascades[ n + 1 ] ?? null;
		const theta = cascade.theta;

		// a group of up to 64 threads per slot, each with some of its outputs, see _createAccumulate()

		const lanes = Math.min( cascade.outputs, 64 );

		return Fn( () => {

			const slot = instanceIndex.div( lanes ).toVar();
			const lane = instanceIndex.mod( lanes ).toVar();

			If( this._isAlive( n, slot ), () => {

				const key = this._key( slot.add( cascade.slotOffset ) ).toVar();
				const corners = [];

				if ( coarser !== null ) {

					// the coarser cells around this one lie a quarter and three quarters of a cell away

					const cell = key.xyz.toVar();
					const lower = ivec3( floor( vec3( cell.sub( 1 ) ).mul( 0.5 ) ) ).toVar();
					const lowerWeight = vec3( cell.bitAnd( ivec3( 1 ) ) ).mul( 0.5 ).add( 0.25 ).toVar();

					for ( let corner = 0; corner < 8; corner ++ ) {

						const offset = ivec3( corner & 1, ( corner >> 1 ) & 1, ( corner >> 2 ) & 1 );
						const probe = this._lookup( n + 1, this._keyOf( lower.add( offset ), key.w.bitAnd( 15 ) ), uint( key.w.shiftRight( 4 ) ) ).toVar();
						const wx = ( corner & 1 ) ? lowerWeight.x.oneMinus() : lowerWeight.x;
						const wy = ( corner & 2 ) ? lowerWeight.y.oneMinus() : lowerWeight.y;
						const wz = ( corner & 4 ) ? lowerWeight.z.oneMinus() : lowerWeight.z;
						const weight = wx.mul( wy ).mul( wz ).toVar();

						if ( this.useQualityWeight ) {

							If( probe.notEqual( NONE ), () => {

								weight.mulAssign( this._float( 'quality', probe.add( coarser.slotOffset ) ) );

							} );

						}

						corners.push( { probe, weight } );

					}

				}

				const lightOf = ( bin ) => {

					const index = slot.mul( cascade.bins ).add( bin ).add( cascade.binOffset ).toVar();
					const weight = this._float( 'weights', index ).toVar();
					const fluence = this._fluence.element( index ).div( weight.max( 1e-4 ) ).toVar();
					const radiance = fluence.rgb.toVar();

					if ( coarser !== null ) {

						const sum = vec4( 0 ).toVar();

						for ( const { probe, weight: probeWeight } of corners ) {

							If( probe.notEqual( NONE ), () => {

								const value = this._merged.element( probe.mul( coarser.outputs ).add( bin ).add( coarser.mergedOffset ) ).toVar();

								If( value.w.greaterThan( 0 ), () => {

									sum.addAssign( vec4( value.rgb, 1 ).mul( probeWeight ) );

								} );

							} );

						}

						radiance.addAssign( sum.rgb.div( sum.w.max( 1e-5 ) ).mul( fluence.a ) );

					}

					return { radiance, valid: weight.greaterThanEqual( 1e-4 ) };

				};

				Loop( { start: uint( 0 ), end: uint( cascade.outputs / lanes ), type: 'uint', condition: '<', name: 'j' }, ( { j } ) => {

					const output = lane.add( j.mul( lanes ) ).toVar();
					const target = this._merged.element( slot.mul( cascade.outputs ).add( output ).add( cascade.mergedOffset ) );

					if ( n === 0 ) {

						const { radiance, valid } = lightOf( output );

						target.assign( select( valid, vec4( radiance, 1 ), vec4( 0 ) ) );

					} else {

						const column = output.mod( theta ).mul( 2 ).toVar();
						const row = output.div( theta ).mul( 2 ).toVar();
						const sum = vec4( 0 ).toVar();

						for ( let child = 0; child < 4; child ++ ) {

							const bin = row.add( child >> 1 ).mul( 2 * theta ).add( column.add( child & 1 ) );
							const { radiance, valid } = lightOf( bin );

							If( valid, () => {

								sum.addAssign( vec4( radiance, 1 ) );

							} );

						}

						target.assign( select( sum.w.greaterThan( 0 ), vec4( sum.rgb.div( sum.w ), 1 ), vec4( 0 ) ) );

					}

				} );

			} );

		} )().compute( cascade.capacity * lanes ).setName( 'RC.Merge' + n );

	}

	/**
	 * Creates the passes that depend on the resolution: the probes of the pixels and of the hits, the rays of
	 * the probes, and the rays.
	 *
	 * @private
	 */
	_createFrameKernels() {

		const capacity = this._hitCapacity;
		const width = this._screenWidth, height = this._screenHeight;

		// per pixel, the hit of its ray: the position and the frame, and the normal

		this._hits = storage( new StorageBufferAttribute( new Float32Array( capacity * 8 ), 4 ), 'vec4', capacity * 2 );

		// the points of the grid on which the pixels gather the light, see update(): the cells, and the pixels at their
		// centers

		const shading = this._shading;

		const shadingPoint = ( index ) => {

			const columns = uint( shading.y );
			const cell = ivec2( int( index.mod( columns ) ), int( index.div( columns ) ) ).toVar();
			const pixel = ivec2( vec2( cell ).add( 0.5 ).mul( shading.x ) ).min( ivec2( int( width ).sub( 1 ), int( height ).sub( 1 ) ) ).toVar();

			return { cell, pixel };

		};

		// every point of the grid inserts the probes of its levels of detail, except those of the point to its left: a
		// probe covers many points, and only the first point of each run along a row inserting it halves the time of
		// the pass

		const gather = Fn( () => {

			If( float( instanceIndex ).lessThan( shading.z ), () => {

				const { cell, pixel } = shadingPoint( instanceIndex );
				const surface = this._pixelSurface( pixel );

				If( surface.valid, () => {

					const group = this._groupOf( surface.normal ).toVar();

					// the keys of the point to the left, NONE where it inserts none

					const left = this._pixelSurface( shadingPoint( instanceIndex.max( 1 ).sub( 1 ) ).pixel );
					const leftKeys = [ uint( NONE ).toVar(), uint( NONE ).toVar() ];

					If( left.valid.and( cell.x.greaterThan( 0 ) ).and( this._groupOf( left.normal ).equal( group ) ), () => {

						this._levelsOf( left.position ).forEach( ( { level, weight }, i ) => {

							If( weight.greaterThan( 0 ), () => {

								leftKeys[ i ].assign( this._keyOf( this._surfaceCell( left.position, left.normal, level, 0 ), level ) );

							} );

						} );

					} );

					for ( const { level, weight } of this._levelsOf( surface.position ) ) {

						const key = this._keyOf( this._surfaceCell( surface.position, surface.normal, level, 0 ), level ).toVar();

						If( weight.greaterThan( 0 ).and( key.notEqual( leftKeys[ 0 ] ) ).and( key.notEqual( leftKeys[ 1 ] ) ), () => {

							this._insert( 0, key, group );

						} );

					}

				} );

			} );

		} )().computeKernel().setName( 'RC.Gather' );

		// the light of the points of the grid, which the pixels interpolate, see getIrradianceNode(): w is the weight of
		// the levels of detail with probes, 0 without any or on the background

		const shade = Fn( () => {

			If( float( instanceIndex ).lessThan( shading.z ).and( shading.x.greaterThanEqual( 1.5 ) ), () => {

				const { cell, pixel } = shadingPoint( instanceIndex );
				const surface = this._pixelSurface( pixel );
				const light = vec4( 0 ).toVar();

				If( surface.valid, () => {

					light.assign( this._gather( surface.position, surface.normal ) );

				} );

				textureStore( this._shadeTexture, uvec2( cell ), light ).toWriteOnly();

			} );

		} )().computeKernel().setName( 'RC.Shade' );

		// a pixel of each cell of a grid traces a ray, see update(): a random one, shifted along the R2 sequence every
		// frame. Neighbouring threads trace from neighbouring cells, so that their rays start close together

		const tracedPixel = ( index, rays = this._rays, frame = this._frameNode ) => {

			const columns = uint( rays.y );
			const cell = vec2( float( index.mod( columns ) ), float( index.div( columns ) ) );
			const shift = vec2( float( frame.mul( R2[ 0 ] ) ), float( frame.mul( R2[ 1 ] ) ) ).mul( 2 ** - 32 );
			const offset = fract( vec2( hash( index ), hash( index.add( 0x5bd1e995 ) ) ).add( shift ) );
			const pixel = ivec2( cell.add( offset ).mul( rays.x ) ).toVar();

			return { pixel, valid: float( index ).lessThan( rays.z ).and( pixel.x.lessThan( int( width ) ) ).and( pixel.y.lessThan( int( height ) ) ) };

		};

		// the hits of the rays of the last frame, at the pixels that traced them: they insert their secondary probes,
		// two levels coarser, and trace their rays. The passes run over the rays rather than the pixels, of which only
		// some have a hit, so that the threads of a SIMD group all trace

		const secondaryHit = ( ray ) => {

			const traced = tracedPixel( ray, this._previousRays, this._frameNode.sub( 1 ) );
			const index = uint( traced.pixel.y ).mul( width ).add( uint( traced.pixel.x ) ).toVar();
			const position = this._hits.element( index.mul( 2 ) ).toVar();
			const valid = traced.valid.and( position.w.equal( float( this._frameNode.sub( 1 ) ) ) ).and( this._frameNode.greaterThan( 1 ) );
			const level = this._levelOf( position.xyz ).add( 2 ).toVar();

			return { valid: valid.and( level.greaterThanEqual( 2 ) ).and( level.lessThan( this.levels ) ), position: position.xyz, normal: this._hits.element( index.mul( 2 ).add( 1 ) ).xyz, level, index };

		};

		const gatherSecondary = this.secondary ? Fn( () => {

			const hit = secondaryHit( instanceIndex );

			If( hit.valid, () => {

				this._insert( 0, this._keyOf( this._surfaceCell( hit.position, hit.normal, hit.level, 0 ), hit.level ), this._groupOf( hit.normal ) );

			} );

		} )().computeKernel().setName( 'RC.GatherSecondary' ) : null;

		// the rays of the probes of the finest cascade, from their pixels in their level of detail

		const count = Fn( () => {

			const { pixel, valid } = tracedPixel( instanceIndex );

			If( valid, () => {

				const surface = this._pixelSurface( pixel );
				const level = this._primaryLevel( surface.position ).toVar();

				If( surface.valid.and( level.greaterThanEqual( 0 ) ), () => {

					const slot = this._lookup( 0, this._keyOf( this._surfaceCell( surface.position, surface.normal, level, 0 ), level ), this._groupOf( surface.normal ) ).toVar();

					If( slot.notEqual( NONE ), () => {

						atomicAdd( this._rayCount.element( slot ), uint( 1 ) );

					} );

				} );

			} );

		} )().computeKernel().setName( 'RC.Count' );

		const trace = Fn( () => {

			const { pixel, valid } = tracedPixel( instanceIndex );

			If( valid, () => {

				const surface = this._pixelSurface( pixel );
				const index = uint( pixel.y ).mul( width ).add( uint( pixel.x ) ).toVar();

				// pixels without a ray this frame have no hit

				this._hits.element( index.mul( 2 ) ).w.assign( 0 );

				If( surface.valid, () => {

					this._tracePrimary( surface, index );

				} );

			} );

		} )().computeKernel().setName( 'RC.Trace' );

		const traceSecondary = this.secondary ? Fn( () => {

			const hit = secondaryHit( instanceIndex );

			If( hit.valid, () => {

				this._traceSecondary( hit, hit.index );

			} );

		} )().computeKernel().setName( 'RC.TraceSecondary' ) : null;

		return { gather, shade, gatherSecondary, count, trace, traceSecondary };

	}

	/**
	 * Traces the ray of a pixel in the direction of its probe's R2 sequence, records its hit and deposits it into
	 * the cascades of the levels of detail of the pixel (`compute_rays()` in chandra).
	 *
	 * @private
	 */
	_tracePrimary( surface, index ) {

		const { position, normal } = surface;
		const level = this._primaryLevel( position ).toVar();
		const direction = vec3( 0, 0, 1 ).toVar();

		If( level.greaterThanEqual( 0 ), () => {

			const slot = this._lookup( 0, this._keyOf( this._surfaceCell( position, normal, level, 0 ), level ), this._groupOf( normal ) ).toVar();

			If( slot.notEqual( NONE ), () => {

				const sequence = this._rayOffset.element( slot ).add( atomicAdd( this._rayIndex.element( slot ), uint( 1 ) ) ).toVar();
				const r2 = vec2( float( sequence.mul( R2[ 0 ] ) ), float( sequence.mul( R2[ 1 ] ) ) ).mul( 2 ** - 32 );

				direction.assign( projectLine( fract( r2.add( this._jitter ) ) ) );

			} );

		} );

		direction.assign( select( dot( direction, normal ).lessThan( 0 ), direction.negate(), direction ) );

		const spacing = this._spacingOf( level.max( 0 ), 0 );
		const origin = position.add( normal.mul( spacing.mul( 0.05 ) ) ).toVar();
		const { radiance, distance, point, hitNormal } = this._traceRay( origin, direction );

		If( distance.greaterThanEqual( 0 ), () => {

			this._hits.element( index.mul( 2 ) ).assign( vec4( point, float( this._frameNode ) ) );
			this._hits.element( index.mul( 2 ).add( 1 ) ).assign( vec4( hitNormal, 0 ) );

		} );

		for ( const { level, weight } of this._levelsOf( position ) ) {

			If( weight.greaterThan( 0 ), () => {

				this._depositRay( position, normal, level, direction, radiance, distance, this._maxLifetime );

			} );

		}

	}

	/**
	 * Traces a secondary ray from a hit of the last frame in a random direction and deposits it into the
	 * cascades of its secondary probe (`compute_secondary_rays()` in chandra).
	 *
	 * @private
	 */
	_traceSecondary( hit, index ) {

		const random = pcg3df( uvec3( index, this._frameNode, uint( 173 ) ) );
		const direction = projectLine( random.xy ).toVar();

		direction.assign( select( dot( direction, hit.normal ).lessThan( 0 ), direction.negate(), direction ) );

		const origin = hit.position.add( hit.normal.mul( this._spacingOf( hit.level.sub( 2 ), 0 ).mul( 0.05 ) ) ).toVar();
		const { radiance, distance } = this._traceRay( origin, direction );

		this._depositRay( hit.position, hit.normal, hit.level, direction, radiance, distance, this._secondaryLifetime );

	}

	/**
	 * Traces a ray: the radiance of its hit, or of the sky, the hit distance, or -1, and the position and normal
	 * of the hit.
	 *
	 * @private
	 */
	_traceRay( origin, direction ) {

		const hit = this._trace( origin, direction ).toVar();
		const radiance = vec3( 0 ).toVar();
		const distance = float( - 1 ).toVar();
		const point = vec3( 0 ).toVar();
		const hitNormal = vec3( 0 ).toVar();

		If( hit.z.notEqual( 0 ), () => {

			distance.assign( hit.w );
			point.assign( origin.add( direction.mul( distance ) ) );
			hitNormal.assign( this._faceNormal( hit, direction ) );
			radiance.assign( this._hitRadiance( hit, point, hitNormal, distance ) );

		} ).Else( () => {

			if ( this._skyTarget !== null ) {

				radiance.assign( texture( this._skyTarget.texture ).sample( equirectUV( direction ) ).level( 0 ).rgb );

			} else {

				radiance.assign( this.skyColor );

			}

		} );

		radiance.assign( radiance.min( this._maxRadiance ) );

		return { radiance, distance, point, hitNormal };

	}

	/**
	 * The radiance that leaves a hit towards the ray: its emission, and its albedo times the light of the
	 * sun, of the point, spot and rect area lights and of its secondary probe (`get_emission()` in chandra).
	 *
	 * @private
	 */
	_hitRadiance( hit, point, normal, distance ) {

		const { facing, albedo, emission } = this._hitMaterial( hit );

		const radiance = vec3( 0 ).toVar();
		const cosine = dot( normal, this._sunDirection ).toVar();

		If( cosine.greaterThan( 0 ).and( this._sunColor.dot( vec3( 1 ) ).greaterThan( 0 ) ), () => {

			radiance.addAssign( this._sunColor.mul( cosine.mul( this._sunVisibility( point, normal, distance ) ) ).div( Math.PI ) );

		} );

		if ( this.secondary ) radiance.addAssign( this._sampleSecondary( point, normal ) );
		if ( this._lights !== null || this._rectLights !== null ) radiance.addAssign( this._lightRadiance( point, normal, distance, radiance ) );

		return emission.add( albedo.mul( radiance ) ).mul( facing );

	}

	/**
	 * The light of the point, spot and rect area lights at a hit, as the radiance that a white diffuse surface
	 * reflects, with the falloff and the form factors of three.js: one light picked in proportion to its light there
	 * by weighted reservoir sampling, whose shadow ray, to a random point of a rect area light, occludes it, over the
	 * probability of the pick.
	 *
	 * @private
	 * @param {Node<vec3>} point - The hit.
	 * @param {Node<vec3>} normal - The normal of the hit.
	 * @param {Node<float>} distance - The distance of the hit from the origin of its ray.
	 * @param {Node<vec3>} other - The rest of the light of the hit, see `LIGHT_SHARE`.
	 * @return {Node<vec3>} The light.
	 */
	_lightRadiance( point, normal, distance, other ) {

		const total = float( 0 ).toVar();
		const picked = vec4( 0 ).toVar();
		const toLight = vec4( 0 ).toVar();
		const seed = floatBitsToUint( point.x ).add( floatBitsToUint( point.y ).mul( 7919 ) ).add( floatBitsToUint( point.z ).mul( 104729 ) ).add( this._frameNode.mul( 31337 ) ).toVar();

		// every light with a weight replaces the pick so far with the probability of its share of the weights. The
		// test includes equality as hash() can round up to 1, which would leave the first light unpicked: a shadow
		// ray without a direction and a light of NaN

		const consider = ( index, light, target ) => {

			const weight = light.dot( vec3( 1 ) ).toVar();

			If( weight.greaterThan( 0 ), () => {

				total.addAssign( weight );

				If( hash( seed.add( index ) ).mul( total ).lessThanEqual( weight ), () => {

					const vector = target().sub( point ).toVar();

					picked.assign( vec4( light, weight ) );
					toLight.assign( vec4( vector.normalize(), vector.length() ) );

				} );

			} );

		};

		if ( this._lights !== null ) {

			const lights = this._lights;

			Loop( { start: uint( 0 ), end: this._lightCount, type: 'uint', condition: '<' }, ( { i } ) => {

				const position = lights.element( i.mul( 3 ) );
				const color = lights.element( i.mul( 3 ).add( 1 ) );
				const cone = lights.element( i.mul( 3 ).add( 2 ) );

				const vector = position.xyz.sub( point ).toVar();
				const lightDistance = vector.length().toVar();
				const direction = vector.div( lightDistance.max( 1e-6 ) ).toVar();
				const attenuation = getDistanceAttenuation( { lightDistance, cutoffDistance: position.w, decayExponent: color.w } );
				const spot = smoothstep( 0, 1, dot( direction.negate(), cone.xyz ).sub( cone.w ) );

				consider( i, color.rgb.mul( attenuation.mul( spot ).mul( dot( normal, direction ).max( 0 ) ).div( Math.PI ) ), () => position.xyz );

			} );

		}

		if ( this._rectLights !== null ) {

			const lights = this._rectLights;
			const random = vec2( hash( seed.bitXor( uint( 0x5bd1e995 ) ) ), hash( seed.bitXor( uint( 0x1b873593 ) ) ) ).mul( 2 ).sub( 1 ).toVar();

			// any direction but the normal sets up the frame of the form factor

			const frame = select( abs( normal.y ).lessThan( 0.9 ), vec3( 0, 1, 0 ), vec3( 1, 0, 0 ) );

			Loop( { start: uint( 0 ), end: this._rectLightCount, type: 'uint', condition: '<' }, ( { i } ) => {

				const center = lights.element( i.mul( 3 ) );
				const halfWidth = lights.element( i.mul( 3 ).add( 1 ) );
				const halfHeight = lights.element( i.mul( 3 ).add( 2 ) );

				const p0 = center.xyz.add( halfWidth.xyz ).sub( halfHeight.xyz );
				const p1 = center.xyz.sub( halfWidth.xyz ).sub( halfHeight.xyz );
				const p2 = center.xyz.sub( halfWidth.xyz ).add( halfHeight.xyz );
				const p3 = center.xyz.add( halfWidth.xyz ).add( halfHeight.xyz );
				const formFactor = LTC_Evaluate( { N: normal, V: frame, P: point, mInv: mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 ), p0, p1, p2, p3 } ).x;

				consider( i.add( MAX_LIGHTS ), vec3( center.w, halfWidth.w, halfHeight.w ).mul( formFactor ), () => center.xyz.add( halfWidth.xyz.mul( random.x ) ).add( halfHeight.xyz.mul( random.y ) ) );

			} );

		}

		// Russian roulette: lights that add less than LIGHT_SHARE of the light of the hit trace their shadow ray with
		// the probability of their share over it, and their light is divided by it, which keeps its mean

		const radiance = vec3( 0 ).toVar();
		const probability = total.div( total.add( other.dot( vec3( 1 ) ) ).mul( LIGHT_SHARE ) ).min( 1 ).toVar();

		If( total.greaterThan( 0 ).and( hash( seed.add( 2 * MAX_LIGHTS ) ).lessThan( probability ) ), () => {

			const origin = point.add( normal.mul( distance.mul( 1e-3 ).add( 1e-3 ) ) );
			const visibility = this._visibility( origin, toLight.xyz, toLight.w.mul( 0.99 ) );

			radiance.assign( picked.rgb.mul( total.div( picked.w.mul( probability ) ).mul( visibility ) ) );

		} );

		return radiance;

	}

	/**
	 * The visibility of the sun from a hit: from the shadow map of the sun where it covers the hit, else by a
	 * shadow ray.
	 *
	 * @private
	 */
	_sunVisibility( point, normal, distance ) {

		const trace = () => this._visibility( point.add( normal.mul( distance.mul( 1e-3 ).add( 1e-3 ) ) ), this._sunDirection, float( 0 ) );

		if ( this._shadowTexture === null ) return trace();

		// the hit moves off the surface by a texel, which matches the shadow rays within their noise without a
		// depth bias, then the shadow map is filtered bilinearly by hand, since compute shaders cannot compare
		// depths with a sampler

		const map = texture( this._shadowTexture );
		const coord = this._shadowMatrix.mul( vec4( point.add( normal.mul( this._shadowOffset ) ), 1 ) ).toVar();
		const visibility = float( 1 ).toVar();

		If( coord.x.greaterThanEqual( 0 ).and( coord.x.lessThanEqual( 1 ) ).and( coord.y.greaterThanEqual( 0 ) ).and( coord.y.lessThanEqual( 1 ) ).and( coord.z.greaterThanEqual( 0 ) ).and( coord.z.lessThanEqual( 1 ) ), () => {

			const texel = vec2( coord.x, coord.y.oneMinus() ).mul( this._shadowSize ).sub( 0.5 ).toVar();
			const corner = ivec2( floor( texel ) ).toVar();
			const last = ivec2( this._shadowSize ).sub( 1 ).toVar();
			const weight = fract( texel ).toVar();

			const lit = ( x, y ) => select( map.load( clamp( corner.add( ivec2( x, y ) ), ivec2( 0 ), last ) ).x.sub( coord.z ).mul( this._shadowSign ).greaterThanEqual( 0 ), float( 1 ), float( 0 ) );

			visibility.assign( mix( mix( lit( 0, 0 ), lit( 1, 0 ), weight.x ), mix( lit( 0, 1 ), lit( 1, 1 ), weight.x ), weight.y ) );

		} ).Else( () => {

			visibility.assign( trace() );

		} );

		return visibility;

	}

	/**
	 * Deposits a ray into the probes of a surface in a level of detail: its radiance into the cascade whose
	 * interval holds the hit, the last one for rays that leave the scene, and its transmittance into the cascades
	 * below (`compute_deposit_ray()` and `deposit_split()` in chandra). The probe of the finest cascade lives for
	 * `lifetime` frames on.
	 *
	 * @private
	 */
	_depositRay( position, normal, level, direction, radiance, distance, lifetime ) {

		const group = this._groupOf( normal ).toVar();
		const keyed = position.add( normal.mul( this._spacingOf( level, 0 ).mul( KEY_OFFSET ) ) ).toVar();
		const length = this._spacingOf( level, 0 ).mul( this.intervalScale );
		const index = log2( distance.div( length ).max( 1e-6 ) ).div( Math.log2( this.lengthScale ) );
		const cascade = select( distance.lessThan( 0 ), int( this.cascades - 1 ), int( ceil( index.max( 0 ) ) ).min( this.cascades - 1 ) ).toVar();

		for ( let n = 0; n < this.cascades; n ++ ) {

			If( cascade.greaterThanEqual( n ), () => {

				const slot = this._lookup( n, this._keyOf( this._cellOf( keyed, level, n ), level ), group ).toVar();

				if ( n === 0 ) {

					If( slot.notEqual( NONE ), () => {

						atomicMax( this._expiry.element( slot ), this._frameNode.add( lifetime ).sub( 1 ) );

					} );

				}

				If( cascade.equal( n ), () => {

					this._deposit( slot, n, direction, radiance, false );

				} ).Else( () => {

					this._deposit( slot, n, direction, null, true );

				} );

			} );

		}

	}

	/**
	 * Adds a ray to a bin of a probe: its radiance, or that it passed the interval, and counts it for the probe.
	 *
	 * @private
	 */
	_deposit( slot, n, direction, radiance, passed ) {

		const cascade = this._layout.cascades[ n ];

		If( slot.notEqual( NONE ), () => {

			const base = slot.mul( cascade.bins ).add( this._binOf( direction, n ) ).add( cascade.binOffset ).mul( WORDS ).toVar();

			atomicAdd( this._deposited.element( slot.add( cascade.slotOffset ) ), uint( 1 ) );

			const rays = atomicAdd( this._deposits.element( base.add( 4 ) ), uint( 1 ) );

			If( rays.lessThan( MAX_RAYS ), () => {

				if ( radiance !== null ) {

					const value = radiance.max( 0 ).mul( SCALE ).add( 0.5 ).toVar();

					for ( let channel = 0; channel < 3; channel ++ ) {

						const component = uint( value[ 'xyz'[ channel ] ] ).toVar();

						If( component.greaterThan( 0 ), () => {

							atomicAdd( this._deposits.element( base.add( channel ) ), component );

						} );

					}

				}

				if ( passed ) atomicAdd( this._deposits.element( base.add( 3 ) ), uint( 1 ) );

			} );

		} );

	}

}

/**
 * Writes the entry of a material in the scene buffer: its diffuse color and whether its front side is visible,
 * then its emitted radiance and whether its back side is visible. Unlit surfaces emit their color, metals have no
 * diffuse color.
 *
 * @private
 * @param {Material} material - The material.
 * @param {Float32Array} target - The 8 floats of the entry.
 * @return {Float32Array} The entry.
 */
function materialEntry( material, target ) {

	const unlit = material.isMeshBasicMaterial === true;
	const color = unlit ? undefined : material.color;
	const emissive = unlit ? material.color : material.emissive;
	const diffuse = 1 - ( material.metalness ?? 0 );
	const emission = unlit ? 1 : material.emissiveIntensity ?? 1;

	target[ 0 ] = color !== undefined ? color.r * diffuse : 0;
	target[ 1 ] = color !== undefined ? color.g * diffuse : 0;
	target[ 2 ] = color !== undefined ? color.b * diffuse : 0;
	target[ 3 ] = material.side !== BackSide ? 1 : 0;
	target[ 4 ] = emissive !== undefined ? emissive.r * emission : 0;
	target[ 5 ] = emissive !== undefined ? emissive.g * emission : 0;
	target[ 6 ] = emissive !== undefined ? emissive.b * emission : 0;
	target[ 7 ] = material.side !== FrontSide ? 1 : 0;

	return target;

}

/**
 * The finalizer of MurmurHash3, which spreads the keys of neighboring cells over a table.
 *
 * @private
 */
function mixKey( key ) {

	const h = uint( key ).toVar();
	h.assign( h.bitXor( h.shiftRight( uint( 16 ) ) ).mul( 0x85ebca6b ) );
	h.assign( h.bitXor( h.shiftRight( uint( 13 ) ) ).mul( 0xc2b2ae35 ) );

	return h.bitXor( h.shiftRight( uint( 16 ) ) );

}

/**
 * The PCG3D hash of three integers on the CPU, see `pcg3df()`.
 *
 * @private
 */
function pcg3d( x, y, z ) {

	x = ( Math.imul( x, 1664525 ) + 1013904223 ) >>> 0;
	y = ( Math.imul( y, 1664525 ) + 1013904223 ) >>> 0;
	z = ( Math.imul( z, 1664525 ) + 1013904223 ) >>> 0;

	x = ( x + Math.imul( y, z ) ) >>> 0;
	y = ( y + Math.imul( z, x ) ) >>> 0;
	z = ( z + Math.imul( x, y ) ) >>> 0;

	x = ( x ^ ( x >>> 16 ) ) >>> 0;
	y = ( y ^ ( y >>> 16 ) ) >>> 0;
	z = ( z ^ ( z >>> 16 ) ) >>> 0;

	x = ( x + Math.imul( y, z ) ) >>> 0;
	y = ( y + Math.imul( z, x ) ) >>> 0;
	z = ( z + Math.imul( x, y ) ) >>> 0;

	return [ x, y, z ];

}

/**
 * The PCG3D hash of three integers as floats in [0, 1].
 *
 * @private
 */
function pcg3df( value ) {

	const v = value.mul( 1664525 ).add( 1013904223 ).toVar();

	v.x.addAssign( v.y.mul( v.z ) );
	v.y.addAssign( v.z.mul( v.x ) );
	v.z.addAssign( v.x.mul( v.y ) );

	v.bitXorAssign( v.shiftRight( uvec3( 16 ) ) );

	v.x.addAssign( v.y.mul( v.z ) );
	v.y.addAssign( v.z.mul( v.x ) );
	v.z.addAssign( v.x.mul( v.y ) );

	return vec3( v ).div( 0xffffffff );

}

/**
 * A uniformly distributed line through the origin of a point in [0, 1]^2, as a direction of the upper half
 * of the sphere along y (`project_line()` in chandra).
 *
 * @private
 */
function projectLine( point ) {

	const phi = point.x.mul( Math.PI ).toVar();
	const z = point.y.mul( 2 ).sub( 1 ).toVar();
	const r = sqrt( z.mul( z ).oneMinus().max( 0 ) );

	return vec3( r.mul( cos( phi ) ), r.mul( sin( phi ) ), z );

}

/**
 * The center direction of a bin of a cascade with `theta` bins along the polar axis.
 *
 * @private
 */
function binDirection( bin, theta ) {

	const u = float( bin.mod( 2 * theta ) ).add( 0.5 ).div( 2 * theta );
	const z = float( bin.div( 2 * theta ) ).add( 0.5 ).div( theta ).mul( 2 ).sub( 1 ).toVar();
	const r = sqrt( z.mul( z ).oneMinus().max( 0 ) );
	const phi = u.mul( 2 * Math.PI ).toVar();

	return vec3( r.mul( cos( phi ) ), r.mul( sin( phi ) ), z );

}

/**
 * The octahedral coordinates of a direction in [0, 1]^2.
 *
 * @private
 */
function octahedralEncode( direction ) {

	const n = direction.div( abs( direction.x ).add( abs( direction.y ) ).add( abs( direction.z ) ) ).toVar();
	const signs = step( vec2( 0 ), n.xy ).mul( 2 ).sub( 1 );
	const folded = select( n.z.greaterThanEqual( 0 ), n.xy, abs( n.yx ).oneMinus().mul( signs ) );

	return folded.mul( 0.5 ).add( 0.5 );

}

/**
 * The direction of octahedral coordinates in [0, 1]^2.
 *
 * @private
 */
function octahedralDecode( coordinates ) {

	const v = coordinates.mul( 2 ).sub( 1 ).toVar();
	const f = abs( v.x ).add( abs( v.y ) ).oneMinus().toVar();
	const signs = step( vec2( 0 ), v ).mul( 2 ).sub( 1 );
	const n = select( f.greaterThanEqual( 0 ), v, abs( v.yx ).oneMinus().mul( signs ) );

	return normalize( vec3( n, f ) );

}

/**
 * The index of a texel of an octahedral map, with the texels beyond its edges mirrored across them as the
 * octahedron folds.
 *
 * @private
 */
function octahedralTexel( texel ) {

	const last = IRRADIANCE_SIZE - 1;
	const x = texel.x.toVar(), y = texel.y.toVar();
	const outsideX = x.lessThan( 0 ).or( x.greaterThan( last ) ).toVar();
	const outsideY = y.lessThan( 0 ).or( y.greaterThan( last ) ).toVar();

	If( outsideX.and( outsideY ), () => {

		// the opposite corner

		x.assign( select( x.lessThan( 0 ), int( last ), int( 0 ) ) );
		y.assign( select( y.lessThan( 0 ), int( last ), int( 0 ) ) );

	} ).ElseIf( outsideY, () => {

		x.assign( int( last ).sub( x ) );
		y.assign( y.clamp( 0, last ) );

	} ).ElseIf( outsideX, () => {

		y.assign( int( last ).sub( y ) );
		x.assign( x.clamp( 0, last ) );

	} );

	return uint( y.mul( IRRADIANCE_SIZE ).add( x ) );

}

/**
 * Returns the frame time of a common refresh rate that 85% of some frame times equal, give or take a millisecond or
 * 5%, or null.
 *
 * @private
 * @param {Array<number>} times - The frame times in milliseconds.
 * @return {?number} The frame time.
 */
function steadyFrameTime( times ) {

	for ( const rate of REFRESH_RATES ) {

		const period = 1000 / rate;
		const tolerance = Math.max( 1, period * 0.05 );

		if ( times.filter( ( time ) => Math.abs( time - period ) < tolerance ).length >= times.length * 0.85 ) return period;

	}

	return null;

}

/**
 * Returns the frame time of the common refresh rate within 8% of a frame time, or the frame time.
 *
 * @private
 * @param {number} time - The frame time in milliseconds.
 * @return {number} The frame time.
 */
function refreshTime( time ) {

	for ( const rate of REFRESH_RATES ) if ( Math.abs( 1000 / rate - time ) < time * 0.08 ) return 1000 / rate;

	return time;

}

export { RealtimeRadianceCascades };
