import { BackSide, Box3, BufferAttribute, DoubleSide, EquirectangularReflectionMapping, EquirectangularRefractionMapping, FrontSide, Matrix4, Mesh, MeshBasicNodeMaterial, MeshLambertNodeMaterial, PerspectiveCamera, Raycaster, RenderTarget, Sphere, SphereGeometry, Vector3 } from 'three/webgpu';
import { cubeTexture, dot, equirectUV, lights, luminance, positionWorld, texture, uniform, vec3 } from 'three/tsl';

import { LightMapper } from './LightMapper.js';
import { LightMapDenoiser } from './LightMapDenoiser.js';
import { LightMapSeams } from './LightMapSeams.js';
import { LightProbeGrid } from './LightProbeGrid.js';
import { VertexLightMapper, imprintContacts, refineContacts, simplifyGeometry, subdivideGeometry, vertexLightMap } from './VertexLightMapper.js';
import { StochasticRadiosity, radiosityIrradiance } from './StochasticRadiosity.js';
import { VXGIVolume } from './vxgi/VXGIVolume.js';
import { vxgiIrradiance } from './vxgi/VXGIIrradiance.js';
import { lightProbeGridIrradiance } from '../tsl/lighting/LightProbeGridNode.js';
import { directionalLightMap, instancedLightMap } from '../tsl/lighting/DirectionalLightMapNode.js';
import { unwrapUVs } from '../utils/unwrapUVs.js';
import { mergeVertices } from '../utils/BufferGeometryUtils.js';

const ALGORITHMS = [ 'stochastic', 'ray', 'probes', 'vxgi' ];
const TARGETS = [ 'lightMap', 'vertex' ];

// the bake stops once the estimated noise of the light map drops below the tolerance, which is checked
// whenever the samples have grown by a quarter, or after the maximum samples. Light probes are
// deterministic and only need a few samples to antialias the light map, the rays, the VXGI cones and
// the stochastic radiosity directions vary per sample and converge over more samples. Stochastic
// radiosity samples are cheap, so several are baked per frame

const NOISE_TOLERANCE = 0.02;

// vertex bakes stop at a lower noise: a vertex spreads its noise over its triangles, where it shows as
// blotches, and vertex bakes need far fewer samples than light maps

const VERTEX_NOISE_TOLERANCE = 0.01;
const MAX_SAMPLES = { ray: 1024, stochastic: 8192, probes: 16, vxgi: 256 };
const SAMPLES_PER_FRAME = { ray: 1, stochastic: 4, probes: 1, vxgi: 1 };

// a sample of a vertex bake gathers at far fewer points than one of a light map

const VERTEX_SAMPLES_PER_FRAME = { ray: 4, stochastic: 16, probes: 1, vxgi: 1 };

// interactive bakes bake fewer samples per frame while frames take longer than this on average, in
// milliseconds, and wait while the GPU is more than a few frames behind. Slow GPUs, e.g. of phones, are
// not handed more work than they finish, the page stays responsive

const FRAME_BUDGET = 30;
const FRAMES_IN_FLIGHT = 3;

// the first noise estimate only records the light map, the second one follows at this sample count

const FIRST_NOISE_CHECK = 8;

// the rays and the bounce cache of subdivided vertex bakes use a coarser subdivision, by this factor of the
// maximum edge length, with edges of at most this share of the size of the meshes. Coarser bounce caches
// interpolate the bounces into blotches

const VERTEX_CACHE_EDGE = 4;
const VERTEX_CACHE_MAX_EDGE = 0.04;

// the refinement of vertex bakes splits the edges whose ends differ more in luminance, relative to the
// brighter end, down to the maximum edge length halved by the number of refinements

const REFINE_CONTRAST = 0.1;

const OPTIONS = [ 'algorithm', 'target', 'maxEdgeLength', 'refine', 'simplify', 'resolution', 'pageSize', 'padding', 'unwrap', 'ignoreOutlines', 'directional', 'specularIntensity', 'denoise', 'stitchSeams', 'noiseTolerance', 'maxSamples', 'samplesPerFrame', 'directLight', 'directions', 'cacheSize', 'probes', 'vxgiResolution' ];

// the ray traced source needs three-mesh-bvh, so it is loaded on demand

let _rayTracedRadiosity = null;

/**
 * Bakes the global illumination of a scene into light maps, with one of four sources of indirect
 * light: `'stochastic'` for {@link StochasticRadiosity}, `'ray'` for {@link RayTracedRadiosity},
 * `'probes'` for a {@link LightProbeGrid} and `'vxgi'` for a {@link VXGIVolume}. It runs the whole
 * pipeline that the individual classes provide:
 *
 * - {@link unwrapUVs} generates the light map UVs in `uv1`, in pages of `pageSize` if `resolution`
 * exceeds it. `mesh.userData.lightMapScale` scales the texel density of a mesh. Textures that used the
 * old `uv1`, e.g. the ambient occlusion maps of glTF files, move to `uv2`. See {@link LightBaker#unwrap}
 * to keep the charts or the layout of the existing `uv1`.
 * - The source is set up for the scene. A background texture lights the scene as a sky, background
 * colors are ignored. Emissive meshes and the lights of the scene contribute their light.
 * - {@link LightMapper} accumulates samples until {@link LightMapper#estimateNoise} drops below the
 * noise tolerance, or up to the maximum samples. Then the light maps are denoised with
 * {@link LightMapDenoiser} and their seams stitched with {@link LightMapSeams}.
 * - `apply()` assigns the light maps to the materials, with directional light maps that keep normal
 * maps visible, see {@link directionalLightMap}. Meshes on other pages than the first one, and the
 * meshes left out of the light map, get their own copies of shared materials. Instanced meshes look up
 * the atlas regions of their instances, see {@link instancedLightMap}.
 *
 * ```js
 * const baker = new LightBaker( renderer, { algorithm: 'ray', resolution: 1024 } );
 *
 * await baker.bake( scene, { onProgress: ( { samples, noise } ) => console.log( samples, noise ) } );
 * baker.apply();
 * ```
 *
 * The meshes of the `root` of the bake, the scene by default, are light-mapped, visible or not. Skinned
 * and batched meshes, and meshes with a `userData.lightMapScale` of 0, are left out, see
 * {@link LightBaker#excludedMeshes}, e.g. for light probes to light them like dynamic objects. Hide
 * objects that should not take part, e.g. dynamic objects, while preparing: the bake sees the visible
 * scene of that moment, also in the shadows of the baked lights. The shells of inverted hull outlines
 * are left out of the bake as well, see {@link LightBaker#ignoreOutlines}.
 *
 * The bake is progressive: `bake()` adds a few samples per animation frame, so that the page keeps
 * rendering, and resolves once the light maps have converged. Applied materials show the samples
 * every frame while they accumulate, and the denoised and stitched light maps once the bake has
 * converged. Abort a bake with an `AbortSignal`, call `bake()` again to continue it, or
 * `reset()` to start over. Call `prepare()` again after changing the scene or the lighting.
 *
 * ```js
 * await baker.prepare( scene, root );
 * baker.apply();
 *
 * const controller = new AbortController();
 * baker.bake( scene, { root, signal: controller.signal } ).catch( () => {} );
 * ```
 *
 * The direct light of directional, point and spot lights stays live by default, the light maps only hold
 * their bounces. With `directLight: 'baked'`, their direct diffuse light is baked too, and `apply()` leaves
 * them out of the lighting of the light-mapped materials. The shadows of the lights need
 * `renderer.shadowMap`, like the stochastic radiosity. The ray traced radiosity can need more storage
 * buffers per shader stage than the default eight, e.g. for a sky, lights and emissive meshes together,
 * so request `maxStorageBuffersPerShaderStage` of the adapter in the `requiredLimits` of the renderer.
 *
 * This class can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @three_import import { LightBaker } from 'three/addons/lighting/LightBaker.js';
 */
class LightBaker {

	/**
	 * Constructs a new light baker.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Object} [options] - The bake options, see the properties of the same names.
	 */
	constructor( renderer, options = {} ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The source of the indirect light: `'stochastic'`, `'ray'`, `'probes'` or `'vxgi'`.
		 *
		 * @type {string}
		 * @default 'stochastic'
		 */
		this.algorithm = 'stochastic';

		/**
		 * What the light is baked into: `'lightMap'` for light maps, `'vertex'` for the vertices of the
		 * meshes, see {@link VertexLightMapper}. Vertex bakes need no light map UVs, so they skip the
		 * unwrapping, the atlas, the denoising and the seams. The radiosity solvers also cache their bounces
		 * in the vertices then, and only the `'ray'` algorithm bakes the direct light of a vertex bake, see
		 * {@link LightBaker#directLight}. The light of a vertex bake is as detailed as the meshes: big
		 * triangles can not show shadows within them.
		 *
		 * @type {string}
		 * @default 'lightMap'
		 */
		this.target = 'lightMap';

		/**
		 * The maximum edge length of the triangles of vertex bakes in world units, longer edges are split
		 * by {@link subdivideGeometry}, so that the vertices can show the light within big triangles. The
		 * meshes render the subdivided geometries while the vertex bake is applied, and get their own back
		 * for light map bakes and on `dispose()`. `null` keeps the meshes as they are.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.maxEdgeLength = null;

		/**
		 * The number of refinements of vertex bakes. Before the bake, also without refinements, the subdivided
		 * meshes are cut along the contacts of surfaces and the triangles inside other meshes are left out, see
		 * {@link imprintContacts}. Once a bake has converged, the edges whose ends differ by more than a tenth
		 * in luminance are split, and all vertices are baked again until they converge. Each refinement halves
		 * the edges at the shadows and other changes of the light, down to the maximum edge length, or a
		 * hundredth of the size of the meshes, halved by the number of refinements. The triangles that split an
		 * edge split their longest edge too, and so do their neighbours, so the triangles keep their shapes
		 * and the refinement grades into the larger triangles around it. The rays and the bounces
		 * keep their geometry, so a refinement only bakes the vertices again. {@link LightBaker#simplify} removes
		 * the vertices that the light does not need afterwards. Instanced meshes are not refined.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.refine = 0;

		/**
		 * The error of the simplification of vertex bakes, or `null` to keep all their vertices. Once a vertex
		 * bake has converged after its refinements, the meshes are simplified where the baked light allows it,
		 * with meshoptimizer, down to the vertices of the meshes before their subdivision, and the vertices that
		 * remain keep their light: baked over the smaller triangles, it is closer to the light at the vertices
		 * than a bake over the larger ones, which would flatten curved light. The error is relative to the size
		 * of each mesh, and for the light to its mean, e.g. `0.0005`: larger errors lose small features like
		 * contact shadows.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.simplify = null;

		/**
		 * The resolution of the light map atlas, which sets the texel density. It doubles until the
		 * charts fit, see {@link LightBaker#atlasResolution}.
		 *
		 * @type {number}
		 * @default 1024
		 */
		this.resolution = 1024;

		/**
		 * The maximum size of a light map page. Resolutions above it give several pages at the density
		 * of the resolution, e.g. for devices that limit the texture size.
		 *
		 * @type {number}
		 * @default 2048
		 */
		this.pageSize = 2048;

		/**
		 * The gutter of the atlas charts in texels, at least three.
		 *
		 * @type {number}
		 * @default 3
		 */
		this.padding = 3;

		/**
		 * How the light map UVs are generated. `true` unwraps new charts. `'repack'` keeps the charts of
		 * the existing `uv1` where they are valid and packs them at the same texel density, meshes without
		 * `uv1` get new charts. With `false`, the meshes keep their `uv1`, which must be a unique
		 * non-overlapping layout with enough padding, and meshes without it are left out.
		 *
		 * @type {boolean|string}
		 * @default true
		 */
		this.unwrap = true;

		/**
		 * Whether to leave out the shells of inverted hull outlines: single-sided meshes turned inside out
		 * around the surfaces that they outline, whose visible side is covered by these surfaces. They
		 * would enclose and shadow the surfaces. The shells keep their materials without a light map and
		 * cast no shadows in the bake, see {@link LightBaker#outlineMeshes}.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.ignoreOutlines = true;

		/**
		 * Whether to also bake the dominant direction of the light, so that normal maps show under
		 * baked light.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.directional = true;

		/**
		 * The scale of the specular highlight that directional light maps add, 0 leaves it out.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.specularIntensity = 1;

		/**
		 * Whether to denoise the light maps once the bake has converged, also the light of vertex bakes, see
		 * {@link VertexLightMapper#denoise}.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.denoise = true;

		/**
		 * Whether to stitch the seams of the light maps.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.stitchSeams = true;

		/**
		 * The relative noise at which the bake stops, see {@link LightMapper#estimateNoise}, by default 2% for
		 * light maps and 1% for vertex bakes.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.noiseTolerance = null;

		/**
		 * The maximum number of samples. By default 1024 for rays, 8192 for stochastic radiosity, 16 for
		 * light probes and 256 for VXGI. The bake warns when it stops at the maximum above the noise tolerance.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.maxSamples = null;

		/**
		 * The samples per animation frame of interactive bakes. By default 4 for stochastic radiosity and
		 * 1 for the other algorithms, and for vertex bakes 16 for stochastic radiosity and 4 for ray traced
		 * radiosity. Interactive bakes bake fewer, down to one, while the frames take longer than 30 ms on
		 * average, e.g. on phones.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.samplesPerFrame = null;

		/**
		 * Whether the direct light of directional, point and spot lights stays `'live'`, or is `'baked'`
		 * into the light maps. Vertex bakes only bake it with the `'ray'` algorithm.
		 *
		 * @type {string}
		 * @default 'live'
		 */
		this.directLight = 'live';

		/**
		 * The directions per sample of the stochastic radiosity. More directions converge in fewer
		 * samples, desktop GPUs render them at almost no extra cost, but they take memory and more time
		 * per sample on phones.
		 *
		 * @type {number}
		 * @default 64
		 */
		this.directions = 64;

		/**
		 * The size of the bounce caches of the radiosity solvers, for an atlas of one page. Atlases of
		 * several pages keep its texel density.
		 *
		 * @type {number}
		 * @default 256
		 */
		this.cacheSize = 256;

		/**
		 * The light probe grid of the `'probes'` algorithm: its `size` and `position` as vectors, the
		 * probe `counts` along each axis, the `near` and `far` planes of the captures and the
		 * `cubemapSize`. Missing values are fitted to the bounds of the light-mapped meshes.
		 *
		 * @type {?{size: Vector3, position: Vector3, counts: Array<number>, near: number, far: number, cubemapSize: number}}
		 * @default null
		 */
		this.probes = null;

		/**
		 * The voxels along the longest axis of the scene for the `'vxgi'` algorithm.
		 *
		 * @type {number}
		 * @default 256
		 */
		this.vxgiResolution = 256;

		/**
		 * The scene of the last bake.
		 *
		 * @type {?Scene}
		 * @readonly
		 */
		this.scene = null;

		/**
		 * The light mapper, created by `prepare()`.
		 *
		 * @type {?LightMapper}
		 * @readonly
		 */
		this.lightMapper = null;

		/**
		 * The source of the indirect light, a {@link StochasticRadiosity}, {@link RayTracedRadiosity},
		 * {@link LightProbeGrid} or {@link VXGIVolume}.
		 *
		 * @type {?Object}
		 * @readonly
		 */
		this.source = null;

		/**
		 * The irradiance sampler of the source that the light mapper bakes, see {@link LightMapper#irradianceNode}.
		 *
		 * @type {?function(Node<vec3>, Node<vec3>, ?Node<float>, ?Node<vec3>): Node<vec3>}
		 * @readonly
		 */
		this.irradianceNode = null;

		/**
		 * The visible directional, point and spot lights of the scene.
		 *
		 * @type {Array<Light>}
		 * @readonly
		 */
		this.lights = [];

		/**
		 * The lights whose direct light is baked into the light maps.
		 *
		 * @type {Array<Light>}
		 * @readonly
		 */
		this.bakedLights = [];

		/**
		 * The estimated relative noise of the light maps, `Infinity` before the first estimate.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.noise = Infinity;

		/**
		 * The bake time in seconds.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.time = 0;

		/**
		 * Whether a bake is running.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this.baking = false;

		this._records = new Map();
		this._record = null;
		this._preparedKey = null;
		this._denoisers = [];
		this._stitchers = [];
		this._seams = [];
		this._seamsKey = null;
		this._lightMaps = null;
		this._processedKey = null;
		this._applied = false;
		this._areaLights = [];
		this._lightCopies = [];
		this._preparedObjects = null;
		this._lightsNodes = new Map();
		this._noiseCheck = FIRST_NOISE_CHECK;
		this._noisePromise = null;
		this._epoch = 0;
		this._start = 0;
		this._run = null;
		this._refinements = 0;
		this._simplified = false;
		this._refineContrast = null;
		this._refineKeep = false;
		this._simplifyRebake = false;
		this._cacheEdge = VERTEX_CACHE_EDGE;
		this._vertexDenoise = {};
		this._contacts = 'imprint';
		this._contactRays = 8;
		this._lightSamples = 0;
		this._bounces = null;
		this._lightShape = null;
		this._ambientOcclusion = null;
		this._contactOcclusion = null;
		this._seed = 0;

		// where vertex bakes sample the light, see VertexLightMapper's sampling option

		this._sampling = 'triangles';

		// the offset of the rays from the surface, see RayTracedRadiosity's bias (null: its default)

		this._bias = null;

		this.setOptions( options );

	}

	/**
	 * Sets several options at once and validates them.
	 *
	 * @param {Object} options - The options, see the properties of the same names.
	 * @return {LightBaker} A reference to this light baker.
	 */
	setOptions( options ) {

		for ( const name in options ) {

			if ( OPTIONS.includes( name ) === false ) {

				console.warn( `THREE.LightBaker: Unknown option "${ name }".` );
				continue;

			}

			if ( options[ name ] !== undefined ) this[ name ] = options[ name ];

		}

		this._validate();

		return this;

	}

	/**
	 * The atlas resolution at which the charts fit, at least the requested `resolution`.
	 *
	 * @type {number}
	 * @readonly
	 */
	get atlasResolution() {

		return this._record !== null ? this._record.resolution : this.resolution;

	}

	/**
	 * The atlas of the light-mapped meshes, the result of {@link unwrapUVs}, or `null` if the meshes keep their UVs.
	 *
	 * @type {?Object}
	 * @readonly
	 */
	get atlas() {

		return this._record !== null ? this._record.atlas : null;

	}

	/**
	 * The meshes in the light map, or in the vertex bake.
	 *
	 * @type {Array<Mesh>}
	 * @readonly
	 */
	get lightMappedMeshes() {

		return this._record !== null ? this._record.lightMapped : [];

	}

	/**
	 * The meshes left out of the light map, without light map UVs, e.g. skinned meshes or meshes with a
	 * `userData.lightMapScale` of 0. Light probes can light them like dynamic objects.
	 *
	 * @type {Array<Mesh>}
	 * @readonly
	 */
	get excludedMeshes() {

		return this._record !== null ? this._record.excluded : [];

	}

	/**
	 * The meshes left out of the bake as the shells of outlines, see {@link LightBaker#ignoreOutlines}.
	 * They are part of {@link LightBaker#excludedMeshes}.
	 *
	 * @type {Array<Mesh>}
	 * @readonly
	 */
	get outlineMeshes() {

		return this._record !== null ? this._record.outlines : [];

	}

	/**
	 * The current materials of the meshes, including the copies of shared materials of other pages.
	 *
	 * @type {Set<Material>}
	 * @readonly
	 */
	get materials() {

		return this._record !== null ? this._record.materials : new Set();

	}

	/**
	 * The light map page of each material in {@link LightBaker#materials}, -1 for the materials of the
	 * meshes left out of the light map.
	 *
	 * @type {Map<Material, number>}
	 * @readonly
	 */
	get materialPages() {

		return this._record !== null ? this._record.materialPages : new Map();

	}

	/**
	 * The number of accumulated samples.
	 *
	 * @type {number}
	 * @readonly
	 */
	get samples() {

		return this.lightMapper !== null ? this.lightMapper.samples : 0;

	}

	/**
	 * The refinements of the current vertex bake so far, see {@link LightBaker#refine}.
	 *
	 * @type {number}
	 * @readonly
	 */
	get refinements() {

		return this._refinements;

	}

	/**
	 * Whether the bake has reached the noise tolerance or the maximum samples.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get converged() {

		return this.lightMapper !== null && ( this.noise < this.getNoiseTolerance() || this.samples >= this.getMaxSamples() );

	}

	/**
	 * Returns the noise tolerance of the bake, see {@link LightBaker#noiseTolerance}.
	 *
	 * @return {number} The noise tolerance.
	 */
	getNoiseTolerance() {

		return this.noiseTolerance ?? ( this.target === 'vertex' ? VERTEX_NOISE_TOLERANCE : NOISE_TOLERANCE );

	}

	/**
	 * Returns the maximum number of samples, see {@link LightBaker#maxSamples}, at most the samples that the
	 * light mapper accumulates on the device, see {@link LightMapper#maxSamples}.
	 *
	 * @return {number} The maximum number of samples.
	 */
	getMaxSamples() {

		return Math.min( this.maxSamples ?? MAX_SAMPLES[ this.algorithm ], this.lightMapper?.maxSamples ?? Infinity );

	}

	/**
	 * Returns the samples per animation frame of interactive bakes, see {@link LightBaker#samplesPerFrame}.
	 *
	 * @return {number} The samples per frame.
	 */
	getSamplesPerFrame() {

		return this.samplesPerFrame ?? ( this.target === 'vertex' ? VERTEX_SAMPLES_PER_FRAME : SAMPLES_PER_FRAME )[ this.algorithm ];

	}

	/**
	 * Prepares the meshes of a hierarchy for light mapping without baking: generates their light map
	 * UVs, unless `unwrap` is disabled, and gives the meshes on other pages than the first one, and the
	 * meshes left out of the light map, their own copies of shared materials. The atlas is reused while
	 * the meshes and the atlas options stay the same. `prepare()` calls it.
	 *
	 * @param {Object3D} root - The light-mapped meshes, or a hierarchy that contains them.
	 */
	prepareMeshes( root ) {

		let record = this._records.get( root );

		if ( record === undefined ) {

			record = {
				atlas: null, atlasKey: null, vertexKey: null, target: null, requested: 0, resolution: 0, size: 0, pages: 1,
				geometries: new Set(), meshes: [], lightMapped: [], excluded: [], outlines: [], warned: new Set(), subdivided: new Map(),
				sourceMaterials: new Map(), assigned: new Map(), pageMaterials: [], materialPages: new Map(), materials: new Set()
			};

			this._records.set( root, record );

		}

		const meshes = [];
		root.traverse( ( object ) => object.isMesh && meshes.push( object ) );

		// materials changed since the last call are the new sources of the copies

		let materialsChanged = false;

		for ( const mesh of meshes ) {

			if ( mesh.material !== record.assigned.get( mesh ) ) {

				record.sourceMaterials.set( mesh, mesh.material );
				materialsChanged = true;

			}

			if ( ( mesh.isSkinnedMesh || mesh.isBatchedMesh ) && record.warned.has( mesh ) === false ) {

				console.warn( `THREE.LightBaker: ${ mesh.isSkinnedMesh ? 'Skinned' : 'Batched' } mesh "${ mesh.name }" is left out of the light map.` );
				record.warned.add( mesh );

			}

		}

		// vertex bakes keep the meshes as they are, or subdivided, the light map atlas stays for later light
		// map bakes. The meshes get their own geometries back for light maps

		this._subdivide( record, this.target === 'vertex' ? this.maxEdgeLength : null );

		if ( this.target === 'vertex' ) {

			const original = ( mesh ) => record.subdivided.get( mesh )?.original ?? mesh.geometry;
			const vertexKey = JSON.stringify( [ this.ignoreOutlines, meshes.map( ( mesh ) => original( mesh ).id ) ] );

			if ( record.vertexKey !== vertexKey ) {

				root.updateWorldMatrix( true, true );

				record.outlines = this.ignoreOutlines ? findOutlineShells( meshes ) : [];
				record.vertexKey = vertexKey;

				for ( const mesh of record.outlines ) {

					if ( record.warned.has( mesh ) ) continue;

					console.warn( `THREE.LightBaker: Mesh "${ mesh.name }" looks like the shell of an outline and is left out of the bake.` );
					record.warned.add( mesh );

				}

			}

			if ( record.target !== 'vertex' || materialsChanged || record.meshes.length !== meshes.length ) {

				record.meshes = meshes;
				record.target = 'vertex';
				this._setPageMaterials( record );

			}

			this._subdivide( record, this.maxEdgeLength );
			this._record = record;

			return;

		}

		const atlasKey = JSON.stringify( [ this.unwrap, this.ignoreOutlines, this.pageSize, this.padding ] );
		const atlasValid = record.atlasKey === atlasKey && ( this.resolution === record.requested || this.resolution === record.resolution ) &&
			meshes.length === record.meshes.length && meshes.every( ( mesh ) => record.geometries.has( mesh.geometry ) );

		if ( atlasValid === false ) {

			root.updateWorldMatrix( true, true );

			record.outlines = this.ignoreOutlines ? findOutlineShells( meshes ) : [];

			for ( const mesh of record.outlines ) {

				if ( record.warned.has( mesh ) ) continue;

				console.warn( `THREE.LightBaker: Mesh "${ mesh.name }" looks like the shell of an outline and is left out of the bake.` );
				record.warned.add( mesh );

			}

			if ( this.unwrap !== false ) {

				// skinned meshes and outlines are left out, and textures that used the old light map UVs move to uv2

				const skinned = meshes.filter( ( mesh ) => mesh.isSkinnedMesh || record.outlines.includes( mesh ) ).map( ( mesh ) => [ mesh, mesh.userData.lightMapScale ] );

				for ( const [ mesh ] of skinned ) mesh.userData.lightMapScale = 0;

				preserveTextureUVs( meshes );

				let resolution = this.resolution;
				let atlas = null;

				try {

					// the resolution grows until the charts fit, up to several pages. Beyond them, a larger resolution
					// does not help a mesh that does not fit a page

					while ( ( atlas = unwrapUVs( root, { resolution, pageSize: this.pageSize, padding: this.padding, useInputUVs: this.unwrap === 'repack', inputAttribute: 'uv1' } ) ) === null ) {

						if ( resolution >= this.pageSize * 2 ) throw new Error( `THREE.LightBaker: The charts do not fit light map pages of ${ this.pageSize }², a mesh has too many charts or instances for a page. Increase the page size.` );

						resolution *= 2;

					}

				} finally {

					for ( const [ mesh, scale ] of skinned ) {

						if ( scale === undefined ) delete mesh.userData.lightMapScale;
						else mesh.userData.lightMapScale = scale;

					}

				}

				// the geometries of a previous atlas are replaced

				const geometries = new Set( meshes.map( ( mesh ) => mesh.geometry ) );

				for ( const geometry of record.geometries ) {

					if ( geometries.has( geometry ) === false && geometry.userData.lightBakerAtlas === true ) geometry.dispose();

				}

				for ( const mesh of meshes ) {

					if ( mesh.geometry.hasAttribute( 'uv1' ) ) mesh.geometry.userData.lightBakerAtlas = true;

				}

				record.atlas = atlas;
				record.requested = this.resolution;
				record.resolution = resolution;
				record.size = atlas.resolution;
				record.pages = atlas.pages;

			} else {

				let pages = 1;

				for ( const mesh of meshes ) {

					if ( mesh.geometry.hasAttribute( 'uv1' ) ) pages = Math.max( pages, ( mesh.userData.lightMapPage ?? 0 ) + 1 );

				}

				record.atlas = null;
				record.requested = record.resolution = this.resolution;
				record.size = Math.min( this.resolution, this.pageSize );
				record.pages = pages;

			}

			record.atlasKey = atlasKey;
			record.geometries = new Set( meshes.map( ( mesh ) => mesh.geometry ) );
			record.meshes = meshes;
			record.target = 'lightMap';

			this._setPageMaterials( record );

		} else if ( materialsChanged || record.target !== 'lightMap' ) {

			record.meshes = meshes;
			record.target = 'lightMap';

			this._setPageMaterials( record );

		}

		this._record = record;

	}

	/**
	 * Prepares a bake: generates the light map UVs, sets up the source of the indirect light for the
	 * visible scene and creates the light mapper. The light maps are removed from the materials until
	 * `apply()`, so that the sources do not see a previous bake. `bake()` calls it if the options that it
	 * depends on have changed, call it again after changing the scene or the lighting.
	 *
	 * @async
	 * @param {Scene} scene - The scene.
	 * @param {Object3D} [root=scene] - The light-mapped meshes, or a hierarchy that contains them.
	 * @return {Promise} A promise that resolves when the bake is prepared.
	 */
	async prepare( scene, root = scene ) {

		this._validate();

		const algorithm = this.algorithm;

		if ( algorithm === 'ray' && _rayTracedRadiosity === null ) _rayTracedRadiosity = await import( './RayTracedRadiosity.js' );

		this._stop();
		this._disposeBake();

		if ( this.renderer.shadowMap.enabled !== true ) console.warn( 'THREE.LightBaker: Enable renderer.shadowMap, otherwise the lights of the bake cast no shadows.' );

		// adding or removing light maps needs new shaders, also for the render targets of the probe captures

		const clearMaterials = () => {

			for ( const material of this.materials ) {

				material.lightMap = null;
				material.lightsNode = null;
				material.needsUpdate = true;

				vertexLightMap( material, null );

			}

		};

		// the materials of the previous bake, and of this one

		clearMaterials();

		this.prepareMeshes( root );

		clearMaterials();

		// vertex bakes split the edges at the contacts of surfaces first, which only depend on the geometry

		if ( this.target === 'vertex' ) await this._refineContacts( this._record );

		this.scene = scene;

		const record = this._record;

		// the direct light of the analytic lights stays live or is baked, the sources see it for its bounces.
		// The stochastic radiosity bakes the light of rect area lights like emitters

		scene.updateMatrixWorld();

		this.lights = [];
		this._areaLights = [];

		scene.traverseVisible( ( object ) => {

			// (vertex bakes of the ray traced radiosity bake hemisphere lights too)

			if ( object.isDirectionalLight || object.isPointLight || object.isSpotLight ) this.lights.push( object );
			else if ( object.isHemisphereLight && algorithm === 'ray' && this.target === 'vertex' ) this.lights.push( object );
			else if ( object.isRectAreaLight && ( algorithm === 'stochastic' || ( this.target === 'vertex' && this.directLight === 'baked' ) ) ) this._areaLights.push( object );

		} );

		this.bakedLights = this.directLight === 'baked' ? this.lights : [];

		// the bake sees the scene as it is now: the sources capture it, and the baked lights get copies with
		// shadow maps of it, which the renders of the scene do not replace, e.g. with moving dynamic objects

		this._withoutOutlines( () => {

			this._preparedObjects = new Set();
			scene.traverseVisible( ( object ) => this._preparedObjects.add( object ) );

			this._createSource( scene );

		} );

		// vertex bakes gather the baked lights with shadow rays, they need no copies

		this._lightCopies = this.target === 'vertex' ? [] : this.bakedLights.map( copyLight );

		if ( this.target === 'vertex' ) {

			// the vertices accumulate the samples, with the layout of the bounce cache if it has the same meshes and
			// geometries, and records of the back of the faces of the same meshes: the files keep the light of the
			// back of double-sided meshes, the cache of open ones too

			const meshes = record.lightMapped;
			const layout = this.source.layout ?? null;
			const doubleSided = this._doubleSided();
			const hasBack = ( mesh ) => doubleSided && [ mesh.material ].flat().some( ( material ) => material !== undefined && material.side === DoubleSide );
			const shared = layout !== null && layout.meshes.length === meshes.length && meshes.every( ( mesh ) => layout.hasMesh( mesh ) && layout.getGeometry( mesh ) === mesh.geometry && layout.hasBack( mesh ) === hasBack( mesh ) );

			this.lightMapper = new VertexLightMapper( this.renderer, this.irradianceNode, { meshes, layout: shared ? layout : null, directional: this.directional, doubleSided, sampling: this._sampling, smoothNormals: this._contactOcclusion?.smooth === true } );

			this._preparedKey = this._getPrepareKey( scene, root );
			this._applied = false;
			this._refinements = 0;
			this._simplified = false;

			this.reset();

			return;

		}

		// the light map accumulates the samples. A directional light map also bakes the dominant
		// direction of the light, so that normal maps show under baked light

		this.lightMapper = new LightMapper( this.renderer, record.size, this.irradianceNode, { lights: this._lightCopies, moments: true, directional: this.directional, pages: record.pages } );
		this.lightMapper.addObjects( record.lightMapped );

		// each page has its own denoiser and seams. Finding the seams takes a while, so they are reused while
		// the meshes and their light map UVs and transforms stay the same, e.g. for another algorithm. The
		// noise of stochastic radiosity is correlated, a lower luminance threshold keeps the contact shadows

		const seamsKey = this._getSeamsKey();
		const seams = seamsKey === this._seamsKey ? this._seams : [];

		const denoise = this.algorithm === 'stochastic' ? { correlation: 1, luminancePhi: 2 } : {};

		this._denoisers = this.lightMapper.pages.map( ( page, i ) => new LightMapDenoiser( this.renderer, this.lightMapper, { ...denoise, page: i } ) );
		this._stitchers = this.lightMapper.pages.map( ( page, i ) => new LightMapSeams( this.renderer, this.lightMapper, { page: i, seams: seams[ i ] } ) );

		this._seams = this._stitchers.map( ( stitcher ) => stitcher.seams );
		this._seamsKey = seamsKey;

		this._preparedKey = this._getPrepareKey( scene, root );
		this._applied = false;

		this.reset();

	}

	/**
	 * Bakes the light maps progressively until the estimated noise drops below the noise tolerance, or
	 * up to the maximum samples. Prepares the bake first if needed, and continues a previous bake of the
	 * same scene and options. A running bake stops when a new one starts.
	 *
	 * @async
	 * @param {Scene} scene - The scene.
	 * @param {Object} [options] - The options.
	 * @param {Object3D} [options.root=scene] - The light-mapped meshes, or a hierarchy that contains them.
	 * @param {?function({samples: number, noise: number, time: number})} [options.onProgress=null] - Called after each step of the bake.
	 * @param {?AbortSignal} [options.signal=null] - Stops the bake, the promise then rejects with the reason of the signal.
	 * @param {boolean} [options.interactive=true] - Whether to bake a few samples per animation frame, so that
	 * the page keeps rendering and shows the light maps while they accumulate. Otherwise the samples are baked
	 * in batches between the noise estimates, which is faster.
	 * @return {Promise<{samples: number, noise: number, time: number}>} A promise that resolves when the light maps have converged.
	 */
	async bake( scene, { root = scene, onProgress = null, signal = null, interactive = true } = {} ) {

		signal?.throwIfAborted();

		if ( this._needsPrepare( scene, root ) ) await this.prepare( scene, root );

		this._stop();

		const run = this._run = {};
		const aborted = () => signal?.aborted === true || this._run !== run;
		const progress = () => onProgress?.( { samples: this.samples, noise: this.noise, time: this.time } );

		let samplesPerFrame = this.getSamplesPerFrame();
		let framesInFlight = 0;
		let frameStart = performance.now();
		let averageFrameTime = 0;

		if ( this.samples === 0 ) this._renderShadowMaps( this._lightCopies );

		this._start = performance.now() - this.time * 1000;
		this.baking = true;

		// the light maps are only denoised once the bake has converged, so that the denoiser does not
		// settle the errors of early estimates. Until then, the materials show the samples

		if ( this.converged === false ) this._showSamples();

		try {

			// a noise estimate of a previous interactive bake

			if ( interactive === false ) await this._noisePromise;

			while ( true ) {

				while ( this.converged === false ) {

					if ( aborted() ) throw signal?.aborted ? signal.reason : new DOMException( 'The bake was superseded by another one.', 'AbortError' );

					const maxSamples = this.getMaxSamples();

					if ( interactive ) {

						// the noise estimates read the light map back while the samples accumulate

						this.lightMapper.update( Math.min( samplesPerFrame, maxSamples - this.samples ) );

						if ( this.samples < maxSamples && this.samples >= this._noiseCheck ) this._checkNoise();

					} else {

						// the same noise estimates as an interactive bake

						const target = this.samples < FIRST_NOISE_CHECK ? FIRST_NOISE_CHECK : Math.ceil( this.samples * 1.25 );

						this.lightMapper.update( Math.max( Math.min( target, maxSamples ) - this.samples, 1 ) );
						await this._checkNoise();

					}

					this.time = ( performance.now() - this._start ) / 1000;
					progress();

					if ( interactive ) {

						framesInFlight ++;
						this._workDone().then( () => framesInFlight -- );

						do {

							await nextFrame();

						} while ( framesInFlight > FRAMES_IN_FLIGHT && aborted() === false );

						const frameTime = performance.now() - frameStart;
						frameStart += frameTime;
						averageFrameTime += ( frameTime - averageFrameTime ) * 0.2;

						if ( averageFrameTime > FRAME_BUDGET ) samplesPerFrame = Math.max( Math.floor( samplesPerFrame * 0.75 ), 1 );
						else samplesPerFrame = Math.min( samplesPerFrame + 1, this.getSamplesPerFrame() );

					}

				}

				// vertex bakes are refined at the changes of the light and baked again, then simplified where the
				// light is smooth and baked once more. Simplified meshes are not refined again

				if ( this.target === 'vertex' && this._simplified === false && this._refinements < this.refine && await this._refineVertices() ) continue;
				if ( this.target === 'vertex' && this.simplify !== null && this._simplified === false && await this._simplifyVertices() ) continue;

				break;

			}

			// at the maximum samples, the last noise estimate is from fewer samples

			const tolerance = this.getNoiseTolerance();

			if ( this.noise >= tolerance ) {

				await this._checkNoise();

				if ( this.noise >= tolerance && Number.isFinite( this.noise ) ) console.warn( `THREE.LightBaker: The bake reached the maximum of ${ this.samples } samples at ${ ( this.noise * 100 ).toFixed( 1 ) }% noise, above the noise tolerance of ${ ( tolerance * 100 ).toFixed( 1 ) }%.` );

			}

			this.process();

		} finally {

			if ( this._run === run ) {

				this._run = null;
				this.baking = false;

			}

		}

		return { samples: this.samples, noise: this.noise, time: this.time };

	}

	/**
	 * Discards the accumulated samples, the next `bake()` starts over.
	 */
	reset() {

		this.lightMapper?.reset();

		this.noise = Infinity;
		this.time = 0;
		this._noiseCheck = FIRST_NOISE_CHECK;
		this._start = performance.now();
		this._epoch ++;

		this._showSamples();

	}

	/**
	 * Denoises and stitches the light maps with the current options, see {@link LightBaker#denoise} and
	 * {@link LightBaker#stitchSeams}, and assigns them to the materials if they are applied. The bake does
	 * so once it has converged.
	 *
	 * @return {Array<Texture>} The light maps, one per page.
	 */
	process() {

		if ( this.lightMapper === null ) throw new Error( 'THREE.LightBaker: Call prepare() or bake() first.' );

		// vertex bakes are denoised between the vertices, the stochastic radiosity with its noise that the
		// vertices share like the light maps

		if ( this.target === 'vertex' ) {

			const key = `${ this._epoch },${ this.samples },${ this.noise },${ this.denoise }`;

			if ( key !== this._processedKey ) {

				this._processedKey = key;

				if ( this.denoise && this.noise < Infinity ) {

					const options = this.algorithm === 'stochastic' ? { correlation: 1, luminancePhi: 2 } : {};
					this.lightMapper.denoise( { ...options, ...this._vertexDenoise, relativeNoise: this.noise } );

				} else {

					this.lightMapper.update( 0 );

				}

			}

			return [ this.lightMapper.texture ];

		}

		const key = `${ this._epoch },${ this.samples },${ this.noise },${ this.denoise },${ this.stitchSeams }`;

		if ( key !== this._processedKey ) {

			this._processedKey = key;

			this._lightMaps = this.lightMapper.pages.map( ( page, i ) => {

				let lightMap = page.texture;

				if ( this.denoise ) {

					if ( this.noise < Infinity ) this._denoisers[ i ].relativeNoise.value = this.noise;
					this._denoisers[ i ].update();
					lightMap = this._denoisers[ i ].texture;

				}

				if ( this.stitchSeams ) {

					this._stitchers[ i ].update( lightMap );
					lightMap = this._stitchers[ i ].texture;

				}

				return lightMap;

			} );

			if ( this._applied ) this._assignLightMaps();

		}

		return this._lightMaps;

	}

	/**
	 * Assigns the light maps to the materials of the light-mapped meshes, the processed ones of a converged
	 * bake or else the samples, which update every frame while baking. With
	 * `directional`, the materials shade the light maps with the dominant directions of the light. With
	 * baked direct light, the materials leave the baked lights out. Call it again after changing
	 * `directional` or `specularIntensity`.
	 */
	apply() {

		if ( this.lightMapper === null ) throw new Error( 'THREE.LightBaker: Call prepare() or bake() first.' );

		const directional = this.directional && this.lightMapper.directionTexture !== null;
		const lightsNode = this._getLightsNode();

		for ( const material of this.materials ) {

			const page = this.materialPages.get( material );

			if ( page < 0 ) continue;

			if ( this.target === 'vertex' ) {

				vertexLightMap( material, this.lightMapper, { directional, specularIntensity: this.specularIntensity } );

				material.lightsNode = lightsNode;
				material.needsUpdate = true;

				continue;

			}

			directionalLightMap( material, directional ? this.lightMapper.pages[ page ].directionTexture : null, { specularIntensity: this.specularIntensity } );

			material.lightsNode = lightsNode;
			material.needsUpdate = true;

		}

		this._applied = true;
		this._assignLightMaps();

	}

	/**
	 * Frees the GPU resources. The meshes get their own materials back, without light maps, and keep
	 * their light map UVs.
	 */
	dispose() {

		this._stop();
		this._disposeBake();

		this._seams = [];
		this._seamsKey = null;

		for ( const record of this._records.values() ) {

			this._subdivide( record, null );

			for ( const mesh of record.meshes ) {

				if ( mesh.material === record.assigned.get( mesh ) ) mesh.material = record.sourceMaterials.get( mesh );

			}

			for ( const material of record.materials ) {

				if ( record.pageMaterials.includes( material ) ) continue;

				material.lightMap = null;
				material.lightsNode = null;
				directionalLightMap( material, null );
				vertexLightMap( material, null );

			}

			for ( const material of record.pageMaterials ) material.dispose();

		}

		this._records.clear();
		this._record = null;
		this._lightsNodes.clear();
		this.scene = null;

	}

	/**
	 * Throws if an option is invalid.
	 *
	 * @private
	 */
	_validate() {

		const integer = ( value, min ) => Number.isInteger( value ) && value >= min;

		if ( ALGORITHMS.includes( this.algorithm ) === false ) throw new Error( `THREE.LightBaker: Unknown algorithm "${ this.algorithm }", use one of ${ ALGORITHMS.join( ', ' ) }.` );
		if ( TARGETS.includes( this.target ) === false ) throw new Error( `THREE.LightBaker: Unknown target "${ this.target }", use one of ${ TARGETS.join( ', ' ) }.` );
		if ( this.target === 'vertex' && this.directLight === 'baked' && this.algorithm !== 'ray' ) throw new Error( 'THREE.LightBaker: Vertex bakes only bake the direct light with the \'ray\' algorithm.' );
		if ( this.maxEdgeLength !== null && ! ( this.maxEdgeLength > 0 ) ) throw new Error( 'THREE.LightBaker: The maximum edge length must be positive or null.' );
		if ( integer( this.refine, 0 ) === false ) throw new Error( 'THREE.LightBaker: The refinements must be an integer of at least 0.' );
		if ( this.simplify !== null && ! ( this.simplify > 0 ) ) throw new Error( 'THREE.LightBaker: The simplification error must be positive or null.' );
		if ( this.unwrap !== true && this.unwrap !== false && this.unwrap !== 'repack' ) throw new Error( `THREE.LightBaker: unwrap must be true, false or 'repack', not "${ this.unwrap }".` );
		if ( this.directLight !== 'live' && this.directLight !== 'baked' ) throw new Error( `THREE.LightBaker: directLight must be 'live' or 'baked', not "${ this.directLight }".` );
		if ( integer( this.resolution, 16 ) === false ) throw new Error( 'THREE.LightBaker: The resolution must be an integer of at least 16.' );
		if ( integer( this.pageSize, 16 ) === false ) throw new Error( 'THREE.LightBaker: The page size must be an integer of at least 16.' );
		if ( integer( this.padding, 3 ) === false ) throw new Error( 'THREE.LightBaker: The padding must be an integer of at least 3.' );
		if ( integer( this.directions, 1 ) === false ) throw new Error( 'THREE.LightBaker: The directions must be a positive integer.' );
		if ( ! ( this.cacheSize > 0 ) ) throw new Error( 'THREE.LightBaker: The cache size must be positive.' );
		if ( integer( this.vxgiResolution, 2 ) === false ) throw new Error( 'THREE.LightBaker: The VXGI resolution must be an integer of at least 2.' );
		if ( this.noiseTolerance !== null && ! ( this.noiseTolerance > 0 ) ) throw new Error( 'THREE.LightBaker: The noise tolerance must be positive or null.' );
		if ( this.maxSamples !== null && integer( this.maxSamples, 1 ) === false ) throw new Error( 'THREE.LightBaker: The maximum samples must be a positive integer or null.' );
		if ( this.samplesPerFrame !== null && integer( this.samplesPerFrame, 1 ) === false ) throw new Error( 'THREE.LightBaker: The samples per frame must be a positive integer or null.' );
		if ( ! ( this.specularIntensity >= 0 ) ) throw new Error( 'THREE.LightBaker: The specular intensity must not be negative.' );

	}

	/**
	 * Returns whether `bake()` has to prepare the bake first.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 * @param {Object3D} root - The root of the light-mapped meshes.
	 * @return {boolean} Whether to prepare.
	 */
	_needsPrepare( scene, root ) {

		if ( this.lightMapper === null || this._getPrepareKey( scene, root ) !== this._preparedKey ) return true;

		// a bake without directions cannot continue as a directional one, the other way round it can

		return this.directional && this.lightMapper.directionTexture === null;

	}

	/**
	 * Returns a key of the options that a prepared bake depends on.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 * @param {Object3D} root - The root of the light-mapped meshes.
	 * @return {string} The key.
	 */
	_getPrepareKey( scene, root ) {

		return JSON.stringify( [ scene.uuid, root.uuid, this.algorithm, this.target, this.maxEdgeLength, this.refine, this.simplify, this.resolution, this.pageSize, this.padding, this.unwrap, this.ignoreOutlines, this.directLight, this.directions, this.cacheSize, this.probes, this.vxgiResolution ] );

	}

	/**
	 * Returns a key of what the seams of the light mapper's atlas depend on: the size, the meshes of each
	 * page with their geometries, light map UVs and world transforms.
	 *
	 * @private
	 * @return {string} The key.
	 */
	_getSeamsKey() {

		const key = [ this.lightMapper.size ];

		for ( const page of this.lightMapper.pages ) {

			key.push( '|' );

			for ( const mesh of page.objects ) {

				const geometry = mesh.geometry;

				key.push( mesh.id, geometry.id, geometry.getAttribute( 'position' ).version, geometry.getAttribute( 'uv1' ).version, ...mesh.matrixWorld.elements );

				if ( mesh.isInstancedMesh ) key.push( mesh.count, mesh.instanceMatrix.version );

			}

		}

		return key.join();

	}

	/**
	 * Returns the light map page of a mesh, -1 for meshes left out of the light map.
	 *
	 * @private
	 * @param {Mesh} mesh - The mesh.
	 * @param {Object} record - The meshes of its root.
	 * @return {number} The page.
	 */
	_pageOf( mesh, record ) {

		if ( mesh.isSkinnedMesh || mesh.isBatchedMesh ) return - 1;
		if ( record.outlines.includes( mesh ) ) return - 1;
		if ( record.target === 'vertex' ) return mesh.userData.lightMapScale === 0 ? - 1 : 0;
		if ( mesh.geometry.hasAttribute( 'uv1' ) === false ) return - 1;
		if ( this.unwrap === false && mesh.userData.lightMapScale === 0 ) return - 1;

		return mesh.userData.lightMapPage ?? 0;

	}

	/**
	 * Subdivides the light-mapped meshes of a root for a maximum edge length, or restores their geometries
	 * with `null`. The subdivided geometries are reused while the length stays the same.
	 *
	 * @private
	 * @param {Object} record - The meshes of a root.
	 * @param {?number} maxEdgeLength - The maximum edge length.
	 */
	_subdivide( record, maxEdgeLength ) {

		const subdivided = record.subdivided;
		const geometriesOf = ( entries ) => new Set( [ ...entries ].flatMap( ( entry ) => [ entry.geometry, entry.subdivided, entry.cacheGeometry, entry.uniform ?? entry.subdivided ] ) );
		const previous = geometriesOf( subdivided.values() );

		for ( const [ mesh, previousEntry ] of subdivided ) {

			let entry = previousEntry;

			// refinements are undone, the mesh gets its subdivision back

			if ( mesh.geometry === entry.geometry && entry.geometry !== entry.subdivided ) {

				mesh.geometry = entry.subdivided;
				entry = { ...entry, geometry: entry.subdivided };
				subdivided.set( mesh, entry );

			}

			if ( entry.maxEdgeLength === maxEdgeLength && mesh.geometry === entry.geometry && entry.geometry !== entry.original ) continue;

			if ( mesh.geometry === entry.geometry ) mesh.geometry = entry.original;

			subdivided.delete( mesh );

		}

		if ( maxEdgeLength !== null ) {

			// meshes that share a geometry share its subdivisions, split by the transform of the first one. The
			// rays and the bounce cache use a coarser subdivision, with the same surfaces, which is faster to trace

			const geometries = new Map( [ ...subdivided.values() ].map( ( entry ) => [ entry.original, entry ] ) );

			const bounds = new Box3();
			for ( const mesh of record.lightMapped ) bounds.expandByObject( mesh );

			const size = bounds.isEmpty() ? 0 : bounds.getSize( new Vector3() ).length();
			const cacheEdgeLength = Math.max( maxEdgeLength, Math.min( maxEdgeLength * this._cacheEdge, size * VERTEX_CACHE_MAX_EDGE ) );

			for ( const mesh of record.lightMapped ) {

				if ( subdivided.has( mesh ) ) continue;

				const original = mesh.geometry;

				if ( geometries.has( original ) === false ) {

					mesh.updateWorldMatrix( true, false );

					const geometry = subdivideGeometry( original, maxEdgeLength, { matrix: mesh.matrixWorld } );
					const cacheGeometry = geometry !== original ? subdivideGeometry( original, cacheEdgeLength, { matrix: mesh.matrixWorld } ) : original;

					geometries.set( original, { original, geometry, subdivided: geometry, cacheGeometry, maxEdgeLength } );

				}

				const entry = geometries.get( original );

				if ( entry.geometry === original ) continue;

				mesh.geometry = entry.geometry;
				subdivided.set( mesh, entry );

			}

		}

		const current = geometriesOf( subdivided.values() );

		for ( const geometry of previous ) {

			if ( current.has( geometry ) === false && [ ...subdivided.values() ].every( ( entry ) => entry.original !== geometry ) && record.meshes.every( ( mesh ) => mesh.geometry !== geometry ) ) geometry.dispose();

		}

	}

	/**
	 * Cuts the subdivided meshes of a vertex bake along the contacts of surfaces, see {@link imprintContacts},
	 * or with `_contacts` set to `'rays'`, splits their edges at the contacts with rays, see
	 * {@link refineContacts}, down to the maximum edge length halved by the number of refinements. The cut
	 * geometries replace the subdivisions, so the refinements at the changes of the light start from them,
	 * and they are kept while the maximum edge length, and for rays the refinements, stay.
	 *
	 * @private
	 * @async
	 * @param {Object} record - The meshes of a root.
	 * @return {Promise} A promise that resolves once the meshes are split.
	 */
	async _refineContacts( record ) {

		const imprint = this._contacts === 'imprint';
		const enabled = this.maxEdgeLength !== null && ( imprint || ( this._contacts === 'rays' && this.refine > 0 && this._contactRays > 0 ) );
		const key = enabled ? ( imprint ? `${ this.maxEdgeLength },imprint` : `${ this.maxEdgeLength },${ this.refine },rays` ) : null;

		// the meshes that share a subdivision are split together, from the uniform subdivision. Without
		// refinements, the meshes get the uniform subdivision back

		const groups = new Map();
		const replaced = new Set();

		for ( const [ mesh, entry ] of record.subdivided ) {

			if ( mesh.isInstancedMesh || ( entry.contacts ?? null ) === key ) continue;

			const uniform = entry.uniform ?? entry.subdivided;

			if ( key === null ) {

				if ( entry.subdivided !== uniform ) replaced.add( entry.subdivided );

				record.subdivided.set( mesh, { ...entry, subdivided: uniform, geometry: uniform, contacts: null } );
				mesh.geometry = uniform;

				continue;

			}

			if ( groups.has( uniform ) === false ) groups.set( uniform, { geometry: uniform, meshes: [] } );

			groups.get( uniform ).meshes.push( mesh );

		}

		const free = () => {

			for ( const geometry of replaced ) {

				if ( record.meshes.every( ( mesh ) => mesh.geometry !== geometry ) ) geometry.dispose();

			}

		};

		if ( groups.size === 0 ) {

			free();
			return;

		}

		const occluders = record.meshes.filter( ( mesh ) => mesh.isSkinnedMesh !== true && mesh.isBatchedMesh !== true && record.outlines.includes( mesh ) === false );
		const list = [ ...groups.values() ];
		// the occluders cut with their own geometries, not their subdivisions

		const originals = new Map( occluders.map( ( mesh ) => [ mesh, record.subdivided.get( mesh )?.original ?? mesh.geometry ] ) );
		const geometries = imprint
			? await imprintContacts( list, occluders, { geometries: originals } )
			: await refineContacts( list, occluders, { minEdgeLength: this.maxEdgeLength / 2 ** this.refine, rounds: this.refine, rays: this._contactRays } );

		// the previous splits of other refinements are freed

		list.forEach( ( group, g ) => {

			for ( const mesh of group.meshes ) {

				const entry = record.subdivided.get( mesh );

				if ( entry.subdivided !== group.geometry ) replaced.add( entry.subdivided );

				record.subdivided.set( mesh, { ...entry, uniform: group.geometry, subdivided: geometries[ g ], geometry: geometries[ g ], contacts: key } );
				mesh.geometry = geometries[ g ];

			}

		} );

		free();

	}

	/**
	 * Refines the meshes of a converged vertex bake at the changes of the light: the edges whose ends differ
	 * more in luminance are split once, with the longest edges of their triangles, and the vertices of the
	 * refined meshes get a new mapper, which bakes them all again. A refinement whose triangles would not fit
	 * the storage buffers of the device is left out, and ends the refinements. Keeping the light of the
	 * vertices of unchanged triangles, `_refineKeep`, needs about as long, since the changed vertices are the
	 * noisiest, and gives the same light. The source, with its rays and bounce cache, stays.
	 *
	 * @private
	 * @async
	 * @return {Promise<boolean>} A promise that resolves with whether any mesh was refined.
	 */
	async _refineVertices() {

		const record = this._record;
		const mapper = this.lightMapper;
		const layout = mapper.layout;
		const irradiance = await mapper.readIrradiance();
		const directions = this._refineKeep ? await mapper.readDirections() : null;

		// the luminance of the records, the contrast of dark ends is relative to a twentieth of the mean

		const luminance = new Float32Array( layout.recordCount );
		let sum = 0, mass = 0;

		for ( let i = 0; i < layout.recordCount; i ++ ) {

			luminance[ i ] = 0.2126 * irradiance[ i * 3 ] + 0.7152 * irradiance[ i * 3 + 1 ] + 0.0722 * irradiance[ i * 3 + 2 ];
			sum += luminance[ i ] * layout.masses[ i ];
			mass += layout.masses[ i ];

		}

		const floor = mass > 0 ? 0.05 * sum / mass : 0;
		const bounds = new Box3();

		for ( const mesh of record.lightMapped ) bounds.expandByObject( mesh );

		const minLength = ( this.maxEdgeLength ?? bounds.getSize( new Vector3() ).length() * 0.01 ) / 2 ** this.refine;
		const contrast = this._refineContrast ?? REFINE_CONTRAST;
		const refinements = [];

		for ( const mesh of record.lightMapped ) {

			if ( mesh.isInstancedMesh ) continue;

			const geometry = mesh.geometry;
			const at = ( vertex, back ) => luminance[ layout.getRecord( mesh, 0, vertex, back ) ] ?? 0;

			// the vertices inside other meshes have no light, see imprintContacts. The light of both sides of
			// double-sided meshes counts

			const known = ( vertex, back ) => layout.masses[ layout.getRecord( mesh, 0, vertex, back ) ] > 0;
			const sides = layout.hasBack( mesh ) ? [ false, true ] : [ false ];

			const split = ( i, j, lengthSq ) => {

				if ( lengthSq <= minLength * minLength ) return false;

				return sides.some( ( back ) => {

					if ( known( i, back ) === false || known( j, back ) === false ) return false;

					const a = at( i, back ), b = at( j, back );

					return Math.abs( a - b ) > contrast * Math.max( a, b, floor );

				} );

			};

			const refinedGeometry = subdivideGeometry( geometry, 0, { matrix: mesh.matrixWorld, rounds: 1, split, longest: true } );

			if ( refinedGeometry !== geometry ) refinements.push( { mesh, geometry: refinedGeometry } );

		}

		if ( refinements.length === 0 ) return false;

		// the refined meshes get a mapper, which is left out with the refinement if its storage buffers exceed what
		// a binding of the device holds

		const geometries = refinements.map( ( { mesh } ) => mesh.geometry );

		for ( const { mesh, geometry } of refinements ) mesh.geometry = geometry;

		const previous = this._refineKeep ? { layout, irradiance, directions } : null;
		const refinedMapper = new VertexLightMapper( this.renderer, this.irradianceNode, { meshes: record.lightMapped, directional: this.directional, doubleSided: this._doubleSided(), previous, sampling: this._sampling, smoothNormals: this._contactOcclusion?.smooth === true } );
		const limit = this.renderer.backend.device?.limits.maxStorageBufferBindingSize ?? 134217728;

		if ( refinedMapper._storageSize() > limit ) {

			refinedMapper.dispose();

			refinements.forEach( ( { mesh, geometry }, i ) => {

				mesh.geometry = geometries[ i ];
				geometry.dispose();

			} );

			console.warn( `THREE.LightBaker: The refinements stopped after ${ this._refinements } of ${ this.refine }, the next one needs more than the ${ Math.round( limit / 1048576 ) } MB that a storage buffer binding of this device holds.` );

			return false;

		}

		// the refinement of each mesh is its own, the previous one is replaced

		refinements.forEach( ( { mesh, geometry: refinedGeometry }, i ) => {

			const geometry = geometries[ i ];
			const entry = record.subdivided.get( mesh ) ?? { original: geometry, geometry, subdivided: geometry, cacheGeometry: geometry, maxEdgeLength: this.maxEdgeLength };

			if ( entry.geometry !== entry.subdivided ) entry.geometry.dispose();

			record.subdivided.set( mesh, { ...entry, geometry: refinedGeometry } );

		} );

		this.lightMapper = refinedMapper;
		mapper.dispose();

		// the bake time continues

		const start = this._start;

		this._refinements ++;
		this.reset();

		this._start = start;

		if ( this._applied ) this.apply();

		return true;

	}

	/**
	 * Simplifies the meshes of a converged vertex bake where the light is smooth, with the
	 * `simplifyWithAttributes` of meshoptimizer and the luminance of the vertices relative to its mean as
	 * an attribute, and gives the vertices that remain a new mapper, which keeps their light, see
	 * {@link LightBaker#simplify}.
	 *
	 * @private
	 * @async
	 * @return {Promise<boolean>} A promise that resolves with whether any mesh was simplified.
	 */
	async _simplifyVertices() {

		this._simplified = true;

		const record = this._record;
		const mapper = this.lightMapper;
		const layout = mapper.layout;
		const irradiance = await mapper.readIrradiance();

		// the luminance of the records relative to their mean

		const luminance = new Float32Array( layout.recordCount );
		let sum = 0, mass = 0;

		for ( let i = 0; i < layout.recordCount; i ++ ) {

			luminance[ i ] = 0.2126 * irradiance[ i * 3 ] + 0.7152 * irradiance[ i * 3 + 1 ] + 0.0722 * irradiance[ i * 3 + 2 ];
			sum += luminance[ i ] * layout.masses[ i ];
			mass += layout.masses[ i ];

		}

		const mean = mass > 0 && sum > 0 ? sum / mass : 1;
		let simplified = false;

		for ( const mesh of record.lightMapped ) {

			if ( mesh.isInstancedMesh ) continue;

			const geometry = mesh.geometry;
			const count = geometry.getAttribute( 'position' ).count;

			// the light of both sides of double-sided meshes

			const sides = layout.hasBack( mesh ) ? [ false, true ] : [ false ];
			const light = new Float32Array( count * sides.length );

			for ( let v = 0; v < count; v ++ ) {

				sides.forEach( ( back, k ) => {

					const r = layout.getRecord( mesh, 0, v, back );
					light[ v * sides.length + k ] = r >= 0 ? luminance[ r ] / mean : 0;

				} );

			}

			// meshoptimizer needs shared vertices, the light keeps vertices with different light apart

			let source = geometry;

			if ( source.index === null ) {

				source = geometry.clone();
				source.setAttribute( 'simplifyLight', new BufferAttribute( light, sides.length ) );
				source = mergeVertices( source );

			}

			const values = source.hasAttribute( 'simplifyLight' ) ? new Float32Array( source.getAttribute( 'simplifyLight' ).array ) : light;
			if ( source !== geometry ) source.deleteAttribute( 'simplifyLight' );

			// the vertices of the mesh before its subdivision stay

			const keep = record.subdivided.get( mesh )?.original ?? geometry;
			const simplification = await simplifyGeometry( source, values, { error: this.simplify, keep, stride: sides.length } );

			if ( source !== geometry ) source.dispose();
			if ( simplification === null ) continue;

			const result = simplification.geometry;

			// the simplification replaces the refinement of the mesh

			const entry = record.subdivided.get( mesh ) ?? { original: geometry, geometry, subdivided: geometry, cacheGeometry: geometry, maxEdgeLength: this.maxEdgeLength };

			if ( entry.geometry !== entry.subdivided && entry.geometry !== entry.original ) entry.geometry.dispose();

			record.subdivided.set( mesh, { ...entry, geometry: result } );
			mesh.geometry = result;
			simplified = true;

		}

		if ( simplified === false ) return false;

		// the vertices that remain keep the light of the bake, which meshoptimizer interpolates within the error,
		// unless they are baked again

		const previous = this._simplifyRebake ? null : { layout, irradiance, directions: await mapper.readDirections(), all: true };

		this.lightMapper = new VertexLightMapper( this.renderer, this.irradianceNode, { meshes: record.lightMapped, directional: this.directional, doubleSided: this._doubleSided(), previous, sampling: this._sampling, smoothNormals: this._contactOcclusion?.smooth === true } );
		mapper.dispose();

		// the bake time continues

		const start = this._start;

		this.reset();

		this._start = start;

		if ( this._applied ) this.apply();

		return true;

	}

	/**
	 * Assigns the materials of the pages. A material samples one light map, the meshes on other pages
	 * than the first one get copies of their materials, which sample the light map of their page. Meshes
	 * left out of the light map get copies without a light map.
	 *
	 * @private
	 * @param {Object} record - The meshes of a root.
	 */
	_setPageMaterials( record ) {

		for ( const material of record.pageMaterials ) material.dispose();

		const copies = new Map();

		record.materialPages = new Map();
		record.assigned = new Map();
		record.lightMapped = [];
		record.excluded = [];

		for ( const mesh of record.meshes ) {

			const page = this._pageOf( mesh, record );
			const source = record.sourceMaterials.get( mesh );

			const pageMaterial = ( material ) => {

				if ( page === 0 ) return mesh.isInstancedMesh && record.target !== 'vertex' ? instancedLightMap( material ) : material;

				const key = material.uuid + ',' + page;

				if ( copies.has( key ) === false ) {

					const copy = material.clone();
					copy.envNode = material.envNode;
					copy.lightMap = null;
					if ( mesh.isInstancedMesh ) instancedLightMap( copy );
					copies.set( key, copy );

				}

				return copies.get( key );

			};

			mesh.material = Array.isArray( source ) ? source.map( pageMaterial ) : pageMaterial( source );

			for ( const material of [ mesh.material ].flat() ) record.materialPages.set( material, page );

			record.assigned.set( mesh, mesh.material );

			if ( page >= 0 ) record.lightMapped.push( mesh );
			else record.excluded.push( mesh );

		}

		record.pageMaterials = [ ...copies.values() ];
		record.materials = new Set( record.meshes.flatMap( ( mesh ) => [ mesh.material ].flat() ) );

	}

	/**
	 * Creates the source of the indirect light and its irradiance samplers.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 */
	/**
	 * Returns whether vertex bakes give the meshes with double-sided materials records for the back of their
	 * faces: the rays of the ray traced radiosity see the light of the side they hit.
	 *
	 * @private
	 * @return {boolean} Whether double-sided meshes get records for both sides.
	 */
	_doubleSided() {

		return this.algorithm === 'ray';

	}

	_createSource( scene ) {

		const renderer = this.renderer;
		const record = this._record;

		// the bounce caches of the radiosity solvers keep their texel density with several pages, their
		// size is per page

		const cacheSize = this.target === 'vertex' ? this.cacheSize : this.cacheSize * record.size / record.resolution;

		if ( this.algorithm === 'ray' ) {

			// rays traced through a BVH of the scene gather the bounces from a cached light map, a small
			// cache suffices since the rays average it

			const { RayTracedRadiosity, rayTracedRadiosityIrradiance } = _rayTracedRadiosity;

			// vertex bakes cache the bounces in the vertices too, and gather the baked lights with shadow rays

			const vertex = this.target === 'vertex';
			const geometries = new Map();

			if ( vertex ) for ( const [ mesh, entry ] of record.subdivided ) geometries.set( mesh, entry.cacheGeometry );

			const radiosity = new RayTracedRadiosity( { cacheSize, cache: vertex ? 'vertex' : 'lightMap', geometries } );
			radiosity.lightSamples = this._lightSamples;
			radiosity.lightShape = this._lightShape;
			if ( this._bias !== null ) radiosity.bias = this._bias;
			radiosity.ambientOcclusion = this._ambientOcclusion;
			radiosity.contactOcclusion = this._contactOcclusion;
			if ( this._bounces !== null ) radiosity.bounces = this._bounces;

			// another seed starts the sample sequences elsewhere, e.g. to measure the noise of a bake

			radiosity._pass = ( this._seed * 65536 ) >>> 0;
			radiosity.update( renderer, scene );

			this.irradianceNode = rayTracedRadiosityIrradiance( radiosity, { analyticLights: vertex && this.directLight === 'baked' } );
			this.source = radiosity;

		} else if ( this.algorithm === 'stochastic' ) {

			// stochastic depth radiosity, the bounces are cached in a light map before baking. It captures a
			// sky as a large unlit sphere around the scene

			// vertex bakes cache the bounces in the vertices too, rendered with the geometries of the cache

			const vertex = this.target === 'vertex';
			const geometries = new Map();

			if ( vertex ) for ( const [ mesh, entry ] of record.subdivided ) geometries.set( mesh, entry.cacheGeometry );

			const radiosity = new StochasticRadiosity( { directions: this.directions, cacheSize, cache: vertex ? 'vertex' : 'lightMap', meshes: vertex ? record.lightMapped : null, geometries } );
			const sky = createSkySphere( scene );

			if ( sky !== null ) scene.add( sky );

			try {

				radiosity.update( renderer, scene );

			} finally {

				if ( sky !== null ) {

					scene.remove( sky );
					sky.geometry.dispose();
					sky.material.dispose();

				}

			}

			this.irradianceNode = radiosityIrradiance( radiosity );
			this.source = radiosity;

		} else if ( this.algorithm === 'probes' ) {

			const { size, position, counts, near, far, cubemapSize } = this._getProbeGrid();
			const probes = new LightProbeGrid( size.x, size.y, size.z, ...counts );
			probes.position.copy( position );
			probes.updateBoundingBox();

			// background colors are not part of the bake

			const background = scene.background;
			if ( background !== null && background.isColor ) scene.background = null;

			try {

				probes.bake( renderer, scene, { cubemapSize, near, far } );

			} finally {

				scene.background = background;

			}

			this.irradianceNode = ( position, normal, sample, direction ) => {

				const irradiance = lightProbeGridIrradiance( probes, position, normal );

				if ( direction ) direction.addAssign( lightProbeGridDirection( probes, position, normal ).mul( luminance( irradiance ) ) );

				return irradiance;

			};

			this.source = probes;

		} else {

			const volume = new VXGIVolume( this.vxgiResolution );
			volume.update( renderer, scene );

			// three cones like webgpu_vxgi

			this.irradianceNode = vxgiIrradiance( volume, { coneCount: 3 } );
			this.source = volume;

		}

	}

	/**
	 * Returns the light probe grid of the `'probes'` algorithm, with the missing values fitted to the
	 * bounds of the light-mapped meshes: about eight probes along the longest side.
	 *
	 * @private
	 * @return {{size: Vector3, position: Vector3, counts: Array<number>, near: number, far: number, cubemapSize: number}} The grid.
	 */
	_getProbeGrid() {

		const options = this.probes ?? {};
		const bounds = new Box3();

		for ( const mesh of this._record.lightMapped ) bounds.expandByObject( mesh );

		if ( bounds.isEmpty() ) bounds.setFromCenterAndSize( new Vector3(), new Vector3( 1, 1, 1 ) );

		const size = options.size ?? bounds.getSize( new Vector3() );
		const position = options.position ?? bounds.getCenter( new Vector3() );
		const extent = Math.max( size.x, size.y, size.z, 1e-6 );
		const counts = options.counts ?? [ size.x, size.y, size.z ].map( ( length ) => Math.min( Math.max( Math.round( length / extent * 7 ) + 1, 2 ), 16 ) );
		const diagonal = size.length();

		return { size, position, counts, near: options.near ?? Math.min( 0.05, diagonal / 100 ), far: options.far ?? diagonal * 2, cubemapSize: options.cubemapSize ?? 32 };

	}

	/**
	 * Returns a promise that resolves when the GPU has finished the work submitted so far.
	 *
	 * @private
	 * @return {Promise} The promise.
	 */
	_workDone() {

		return this.renderer.backend.device.queue.onSubmittedWorkDone();

	}

	/**
	 * Estimates the noise of the light maps and processes them with the estimate.
	 *
	 * @private
	 * @return {Promise} A promise that resolves after the estimate.
	 */
	_checkNoise() {

		const epoch = this._epoch;

		this._noiseCheck = Infinity;

		this._noisePromise = this.lightMapper.estimateNoise().then( ( noise ) => {

			if ( epoch !== this._epoch ) return;

			this.noise = noise;
			this._noiseCheck = Math.ceil( this.samples * 1.25 );

		} );

		return this._noisePromise;

	}

	/**
	 * Stops a running bake.
	 *
	 * @private
	 */
	_stop() {

		this._run = null;
		this.baking = false;

	}

	/**
	 * Disposes the light mapper, its post-processing and the source.
	 *
	 * @private
	 */
	_disposeBake() {

		this.lightMapper?.dispose();
		for ( const denoiser of this._denoisers ) denoiser.dispose();
		for ( const stitcher of this._stitchers ) stitcher.dispose();
		this.source?.dispose();
		for ( const light of this._lightCopies ) light.dispose();

		this.lightMapper = null;
		this.source = null;
		this.irradianceNode = null;
		this._denoisers = [];
		this._stitchers = [];
		this._lightCopies = [];
		this._preparedObjects = null;
		this._lightMaps = null;
		this._processedKey = null;
		this._preparedKey = null;
		this._noisePromise = null;
		this._applied = false;

	}

	/**
	 * Discards the processed light maps, the applied materials show the samples again.
	 *
	 * @private
	 */
	_showSamples() {

		this._lightMaps = null;
		this._processedKey = null;

		if ( this._applied ) this._assignLightMaps();

	}

	/**
	 * Assigns the processed light maps, or else the samples, to the applied materials.
	 *
	 * @private
	 */
	_assignLightMaps() {

		// the materials of vertex bakes look the vertices up

		if ( this.target === 'vertex' ) return;

		const lightMaps = this._lightMaps ?? this.lightMapper.pages.map( ( page ) => page.texture );

		for ( const material of this.materials ) {

			const page = this.materialPages.get( material );

			if ( page >= 0 ) material.lightMap = lightMaps[ page ];

		}

	}

	/**
	 * Returns the lights node of the light-mapped materials, the lights of the scene without the baked
	 * ones, or `null` for all lights. There is one node per set, so that materials keep their shaders.
	 *
	 * @private
	 * @return {?LightsNode} The lights node.
	 */
	_getLightsNode() {

		const excluded = [ ...this.bakedLights, ...this._areaLights ];

		if ( excluded.length === 0 ) return null;

		const sceneLights = [];
		this.scene.traverseVisible( ( object ) => object.isLight && excluded.includes( object ) === false && sceneLights.push( object ) );

		const key = sceneLights.map( ( light ) => light.id ).join();
		if ( this._lightsNodes.has( key ) === false ) this._lightsNodes.set( key, lights( sceneLights ) );

		return this._lightsNodes.get( key );

	}

	/**
	 * Hides the visible outline shells while the callback renders or captures the scene.
	 *
	 * @private
	 * @param {Function} callback - The callback.
	 */
	_withoutOutlines( callback ) {

		const outlines = this.outlineMeshes.filter( ( mesh ) => mesh.visible );

		for ( const mesh of outlines ) mesh.visible = false;

		try {

			callback();

		} finally {

			for ( const mesh of outlines ) mesh.visible = true;

		}

	}

	/**
	 * Hides the objects that were not visible when the bake was prepared while the callback renders the
	 * scene, e.g. dynamic objects and the outline shells.
	 *
	 * @private
	 * @param {Function} callback - The callback.
	 */
	_withPreparedScene( callback ) {

		const hidden = [];
		this.scene.traverseVisible( ( object ) => this._preparedObjects.has( object ) === false && hidden.push( object ) );

		for ( const object of hidden ) object.visible = false;

		try {

			callback();

		} finally {

			for ( const object of hidden ) object.visible = true;

		}

	}

	/**
	 * Renders the shadow maps of copies of lights, see `copyLight()`, from the scene as it was when the
	 * bake was prepared. The light maps bake the direct light with them.
	 *
	 * @private
	 * @param {Array<Light>} shadowLights - The copies of the lights.
	 */
	_renderShadowMaps( shadowLights ) {

		shadowLights = shadowLights.filter( ( light ) => light.castShadow );

		if ( shadowLights.length === 0 ) return;

		const renderer = this.renderer;
		const material = new MeshLambertNodeMaterial();
		material.lightsNode = lights( shadowLights );

		const target = new RenderTarget( 1, 1 );
		const renderTarget = renderer.getRenderTarget();
		const overrideMaterial = this.scene.overrideMaterial;

		for ( const light of shadowLights ) light.shadow.needsUpdate = true;

		// a new camera, the shadow maps update once per camera and frame. Outlines, and objects that were
		// hidden while preparing, cast no shadows in the bake

		this.scene.overrideMaterial = material;
		renderer.setRenderTarget( target );
		this._withPreparedScene( () => renderer.render( this.scene, new PerspectiveCamera() ) );
		renderer.setRenderTarget( renderTarget );
		this.scene.overrideMaterial = overrideMaterial;

		target.dispose();
		material.dispose();

	}

}

/**
 * Copies a light in world space, with its own shadow map that only updates on demand. The renders of
 * the scene keep updating the shadow maps of its lights, with all its visible objects.
 *
 * @private
 * @param {Light} source - The light.
 * @return {Light} The copy.
 */
function copyLight( source ) {

	const light = source.clone( false );
	light.matrixAutoUpdate = false;
	light.matrix.copy( source.matrixWorld );
	light.matrixWorld.copy( source.matrixWorld );
	light.shadow.autoUpdate = false;

	if ( light.target !== undefined ) {

		light.target.matrixAutoUpdate = false;
		light.target.matrix.copy( source.target.matrixWorld );
		light.target.matrixWorld.copy( source.target.matrixWorld );

	}

	return light;

}

/**
 * Returns the meshes that look like the shells of inverted hull outlines: single-sided meshes turned
 * inside out, whose visible side faces other surfaces at a small distance. Rays from points on a mesh
 * along the normals of its visible side test whether three quarters of them hit another mesh within
 * half a percent of the size of the mesh. Rooms are turned inside out too, but their visible side
 * faces open space.
 *
 * @private
 * @param {Array<Mesh>} meshes - The meshes.
 * @return {Array<Mesh>} The outline shells.
 */
function findOutlineShells( meshes ) {

	const samples = 32;
	const raycaster = new Raycaster();
	const a = new Vector3(), b = new Vector3(), c = new Vector3(), normal = new Vector3(), center = new Vector3();
	const shells = [];

	for ( const mesh of meshes ) {

		if ( mesh.isSkinnedMesh || mesh.isBatchedMesh || mesh.isInstancedMesh ) continue;
		if ( [ mesh.material ].flat().some( ( material ) => material.side !== FrontSide ) ) continue;

		const geometry = mesh.geometry;
		const position = geometry.getAttribute( 'position' );
		const index = geometry.index;
		const triangles = Math.floor( ( index !== null ? index.count : position.count ) / 3 );

		if ( triangles === 0 ) continue;

		const vertex = ( i ) => index !== null ? index.getX( i ) : i;
		const mirrored = mesh.matrixWorld.determinant() < 0;

		// the signed volume around the center of the bounds is negative for closed meshes turned inside out

		if ( geometry.boundingBox === null ) geometry.computeBoundingBox();
		geometry.boundingBox.getCenter( center );

		let volume = 0;

		for ( let i = 0; i < triangles * 3; i += 3 ) {

			a.fromBufferAttribute( position, vertex( i ) ).sub( center );
			b.fromBufferAttribute( position, vertex( i + 1 ) ).sub( center );
			c.fromBufferAttribute( position, vertex( i + 2 ) ).sub( center );
			volume += a.dot( b.cross( c ) );

		}

		if ( ( mirrored ? - volume : volume ) >= 0 ) continue;

		raycaster.far = new Box3().setFromObject( mesh ).getSize( normal ).length() * 0.005;

		const others = meshes.filter( ( other ) => other !== mesh );
		let covered = 0, open = 0;

		for ( let s = 0; s < samples && covered < samples * 0.75 && open <= samples * 0.25; s ++ ) {

			const i = Math.floor( ( s + 0.5 ) * triangles / samples ) * 3;

			a.fromBufferAttribute( position, vertex( i ) ).applyMatrix4( mesh.matrixWorld );
			b.fromBufferAttribute( position, vertex( i + 1 ) ).applyMatrix4( mesh.matrixWorld );
			c.fromBufferAttribute( position, vertex( i + 2 ) ).applyMatrix4( mesh.matrixWorld );

			normal.subVectors( c, b ).cross( a.clone().sub( b ) ).normalize();

			if ( mirrored ) normal.negate();

			raycaster.set( a.add( b ).add( c ).divideScalar( 3 ), normal );

			if ( normal.lengthSq() > 0 && raycaster.intersectObjects( others, false ).length > 0 ) covered ++;
			else open ++;

		}

		if ( covered >= samples * 0.75 ) shells.push( mesh );

	}

	return shells;

}

/**
 * Moves the textures that use the `uv1` of meshes to `uv2`, so that they keep their UVs when the meshes
 * are unwrapped, e.g. the ambient occlusion maps of glTF files on `TEXCOORD_1`. Meshes that use these
 * textures without `uv1` get `uv` instead, which keeps their shaders valid.
 *
 * @private
 * @param {Array<Mesh>} meshes - The meshes.
 */
function preserveTextureUVs( meshes ) {

	const texturesOf = ( mesh ) => {

		const textures = [];

		for ( const material of [ mesh.material ].flat() ) {

			for ( const name in material ) {

				const value = material[ name ];

				if ( value !== null && value !== undefined && value.isTexture === true && value.channel === 1 && name !== 'lightMap' && name !== 'lightMapDirection' ) textures.push( value );

			}

		}

		return textures;

	};

	const moved = new Set();

	for ( const mesh of meshes ) {

		if ( mesh.geometry.hasAttribute( 'uv1' ) ) for ( const texture of texturesOf( mesh ) ) moved.add( texture );

	}

	if ( moved.size === 0 ) return;

	for ( const mesh of meshes ) {

		const geometry = mesh.geometry;

		if ( texturesOf( mesh ).some( ( texture ) => moved.has( texture ) ) === false ) continue;

		if ( geometry.hasAttribute( 'uv2' ) ) {

			console.warn( `THREE.LightBaker: The textures of mesh "${ mesh.name }" use uv1, which the light map replaces, and uv2 is taken.` );
			continue;

		}

		const uv = geometry.getAttribute( 'uv1' ) ?? geometry.getAttribute( 'uv' );

		if ( uv !== undefined ) geometry.setAttribute( 'uv2', uv );

	}

	for ( const texture of moved ) texture.channel = 2;

}

/**
 * Returns a large unlit sphere around the scene with the background texture, which the stochastic
 * radiosity captures as the sky, or `null` without a background texture. It looks the sky up by the
 * direction from its center, like the background.
 *
 * @private
 * @param {Scene} scene - The scene.
 * @return {?Mesh} The sky sphere.
 */
function createSkySphere( scene ) {

	const background = scene.background;

	if ( background === null || background.isTexture !== true ) return null;

	const cube = background.isCubeTexture === true;

	if ( cube === false && background.mapping !== EquirectangularReflectionMapping && background.mapping !== EquirectangularRefractionMapping ) return null;

	// the bounds of the visible meshes, which the radiosity collects

	const bounds = new Box3(), box = new Box3();

	scene.traverseVisible( ( object ) => {

		if ( object.isMesh !== true ) return;

		if ( object.isInstancedMesh ) {

			if ( object.boundingBox === null ) object.computeBoundingBox();
			box.copy( object.boundingBox );

		} else {

			if ( object.geometry.boundingBox === null ) object.geometry.computeBoundingBox();
			box.copy( object.geometry.boundingBox );

		}

		bounds.union( box.applyMatrix4( object.matrixWorld ) );

	} );

	const sphere = bounds.isEmpty() ? null : bounds.getBoundingSphere( new Sphere() );
	const center = sphere !== null ? sphere.center : new Vector3();
	const radius = sphere !== null ? Math.max( sphere.radius * 3, 1e-3 ) : 1;

	const rotation = new Matrix4().makeRotationFromEuler( scene.backgroundRotation ).transpose();
	const direction = uniform( rotation ).mul( positionWorld.sub( uniform( center ) ).normalize() ).xyz.normalize();

	const material = new MeshBasicNodeMaterial( { side: BackSide } );
	material.colorNode = ( cube ? cubeTexture( background, direction ) : texture( background, equirectUV( direction ) ) ).mul( scene.backgroundIntensity );

	const mesh = new Mesh( new SphereGeometry( radius, 64, 32 ), material );
	mesh.position.copy( center );
	mesh.updateMatrixWorld();

	return mesh;

}

/**
 * The average light direction of light probes, weighted by luminance and the cosine to the normal over
 * its hemisphere. The probes' L0 and L1 bands are matched by uniform light and light from one direction,
 * with the mean resultant length of their radiance as its share. The bands follow from the irradiance
 * along the axes at the point that `lightProbeGridIrradiance()` samples, half a probe spacing along the
 * normal.
 *
 * @private
 * @param {LightProbeGrid} probes - The light probes.
 * @param {Node<vec3>} position - The world-space position.
 * @param {Node<vec3>} normal - The world-space normal.
 * @return {Node<vec3>} The light direction, scaled by its directionality.
 */
function lightProbeGridDirection( probes, position, normal ) {

	const offset = uniform( probes.boundingBox.getSize( new Vector3() ).divide( probes.resolution ).multiplyScalar( 0.5 ) );
	const axes = [[ 1, 0, 0 ], [ - 1, 0, 0 ], [ 0, 1, 0 ], [ 0, - 1, 0 ], [ 0, 0, 1 ], [ 0, 0, - 1 ]];
	const [ px, nx, py, ny, pz, nz ] = axes.map( ( axis ) => luminance( lightProbeGridIrradiance( probes, position.add( normal.sub( vec3( ...axis ) ).mul( offset ) ), vec3( ...axis ) ) ) );

	// pi L0 and 4 pi / 3 L1

	const ambient = px.add( nx ).add( py ).add( ny ).add( pz ).add( nz ).div( 6 ).toVar();
	const gradient = vec3( px.sub( nx ), py.sub( ny ), pz.sub( nz ) ).toVar();

	// the irradiance of the uniform and the directional light, and their first moments over the hemisphere

	const share = gradient.length().div( ambient.mul( 4 ).max( 1e-10 ) ).min( 1 ).toVar();
	const dominant = gradient.div( gradient.length().max( 1e-10 ) ).toVar();
	const uniformLight = ambient.mul( share.oneMinus() );
	const directionalLight = ambient.mul( share ).mul( dot( dominant, normal ).max( 0 ) ).mul( 4 );

	return normal.mul( uniformLight.mul( 2 / 3 ) ).add( dominant.mul( directionalLight ) ).div( uniformLight.add( directionalLight ).max( 1e-10 ) );

}

/**
 * Waits for the next animation frame, or for the next task in hidden documents, which do not
 * animate.
 *
 * @private
 * @return {Promise} A promise that resolves at the next frame.
 */
function nextFrame() {

	return new Promise( ( resolve ) => {

		if ( document.hidden ) setTimeout( resolve, 0 );
		else requestAnimationFrame( resolve );

	} );

}

export { LightBaker };
