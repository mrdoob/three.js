import {
	BackSide,
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	Frustum,
	IndirectStorageBufferAttribute,
	Matrix4,
	Mesh,
	Object3D,
	StorageBufferAttribute,
	Vector2,
	Vector3,
	Vector4,
	warn,
	warnOnce
} from 'three/webgpu';

import {
	Fn,
	If,
	Loop,
	Break,
	array,
	atomicAdd,
	atomicAnd,
	atomicLoad,
	atomicOr,
	atomicStore,
	ceil,
	countLeadingZeros,
	float,
	floatBitsToUint,
	floor,
	instanceIndex,
	log2,
	max,
	min,
	mix,
	normalLocal,
	positionGeometry,
	positionPrevious,
	select,
	smoothstep,
	storage,
	transformNormalToView,
	uint,
	uniform,
	uniformArray,
	uintBitsToFloat,
	uvec2,
	uvec4,
	vec2,
	vec3,
	vec4,
	varyingProperty,
	vertexIndex
} from 'three/tsl';

import { ConcurrentBinaryTree } from '../gpgpu/ConcurrentBinaryTree.js';

const INVALID = 0xffffffff;
const WORKGROUP_SIZE = 64;
const MERGE_HYSTERESIS = 0.9;
const BACKFACE_MARGIN = 0.25;
const FRAGMENT_NORMAL_PIXELS = 2; // the footprint of per pixel normals from finite differences, 1 with a given gradient
const MAX_DEPTH = 31; // heap indices are 32-bit integers
const CAMERA_DRAW = 0; // the sets of indirect draws, each with one draw per patch size: the leaves visible to the camera,
const ALL_DRAW = 1; // all leaves of the camera subdivision,
const CAMERA_WIREFRAME_DRAW = 2; // both as wireframe lines,
const ALL_WIREFRAME_DRAW = 3;
const SHADOW_DRAW = 4; // and all leaves of the shadow subdivision
const DRAW_SETS = 5;
const MORPH_END = 1.3; // the split ratio of a parent at which its children stop morphing
const PATCH_MORPH_END = 1.6; // the size of a leaf, relative to where its patch size doubled, at which its patch stops morphing
const FULL_PATCH_MORPH_END = 1.16; // the same for the full patch, which ends before leaves morph, see _patchLevel()
const MAX_SHADOW_SCALE = 1e6; // the scale of shadow triangles at a shadow detail of 0, large enough that nothing splits
const LEVEL_SCALE = 4096; // patch levels are multiples of 1 / LEVEL_SCALE below 16, packed as 16 bit fixed point, see _patchLevel()
const POOL_STRIDE = 11; // the integers per block of the memory pool, see Subdivision
const POOL_HEAP = 0; // the heap index of the leaf
const POOL_NEIGHBORS = 1; // the blocks of its neighbors across the edges v0-v1 (the refinement edge), v1-v2 and v2-v0
const POOL_MORPH = 4; // its morph factor, see the build node
const POOL_COMMAND = 5; // what happens to it in this update
const POOL_SCRATCH = 6; // four integers passed between the passes of an update
const POOL_LIST = 10; // the block of the leaf of this index, see the build node
const SPLIT = 1; // commands: the leaf splits,
const MERGE = 2; // the leaf merges,
const MERGE_OWNER = 4; // the leaf applies the merge of its diamond,
const DEMAND_CHILDREN = 8; // the children of the split have to morph in, see _createDecideNode()
const DEMAND = 0x80000000; // a request to morph in, made by the split decision, see _demandDiamond()
const HELD = 0x40000000; // the request, held until the next split decision renews or drops it
const MORPH_FLAGS = 0xc0000000;

const _frustum = /*@__PURE__*/ new Frustum();
const _matrix = /*@__PURE__*/ new Matrix4();
const _inverse = /*@__PURE__*/ new Matrix4();
const _cameraPosition = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector2();
const _emptyGeometry = /*@__PURE__*/ new BufferGeometry();
const _mesh = /*@__PURE__*/ new Mesh( _emptyGeometry );
const _intersects = [];

/**
 * A mesh that is adaptively subdivided on the GPU every frame, so displacement can add real
 * geometric detail to coarse meshes without any per-frame geometry work on the CPU.
 *
 * The subdivision is longest edge bisection (LEB) following "Concurrent Binary Trees (with
 * application to longest edge bisection)" by Dupuy (HPG 2020) and "Concurrent Binary Trees for
 * Large-Scale Game Components" by Benyoub and Dupuy (HPG 2024):
 *
 * - Every halfedge of the source mesh becomes a root triangle ("bisector") spanned by the edge and
 *   the face centroid. Twin halfedges form a diamond across every mesh edge, so arbitrary triangle
 *   meshes can be bisected without T-junctions.
 * - The leaves live in a memory pool managed by a {@link ConcurrentBinaryTree}: each holds its heap
 *   index, from whose bits its vertices are decoded, and the blocks of its three neighbors. Splits
 *   and merges allocate and free blocks concurrently on the GPU, so the memory follows the number
 *   of leaves rather than the depth of the subdivision.
 * - Each frame, compute shaders split triangles that are larger on screen than the target and
 *   merge those that are smaller, alternating between split and merge frames. The size is measured
 *   by area, so the triangle density is the same for all source meshes. Coarser neighbors split
 *   first as needed, so the result is always crack free.
 * - The leaves are written to lists, one per patch size, and drawn with one indirect draw per size
 *   that instances a pre-tessellated triangle patch per leaf. Leaves cannot get coarser than the
 *   root triangles, so root triangles that are small on screen draw a coarser patch, down to a
 *   single triangle. Edges between leaves of different patch sizes are drawn at the finer size by
 *   both, so they stay crack-free.
 * - Leaves outside the view frustum or facing away from the camera are culled and not refined.
 * - The patch is itself bisected, so the patches of two children are the patch of their parent with
 *   every triangle bisected once. New vertices morph in from the midpoints of the edges they split,
 *   so splits, merges and changes of the patch size do not pop (geomorphing).
 *
 * All barycentric coordinates are dyadic rationals and evaluated exactly in 32-bit floats, and
 * vertices on shared mesh edges are interpolated in a canonical order, so displaced vertices
 * shared by neighboring triangles are bit-identical. Displacement must therefore only depend on
 * the inputs passed to the `displacement` callback. Triplanar mapping is a good fit: it does not
 * depend on UVs, so there are no texture seams that would tear the surface apart. Displacement is
 * applied along the source normals averaged per position, so hard edges are rounded off over the
 * source triangles next to them.
 *
 * Bisection keeps the shape of the source triangles, so the source mesh should be made of well
 * shaped triangles. Long, thin triangles, like the bevel strips of a rounded box, are refined by
 * their area, so their long edges sample the displacement coarsely. The source mesh also sets the
 * least number of triangles drawn: one per root triangle, three per source triangle.
 *
 * By default, the shading normals are those of the displaced triangles, with a normal map computed
 * from the displacement blended in for the detail the triangles are too coarse to show, so the
 * normal map fades out as the subdivision gets finer. Raycasting uses the source geometry without
 * displacement.
 *
 * Call {@link AdaptiveSubdivisionMesh#update} every frame, before rendering, with the camera that
 * drives the level of detail. That camera only draws the leaves it can see. Shadow passes draw a
 * separate subdivision, created when the mesh is first drawn by a shadow pass, which subdivides the
 * faces the camera cannot see as well and scales the level of detail with
 * {@link AdaptiveSubdivisionMesh#shadowDetail}. Other cameras, like cube cameras or reflections,
 * draw all leaves of the camera subdivision. The draw is selected in `onBeforeRender()` and
 * `onAfterRender()`, so these must not be replaced.
 *
 * ```js
 * const mesh = new AdaptiveSubdivisionMesh( geometry, new THREE.MeshStandardNodeMaterial(), {
 * 	displacement: ( { position, normal, footprint } ) => triplanarHeight( position, normal, footprint ).mul( 0.1 ),
 * 	maxDisplacement: 0.1
 * } );
 *
 * // animation loop
 * mesh.update( renderer, camera );
 * renderer.render( scene, camera );
 * ```
 *
 * Requires the WebGPU backend of {@link WebGPURenderer}.
 *
 * @augments Mesh
 * @three_import import { AdaptiveSubdivisionMesh } from 'three/addons/objects/AdaptiveSubdivisionMesh.js';
 */
class AdaptiveSubdivisionMesh extends Mesh {

	/**
	 * Constructs a new adaptive subdivision mesh.
	 *
	 * @param {BufferGeometry} geometry - The source triangle mesh. Vertices with identical positions are welded.
	 * @param {NodeMaterial} material - The node material. Its `positionNode` (and `normalNode` for fragment normals) is overwritten, so it should not be shared with other meshes.
	 * @param {Object} [options={}] - The options.
	 * @param {?Function} [options.displacement=null] - A callback returning a `Node<float>` with the displacement along the normal in local space. It receives the local space `position`, the normalized `normal`, the `uv` and the `footprint`: the approximate local space size of a rendered triangle at the given position, useful to pick a texture mip level.
	 * @param {?Function} [options.displacementGradient=null] - An optional callback returning a `Node<vec3>` with the gradient of the displacement in local space, used for the normals instead of finite differences of `displacement`, which take three evaluations per gradient. It receives the same inputs as `displacement`, only the component of the gradient along the surface is used. Displacement maps can be baked once into a texture holding the height and its gradient, see the example.
	 * @param {?Function} [options.displacementError=null] - An optional callback returning a `Node<float>` with how far triangles of a given size deviate from the displaced surface, in local space: the root mean square difference between the displacement and its linear interpolation over the triangles of a leaf. It receives the local space `position`, the normalized `normal` and the `uv` at the center of the leaf, the local space `size` of its triangles (see {@link AdaptiveSubdivisionMesh#targetEdgePixels}) and the `footprint` the displacement is sampled with. Leaves larger than the target size are then only split while they deviate more than {@link AdaptiveSubdivisionMesh#maxErrorPixels}, which saves triangles where the displacement is smooth. It runs in compute shaders, so textures must be sampled with an explicit level.
	 * @param {number} [options.maxDisplacement=0] - An upper bound for the absolute displacement, used for culling.
	 * @param {?number} [options.maxDepth=null] - The maximum number of bisections of a root triangle, every two levels halve the edge length. Defaults to as many as 32-bit heap indices allow, `31 - ceil( log2( rootCount ) )`.
	 * @param {number} [options.patchSize=8] - The number of segments per edge of the pre-tessellated patch drawn for each leaf. Must be a power of two.
	 * @param {number} [options.maxLeafCount=131072] - The maximum number of leaves, raised to twice the number of halfedges if lower. Splits stop when it is reached. Sizes the memory pool and the draw buffers, which take `76 + 4 * ( log2( patchSize ) + 1 )` bytes per leaf, 92 with the default patch size. Meshes casting shadows take as much again per leaf with a shadowDetail above 0, else per halfedge.
	 * @param {number} [options.targetEdgePixels=8] - The target size of rendered triangles in pixels, see {@link AdaptiveSubdivisionMesh#targetEdgePixels}.
	 * @param {number} [options.shadowDetail=1] - The level of detail of shadow passes relative to the camera, see {@link AdaptiveSubdivisionMesh#shadowDetail}.
	 * @param {('blend'|'fragment'|'vertex'|'source')} [options.normals='blend'] - How the normals of the displaced surface are computed. `'blend'`: the normals of the displaced triangles, computed per vertex, plus a normal map of the detail the triangles are too coarse to show, computed per pixel. The shading follows the triangles where the subdivision is as fine as the pixels, and the normal map takes over where it is coarser. Evaluates the displacement four times per vertex and six times per pixel, or once per vertex and the gradient once per vertex and twice per pixel with `displacementGradient`. `'fragment'`: per pixel from the displacement alone, independent of the tessellation. `'vertex'`: per vertex, without detail below the triangle size. `'source'`: the interpolated normals of the source mesh.
	 */
	constructor( geometry, material, options = {} ) {

		const {
			displacement = null,
			displacementGradient = null,
			displacementError = null,
			maxDisplacement = 0,
			maxDepth = null,
			patchSize = 8,
			maxLeafCount = 131072,
			targetEdgePixels = 8,
			shadowDetail = 1,
			normals = 'blend'
		} = options;

		if ( Number.isInteger( Math.log2( patchSize ) ) === false ) {

			throw new Error( 'AdaptiveSubdivisionMesh: patchSize must be a power of two.' );

		}

		const patch = createPatchGeometry( patchSize );
		const patchGeometry = patch.geometry;

		super( patchGeometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isAdaptiveSubdivisionMesh = true;

		this.type = 'AdaptiveSubdivisionMesh';

		/**
		 * The target size of rendered triangles in pixels of the drawing buffer, which include the
		 * pixel ratio of the renderer: the edge length of an equilateral triangle of the same area, so
		 * the triangle density does not depend on the shape of the source triangles. Leaves are split
		 * until their triangles are at most this large, and meshes whose leaves all are smaller draw
		 * coarser patches.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.targetEdgePixels = targetEdgePixels;

		/**
		 * The level of detail of shadow passes relative to the camera, in the range `[0, 1]`. Shadow
		 * passes draw a separate subdivision whose triangle edges are `1 / shadowDetail` times
		 * longer than those drawn for the camera, down to the source triangles without any
		 * subdivision at `0`. The displacement is sampled with a footprint scaled the same way, up to the
		 * longest source edge, so coarse shadow casters follow the mean displaced surface around them.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.shadowDetail = shadowDetail;

		/**
		 * The largest deviation of the drawn triangles from the displaced surface in pixels, with a
		 * `displacementError` callback: leaves larger than the target size are only split while they
		 * deviate more.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.maxErrorPixels = 0.5;

		/**
		 * Whether splits, merges and changes of the patch size morph, so they do not pop. The vertices of
		 * a split move from the surface of the parent to their displaced positions while its split ratio
		 * (its size, or its deviation with `maxErrorPixels`) grows to 1.3 times the split threshold, and
		 * back before a merge, and the patch morphs into the next smaller one likewise. Morphs take at
		 * least {@link AdaptiveSubdivisionMesh#morphTime}, and leaves only split once they morphed in and
		 * merge once they morphed out, so transitions stay smooth at any camera speed, refining a level
		 * per morph. Morphing vertices evaluate the displacement and its gradient up to six more times.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.morphing = true;

		/**
		 * The least time in seconds a morph takes. Morphs follow the camera, and only take longer when it moves
		 * faster than that, so they stay smooth whatever the speed. `0` lets them follow the camera at any speed,
		 * which pops when it moves fast.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.morphTime = 0;

		/**
		 * Whether leaves outside of the view frustum of the camera are culled and coarsened.
		 * Other cameras and shadow passes still draw them, coarsened.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.frustumCulling = true;

		/**
		 * Whether leaves facing away from the camera are culled and coarsened. Only applies to
		 * single-sided materials, for `BackSide` the leaves facing the camera are culled. Other
		 * cameras still draw them, and shadow passes subdivide them as usual.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.backfaceCulling = true;

		/**
		 * The source geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.sourceGeometry = geometry;

		/**
		 * The upper bound of the absolute displacement.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.maxDisplacement = maxDisplacement;

		/**
		 * The number of segments per edge of the patch drawn for each leaf.
		 *
		 * @type {number}
		 */
		this.patchSize = patchSize;

		this._options = { ...options };

		// source mesh

		const mesh = buildHalfedgeMesh( geometry );

		const rootCount = mesh.faceCount * 3;
		const rootDepth = Math.max( Math.ceil( Math.log2( rootCount ) ), 1 );
		const levels = Math.min( maxDepth !== null ? maxDepth : MAX_DEPTH, MAX_DEPTH - rootDepth );

		if ( maxDepth !== null && maxDepth > levels ) {

			warn( `AdaptiveSubdivisionMesh: maxDepth reduced to ${ levels } as the source mesh has ${ rootCount } halfedges.` );

		}

		/**
		 * The number of root triangles (halfedges of the source mesh).
		 *
		 * @type {number}
		 */
		this.rootCount = rootCount;

		/**
		 * The maximum number of leaves, at least twice the number of root triangles.
		 *
		 * @type {number}
		 */
		this.maxLeafCount = Math.max( maxLeafCount, rootCount * 2 );

		/**
		 * The depth of the root triangles in the tree.
		 *
		 * @type {number}
		 */
		this.rootDepth = rootDepth;

		// the root triangles, in the first blocks of the memory pool of every subdivision: each neighbors the triangle
		// of its twin halfedge across its refinement edge, the mesh edge, and the triangles of the next and previous
		// halfedges of its face across its other edges

		const rootPool = new Uint32Array( rootCount * POOL_STRIDE );

		for ( let root = 0; root < rootCount; root ++ ) {

			const face = Math.floor( root / 3 ), corner = root % 3, offset = root * POOL_STRIDE;

			rootPool[ offset + POOL_HEAP ] = 2 ** rootDepth + root;
			rootPool[ offset + POOL_NEIGHBORS ] = mesh.twins[ root ];
			rootPool[ offset + POOL_NEIGHBORS + 1 ] = face * 3 + ( corner + 1 ) % 3;
			rootPool[ offset + POOL_NEIGHBORS + 2 ] = face * 3 + ( corner + 2 ) % 3;
			rootPool[ offset + POOL_LIST ] = root;

		}

		this._rootPool = rootPool;
		this._maxDepth = rootDepth + levels;
		this._patchLevels = patch.levels;
		this._patchVertexCount = patch.vertexCount;
		this._bucketCount = patch.levels.length;

		// uniforms

		this._cameraPosition = uniform( new Vector3() );
		this._projectionScale = uniform( 1 );
		this._orthographic = uniform( 0 );
		this._edgePixels = uniform( targetEdgePixels );
		this._cameraDirection = uniform( new Vector3() );
		this._frustumPlanes = uniformArray( [ new Vector4(), new Vector4(), new Vector4(), new Vector4(), new Vector4(), new Vector4() ], 'vec4' );
		this._morphing = uniform( 1 );
		this._shadowFootprintScale = uniform( 1 );

		// the sizes and bounds of the mesh are uniforms too, so meshes of the same kind share their shaders, which then
		// compile once, see compileAsync()

		this._rootCount = uniform( rootCount, 'uint' );
		this._maxDisplacement = uniform( maxDisplacement );

		// whether the current render object is drawn by a shadow pass with the shadow subdivision, a uniform per render object

		this._shadowPass = uniform( 0 ).onObjectUpdate( ( { material } ) => material.isShadowPassMaterial === true && this._shadowReady() ? 1 : 0 );

		// buffers: the welded vertex indices per face, followed by the original vertex indices for UVs, and the position
		// and normal per welded vertex, followed by the UV per original vertex, which saves storage buffer bindings as
		// shaders are limited to eight

		const uvCount = mesh.uvs !== null ? mesh.uvs.length / 2 : 0;
		const faceData = new Uint32Array( mesh.faceCount * ( uvCount > 0 ? 2 : 1 ) * 4 );
		const vertexData = new Float32Array( ( mesh.vertexCount * 2 + uvCount ) * 4 );

		faceData.set( mesh.faces );
		vertexData.set( mesh.vertices );

		if ( uvCount > 0 ) {

			faceData.set( mesh.corners, mesh.faceCount * 4 );

			for ( let i = 0; i < uvCount; i ++ ) {

				vertexData[ ( mesh.vertexCount * 2 + i ) * 4 ] = mesh.uvs[ 2 * i ];
				vertexData[ ( mesh.vertexCount * 2 + i ) * 4 + 1 ] = mesh.uvs[ 2 * i + 1 ];

			}

		}

		this._faces = storage( new StorageBufferAttribute( faceData, 4 ), 'uvec4' ).toReadOnly().setName( 'subdivisionFaces' );
		this._vertices = storage( new StorageBufferAttribute( vertexData, 4 ), 'vec4' ).toReadOnly().setName( 'subdivisionVertices' );

		this._faceCount = uniform( mesh.faceCount, 'uint' );

		// how the vertices of the patch morph, see createPatchGeometry()

		this._patchCodes = storage( new StorageBufferAttribute( patch.codes, 1 ), 'uint' ).toReadOnly().setName( 'subdivisionPatchCodes' );
		this._uvOffset = uvCount > 0 ? uniform( mesh.vertexCount * 2, 'uint' ) : null;

		// splits reserve the blocks they allocate, so the pool holds exactly the budget

		const capacity = this.maxLeafCount;

		this._capacity = capacity;

		// the draw and slot buffers, for the camera subdivision until a shadow subdivision is created, see _allocateDraws()

		this._draws = null;
		this._drawsRead = null;
		this._slots = null;
		this._slotsRead = null;
		this._shadowCapacity = uniform( 0, 'uint' );

		this._allocateDraws( 0 );

		// indirect draws, one per patch size for each set, see CAMERA_DRAW, followed by the number of leaves hidden from
		// the camera per patch size. the patches of the sizes are drawn from their own copy of the patch vertices, so the
		// vertex shader finds the size from the vertex index

		const drawArguments = [];

		for ( let set = 0; set < DRAW_SETS; set ++ ) {

			const scale = set === CAMERA_WIREFRAME_DRAW || set === ALL_WIREFRAME_DRAW ? 2 : 1;

			patch.levels.forEach( ( { count, start }, bucket ) => drawArguments.push( count * scale, 0, start * scale, bucket * patch.vertexCount, 0 ) );

		}

		this._counterBase = drawArguments.length;

		for ( let i = 0; i < this._bucketCount; i ++ ) drawArguments.push( 0 );

		this._drawOffsets = [];

		for ( let set = 0; set < DRAW_SETS; set ++ ) {

			this._drawOffsets.push( patch.levels.map( ( level, bucket ) => this._drawArgument( set, bucket ) * 4 ) ); // in bytes

		}

		this._drawAttribute = new IndirectStorageBufferAttribute( new Uint32Array( drawArguments ), 1 );
		this._drawArguments = storage( this._drawAttribute, 'uint' ).toAtomic().setName( 'subdivisionDrawArguments' );
		this._drawArgumentsRead = storage( this._drawAttribute, 'uint' ).toReadOnly().setName( 'subdivisionDrawArgumentsRead' );

		patchGeometry.setIndirect( this._drawAttribute, this._drawOffsets[ CAMERA_DRAW ] );

		// bounds of the displaced surface, for culling

		if ( geometry.boundingBox === null ) geometry.computeBoundingBox();
		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		patchGeometry.boundingBox = geometry.boundingBox.clone().expandByScalar( maxDisplacement );
		patchGeometry.boundingSphere = geometry.boundingSphere.clone();
		patchGeometry.boundingSphere.radius += maxDisplacement;

		this._displacement = displacement;
		this._displacementGradient = displacementGradient;
		this._displacementError = displacementError;

		// the longest edge of the source mesh, which bounds the footprint of the coarsest shadow triangles

		let maxEdge = 0;

		for ( let f = 0; f < mesh.faceCount; f ++ ) {

			for ( let k = 0; k < 3; k ++ ) {

				const a = mesh.faces[ 4 * f + k ] * 8, b = mesh.faces[ 4 * f + ( k + 1 ) % 3 ] * 8;

				maxEdge = Math.max( maxEdge, Math.hypot( mesh.vertices[ a ] - mesh.vertices[ b ], mesh.vertices[ a + 1 ] - mesh.vertices[ b + 1 ], mesh.vertices[ a + 2 ] - mesh.vertices[ b + 2 ] ) );

			}

		}

		this._maxEdge = uniform( maxEdge );

		// varyings

		/**
		 * The interpolated local space position of the source surface, before displacement.
		 *
		 * @type {Node<vec3>}
		 */
		this.basePositionNode = varyingProperty( 'vec3', 'vSubdivisionBasePosition' );

		/**
		 * The interpolated, normalized local space normal of the source surface.
		 *
		 * @type {Node<vec3>}
		 */
		this.baseNormalNode = varyingProperty( 'vec3', 'vSubdivisionBaseNormal' );

		/**
		 * The interpolated texture coordinates of the source surface.
		 *
		 * @type {Node<vec2>}
		 */
		this.uvNode = varyingProperty( 'vec2', 'vSubdivisionUV' );

		/**
		 * The displacement returned by the `displacement` callback.
		 *
		 * @type {Node<float>}
		 */
		this.displacementNode = varyingProperty( 'float', 'vSubdivisionDisplacement' );

		/**
		 * The barycentric coordinates within the rendered triangle, e.g. for wireframes.
		 *
		 * @type {Node<vec3>}
		 */
		this.triangleBarycentricNode = varyingProperty( 'vec3', 'vSubdivisionTriangleBarycentric' );

		/**
		 * The barycentric coordinates within the subdivision leaf, i.e. the patch.
		 *
		 * @type {Node<vec3>}
		 */
		this.leafBarycentricNode = varyingProperty( 'vec3', 'vSubdivisionLeafBarycentric' );

		/**
		 * The subdivision depth of the leaf, relative to the root triangles.
		 *
		 * @type {Node<float>}
		 */
		this.depthNode = varyingProperty( 'float', 'vSubdivisionDepth' );

		this._triangleSizeNode = varyingProperty( 'float', 'vSubdivisionTriangleSize' );
		this._triangleGradientNode = varyingProperty( 'vec3', 'vSubdivisionTriangleGradient' );

		material.positionNode = this._createPositionNode( normals );

		if ( ( normals === 'blend' || normals === 'fragment' ) && displacement !== null ) {

			material.normalNode = this._createNormalNode( normals === 'blend' );

		}

		// subdivisions: one for the camera, and one for shadows once the mesh is drawn by a shadow pass

		this._subdivision = this._createSubdivision( false );
		this._shadowSubdivision = null;
		this._shadowRequested = false;

		/**
		 * The concurrent binary tree managing the memory pool of the subdivision of the camera.
		 *
		 * @type {ConcurrentBinaryTree}
		 */
		this.tree = this._subdivision.tree;

		this._camera = null;
		this._indirectOffsets = [];

	}

	/**
	 * Compiles the compute pipelines of the subdivision, and of the shadow subdivision if the mesh casts
	 * shadows, without blocking: the browser compiles them in parallel, instead of one after the other
	 * when they are first used, which can take seconds. Updates skip a subdivision while its pipelines
	 * are compiled, so await the returned promise before the first update, together with
	 * `renderer.compileAsync()` for the materials, to draw the mesh from the first frame.
	 *
	 * Meshes of the same kind have the same shaders: the same options, source geometries with or without
	 * UVs alike and root counts up to the same power of two, and displacement callbacks building the same
	 * nodes, with the numbers that differ between the meshes in uniforms. As browsers may compile a shader
	 * again for every pipeline requested while it compiles, compile such meshes after the first of them,
	 * which finds its pipelines compiled.
	 *
	 * @async
	 * @param {Renderer} renderer - The renderer.
	 * @return {Promise} A promise that resolves when the pipelines are compiled.
	 */
	async compileAsync( renderer ) {

		await renderer.init();

		if ( renderer.backend.isWebGPUBackend !== true ) return;

		const subdivisions = [ this._subdivision ];

		if ( this.castShadow === true && renderer.shadowMap.enabled === true ) {

			// the shadow subdivision is created ahead of the first shadow pass, and updated by the first update

			this._prepareShadowSubdivision();
			this._shadowRequested = true;

			subdivisions.push( this._shadowSubdivision );

		}

		await Promise.all( subdivisions.map( ( subdivision ) => {

			if ( subdivision.initialized === false && subdivision.compiling === null ) {

				const nodes = [ ...subdivision.splitNodes, ...subdivision.mergeNodes, ...subdivision.rebuildNodes ];

				subdivision.compiling = renderer.compileComputeAsync( nodes ).finally( () => subdivision.compiling = null );

			}

			return subdivision.compiling;

		} ) );

	}

	/**
	 * Updates the subdivision for the given camera: one split or merge step, followed by a rebuild
	 * of the list of visible leaves, and the same for the shadow subdivision if the mesh was drawn
	 * by a shadow pass since the last update. Call this once per frame before rendering. The first
	 * update of a subdivision refines until it converges. Subdivisions whose pipelines are being
	 * compiled by {@link AdaptiveSubdivisionMesh#compileAsync} are not updated.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Camera} camera - The camera driving the level of detail and culling.
	 */
	update( renderer, camera ) {

		if ( renderer.backend.isWebGPUBackend !== true ) {

			warnOnce( 'AdaptiveSubdivisionMesh: Requires the WebGPU backend of WebGPURenderer.' );

			this.geometry.setDrawRange( 0, 0 );

			return;

		}

		// the renderer updates the matrices when rendering, which is too late for the level of detail

		this.updateWorldMatrix( true, false );
		camera.updateWorldMatrix( true, false );

		const xr = renderer.xr;

		if ( xr.enabled === true && xr.isPresenting === true ) camera = xr.getCamera();

		this._camera = camera;

		// frustum and camera in local space

		_matrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ).multiply( this.matrixWorld );
		_frustum.setFromProjectionMatrix( _matrix, camera.coordinateSystem, camera.reversedDepth );

		for ( let i = 0; i < 6; i ++ ) {

			const plane = _frustum.planes[ i ];

			this._frustumPlanes.array[ i ].set( plane.normal.x, plane.normal.y, plane.normal.z, plane.constant );

		}

		_inverse.copy( this.matrixWorld ).invert();
		_cameraPosition.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _inverse );

		this._cameraPosition.value.copy( _cameraPosition );
		this._cameraDirection.value.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld ).transformDirection( _inverse );

		// pixels of the drawing buffer, so the level of detail follows the pixel ratio

		renderer.getDrawingBufferSize( _size );

		this._projectionScale.value = 0.5 * _size.y * camera.projectionMatrix.elements[ 5 ];
		this._orthographic.value = camera.isOrthographicCamera ? 1 : 0;
		this._edgePixels.value = this.targetEdgePixels;
		this._morphing.value = this.morphing ? 1 : 0;

		const time = performance.now() / 1000;

		// the sub-cameras of array cameras can look in different directions, so there is no culling

		const culling = camera.isArrayCamera !== true;
		const frustumCulling = culling && this.frustumCulling ? 1 : 0;
		const side = this.material.side;

		const subdivision = this._subdivision;

		subdivision.splitThreshold.value = this.targetEdgePixels * this.patchSize;
		subdivision.splitError.value = this.maxErrorPixels;
		subdivision.targetPixels.value = this.targetEdgePixels;
		subdivision.patchSize.value = this.patchSize;
		subdivision.patchLevel.value = Math.log2( this.patchSize );
		subdivision.frustumCulling.value = frustumCulling;

		subdivision.facing.value = culling && this.backfaceCulling && side !== DoubleSide ? ( side === BackSide ? - 1 : 1 ) : 0;

		// the shadow subdivision, with triangles 1 / shadowDetail times larger: leaves of the same size drawn with a
		// smaller patch, then larger leaves. back faces cast shadows, so they are not culled. at a shadow detail of 0
		// nothing splits, so it only needs the root triangles. it is created before the camera subdivision is updated,
		// as it resizes the draw buffer the update writes

		const detail = Math.min( Math.max( this.shadowDetail, 0 ), 1 );

		if ( this._shadowRequested === true ) this._prepareShadowSubdivision();

		if ( subdivision.compiling === null ) this._updateSubdivision( renderer, subdivision, time );

		if ( this._shadowRequested === true && this._shadowSubdivision.compiling === null ) {

			const scale = Math.min( 1 / detail, MAX_SHADOW_SCALE );
			const levels = this._patchLevels;

			let level = 0;

			while ( level < levels.length - 1 && levels[ level ].size > this.patchSize * detail ) level ++;

			const shadowSubdivision = this._shadowSubdivision;

			shadowSubdivision.splitThreshold.value = this.targetEdgePixels * levels[ level ].size * scale;
			shadowSubdivision.splitError.value = this.maxErrorPixels * scale;
			shadowSubdivision.targetPixels.value = this.targetEdgePixels * scale;
			shadowSubdivision.patchSize.value = levels[ level ].size;
			shadowSubdivision.patchLevel.value = Math.log2( levels[ level ].size );
			shadowSubdivision.frustumCulling.value = frustumCulling;

			this._shadowFootprintScale.value = scale;

			this._updateSubdivision( renderer, shadowSubdivision, time );

			this._shadowRequested = false;

		}

	}

	/**
	 * Selects the indirect draw: the camera passed to {@link AdaptiveSubdivisionMesh#update} draws
	 * the leaves it can see, shadow passes draw the shadow subdivision and all other cameras draw all
	 * leaves. Wireframe materials draw lines.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera rendering the mesh.
	 * @param {BufferGeometry} geometry - The geometry of the mesh.
	 * @param {Material} material - The material of the mesh.
	 */
	onBeforeRender( renderer, scene, camera, geometry, material ) {

		// shadow passes render with an override material

		const drawMaterial = scene.overrideMaterial !== null && material.allowOverride === true ? scene.overrideMaterial : material;

		let set = ( drawMaterial.wireframe === true ? CAMERA_WIREFRAME_DRAW : CAMERA_DRAW ) + ( camera === this._camera ? 0 : 1 );

		if ( drawMaterial.isShadowPassMaterial === true ) {

			// shadow passes draw all leaves of the camera subdivision until an update built the shadow subdivision

			this._shadowRequested = true;

			set = this._shadowReady() ? SHADOW_DRAW : ALL_DRAW;

		}

		// shadow maps can be rendered while this mesh is rendered, before it is drawn, so the offsets are
		// restored afterwards

		this._indirectOffsets.push( geometry.indirectOffset );

		geometry.indirectOffset = this._drawOffsets[ set ];

	}

	/**
	 * Restores the indirect draw of an enclosing render.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera rendering the mesh.
	 * @param {BufferGeometry} geometry - The geometry of the mesh.
	 */
	onAfterRender( renderer, scene, camera, geometry ) {

		geometry.indirectOffset = this._indirectOffsets.pop();

	}

	/**
	 * Computes intersection points between a casted ray and the source geometry, without
	 * displacement.
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		_mesh.geometry = this.sourceGeometry;
		_mesh.material = this.material;
		_mesh.matrixWorld.copy( this.matrixWorld );

		_mesh.raycast( raycaster, _intersects );

		for ( const intersect of _intersects ) {

			intersect.object = this;
			intersects.push( intersect );

		}

		_intersects.length = 0;

		_mesh.geometry = _emptyGeometry;
		_mesh.material = null;

	}

	/**
	 * Reads back statistics of the subdivisions. Intended for debugging, as it waits for the GPU.
	 *
	 * @async
	 * @param {Renderer} renderer - The renderer.
	 * @return {Promise<{leafCount: number, visibleLeafCount: number, triangleCount: number, shadowLeafCount: number, shadowTriangleCount: number, memory: number}>} The leaf count, the visible leaf count and the number of triangles drawn for the camera, the leaf count and the number of triangles drawn by each shadow pass, and the size of the GPU buffers in bytes.
	 */
	async getInfo( renderer ) {

		const info = { leafCount: 0, visibleLeafCount: 0, triangleCount: 0, shadowLeafCount: 0, shadowTriangleCount: 0, memory: 0 };

		const attributes = [ ...this._getStorageAttributes(), this._drawAttribute, ...Object.values( this.geometry.attributes ), this.geometry.index ];

		for ( const subdivision of [ this._subdivision, this._shadowSubdivision ] ) {

			if ( subdivision === null ) continue;

			const { tree } = subdivision;

			attributes.push( tree.bitfieldAttribute, tree.heapAttribute, subdivision.poolAttribute, subdivision.statsAttribute );

		}

		for ( const attribute of attributes ) info.memory += attribute.array.byteLength;

		if ( this._subdivision.initialized === false ) return info;

		const stats = new Uint32Array( await renderer.getArrayBufferAsync( this._subdivision.statsAttribute ) );
		const draw = new Uint32Array( await renderer.getArrayBufferAsync( this._drawAttribute ) );

		const shadow = this._shadowSubdivision !== null && this._shadowSubdivision.initialized === true;

		info.leafCount = stats[ 0 ];

		for ( let bucket = 0; bucket < this._bucketCount; bucket ++ ) {

			const camera = this._drawArgument( CAMERA_DRAW, bucket );

			info.visibleLeafCount += draw[ camera + 1 ];
			info.triangleCount += draw[ camera + 1 ] * draw[ camera ] / 3;

			if ( shadow ) {

				const shadowDraw = this._drawArgument( SHADOW_DRAW, bucket );

				info.shadowLeafCount += draw[ shadowDraw + 1 ];
				info.shadowTriangleCount += draw[ shadowDraw + 1 ] * draw[ shadowDraw ] / 3;

			}

		}

		return info;

	}

	/**
	 * Copies the properties of the given mesh to this instance. The subdivision itself is set up by
	 * the constructor from the source geometry, so the geometry and material are not copied.
	 *
	 * @param {AdaptiveSubdivisionMesh} source - The mesh to copy.
	 * @param {boolean} [recursive=true] - Whether to copy the children as well.
	 * @return {AdaptiveSubdivisionMesh} A reference to this instance.
	 */
	copy( source, recursive ) {

		Object3D.prototype.copy.call( this, source, recursive );

		this.targetEdgePixels = source.targetEdgePixels;
		this.shadowDetail = source.shadowDetail;
		this.maxErrorPixels = source.maxErrorPixels;
		this.morphing = source.morphing;
		this.morphTime = source.morphTime;
		this.frustumCulling = source.frustumCulling;
		this.backfaceCulling = source.backfaceCulling;

		return this;

	}

	/**
	 * Returns a new mesh with the same source geometry, options and properties, and a clone of the
	 * material, as the material is bound to the mesh.
	 *
	 * @param {boolean} [recursive=true] - Whether to clone the children as well.
	 * @return {AdaptiveSubdivisionMesh} The cloned mesh.
	 */
	clone( recursive ) {

		return new this.constructor( this.sourceGeometry, this.material.clone(), this._options ).copy( this, recursive );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this method whenever
	 * this instance is no longer used in your app.
	 */
	dispose() {

		this._subdivision.dispose();

		if ( this._shadowSubdivision !== null ) this._shadowSubdivision.dispose();

		for ( const attribute of this._getStorageAttributes() ) attribute.dispose();

		this.geometry.dispose();
		this._drawAttribute.dispose();

	}

	/**
	 * Creates the shadow subdivision for the current shadow detail, one that does not split at a detail
	 * of 0, replacing one of the other kind unless its pipelines are being compiled.
	 *
	 * @private
	 */
	_prepareShadowSubdivision() {

		const minimal = this.shadowDetail <= 0;
		const shadowSubdivision = this._shadowSubdivision;

		if ( shadowSubdivision !== null && ( shadowSubdivision.minimal === minimal || shadowSubdivision.compiling !== null ) ) return;

		if ( shadowSubdivision !== null ) shadowSubdivision.dispose();

		this._shadowSubdivision = this._createSubdivision( true, minimal );

	}

	/**
	 * Returns whether shadow passes draw the shadow subdivision: once an update built it.
	 *
	 * @private
	 * @return {boolean} Whether the shadow subdivision is drawn.
	 */
	_shadowReady() {

		return this._shadowSubdivision !== null && this._shadowSubdivision.initialized === true;

	}

	/**
	 * Creates a subdivision with its compute nodes.
	 *
	 * @private
	 * @param {boolean} shadow - Whether this is the shadow subdivision.
	 * @param {boolean} [minimal=false] - Whether the subdivision does not split, so its pool only holds the root triangles.
	 * @return {Subdivision} The subdivision.
	 */
	_createSubdivision( shadow, minimal = false ) {

		const capacity = minimal ? this.rootCount : this._capacity;

		if ( shadow && capacity !== this._shadowCapacity.value ) this._allocateDraws( capacity );

		const subdivision = new Subdivision( capacity, minimal ? this.rootDepth : this._maxDepth, this._rootPool, this.rootCount );

		subdivision.minimal = minimal;
		subdivision.shadow = shadow;

		if ( minimal === false ) {

			subdivision.splitNodes = [ this._createDecideNode( subdivision ), this._createPrepareSplitNode( subdivision ), this._createCommitSplitNode( subdivision ) ];
			subdivision.mergeNodes = [ this._createMergeDecideNode( subdivision ), this._createPrepareMergeNode( subdivision ), this._createCommitMergeNode( subdivision ) ];

		}

		subdivision.rebuildNodes = [ ...subdivision.tree.reduceNodes, this._createPrepareNode( subdivision, shadow ), this._createLevelsNode( subdivision, shadow ), this._createBuildNode( subdivision, shadow ) ];

		if ( shadow === false ) subdivision.rebuildNodes.push( this._createFinishNode() );

		return subdivision;

	}

	/**
	 * Allocates the draw and slot buffers for the camera subdivision and a shadow subdivision with the
	 * given capacity, replacing the previous buffers. The draw buffer holds two uvec4 per leaf, at its
	 * index in the leaf list, see the build node: the leaves of the camera subdivision followed by those
	 * of the shadow subdivision. The slot buffer holds the patch level of every root triangle, for the
	 * camera and for shadows, see `_createLevelsNode()`, followed by the leaves drawn with each patch
	 * size: the indices of their draw buffer entries, for the camera with the leaves visible to it from
	 * the front and the others from the back.
	 *
	 * @private
	 * @param {number} shadowCapacity - The capacity of the shadow subdivision, `0` without one.
	 */
	_allocateDraws( shadowCapacity ) {

		const capacity = this._capacity;
		const draws = new StorageBufferAttribute( new Uint32Array( ( capacity + shadowCapacity ) * 8 ), 4 );
		const slots = new StorageBufferAttribute( new Uint32Array( this.rootCount * 2 + this._bucketCount * ( capacity + shadowCapacity ) ), 1 );

		if ( this._draws === null ) {

			this._draws = storage( draws, 'uvec4' ).setName( 'subdivisionDraws' );
			this._drawsRead = storage( draws, 'uvec4' ).toReadOnly().setName( 'subdivisionDrawsRead' );
			this._slots = storage( slots, 'uint' ).setName( 'subdivisionSlots' );
			this._slotsRead = storage( slots, 'uint' ).toReadOnly().setName( 'subdivisionSlotsRead' );

		} else {

			// the shaders read the buffers as runtime-sized arrays, so they are bound anew without being rebuilt

			this._draws.value.dispose();
			this._slots.value.dispose();

			this._draws.value = this._drawsRead.value = draws;
			this._slots.value = this._slotsRead.value = slots;

		}

		this._shadowCapacity.value = shadowCapacity;

	}

	/**
	 * Returns the storage buffer attributes of this mesh, not counting those of its subdivisions.
	 *
	 * @private
	 * @return {Array<StorageBufferAttribute>} The attributes.
	 */
	_getStorageAttributes() {

		return [ this._faces, this._vertices, this._patchCodes, this._draws, this._slots ].map( ( node ) => node.value );

	}

	/**
	 * Runs one split or merge step of the given subdivision and rebuilds its leaf list. The first
	 * update refines until the subdivision converges.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {number} time - The current time in seconds.
	 */
	_updateSubdivision( renderer, subdivision, time ) {

		const { splitNodes, mergeNodes, rebuildNodes } = subdivision;

		// morphs advance by the time since the last update of the subdivision, as the shadow subdivision is not updated
		// every frame, limited so a stall does not skip them

		const delta = subdivision.time !== null ? Math.min( time - subdivision.time, 0.1 ) : 0;

		subdivision.time = time;

		// the passes of an update in one list, named after the mesh so the inspector tells the updates apart

		const nodes = subdivision.updateNodes;

		nodes.name = ( this.name !== '' ? this.name : 'AdaptiveSubdivisionMesh' ) + ( subdivision.shadow ? ' Shadows' : '' );
		nodes.length = 0;

		// the first update refines at once, without morphing

		subdivision.morphRate.value = subdivision.initialized && this.morphing && this.morphTime > 0 ? delta / this.morphTime : 1e6;
		subdivision.progressive.value = subdivision.initialized && this.morphing ? 1 : 0;

		if ( subdivision.initialized === false ) {

			// build the leaf list, then refine to convergence so the first frame shows the final subdivision. a split takes
			// one level of a compatibility chain at a time, so chains take a few more updates than levels

			nodes.push( ...rebuildNodes );

			renderer.compute( nodes );

			subdivision.splitFrame.value = 1;

			if ( splitNodes.length > 0 ) {

				nodes.unshift( ...splitNodes );

				for ( let i = 0; i < 2 * ( subdivision.maxDepth - this.rootDepth ) + 4; i ++ ) {

					renderer.compute( nodes );

				}

			}

			subdivision.initialized = true;

		} else {

			// counted per subdivision, so one that is only updated every other frame still splits and merges

			const split = subdivision.updateCount % 2 === 0;

			subdivision.updateCount ++;
			subdivision.splitFrame.value = split ? 1 : 0;

			nodes.push( ...( split ? splitNodes : mergeNodes ), ...rebuildNodes );

			renderer.compute( nodes );

		}

	}

	/**
	 * Returns the index of the first element of the given indirect draw in the draw arguments.
	 *
	 * @private
	 * @param {number} set - The set of draws, see `CAMERA_DRAW`.
	 * @param {number} bucket - The patch size, `0` for the full patch, `1` for half its size and so on.
	 * @return {number} The index.
	 */
	_drawArgument( set, bucket ) {

		return ( set * this._bucketCount + bucket ) * 5;

	}

	/**
	 * Returns the index of the first patch level of the root triangles in the slot buffer.
	 *
	 * @private
	 * @param {boolean} shadow - Whether this is the shadow subdivision.
	 * @return {Node<uint>} The index.
	 */
	_levelBase( shadow ) {

		return shadow ? this._rootCount : uint( 0 );

	}

	/**
	 * Returns the index of the first slot of the leaves drawn with the full patch in the slot buffer, the
	 * slots of the smaller patches follow, one capacity of the subdivision each.
	 *
	 * @private
	 * @param {boolean} shadow - Whether this is the shadow subdivision.
	 * @return {Node<uint>} The index.
	 */
	_slotBase( shadow ) {

		return this._rootCount.mul( 2 ).add( shadow ? this._bucketCount * this._capacity : 0 );

	}

	// TSL helpers, emitting code into the current shader

	/**
	 * Returns the continuous patch level of a leaf of the given size: log2 of the size of the patch whose
	 * triangles are at most the target size on screen, minus how far the patch has morphed into the next
	 * smaller one, as the leaf shrinks to where the size doubled. So the level falls continuously from
	 * the full patch to a single triangle as the leaf gets smaller. The morph of the full patch ends
	 * before children morph: they morph while their parent is above the merge threshold, so a parent
	 * merging back draws its full patch. The level is rounded to a multiple of `1 / LEVEL_SCALE`, so
	 * the draw buffer holds it exactly, and the build and the vertex shader see the same levels.
	 *
	 * @private
	 * @param {Node<float>} pixels - The size of the leaf on screen, see `_evaluate()`.
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {Node<float>} The patch level.
	 */
	_patchLevel( pixels, subdivision ) {

		const target = subdivision.targetPixels;
		const fullLevel = subdivision.patchLevel;

		const level = ceil( log2( pixels.div( target ) ) ).clamp( 0, fullLevel ).toVar();
		const doubled = target.mul( level.sub( 1 ).exp2() ).toVar();
		const end = select( level.equal( fullLevel ), float( FULL_PATCH_MORPH_END ), float( PATCH_MORPH_END ) );
		const morph = select( level.greaterThan( 0 ).and( this._morphing.equal( 1 ) ), float( 1 ).sub( smoothstep( doubled, doubled.mul( end ), pixels ) ), float( 0 ) );

		return floor( level.sub( morph ).mul( LEVEL_SCALE ).add( 0.5 ) ).mul( 1 / LEVEL_SCALE );

	}

	/**
	 * Returns the number of leaves, the used blocks of the memory pool.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {Node<uint>} The leaf count.
	 */
	_leafCount( subdivision ) {

		return min( subdivision.tree.count(), subdivision.capacityNode );

	}

	/**
	 * Decodes the root triangle and the barycentric coordinates of the vertices of the given node.
	 *
	 * Vertices `v0` and `v1` span the refinement edge. Barycentric coordinates are relative to the
	 * root triangle: `x` weighs the start of its halfedge, `y` its end, and the rest weighs the
	 * face centroid.
	 *
	 * @private
	 * @param {Node<uint>} id - The heap index.
	 * @param {Node<uint>} depth - The depth, at least `rootDepth`.
	 * @return {{root: Node<uint>, v0: Node<vec2>, v1: Node<vec2>, v2: Node<vec2>}} The decoded node.
	 */
	_decodeBisector( id, depth ) {

		const levels = depth.sub( this.rootDepth ).toVar();
		const root = id.shiftRight( levels ).sub( 2 ** this.rootDepth ).toVar();

		const v0 = vec2( 1, 0 ).toVar();
		const v1 = vec2( 0, 1 ).toVar();
		const v2 = vec2( 0, 0 ).toVar();

		Loop( { start: levels, end: uint( 0 ), type: 'uint', condition: '>' }, ( { i } ) => {

			const left = id.shiftRight( i.sub( 1 ) ).bitAnd( 1 ).equal( 0 );

			// split at the midpoint of v0-v1, the children span v2-v0 and v1-v2 with the midpoint as apex

			const midpoint = v0.add( v1 ).mul( 0.5 ).toVar();
			const next0 = select( left, v2, v1 ).toVar();
			const next1 = select( left, v0, v2 ).toVar();

			v0.assign( next0 );
			v1.assign( next1 );
			v2.assign( midpoint );

		} );

		return { root, v0, v1, v2 };

	}

	/**
	 * Returns the local space corner positions and normals of the given root triangle: the start
	 * and end of its halfedge and the face centroid.
	 *
	 * @private
	 * @param {Node<uint>} root - The root triangle index.
	 * @return {{positions: Array<Node<vec3>>, normals: Array<Node<vec3>>}} The corner positions and normals.
	 */
	_rootTriangle( root ) {

		const face = root.div( 3 ).toVar();
		const corner = root.sub( face.mul( 3 ) ).toVar();
		const indices = this._faces.element( face ).toVar();

		const corners = ( offset ) => {

			const a = this._vertices.element( indices.x.mul( 2 ).add( offset ) ).xyz.toVar();
			const b = this._vertices.element( indices.y.mul( 2 ).add( offset ) ).xyz.toVar();
			const c = this._vertices.element( indices.z.mul( 2 ).add( offset ) ).xyz.toVar();

			return [
				select( corner.equal( 0 ), a, select( corner.equal( 1 ), b, c ) ).toVar(),
				select( corner.equal( 0 ), b, select( corner.equal( 1 ), c, a ) ).toVar(),
				a.add( b ).add( c ).div( 3 ).toVar()
			];

		};

		return { positions: corners( 0 ), normals: corners( 1 ) };

	}

	/**
	 * Evaluates the visibility of the given node, its size on screen and its split ratio: its size
	 * relative to the split threshold, and with a `displacementError` callback, the lesser of that
	 * and how far its triangles deviate from the displaced surface relative to the error threshold.
	 * Nodes split above a ratio of 1, merge below `MERGE_HYSTERESIS` and their children morph in
	 * between 1 and `MORPH_END`. Invisible nodes have a ratio of 0.
	 *
	 * @private
	 * @param {Object} node - A node returned by `_decodeBisector()`.
	 * @param {Subdivision} subdivision - The subdivision, with the thresholds and culling parameters.
	 * @param {boolean} [error=false] - Whether to evaluate the deviation, else the ratio only covers the size.
	 * @return {{visible: Node<bool>, pixels: Node<float>, ratio: Node<float>}} The visibility, the size in pixels and the split ratio.
	 */
	_evaluate( node, subdivision, error = false ) {

		const { positions, normals } = this._rootTriangle( node.root );

		const p0 = interpolate( positions, node.v0 ).toVar();
		const p1 = interpolate( positions, node.v1 ).toVar();
		const p2 = interpolate( positions, node.v2 ).toVar();

		// bounding sphere, enlarged by the displacement

		const center = p0.add( p1 ).add( p2 ).div( 3 ).toVar();
		const radius = max( p0.distance( center ), p1.distance( center ), p2.distance( center ) ).add( this._maxDisplacement ).toVar();

		const visible = uint( 1 ).toVar();

		If( subdivision.frustumCulling.equal( 1 ), () => {

			for ( let i = 0; i < 6; i ++ ) {

				const plane = this._frustumPlanes.element( i );

				If( plane.xyz.dot( center ).add( plane.w ).lessThan( radius.negate() ), () => {

					visible.assign( 0 );

				} );

			}

		} );

		If( subdivision.facing.notEqual( 0 ), () => {

			// conservative: all corners must face away by a margin, as displacement changes the normals

			const facing = ( p, v ) => {

				const n = interpolate( normals, v ).normalize();
				const view = select( this._orthographic.equal( 1 ), this._cameraDirection.negate(), this._cameraPosition.sub( p ).normalize() );

				return n.dot( view ).mul( subdivision.facing );

			};

			If( max( facing( p0, node.v0 ), facing( p1, node.v1 ), facing( p2, node.v2 ) ).lessThan( - BACKFACE_MARGIN ), () => {

				visible.assign( 0 );

			} );

		} );

		// screen space size, at the distance of the center as the displacement averages out

		const distance = max( this._cameraPosition.distance( center ), 1e-4 );
		const pixelsPerUnit = this._projectionScale.div( select( this._orthographic.equal( 1 ), float( 1 ), distance ) ).toVar();
		const size = triangleSize( p0, p1, p2 ).toVar();
		const pixels = size.mul( pixelsPerUnit ).toVar();
		const ratio = select( visible.equal( 1 ), pixels.div( subdivision.splitThreshold ), float( 0 ) ).toVar();

		if ( this._displacementError !== null && error === true ) {

			// the deviation of the triangles of the node from the displaced surface, only where it can change a decision

			If( ratio.greaterThan( MERGE_HYSTERESIS ), () => {

				const surface = this._evaluateSurface( node.root, node.v0.add( node.v1 ).add( node.v2 ).div( 3 ) );

				const deviation = this._displacementError( {
					position: surface.position,
					normal: surface.normal,
					uv: surface.uv,
					size: size.div( subdivision.patchSize ),
					footprint: subdivision.targetPixels.div( pixelsPerUnit )
				} );

				ratio.assign( min( ratio, deviation.mul( pixelsPerUnit ).div( max( subdivision.splitError, 1e-6 ) ) ) );

			} );

		}

		return {
			visible: visible.equal( 1 ),
			pixels,
			ratio
		};

	}

	/**
	 * Evaluates the source surface at the given barycentric coordinates of a root triangle.
	 *
	 * Points on mesh edges are interpolated between the two edge vertices in the order of their
	 * vertex indices, and points inside a face with face barycentric weights in face order, so both
	 * triangles sharing an edge or a vertex compute bit-identical results.
	 *
	 * @private
	 * @param {Node<uint>} root - The root triangle index.
	 * @param {Node<vec2>} barycentric - The barycentric coordinates.
	 * @return {{position: Node<vec3>, normal: Node<vec3>, uv: Node<vec2>}} The surface attributes.
	 */
	_evaluateSurface( root, barycentric ) {

		const face = root.div( 3 ).toVar();
		const corner = root.sub( face.mul( 3 ) ).toVar();
		const indices = this._faces.element( face ).toVar();
		const uvIndices = this._uvOffset !== null ? this._faces.element( face.add( this._faceCount ) ).add( this._uvOffset ).toVar() : uvec4( 0 );

		const position = vec3().toVar();
		const normal = vec3().toVar();
		const uv = vec2().toVar();

		const vertex = ( index, attribute ) => this._vertices.element( index.mul( 2 ).add( attribute ) ).xyz;

		const x = barycentric.x;
		const y = barycentric.y;
		const centroidWeight = float( 1 ).sub( x.add( y ) ).toVar();

		If( centroidWeight.equal( 0 ), () => {

			// on the edge of the halfedge, interpolate from its lower to its higher vertex index

			const start = select( corner.equal( 0 ), uvec2( indices.x, uvIndices.x ), select( corner.equal( 1 ), uvec2( indices.y, uvIndices.y ), uvec2( indices.z, uvIndices.z ) ) ).toVar();
			const end = select( corner.equal( 0 ), uvec2( indices.y, uvIndices.y ), select( corner.equal( 1 ), uvec2( indices.z, uvIndices.z ), uvec2( indices.x, uvIndices.x ) ) ).toVar();

			const ascending = start.x.lessThan( end.x );

			const low = select( ascending, start, end ).toVar();
			const high = select( ascending, end, start ).toVar();
			const t = select( ascending, y, x ).toVar();
			const s = float( 1 ).sub( t ).toVar();

			position.assign( vertex( low.x, 0 ).mul( s ).add( vertex( high.x, 0 ).mul( t ) ) );
			normal.assign( vertex( low.x, 1 ).mul( s ).add( vertex( high.x, 1 ).mul( t ) ) );

			if ( this._uvOffset !== null ) {

				uv.assign( this._vertices.element( low.y ).xy.mul( s ).add( this._vertices.element( high.y ).xy.mul( t ) ) );

			}

		} ).Else( () => {

			// inside the face

			const third = centroidWeight.div( 3 );
			const weights = vec3( third ).add( select( corner.equal( 0 ), vec3( x, y, 0 ), select( corner.equal( 1 ), vec3( 0, x, y ), vec3( y, 0, x ) ) ) ).toVar();

			position.assign( vertex( indices.x, 0 ).mul( weights.x ).add( vertex( indices.y, 0 ).mul( weights.y ) ).add( vertex( indices.z, 0 ).mul( weights.z ) ) );
			normal.assign( vertex( indices.x, 1 ).mul( weights.x ).add( vertex( indices.y, 1 ).mul( weights.y ) ).add( vertex( indices.z, 1 ).mul( weights.z ) ) );

			if ( this._uvOffset !== null ) {

				uv.assign( this._vertices.element( uvIndices.x ).xy.mul( weights.x ).add( this._vertices.element( uvIndices.y ).xy.mul( weights.y ) ).add( this._vertices.element( uvIndices.z ).xy.mul( weights.z ) ) );

			}

		} );

		return { position, normal: normal.normalize(), uv };

	}

	/**
	 * Returns the gradient of the displacement along the source surface: the given gradient projected
	 * onto the surface, or finite differences in a tangent frame (Duff et al., "Building an
	 * Orthonormal Basis, Revisited").
	 *
	 * @private
	 * @param {Node<vec3>} position - The local space position on the source surface.
	 * @param {Node<vec3>} normal - The normalized normal of the source surface.
	 * @param {Node<vec2>} uv - The texture coordinates.
	 * @param {Node<float>} footprint - The footprint passed to the displacement callback.
	 * @param {Node<float>} epsilon - The finite difference step in local space.
	 * @param {?Node<float>} [height=null] - The displacement at the position, if already evaluated.
	 * @return {Node<vec3>} The gradient in local space.
	 */
	_gradient( position, normal, uv, footprint, epsilon, height = null ) {

		if ( this._displacementGradient !== null ) {

			const gradient = this._displacementGradient( { position, normal, uv, footprint } ).toVar();

			return gradient.sub( normal.mul( gradient.dot( normal ) ) );

		}

		const displacement = ( p ) => this._displacement( { position: p, normal, uv, footprint } );

		const sign = select( normal.z.greaterThanEqual( 0 ), float( 1 ), float( - 1 ) );
		const a = float( - 1 ).div( sign.add( normal.z ) );
		const b = normal.x.mul( normal.y ).mul( a );
		const tangent = vec3( float( 1 ).add( sign.mul( normal.x ).mul( normal.x ).mul( a ) ), sign.mul( b ), sign.mul( normal.x ).negate() ).toVar();
		const bitangent = vec3( b, sign.add( normal.y.mul( normal.y ).mul( a ) ), normal.y.negate() ).toVar();

		const h = ( height !== null ? height : displacement( position ) ).toVar();
		const ht = displacement( position.add( tangent.mul( epsilon ) ) );
		const hb = displacement( position.add( bitangent.mul( epsilon ) ) );

		return tangent.mul( ht.sub( h ) ).add( bitangent.mul( hb.sub( h ) ) ).div( epsilon );

	}

	/**
	 * Returns the normal of the displaced surface.
	 *
	 * @private
	 * @param {Node<vec3>} position - The local space position on the source surface.
	 * @param {Node<vec3>} normal - The normalized normal of the source surface.
	 * @param {Node<vec2>} uv - The texture coordinates.
	 * @param {Node<float>} footprint - The footprint passed to the displacement callback.
	 * @param {Node<float>} epsilon - The finite difference step in local space.
	 * @param {?Node<float>} [height=null] - The displacement at the position, if already evaluated.
	 * @return {Node<vec3>} The normal in local space.
	 */
	_displacedNormal( position, normal, uv, footprint, epsilon, height = null ) {

		return normal.sub( this._gradient( position, normal, uv, footprint, epsilon, height ) ).normalize();

	}

	// shaders

	/**
	 * Creates the fragment shader normal node, evaluating the displacement at the pixel scale.
	 *
	 * @private
	 * @param {boolean} blend - Whether to add the detail to the normals of the displaced triangles, rather than computing the normals from the displacement alone.
	 * @return {Node<vec3>} The view space normal node.
	 */
	_createNormalNode( blend ) {

		return Fn( () => {

			const position = this.basePositionNode;
			const normal = this.baseNormalNode.normalize().toVar();
			const uv = this.uvNode;

			// finite differences span a few pixels, so 8-bit height maps and bilinear filtering do not show up as noise

			const pixels = this._displacementGradient !== null ? 1 : FRAGMENT_NORMAL_PIXELS;
			const pixel = float( pixels ).div( this._projectionScale ).mul( select( this._orthographic.equal( 1 ), float( 1 ), this._cameraPosition.distance( position ) ) ).toVar();

			if ( blend === false ) {

				return transformNormalToView( this._displacedNormal( position, normal, uv, pixel, pixel ) );

			}

			// the gradient of the displaced triangles, plus the detail they are too coarse to show: the gradient at the
			// pixel scale minus the gradient at the scale of the triangles, as used for their normals. the detail
			// vanishes where the triangles are as small as the pixels, and takes over where the subdivision is coarse

			const triangle = max( this._triangleSizeNode, pixel ).toVar();
			const detail = this._gradient( position, normal, uv, pixel, pixel ).sub( this._gradient( position, normal, uv, triangle, triangle.mul( 0.5 ) ) );

			return transformNormalToView( normal.sub( this._triangleGradientNode.add( detail ) ).normalize() );

		} )();

	}

	/**
	 * Creates the vertex shader position node.
	 *
	 * @private
	 * @param {('blend'|'fragment'|'vertex'|'source')} normals - How the normals are computed.
	 * @return {Node<vec3>} The position node.
	 */
	_createPositionNode( normals ) {

		return Fn( ( builder ) => {

			// shadow passes do not use normals, so their shaders leave them out

			const normalMode = builder.material.isShadowPassMaterial === true ? 'source' : normals;

			// each patch size is drawn from its own copy of the patch vertices. the slots of the camera subdivision hold
			// the leaves visible to the camera from the front and the others from the back, see the build node

			const shadowPass = this._shadowPass.equal( 1 );
			const capacity = this._capacity;
			const bucket = vertexIndex.div( this._patchVertexCount ).toVar();
			const patchVertex = vertexIndex.sub( bucket.mul( this._patchVertexCount ) ).toVar();

			const visibleCount = this._drawArgumentsRead.element( bucket.mul( 5 ).add( this._drawArgument( CAMERA_DRAW, 0 ) + 1 ) );
			const cameraSlot = select( instanceIndex.lessThan( visibleCount ), instanceIndex, uint( capacity - 1 ).add( visibleCount ).sub( instanceIndex ) );
			const shadowSlot = this._slotBase( true ).add( bucket.mul( this._shadowCapacity ) ).add( instanceIndex );
			const slot = select( shadowPass, shadowSlot, this._slotBase( false ).add( bucket.mul( capacity ) ).add( cameraSlot ) );
			const entry = this._slotsRead.element( slot ).mul( 2 ).toVar();

			const recordA = this._drawsRead.element( entry ).toVar();
			const recordB = this._drawsRead.element( entry.add( 1 ) ).toVar();

			// the corners of the leaf spanning its refinement edge, and its apex, the corner of the right angle in the
			// barycentric coordinates of the root triangle, exactly as the coordinates are dyadic, see _decodeBisector()

			const leafA = uintBitsToFloat( recordA ).toVar();
			const halfEdge = leafA.zw.sub( leafA.xy ).mul( 0.5 ).toVar();
			const apex = leafA.xy.add( leafA.zw ).mul( 0.5 ).add( vec2( halfEdge.y.negate(), halfEdge.x ) ).toVar();

			const root = recordB.x;

			// the depth minus the morph factor of the leaf

			const depthMorph = uintBitsToFloat( recordB.y ).toVar();
			const morph = ceil( depthMorph ).sub( depthMorph ).toVar();

			// the patch levels of the inside of the leaf and of its edges

			const unpack = ( bits ) => float( bits ).mul( 1 / LEVEL_SCALE );
			const levels = vec4( unpack( recordB.z.bitAnd( 0xffff ) ), unpack( recordB.z.shiftRight( 16 ) ), unpack( recordB.w.bitAnd( 0xffff ) ), unpack( recordB.w.shiftRight( 16 ) ) ).toVar();

			// the size of the patch and its level, which selects the vertex colors and morph codes, and how far it morphs
			// into the next smaller one

			const level = bucket;
			const patchSize = float( uint( this.patchSize ).shiftRight( bucket ) ).toVar();
			const patchMorph = float( Math.log2( this.patchSize ) ).sub( float( bucket ) ).sub( levels.x ).toVar();

			// the vertices on the edges of the leaf are drawn at the patch level of the edge, see the build node: those
			// between its grid points take the position of the grid point before them, which keeps the surface the
			// same, and those of its finest grid level morph like the vertices of the next smaller patch, and with the
			// leaf on its legs, which are inside its diamond. corners are on edges 0-1 and 1-2

			const patchS = positionGeometry.x;
			const patchT = positionGeometry.y;

			const onEdge01 = patchT.equal( 0 ).toVar();
			const onEdge12 = patchS.add( patchT ).equal( 1 ).and( onEdge01.not() ).toVar();
			const onEdge = onEdge01.or( onEdge12 ).or( patchS.equal( 0 ) ).toVar();

			const edgeLevel = select( onEdge01, levels.y, select( onEdge12, levels.z, levels.w ) ).toVar();
			const edgeCells = float( uint( 1 ).shiftLeft( uint( ceil( edgeLevel ) ) ) ).toVar();
			const edgeMorph = ceil( edgeLevel ).sub( edgeLevel );
			const along = select( onEdge01, patchS, select( onEdge12, patchT, float( 1 ).sub( patchT ) ) );
			const cell = floor( along.mul( edgeCells ) ).toVar();

			const edgePoint = ( u ) => select( onEdge01, vec2( u, 0 ), select( onEdge12, vec2( float( 1 ).sub( u ), u ), vec2( 0, float( 1 ).sub( u ) ) ) );

			const gridPoint = cell.div( edgeCells ).toVar();
			const patchPoint = select( onEdge, edgePoint( gridPoint ), vec2( patchS, patchT ) );
			const edgeFactor = select( uint( cell ).bitAnd( 1 ).equal( 1 ).and( cell.lessThan( edgeCells ) ), max( select( onEdge01, float( 0 ), morph ), edgeMorph ), float( 0 ) ).toVar();

			// exact dyadic barycentric coordinates within the root triangle

			const s = patchPoint.x;
			const t = patchPoint.y;
			const r = float( 1 ).sub( s ).sub( t );

			const barycentric = leafA.xy.mul( r ).add( leafA.zw.mul( s ) ).add( apex.mul( t ) ).toVar();

			// the footprint of the triangles at a vertex, from its distance so it is the same in all leaves. shadow
			// triangles are larger, up to the source triangles at a shadow detail of 0: their displacement is the mean
			// over the source triangles, and not over all of a texture, which shrinks shadow casters to their mean
			// surface and lights the edges of their shadows

			const edgePixels = this._edgePixels.mul( select( shadowPass, this._shadowFootprintScale, float( 1 ) ) );
			const footprintAt = ( position ) => {

				const footprint = edgePixels.div( this._projectionScale ).mul( select( this._orthographic.equal( 1 ), float( 1 ), this._cameraPosition.distance( position ) ) );

				return select( shadowPass, min( footprint, this._maxEdge ), footprint );

			};

			const heightAt = ( position, normal, uv, footprint ) => this._displacement( { position, normal, uv, footprint } );

			const surface = this._evaluateSurface( root, barycentric );
			const position = surface.position.toVar();
			const normal = surface.normal.toVar();
			const height = float( 0 ).toVar();
			const displacedPosition = position.toVar();
			const vertexNormal = normal.toVar();

			// morphing: the leaf into its parent and the patch into the next smaller one, which never happen at once. the
			// vertices of the last bisection of the patch move to the midpoint of the edge they split, those of the
			// bisection before only with the patch, and then the endpoints of the vertices of the last bisection move
			// too. vertices on the edges of the leaf morph with the edge instead. normals follow the same way, and all
			// points are evaluated like the vertices of the patch, so they match

			const morphMode = uint( 0 ).toVar(); // 1: a vertex of the last bisection, 2: of the bisection before
			const morphFactor = float( 0 ).toVar();
			const endpointMorphs = [ float( 0 ).toVar(), float( 0 ).toVar() ];

			// the target of a value given for the points below: the mean of the two endpoints, which are summed alike by
			// the leaves on both sides of an edge, so they match exactly

			const morphTarget = ( value ) => {

				const endpoint = ( i ) => {

					const result = value( i ).toVar();

					If( endpointMorphs[ i ].greaterThan( 0 ), () => {

						result.assign( mix( result, value( 2 + 2 * i ).add( value( 3 + 2 * i ) ).mul( 0.5 ), endpointMorphs[ i ] ) );

					} );

					return result;

				};

				return endpoint( 0 ).add( endpoint( 1 ) ).mul( 0.5 );

			};

			if ( this._displacement !== null ) {

				// the points the vertex morphs to in patch coordinates: the two endpoints, and their own endpoints. bit 0 of
				// the used points is the vertex itself, bit 1 + i point i

				const points = array( 'vec2', 6 ).toVar();
				const used = uint( 1 ).toVar();

				const step = float( 1 ).div( patchSize ).toVar();
				const lastStep = ( code ) => select( code.equal( 1 ), vec2( 0, step ), vec2( step, step.negate() ) );
				const earlierStep = ( code ) => select( code.equal( 1 ), vec2( step, 0 ), vec2( step, step.mul( - 2 ) ) );

				If( onEdge, () => {

					// the grid points of the edge before and after, evaluated alike by the leaf on the other side

					If( edgeFactor.greaterThan( 0 ), () => {

						points.element( 0 ).assign( edgePoint( gridPoint.sub( float( 1 ).div( edgeCells ) ) ) );
						points.element( 1 ).assign( edgePoint( gridPoint.add( float( 1 ).div( edgeCells ) ) ) );
						used.assign( 7 );

						morphMode.assign( 1 );
						morphFactor.assign( edgeFactor );

					} );

				} ).Else( () => {

					const codes = this._patchCodes.element( patchVertex ).shiftRight( level.mul( 4 ) ).toVar();
					const lastCode = codes.bitAnd( 3 ).toVar();
					const earlierCode = codes.shiftRight( 2 ).bitAnd( 3 ).toVar();
					const lastMorph = max( morph, patchMorph );

					If( lastCode.notEqual( 0 ).and( lastMorph.greaterThan( 0 ) ), () => {

						morphMode.assign( 1 );
						morphFactor.assign( lastMorph );

					} ).ElseIf( earlierCode.notEqual( 0 ).and( patchMorph.greaterThan( 0 ) ), () => {

						morphMode.assign( 2 );
						morphFactor.assign( patchMorph );

					} );

					If( morphMode.notEqual( 0 ), () => {

						const offset = select( morphMode.equal( 1 ), lastStep( lastCode ), earlierStep( earlierCode ) ).toVar();
						const endpoints = [ vec2( s, t ).sub( offset ).toVar(), vec2( s, t ).add( offset ).toVar() ];

						points.element( 0 ).assign( endpoints[ 0 ] );
						points.element( 1 ).assign( endpoints[ 1 ] );
						used.assign( 7 );

						If( morphMode.equal( 1 ).and( patchMorph.greaterThan( 0 ) ), () => {

							for ( let i = 0; i < 2; i ++ ) {

								// the endpoints of the bisection before, found by their grid coordinates

								const grid = uvec2( floor( endpoints[ i ].mul( this.patchSize ).add( 0.5 ) ) ).toVar();
								const index = grid.y.mul( uint( 2 * this.patchSize + 3 ).sub( grid.y ) ).div( 2 ).add( grid.x );
								const code = this._patchCodes.element( index ).shiftRight( level.mul( 4 ).add( 2 ) ).bitAnd( 3 ).toVar();

								If( code.notEqual( 0 ), () => {

									points.element( 2 + 2 * i ).assign( endpoints[ i ].sub( earlierStep( code ) ) );
									points.element( 3 + 2 * i ).assign( endpoints[ i ].add( earlierStep( code ) ) );
									used.bitOrAssign( 24 << ( 2 * i ) );

									endpointMorphs[ i ].assign( patchMorph );

								} );

							}

						} );

					} );

				} );

				// the size of the triangles of the leaf for blended normals, sampled at that size, the fragment shader adds
				// the detail below. morphing blends to the size of the triangles morphed into: twice the area for a
				// parent, four times for a patch

				const { positions } = this._rootTriangle( root );
				const size = triangleSize( interpolate( positions, leafA.xy ), interpolate( positions, leafA.zw ), interpolate( positions, apex ) ).div( patchSize ).mul( morph.mul( Math.SQRT2 - 1 ).add( 1 ) ).mul( patchMorph.add( 1 ) ).toVar();

				// the displaced positions, and the normals or gradients, of the vertex and the used points, in a loop so the
				// displacement is in the shader once, which keeps it quick to compile

				const displaced = array( 'vec3', 7 ).toVar();
				const shading = array( 'vec3', 7 ).toVar();

				Loop( { start: uint( 0 ), end: uint( 7 ), type: 'uint' }, ( { i } ) => {

					If( used.shiftRight( i ).bitAnd( 1 ).equal( 1 ), () => {

						const pointPosition = position.toVar();
						const pointNormal = normal.toVar();
						const pointUV = surface.uv.toVar();

						If( i.greaterThan( 0 ), () => {

							const patch = points.element( i.sub( 1 ) ).toVar();
							const point = leafA.xy.mul( float( 1 ).sub( patch.x ).sub( patch.y ) ).add( leafA.zw.mul( patch.x ) ).add( apex.mul( patch.y ) );
							const pointSurface = this._evaluateSurface( root, point );

							pointPosition.assign( pointSurface.position );
							pointNormal.assign( pointSurface.normal );
							pointUV.assign( pointSurface.uv );

						} );

						const footprint = footprintAt( pointPosition ).toVar();
						const pointHeight = heightAt( pointPosition, pointNormal, pointUV, footprint ).toVar();

						displaced.element( i ).assign( pointPosition.add( pointNormal.mul( pointHeight ) ) );

						If( i.equal( 0 ), () => {

							height.assign( pointHeight );

						} );

						if ( normalMode === 'vertex' ) {

							shading.element( i ).assign( this._displacedNormal( pointPosition, pointNormal, pointUV, footprint, footprint.mul( 0.5 ), pointHeight ) );

						} else if ( normalMode === 'blend' ) {

							shading.element( i ).assign( this._gradient( pointPosition, pointNormal, pointUV, size, size.mul( 0.5 ) ) );

						}

					} );

				} );

				displacedPosition.assign( displaced.element( 0 ) );

				If( morphMode.notEqual( 0 ), () => {

					displacedPosition.assign( mix( displaced.element( 0 ), morphTarget( ( k ) => displaced.element( 1 + k ) ), morphFactor ) );

				} );

				if ( normalMode === 'vertex' || normalMode === 'blend' ) {

					const morphedShading = shading.element( 0 ).toVar();

					If( morphMode.notEqual( 0 ), () => {

						morphedShading.assign( mix( shading.element( 0 ), morphTarget( ( k ) => shading.element( 1 + k ) ), morphFactor ) );

					} );

					if ( normalMode === 'vertex' ) {

						vertexNormal.assign( morphedShading );

					} else {

						// the gradient rather than the normal is interpolated, so the fragment shader can add gradients

						vertexNormal.assign( normal.sub( morphedShading ).normalize() );

						this._triangleSizeNode.assign( size );
						this._triangleGradientNode.assign( morphedShading );

					}

				}

			}

			normalLocal.assign( vertexNormal );

			// varyings

			const corner = uint( positionGeometry.z ).shiftRight( level.mul( 2 ) ).bitAnd( 3 );

			this.basePositionNode.assign( position );
			this.baseNormalNode.assign( normal );
			this.uvNode.assign( surface.uv );
			this.displacementNode.assign( height );
			this.triangleBarycentricNode.assign( vec3( select( corner.equal( 0 ), 1, 0 ), select( corner.equal( 1 ), 1, 0 ), select( corner.equal( 2 ), 1, 0 ) ) );
			this.leafBarycentricNode.assign( vec3( float( 1 ).sub( patchS ).sub( patchT ), patchS, patchT ) );
			this.depthNode.assign( depthMorph );

			// motion vectors: the position attribute holds patch coordinates, so the previous position is set to the
			// current one, as the vertices stay in place on the surface. the morphs, which move them gradually over at
			// least morphTime, are left out

			if ( builder.needsPreviousData() ) positionPrevious.assign( displacedPosition );

			return displacedPosition;

		} )();

	}

	/**
	 * Creates the compute node deciding which leaves split, as leaves that are larger on screen than the
	 * threshold. The mesh stays conforming as a leaf only splits together with its neighbor across the
	 * refinement edge, as a diamond, and if that neighbor is coarser, the neighbors along its chain of
	 * refinement edges have to split first: each update splits the coarsest pair of the chain, so every
	 * split creates the leaves of one diamond that morph together, see the build node. The new leaves of
	 * a coarser pair are only needed by the leaf, so they are asked to morph in, else they would merge
	 * again. Leaves that are still morphing do not split, and are asked to morph in as well.
	 *
	 * A split takes one new block of the pool per leaf, its first child keeps the block of the leaf.
	 * The pair is marked once, by its first block, which reserves the blocks from the budget and
	 * allocates them: the free blocks of the indices taken from a counter, found in the concurrent
	 * binary tree.
	 *
	 * Like all per-leaf passes, it is dispatched over the whole pool, as indirect dispatches cost more
	 * than the threads past the leaves.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createDecideNode( subdivision ) {

		const maxDepth = subdivision.maxDepth;

		return Fn( () => {

			If( instanceIndex.lessThan( this._leafCount( subdivision ) ), () => {

				const block = this._load( subdivision, instanceIndex, POOL_LIST ).toVar();
				const id = this._load( subdivision, block, POOL_HEAP ).toVar();
				const depth = heapDepth( id ).toVar();

				If( depth.lessThan( maxDepth ), () => {

					const { ratio } = this._evaluate( this._decodeBisector( id, depth ), subdivision, true );

					const progressive = subdivision.progressive.equal( 1 );
					const morphing = ( other ) => morphFactor( this._load( subdivision, other, POOL_MORPH ) ).notEqual( 0 );

					If( ratio.greaterThan( 1 ), () => {

						If( progressive.and( morphing( block ) ), () => {

							this._demandDiamond( subdivision, block );

						} ).Else( () => {

							// the coarsest pair of the chain: the leaf and its neighbor across the refinement edge if that is
							// the neighbor's refinement edge too, or the leaf alone at a boundary

							const first = block.toVar();
							const second = this._load( subdivision, block, POOL_NEIGHBORS ).toVar();

							Loop( maxDepth - this.rootDepth + 1, () => {

								If( second.equal( INVALID ), () => {

									Break();

								} );

								const next = this._load( subdivision, second, POOL_NEIGHBORS ).toVar();

								If( next.equal( first ), () => {

									Break();

								} );

								first.assign( second );
								second.assign( next );

							} );

							const blocked = uint( 0 ).toVar();

							If( progressive, () => {

								If( morphing( first ), () => {

									blocked.assign( 1 );
									this._demandDiamond( subdivision, first );

								} );

								If( second.notEqual( INVALID ), () => {

									If( morphing( second ), () => {

										blocked.assign( 1 );
										this._demandDiamond( subdivision, second );

									} );

								} );

							} );

							If( blocked.equal( 0 ), () => {

								const canonical = select( second.equal( INVALID ), first, min( first, second ) ).toVar();
								const other = select( second.equal( INVALID ), uint( INVALID ), max( first, second ) ).toVar();
								const previous = atomicOr( this._poolField( subdivision, canonical, POOL_COMMAND ), uint( SPLIT ) ).toVar();

								If( previous.bitAnd( SPLIT ).equal( 0 ), () => {

									// the budget, so the number of leaves stays within the pool

									const count = select( second.equal( INVALID ), uint( 1 ), uint( 2 ) ).toVar();
									const reserved = atomicAdd( subdivision.stats.element( 1 ), count ).toVar();

									If( this._leafCount( subdivision ).add( reserved ).add( count ).greaterThan( subdivision.capacityNode ), () => {

										atomicAnd( this._poolField( subdivision, canonical, POOL_COMMAND ), uint( ~ SPLIT >>> 0 ) );

									} ).Else( () => {

										const command = select( first.equal( block ), uint( SPLIT ), uint( SPLIT | DEMAND_CHILDREN ) ).toVar();
										const index = atomicAdd( subdivision.stats.element( 2 ), count ).toVar();

										atomicOr( this._poolField( subdivision, canonical, POOL_COMMAND ), command );
										this._store( subdivision, canonical, POOL_SCRATCH, subdivision.tree.findFree( index ) );

										If( other.notEqual( INVALID ), () => {

											atomicOr( this._poolField( subdivision, other, POOL_COMMAND ), command );
											this._store( subdivision, other, POOL_SCRATCH, subdivision.tree.findFree( index.add( 1 ) ) );

										} );

									} );

								} );

							} );

						} );

					} );

				} );

			} );

		} )().compute( subdivision.capacity, [ WORKGROUP_SIZE ] ).setName( 'subdivisionDecide' );

	}

	/**
	 * Creates the compute node finding the neighbors of the children of every splitting leaf, while
	 * the pool is unchanged. The children of a leaf with vertices `( v0, v1, v2 )` are `( v2, v0, m )`,
	 * the first, and `( v1, v2, m )`, with `m` the midpoint of the refinement edge: their refinement
	 * edges are the other edges of the leaf, whose neighbors split along if they split as well, and the
	 * neighbor across the second one is pointed to the second child.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createPrepareSplitNode( subdivision ) {

		return Fn( () => {

			If( instanceIndex.lessThan( this._leafCount( subdivision ) ), () => {

				const block = this._load( subdivision, instanceIndex, POOL_LIST ).toVar();

				If( this._load( subdivision, block, POOL_COMMAND ).bitAnd( SPLIT ).notEqual( 0 ), () => {

					const next = this._load( subdivision, block, POOL_NEIGHBORS + 1 ).toVar();
					const previous = this._load( subdivision, block, POOL_NEIGHBORS + 2 ).toVar();

					// a splitting neighbor touches the leaf with its first child if it was its neighbor across v2-v0

					const final = ( neighbor ) => {

						const result = neighbor.toVar();

						If( neighbor.notEqual( INVALID ), () => {

							If( this._load( subdivision, neighbor, POOL_COMMAND ).bitAnd( SPLIT ).notEqual( 0 ).and( this._load( subdivision, neighbor, POOL_NEIGHBORS + 2 ).notEqual( block ) ), () => {

								result.assign( this._load( subdivision, neighbor, POOL_SCRATCH ) );

							} );

						} );

						return result;

					};

					this._store( subdivision, block, POOL_SCRATCH + 1, final( previous ) );
					this._store( subdivision, block, POOL_SCRATCH + 2, final( next ) );

					// the pointer of the neighbor across v1-v2 that has to point to the second child

					const fix = uint( INVALID ).toVar();

					If( next.notEqual( INVALID ), () => {

						If( this._load( subdivision, next, POOL_COMMAND ).bitAnd( SPLIT ).equal( 0 ), () => {

							for ( let k = 0; k < 3; k ++ ) {

								If( this._load( subdivision, next, POOL_NEIGHBORS + k ).equal( block ), () => {

									fix.assign( next.mul( POOL_STRIDE ).add( POOL_NEIGHBORS + k ) );

								} );

							}

						} );

					} );

					this._store( subdivision, block, POOL_SCRATCH + 3, fix );

				} );

			} );

		} )().compute( subdivision.capacity, [ WORKGROUP_SIZE ] ).setName( 'subdivisionPrepareSplit' );

	}

	/**
	 * Creates the compute node applying the splits: the children get their heap indices and neighbors,
	 * across the halves of the refinement edge the children of the neighbor that split along, and start
	 * at the shape of the leaf, with a morph factor of 1.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createCommitSplitNode( subdivision ) {

		return Fn( () => {

			If( instanceIndex.lessThan( this._leafCount( subdivision ) ), () => {

				const block = this._load( subdivision, instanceIndex, POOL_LIST ).toVar();
				const command = this._load( subdivision, block, POOL_COMMAND ).toVar();

				If( command.bitAnd( SPLIT ).notEqual( 0 ), () => {

					const id = this._load( subdivision, block, POOL_HEAP ).toVar();
					const twin = this._load( subdivision, block, POOL_NEIGHBORS ).toVar();
					const child = this._load( subdivision, block, POOL_SCRATCH ).toVar();
					const twinChild = uint( INVALID ).toVar();

					If( twin.notEqual( INVALID ), () => {

						twinChild.assign( this._load( subdivision, twin, POOL_SCRATCH ) );

					} );

					this._store( subdivision, block, POOL_HEAP, id.mul( 2 ) );
					this._store( subdivision, block, POOL_NEIGHBORS, this._load( subdivision, block, POOL_SCRATCH + 1 ) );
					this._store( subdivision, block, POOL_NEIGHBORS + 1, twinChild );
					this._store( subdivision, block, POOL_NEIGHBORS + 2, child );

					this._store( subdivision, child, POOL_HEAP, id.mul( 2 ).add( 1 ) );
					this._store( subdivision, child, POOL_NEIGHBORS, this._load( subdivision, block, POOL_SCRATCH + 2 ) );
					this._store( subdivision, child, POOL_NEIGHBORS + 1, block );
					this._store( subdivision, child, POOL_NEIGHBORS + 2, twin );
					this._store( subdivision, child, POOL_COMMAND, uint( 0 ) );

					const fix = this._load( subdivision, block, POOL_SCRATCH + 3 ).toVar();

					If( fix.notEqual( INVALID ), () => {

						atomicStore( subdivision.pool.element( fix ), child );

					} );

					const morph = select( command.bitAnd( DEMAND_CHILDREN ).notEqual( 0 ), uint( ( 0x3f800000 | DEMAND ) >>> 0 ), uint( 0x3f800000 ) ).toVar();

					this._store( subdivision, block, POOL_MORPH, morph );
					this._store( subdivision, child, POOL_MORPH, morph );

					subdivision.tree.setBit( child );

				} );

			} );

		} )().compute( subdivision.capacity, [ WORKGROUP_SIZE ] ).setName( 'subdivisionCommitSplit' );

	}

	/**
	 * Creates the compute node deciding which leaves merge. The leaves of a diamond merge into its two
	 * parents (or a parent at a boundary) once they morphed into them, if both parents are not split by
	 * the criterion. Only diamonds whose four leaves are leaves merge, so the mesh stays conforming.
	 * The first child of the parent with the smaller heap index applies the merge.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createMergeDecideNode( subdivision ) {

		return Fn( () => {

			If( instanceIndex.lessThan( this._leafCount( subdivision ) ), () => {

				const block = this._load( subdivision, instanceIndex, POOL_LIST ).toVar();
				const id = this._load( subdivision, block, POOL_HEAP ).toVar();
				const depth = heapDepth( id ).toVar();
				const morphed = this._morphing.equal( 0 ).or( morphFactor( this._load( subdivision, block, POOL_MORPH ) ).greaterThanEqual( 1 ) );

				If( depth.greaterThan( this.rootDepth ).and( id.bitAnd( 1 ).equal( 0 ) ).and( morphed ), () => {

					const sibling = this._load( subdivision, block, POOL_NEIGHBORS + 2 ).toVar();

					If( sibling.notEqual( INVALID ), () => {

						If( this._load( subdivision, sibling, POOL_HEAP ).equal( id.add( 1 ) ), () => {

							// the parents to merge: one at a boundary, else also the parent of the neighbor, whose children are the
							// second across the half of the refinement edge of the first child, and the first across that of the
							// second child, if they are leaves

							const partner = this._load( subdivision, block, POOL_NEIGHBORS + 1 ).toVar();
							const partnerId = uint( 0 ).toVar();
							const partnerSibling = this._load( subdivision, sibling, POOL_NEIGHBORS + 2 ).toVar();
							const parentCount = uint( 0 ).toVar();

							If( partner.equal( INVALID ), () => {

								parentCount.assign( 1 );

							} ).Else( () => {

								partnerId.assign( this._load( subdivision, partner, POOL_HEAP ) );

								If( heapDepth( partnerId ).equal( depth ).and( partnerId.bitAnd( 1 ).equal( 1 ) ).and( partnerSibling.notEqual( INVALID ) ).and( id.shiftRight( 1 ).lessThan( partnerId.shiftRight( 1 ) ) ), () => {

									If( this._load( subdivision, partnerSibling, POOL_HEAP ).equal( partnerId.sub( 1 ) ), () => {

										parentCount.assign( 2 );

									} );

								} );

							} );

							// they merge if the criterion splits none of them, evaluated in a loop so it is in the shader once

							const parentDepth = depth.sub( 1 ).toVar();
							const merge = parentCount.greaterThan( 0 ).toVar();

							Loop( { start: uint( 0 ), end: parentCount, type: 'uint' }, ( { i } ) => {

								const parent = select( i.equal( 0 ), id.shiftRight( 1 ), partnerId.shiftRight( 1 ) );

								If( this._evaluate( this._decodeBisector( parent, parentDepth ), subdivision, true ).ratio.greaterThan( MERGE_HYSTERESIS ), () => {

									merge.assign( false );

								} );

							} );

							If( merge, () => {

								this._store( subdivision, block, POOL_COMMAND, uint( MERGE | MERGE_OWNER ) );
								this._store( subdivision, sibling, POOL_COMMAND, uint( MERGE ) );

								If( parentCount.equal( 2 ), () => {

									this._store( subdivision, partner, POOL_COMMAND, uint( MERGE ) );
									this._store( subdivision, partnerSibling, POOL_COMMAND, uint( MERGE ) );

								} );

							} );

						} );

					} );

				} );

			} );

		} )().compute( subdivision.capacity, [ WORKGROUP_SIZE ] ).setName( 'subdivisionMergeDecide' );

	}

	/**
	 * Creates the compute node finding the neighbors of the parents of every merging diamond, while the
	 * pool is unchanged: across the refinement edges of their children, or the parents of merging
	 * neighbors. Each parent keeps the block of its first child, so only the neighbor across the
	 * refinement edge of its second child has to be pointed to it.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createPrepareMergeNode( subdivision ) {

		return Fn( () => {

			If( instanceIndex.lessThan( this._leafCount( subdivision ) ), () => {

				const block = this._load( subdivision, instanceIndex, POOL_LIST ).toVar();

				If( this._load( subdivision, block, POOL_COMMAND ).bitAnd( MERGE_OWNER ).notEqual( 0 ), () => {

					const merging = ( other ) => this._load( subdivision, other, POOL_COMMAND ).bitAnd( MERGE ).notEqual( 0 );

					const final = ( neighbor ) => {

						const result = neighbor.toVar();

						If( neighbor.notEqual( INVALID ), () => {

							If( merging( neighbor ), () => {

								// the parent keeps the block of the first child, the sibling of the second child

								If( this._load( subdivision, neighbor, POOL_HEAP ).bitAnd( 1 ).equal( 1 ), () => {

									result.assign( this._load( subdivision, neighbor, POOL_NEIGHBORS + 1 ) );

								} );

							} );

						} );

						return result;

					};

					const parent = ( first, second ) => {

						const secondTwin = this._load( subdivision, second, POOL_NEIGHBORS ).toVar();
						const fix = uint( INVALID ).toVar();

						If( secondTwin.notEqual( INVALID ), () => {

							If( merging( secondTwin ).not(), () => {

								for ( let k = 0; k < 3; k ++ ) {

									If( this._load( subdivision, secondTwin, POOL_NEIGHBORS + k ).equal( second ), () => {

										fix.assign( secondTwin.mul( POOL_STRIDE ).add( POOL_NEIGHBORS + k ) );

									} );

								}

							} );

						} );

						this._store( subdivision, first, POOL_SCRATCH, final( secondTwin ) );
						this._store( subdivision, first, POOL_SCRATCH + 1, final( this._load( subdivision, first, POOL_NEIGHBORS ) ) );
						this._store( subdivision, first, POOL_SCRATCH + 2, fix );

					};

					const sibling = this._load( subdivision, block, POOL_NEIGHBORS + 2 ).toVar();
					const partner = this._load( subdivision, block, POOL_NEIGHBORS + 1 ).toVar();

					parent( block, sibling );

					If( partner.notEqual( INVALID ), () => {

						parent( this._load( subdivision, sibling, POOL_NEIGHBORS + 2 ).toVar(), partner );

					} );

				} );

			} );

		} )().compute( subdivision.capacity, [ WORKGROUP_SIZE ] ).setName( 'subdivisionPrepareMerge' );

	}

	/**
	 * Creates the compute node applying the merges: the parents take the blocks of their first
	 * children, with a morph factor of 0, and the blocks of the second children are freed.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createCommitMergeNode( subdivision ) {

		return Fn( () => {

			If( instanceIndex.lessThan( this._leafCount( subdivision ) ), () => {

				const block = this._load( subdivision, instanceIndex, POOL_LIST ).toVar();

				If( this._load( subdivision, block, POOL_COMMAND ).bitAnd( MERGE_OWNER ).notEqual( 0 ), () => {

					const sibling = this._load( subdivision, block, POOL_NEIGHBORS + 2 ).toVar();
					const partner = this._load( subdivision, block, POOL_NEIGHBORS + 1 ).toVar();
					const partnerFirst = uint( INVALID ).toVar();

					If( partner.notEqual( INVALID ), () => {

						partnerFirst.assign( this._load( subdivision, sibling, POOL_NEIGHBORS + 2 ) );

					} );

					const apply = ( first, second, twin ) => {

						const fix = this._load( subdivision, first, POOL_SCRATCH + 2 ).toVar();

						this._store( subdivision, first, POOL_HEAP, this._load( subdivision, first, POOL_HEAP ).shiftRight( 1 ) );
						this._store( subdivision, first, POOL_NEIGHBORS, twin );
						this._store( subdivision, first, POOL_NEIGHBORS + 1, this._load( subdivision, first, POOL_SCRATCH ) );
						this._store( subdivision, first, POOL_NEIGHBORS + 2, this._load( subdivision, first, POOL_SCRATCH + 1 ) );
						this._store( subdivision, first, POOL_MORPH, uint( 0 ) );

						If( fix.notEqual( INVALID ), () => {

							atomicStore( subdivision.pool.element( fix ), first );

						} );

						this._store( subdivision, second, POOL_HEAP, uint( 0 ) );

						subdivision.tree.clearBit( second );

					};

					apply( block, sibling, partnerFirst );

					If( partner.notEqual( INVALID ), () => {

						apply( partnerFirst, partner, block );

					} );

				} );

			} );

		} )().compute( subdivision.capacity, [ WORKGROUP_SIZE ] ).setName( 'subdivisionCommitMerge' );

	}

	/**
	 * Creates the compute node resetting the counters of the update and of the leaves drawn with
	 * each patch size.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {boolean} shadow - Whether this is the shadow subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createPrepareNode( subdivision, shadow ) {

		const drawArguments = this._drawArguments;
		const stats = subdivision.stats;

		return Fn( () => {

			atomicStore( stats.element( 0 ), this._leafCount( subdivision ) );
			atomicStore( stats.element( 1 ), uint( 0 ) );
			atomicStore( stats.element( 2 ), uint( 0 ) );

			for ( let bucket = 0; bucket < this._bucketCount; bucket ++ ) {

				if ( shadow ) {

					atomicStore( drawArguments.element( this._drawArgument( SHADOW_DRAW, bucket ) + 1 ), uint( 0 ) );

				} else {

					atomicStore( drawArguments.element( this._drawArgument( CAMERA_DRAW, bucket ) + 1 ), uint( 0 ) );
					atomicStore( drawArguments.element( this._counterBase + bucket ), uint( 0 ) );

				}

			}

		} )().compute( 1 ).setName( shadow ? 'subdivisionShadowPrepare' : 'subdivisionPrepare' );

	}

	/**
	 * Creates the compute node computing the patch level of every root triangle, see `_patchLevel()`.
	 * The build node reads them for root leaves and their neighbors, so both sides of an edge see the
	 * same levels.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {boolean} shadow - Whether this is the shadow subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createLevelsNode( subdivision, shadow ) {

		return Fn( () => {

			If( instanceIndex.lessThan( this._rootCount ), () => {

				const node = this._decodeBisector( instanceIndex.add( 2 ** this.rootDepth ), uint( this.rootDepth ) );
				const { pixels } = this._evaluate( node, subdivision );

				this._slots.element( instanceIndex.add( this._levelBase( shadow ) ) ).assign( floatBitsToUint( this._patchLevel( pixels, subdivision ) ) );

			} );

		} )().compute( this.rootCount, [ WORKGROUP_SIZE ] ).setName( shadow ? 'subdivisionShadowLevels' : 'subdivisionLevels' );

	}

	/**
	 * Creates the compute node writing the draw list of all leaves, where each leaf is drawn with its
	 * own patch size: leaves below the root triangles draw the full patch, root
	 * triangles the patch of their level, see `_patchLevel()`. The edges are drawn at the finer level of
	 * the two leaves sharing them, so both draw them alike, and the leaf draws the patch of its finest
	 * edge, with the vertices inside morphed to at most one level below. The slots of the patch sizes
	 * hold the leaves visible to the camera at the front and the others at the back.
	 *
	 * Each leaf gets a morph factor, how far its vertices are moved to the surface of its parent. A
	 * split creates the leaves of a diamond, the four children of a parent and the parent's neighbor
	 * across its refinement edge, and only the vertices inside the diamond move: on the edges between
	 * the four, never on their refinement edges. So the four share one factor, from the larger split
	 * ratio of the parents, and none morph once one of them is split. The factor follows the ratio
	 * at a limited rate: it starts at 1 after a split, and is kept in the block of each leaf, where all
	 * four follow the same ratio, so they stay equal. Leaves only split once their factor reached 0 and
	 * merge once it reached 1, so every transition is smooth, whatever drives it. Diamonds asked to
	 * morph in by the split decision do so whatever their ratio, and hold the request until the next
	 * split decision, so they wait there once they did.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {boolean} shadow - Whether this is the shadow subdivision.
	 * @return {ComputeNode} The compute node.
	 */
	_createBuildNode( subdivision, shadow ) {

		return Fn( () => {

			If( instanceIndex.lessThan( this._leafCount( subdivision ) ), () => {

				// the block of the leaf, found in the concurrent binary tree and listed for the next update

				const block = subdivision.tree.findUsed( instanceIndex ).toVar();
				const id = this._load( subdivision, block, POOL_HEAP ).toVar();
				const depth = heapDepth( id ).toVar();

				this._store( subdivision, instanceIndex, POOL_LIST, block );

				const node = this._decodeBisector( id, depth );
				const { visible } = this._evaluate( node, subdivision );

				// the morph factor, which follows 1 at the split threshold of the parents (and before they merge) and 0 from
				// MORPH_END, from where it was in the last update

				const morph = float( 0 ).toVar();
				const held = uint( 0 ).toVar();
				const drawArguments = this._drawArguments;

				// the leaves of a subdivision that does not split are root triangles, which do not morph

				if ( subdivision.minimal === false ) {

					If( this._morphing.equal( 1 ), () => {

						const { complete, partner } = this._diamond( subdivision, block, id, depth );

						If( complete, () => {

							// the larger split ratio of the parents, evaluated in a loop so the split criterion is in the shader once,
							// which keeps it quick to compile

							const parentDepth = depth.sub( 1 ).toVar();
							const partnerParent = id.shiftRight( 1 ).toVar();
							const parentCount = uint( 1 ).toVar();
							const ratio = float( 0 ).toVar();

							If( partner.notEqual( INVALID ), () => {

								partnerParent.assign( this._load( subdivision, partner, POOL_HEAP ).shiftRight( 1 ) );
								parentCount.assign( 2 );

							} );

							Loop( { start: uint( 0 ), end: parentCount, type: 'uint' }, ( { i } ) => {

								const parent = select( i.equal( 0 ), id.shiftRight( 1 ), partnerParent );

								ratio.assign( max( ratio, this._evaluate( this._decodeBisector( parent, parentDepth ), subdivision, true ).ratio ) );

							} );

							const word = this._load( subdivision, block, POOL_MORPH ).toVar();
							const previous = morphFactor( word ).toVar();
							const demanded = word.bitAnd( DEMAND ).notEqual( 0 ).toVar();
							const wasHeld = word.bitAnd( HELD ).notEqual( 0 ).toVar();

							const target = select( demanded.or( wasHeld ), float( 0 ), float( 1 ).sub( smoothstep( 1, MORPH_END, ratio ) ) );

							morph.assign( target.clamp( previous.sub( subdivision.morphRate ), previous.add( subdivision.morphRate ) ) );
							held.assign( select( demanded.or( wasHeld.and( morph.greaterThan( 0 ).or( subdivision.splitFrame.equal( 0 ) ) ) ), uint( HELD ), uint( 0 ) ) );

						} );

					} );

				}

				this._store( subdivision, block, POOL_MORPH, floatBitsToUint( morph ).bitOr( held ) );
				this._store( subdivision, block, POOL_COMMAND, uint( 0 ) );

				// the patch levels of the leaf and of its neighbors: the levels of root triangles, and the full patch for the
				// leaves below them

				const fullLevel = subdivision.patchLevel;
				const rootLevel = ( root ) => uintBitsToFloat( this._slots.element( root.add( this._levelBase( shadow ) ) ) );

				const leafLevel = fullLevel.toVar();

				If( depth.equal( this.rootDepth ), () => {

					leafLevel.assign( rootLevel( node.root ) );

				} );

				const edgeLevels = [ 0, 1, 2 ].map( ( k ) => {

					const neighbor = this._load( subdivision, block, POOL_NEIGHBORS + k ).toVar();
					const level = leafLevel.toVar();

					If( neighbor.notEqual( INVALID ), () => {

						const neighborId = this._load( subdivision, neighbor, POOL_HEAP ).toVar();

						If( heapDepth( neighborId ).equal( this.rootDepth ), () => {

							level.assign( rootLevel( neighborId.sub( 2 ** this.rootDepth ) ) );

						} ).Else( () => {

							level.assign( fullLevel );

						} );

					} );

					return level;

				} );

				// the edges are drawn at the finer level, the leaf at the level of its finest edge

				for ( const edgeLevel of edgeLevels ) edgeLevel.assign( max( edgeLevel, leafLevel ) );

				const drawLevel = ceil( max( edgeLevels[ 0 ], edgeLevels[ 1 ], edgeLevels[ 2 ] ) ).toVar();
				const bucket = uint( float( Math.log2( this.patchSize ) ).sub( drawLevel ) ).toVar();
				const entry = instanceIndex.add( shadow ? this._capacity : 0 ).toVar();

				// the corners spanning the refinement edge, as the apex follows from them, the root, the depth minus the morph
				// factor, below 1 so the depth can be recovered, and the levels of the inside of the leaf, at most one below
				// its patch, and of its edges, as 16 bit fixed point, which holds them exactly, see _patchLevel()

				const pack = ( low, high ) => uint( low.mul( LEVEL_SCALE ).add( 0.5 ) ).bitOr( uint( high.mul( LEVEL_SCALE ).add( 0.5 ) ).shiftLeft( 16 ) );
				const depthMorph = float( depth.sub( this.rootDepth ) ).sub( min( morph, 0.999 ) );

				this._draws.element( entry.mul( 2 ) ).assign( floatBitsToUint( vec4( node.v0, node.v1 ) ) );
				this._draws.element( entry.mul( 2 ).add( 1 ) ).assign( uvec4( node.root, floatBitsToUint( depthMorph ), pack( leafLevel.clamp( drawLevel.sub( 1 ), drawLevel ), edgeLevels[ 0 ] ), pack( edgeLevels[ 1 ], edgeLevels[ 2 ] ) ) );

				const slots = this._slotBase( shadow ).add( bucket.mul( subdivision.capacityNode ) ).toVar();
				const instances = ( set ) => drawArguments.element( bucket.mul( 5 ).add( this._drawArgument( set, 0 ) + 1 ) );

				if ( shadow ) {

					this._slots.element( slots.add( atomicAdd( instances( SHADOW_DRAW ), uint( 1 ) ) ) ).assign( entry );

				} else {

					If( visible, () => {

						this._slots.element( slots.add( atomicAdd( instances( CAMERA_DRAW ), uint( 1 ) ) ) ).assign( entry );

					} ).Else( () => {

						const hidden = atomicAdd( drawArguments.element( bucket.add( this._counterBase ) ), uint( 1 ) );

						this._slots.element( slots.add( uint( this._capacity - 1 ).sub( hidden ) ) ).assign( entry );

					} );

				}

			} );

		} )().compute( subdivision.capacity, [ WORKGROUP_SIZE ] ).setName( shadow ? 'subdivisionShadowBuild' : 'subdivisionBuild' );

	}

	/**
	 * Creates the compute node completing the draw arguments of the camera subdivision: the number of
	 * leaves drawn for other cameras, and the wireframes.
	 *
	 * @private
	 * @return {ComputeNode} The compute node.
	 */
	_createFinishNode() {

		const drawArguments = this._drawArguments;

		return Fn( () => {

			for ( let bucket = 0; bucket < this._bucketCount; bucket ++ ) {

				const visible = atomicLoad( drawArguments.element( this._drawArgument( CAMERA_DRAW, bucket ) + 1 ) ).toVar();
				const all = visible.add( atomicLoad( drawArguments.element( this._counterBase + bucket ) ) ).toVar();

				atomicStore( drawArguments.element( this._drawArgument( ALL_DRAW, bucket ) + 1 ), all );
				atomicStore( drawArguments.element( this._drawArgument( CAMERA_WIREFRAME_DRAW, bucket ) + 1 ), visible );
				atomicStore( drawArguments.element( this._drawArgument( ALL_WIREFRAME_DRAW, bucket ) + 1 ), all );

			}

		} )().compute( 1 ).setName( 'subdivisionFinish' );

	}

	/**
	 * Returns a field of a block of the memory pool, see `Subdivision`, for atomic access.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {Node<uint>} block - The block.
	 * @param {number|Node<uint>} field - The field, see `POOL_HEAP`.
	 * @return {Node} The storage element.
	 */
	_poolField( subdivision, block, field ) {

		return subdivision.pool.element( block.mul( POOL_STRIDE ).add( field ) );

	}

	/**
	 * Reads a field of a block of the memory pool.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {Node<uint>} block - The block.
	 * @param {number|Node<uint>} field - The field, see `POOL_HEAP`.
	 * @return {Node<uint>} The value.
	 */
	_load( subdivision, block, field ) {

		return atomicLoad( this._poolField( subdivision, block, field ) );

	}

	/**
	 * Writes a field of a block of the memory pool.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {Node<uint>} block - The block.
	 * @param {number|Node<uint>} field - The field, see `POOL_HEAP`.
	 * @param {Node<uint>} value - The value.
	 */
	_store( subdivision, block, field, value ) {

		atomicStore( this._poolField( subdivision, block, field ), value );

	}

	/**
	 * Finds the other leaves of the diamond of the given leaf: its sibling, and the children of its
	 * parent's neighbor across the refinement edge, the partner across the half of the refinement edge
	 * of the parent that the leaf touches, and the partner's sibling. The first child of a parent
	 * neighbors its sibling across v2-v0 and the partner across v1-v2, the second child the other way
	 * round. The diamond is complete if all of them are leaves.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {Node<uint>} block - The block of the leaf.
	 * @param {Node<uint>} id - The heap index of the leaf.
	 * @param {Node<uint>} depth - The depth of the leaf.
	 * @return {{complete: Node<bool>, sibling: Node<uint>, partner: Node<uint>, partnerSibling: Node<uint>}} Whether the diamond is complete, and the blocks of the other leaves, `INVALID` for the partners at a boundary.
	 */
	_diamond( subdivision, block, id, depth ) {

		const siblingField = ( first ) => select( first, uint( POOL_NEIGHBORS + 2 ), uint( POOL_NEIGHBORS + 1 ) );
		const partnerField = ( first ) => select( first, uint( POOL_NEIGHBORS + 1 ), uint( POOL_NEIGHBORS + 2 ) );

		const first = id.bitAnd( 1 ).equal( 0 ).toVar();
		const sibling = this._load( subdivision, block, siblingField( first ) ).toVar();
		const partner = this._load( subdivision, block, partnerField( first ) ).toVar();
		const partnerSibling = uint( INVALID ).toVar();
		const complete = depth.greaterThan( this.rootDepth ).and( sibling.notEqual( INVALID ) ).toVar();

		If( complete, () => {

			complete.assign( this._load( subdivision, sibling, POOL_HEAP ).equal( id.bitXor( 1 ) ) );

		} );

		If( complete.and( partner.notEqual( INVALID ) ), () => {

			const partnerId = this._load( subdivision, partner, POOL_HEAP ).toVar();

			partnerSibling.assign( this._load( subdivision, partner, siblingField( partnerId.bitAnd( 1 ).equal( 0 ) ) ) );
			complete.assign( heapDepth( partnerId ).equal( depth ).and( partnerSibling.notEqual( INVALID ) ) );

			If( complete, () => {

				complete.assign( this._load( subdivision, partnerSibling, POOL_HEAP ).equal( partnerId.bitXor( 1 ) ) );

			} );

		} );

		return { complete, sibling, partner, partnerSibling };

	}

	/**
	 * Asks the diamond of the given leaf to morph in, see the build node.
	 *
	 * @private
	 * @param {Subdivision} subdivision - The subdivision.
	 * @param {Node<uint>} block - The block of the leaf.
	 */
	_demandDiamond( subdivision, block ) {

		const id = this._load( subdivision, block, POOL_HEAP ).toVar();
		const { complete, sibling, partner, partnerSibling } = this._diamond( subdivision, block, id, heapDepth( id ) );

		If( complete, () => {

			const demand = ( leaf ) => atomicOr( this._poolField( subdivision, leaf, POOL_MORPH ), uint( DEMAND ) );

			demand( block );
			demand( sibling );

			If( partner.notEqual( INVALID ), () => {

				demand( partner );
				demand( partnerSibling );

			} );

		} );

	}

}

/**
 * Returns the depth of a heap index.
 *
 * @private
 * @param {Node<uint>} id - The heap index.
 * @return {Node<uint>} The depth.
 */
function heapDepth( id ) {

	return uint( 31 ).sub( countLeadingZeros( id ) );

}

/**
 * Returns the morph factor of the morph field of a block of the pool, without its flags.
 *
 * @private
 * @param {Node<uint>} word - The morph field.
 * @return {Node<float>} The morph factor.
 */
function morphFactor( word ) {

	return uintBitsToFloat( word.bitAnd( uint( ~ MORPH_FLAGS >>> 0 ) ) );

}

/**
 * Returns the size of a triangle: the edge length of an equilateral triangle of the same area.
 *
 * @private
 * @param {Node<vec3>} a - The first corner.
 * @param {Node<vec3>} b - The second corner.
 * @param {Node<vec3>} c - The third corner.
 * @return {Node<float>} The size.
 */
function triangleSize( a, b, c ) {

	return b.sub( a ).cross( c.sub( a ) ).length().mul( 2 / Math.sqrt( 3 ) ).sqrt();

}

/**
 * Interpolates the corners of a root triangle at the given barycentric coordinates, see
 * `_decodeBisector()`.
 *
 * @private
 * @param {Array<Node>} corners - The values at the start and the end of the halfedge, and at the face centroid.
 * @param {Node<vec2>} barycentric - The barycentric coordinates.
 * @return {Node} The interpolated value.
 */
function interpolate( [ a, b, c ], barycentric ) {

	return a.mul( barycentric.x ).add( b.mul( barycentric.y ) ).add( c.mul( float( 1 ).sub( barycentric.x.add( barycentric.y ) ) ) );

}

/**
 * A subdivision of the source mesh: its leaves in a memory pool managed by a concurrent binary tree,
 * the parameters of the split criterion and the compute nodes updating it.
 *
 * The pool holds `POOL_STRIDE` integers per block: the heap index of the leaf, the blocks of its
 * neighbors across its edges v0-v1 (the refinement edge), v1-v2 and v2-v0, `INVALID` at a boundary,
 * its morph factor, the command of the update, four integers passed between the passes of an update,
 * and the block of the leaf of the same index in the list of leaves.
 *
 * @private
 */
class Subdivision {

	/**
	 * Constructs a new subdivision of the root triangles.
	 *
	 * @param {number} capacity - The number of blocks of the pool, the maximum number of leaves.
	 * @param {number} maxDepth - The maximum depth of the leaves.
	 * @param {Uint32Array} rootPool - The blocks of the root triangles.
	 * @param {number} rootCount - The number of root triangles.
	 */
	constructor( capacity, maxDepth, rootPool, rootCount ) {

		this.capacity = capacity;
		this.capacityNode = uniform( capacity, 'uint' ); // a uniform, see AdaptiveSubdivisionMesh._rootCount
		this.maxDepth = maxDepth;

		this.tree = new ConcurrentBinaryTree( capacity );
		this.tree.setUsed( rootCount );

		const pool = new Uint32Array( capacity * POOL_STRIDE );

		pool.set( rootPool );

		this.poolAttribute = new StorageBufferAttribute( pool, 1 );
		this.statsAttribute = new StorageBufferAttribute( new Uint32Array( 4 ), 1 );

		this.pool = storage( this.poolAttribute, 'uint' ).toAtomic().setName( 'subdivisionPool' );

		// the leaf count, the blocks reserved by splits and the blocks allocated

		this.stats = storage( this.statsAttribute, 'uint' ).toAtomic().setName( 'subdivisionStats' );

		this.splitThreshold = uniform( 1 );
		this.splitError = uniform( 0 );
		this.morphRate = uniform( 1 ); // how far morph factors and patch levels may change per update
		this.progressive = uniform( 0 ); // whether splits wait for morphing leaves, see the decide node
		this.splitFrame = uniform( 0 ); // whether the update splits or merges
		this.targetPixels = uniform( 1 ); // the target size of the drawn triangles in pixels
		this.patchSize = uniform( 1 ); // the size of the patch drawn for the leaves larger than the target
		this.patchLevel = uniform( 0 ); // its log2
		this.frustumCulling = uniform( 1 );
		this.facing = uniform( 0 ); // 1: cull leaves facing away from the camera, -1: cull leaves facing it, 0: no culling

		this.splitNodes = [];
		this.mergeNodes = [];
		this.rebuildNodes = [];
		this.updateNodes = [];

		this.initialized = false;
		this.minimal = false;
		this.shadow = false;
		this.compiling = null; // the promise of the pipelines being compiled, see AdaptiveSubdivisionMesh.compileAsync()
		this.updateCount = 0; // the updates since the first, which alternate between splits and merges
		this.time = null; // the time of the last update in seconds

	}

	/**
	 * Frees the GPU-related resources.
	 */
	dispose() {

		// the reduction nodes belong to the tree

		const nodes = [ ...this.splitNodes, ...this.mergeNodes, ...this.rebuildNodes ].filter( ( node ) => this.tree.reduceNodes.includes( node ) === false );

		for ( const node of nodes ) node.dispose();

		this.tree.dispose();

		this.poolAttribute.dispose();
		this.statsAttribute.dispose();

	}

}

/**
 * Creates the patch drawn for every leaf: the longest edge bisection of the leaf down to an even
 * depth, which has the vertices of a regular triangle grid with `size` segments per edge. So the
 * patches of the two children of a leaf are its patch with every triangle bisected once, and moving
 * the vertices of the last bisection to the midpoints of the edges they split turns the children
 * into their parent.
 *
 * The position attribute holds the patch coordinates and, two bits per level, vertex colors in
 * `[0, 3)` that differ between the corners of every triangle of the level, used for barycentric
 * coordinates. The returned codes hold, four bits per level, whether the vertex comes from one of
 * the two bisections that double the patch size, and the edge it splits: for the last bisection 1
 * for steps of `( 0, ±1 )` and 2 for steps of `( ±1, ∓1 )` grid cells of the level, and two bits
 * up for the bisection before 1 for `( ±1, 0 )` and 2 for `( ±1, ∓2 )`.
 *
 * The index holds the patch at every power of two size, from `size` segments per edge down to a
 * single triangle. The returned levels are the index ranges.
 *
 * @private
 * @param {number} size - The number of segments per edge.
 * @return {{geometry: BufferGeometry, levels: Array<{size: number, start: number, count: number}>, codes: Uint32Array, vertexCount: number}} The patch geometry, its levels, the morph codes of its vertices and their number, the geometry holds a copy of the vertices per level.
 */
function createPatchGeometry( size ) {

	const depth = Math.log2( size );
	const rowStart = [];

	let vertexCount = 0;

	for ( let j = 0; j <= size; j ++ ) {

		rowStart.push( vertexCount );
		vertexCount += size + 1 - j;

	}

	const vertex = ( point ) => rowStart[ point[ 1 ] ] + point[ 0 ];

	const colors = new Float32Array( vertexCount );
	const codes = new Uint32Array( vertexCount );

	// bisect to depth 2 * log2( size ), the triangles of every even depth form a level, in grid coordinates

	let triangles = [[[ 0, 0 ], [ size, 0 ], [ 0, size ]]];

	const levelTriangles = [ triangles ];
	const created = new Set( [ 0, size, vertexCount - 1 ] );

	for ( let d = 1; d <= 2 * depth; d ++ ) {

		const next = [];

		for ( const [ a, b, c ] of triangles ) {

			const midpoint = [ ( a[ 0 ] + b[ 0 ] ) / 2, ( a[ 1 ] + b[ 1 ] ) / 2 ];
			const index = vertex( midpoint );

			if ( created.has( index ) === false ) {

				created.add( index );

				const level = depth - Math.ceil( d / 2 );

				if ( d % 2 === 0 ) {

					codes[ index ] |= ( a[ 0 ] === b[ 0 ] ? 1 : 2 ) << ( 4 * level );

				} else {

					codes[ index ] |= ( a[ 1 ] === b[ 1 ] ? 1 : 2 ) << ( 4 * level + 2 );

				}

			}

			next.push( [ c, a, midpoint ], [ b, c, midpoint ] );

		}

		triangles = next;

		if ( d % 2 === 0 ) levelTriangles.push( triangles );

	}

	// three colors per level, spread from triangle to triangle across their edges

	for ( let m = 0; m <= depth; m ++ ) {

		const levelTriangleList = levelTriangles[ m ].map( ( triangle ) => triangle.map( vertex ) );
		const edges = new Map();
		const color = new Map();

		const edgeKey = ( a, b ) => Math.min( a, b ) * vertexCount + Math.max( a, b );

		levelTriangleList.forEach( ( triangle, t ) => {

			for ( let e = 0; e < 3; e ++ ) {

				const key = edgeKey( triangle[ e ], triangle[ ( e + 1 ) % 3 ] );

				if ( edges.has( key ) === false ) edges.set( key, [] );

				edges.get( key ).push( t );

			}

		} );

		levelTriangleList[ 0 ].forEach( ( index, c ) => color.set( index, c ) );

		const queue = [ 0 ];
		const visited = new Set( queue );

		while ( queue.length > 0 ) {

			const triangle = levelTriangleList[ queue.shift() ];
			const used = triangle.filter( ( index ) => color.has( index ) ).map( ( index ) => color.get( index ) );

			for ( const index of triangle ) {

				if ( color.has( index ) === false ) color.set( index, 3 - used[ 0 ] - used[ 1 ] );

			}

			for ( let e = 0; e < 3; e ++ ) {

				for ( const t of edges.get( edgeKey( triangle[ e ], triangle[ ( e + 1 ) % 3 ] ) ) ) {

					if ( visited.has( t ) === false ) {

						visited.add( t );
						queue.push( t );

					}

				}

			}

		}

		for ( const [ index, c ] of color ) colors[ index ] += c * 4 ** ( depth - m );

	}

	const positions = new Float32Array( vertexCount * 3 );
	const normals = new Float32Array( vertexCount * 3 );

	for ( let j = 0; j <= size; j ++ ) {

		for ( let i = 0; i <= size - j; i ++ ) {

			const index = vertex( [ i, j ] );

			positions.set( [ i / size, j / size, colors[ index ] ], index * 3 );
			normals.set( [ 0, 0, 1 ], index * 3 );

		}

	}

	const indices = [];
	const levels = [];

	for ( let m = depth; m >= 0; m -- ) {

		const start = indices.length;

		for ( const triangle of levelTriangles[ m ] ) indices.push( ...triangle.map( vertex ) );

		levels.push( { size: 2 ** m, start, count: indices.length - start } );

	}

	// a copy of the vertices per patch size, drawn with their offset as base vertex

	const copies = levels.length;
	const copiedPositions = new Float32Array( positions.length * copies );
	const copiedNormals = new Float32Array( normals.length * copies );

	for ( let i = 0; i < copies; i ++ ) {

		copiedPositions.set( positions, i * positions.length );
		copiedNormals.set( normals, i * normals.length );

	}

	const geometry = new BufferGeometry();
	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new BufferAttribute( copiedPositions, 3 ) );
	geometry.setAttribute( 'normal', new BufferAttribute( copiedNormals, 3 ) );

	return { geometry, levels, codes, vertexCount };

}

/**
 * Welds the vertices of the given geometry by position and builds the halfedge data used by the
 * subdivision: welded vertex indices per face, the original vertex indices per face (for UVs),
 * the twin of every halfedge, and positions and smooth normals per welded vertex.
 *
 * @private
 * @param {BufferGeometry} geometry - The source geometry.
 * @return {Object} The halfedge data.
 */
function buildHalfedgeMesh( geometry ) {

	const position = geometry.getAttribute( 'position' );
	const normal = geometry.getAttribute( 'normal' );
	const uv = geometry.getAttribute( 'uv' );
	const index = geometry.getIndex();

	// weld, with a tolerance relative to the size of the mesh: the seams of generated geometries, like the
	// one of a cylinder, have positions that differ by rounding errors

	let extent = 0;

	for ( let i = 0; i < position.count; i ++ ) {

		extent = Math.max( extent, Math.abs( position.getX( i ) ), Math.abs( position.getY( i ) ), Math.abs( position.getZ( i ) ) );

	}

	const tolerance = ( extent || 1 ) * 2 ** - 20;

	const weldMap = new Map();
	const welded = new Uint32Array( position.count );
	const weldedPositions = [];

	for ( let i = 0; i < position.count; i ++ ) {

		const x = position.getX( i ), y = position.getY( i ), z = position.getZ( i );
		const key = Math.round( x / tolerance ) + ',' + Math.round( y / tolerance ) + ',' + Math.round( z / tolerance );

		let id = weldMap.get( key );

		if ( id === undefined ) {

			id = weldedPositions.length / 3;
			weldMap.set( key, id );
			weldedPositions.push( x, y, z );

		}

		welded[ i ] = id;

	}

	const vertexCount = weldedPositions.length / 3;

	// faces, skipping degenerate ones

	const triangleCount = index !== null ? index.count / 3 : position.count / 3;
	const faces = [];
	const corners = [];

	for ( let f = 0; f < triangleCount; f ++ ) {

		const a = index !== null ? index.getX( 3 * f ) : 3 * f;
		const b = index !== null ? index.getX( 3 * f + 1 ) : 3 * f + 1;
		const c = index !== null ? index.getX( 3 * f + 2 ) : 3 * f + 2;

		const wa = welded[ a ], wb = welded[ b ], wc = welded[ c ];

		if ( wa === wb || wb === wc || wc === wa ) continue;

		faces.push( wa, wb, wc, 0 );
		corners.push( a, b, c, 0 );

	}

	const faceCount = faces.length / 4;

	// smooth normals per welded vertex

	const normals = new Float32Array( vertexCount * 3 );

	if ( normal !== undefined ) {

		for ( let i = 0; i < position.count; i ++ ) {

			const w = welded[ i ];

			normals[ 3 * w ] += normal.getX( i );
			normals[ 3 * w + 1 ] += normal.getY( i );
			normals[ 3 * w + 2 ] += normal.getZ( i );

		}

	} else {

		const p = weldedPositions;

		for ( let f = 0; f < faceCount; f ++ ) {

			const a = faces[ 4 * f ], b = faces[ 4 * f + 1 ], c = faces[ 4 * f + 2 ];

			const ex = p[ 3 * b ] - p[ 3 * a ], ey = p[ 3 * b + 1 ] - p[ 3 * a + 1 ], ez = p[ 3 * b + 2 ] - p[ 3 * a + 2 ];
			const fx = p[ 3 * c ] - p[ 3 * a ], fy = p[ 3 * c + 1 ] - p[ 3 * a + 1 ], fz = p[ 3 * c + 2 ] - p[ 3 * a + 2 ];

			const nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx;

			for ( const w of [ a, b, c ] ) {

				normals[ 3 * w ] += nx;
				normals[ 3 * w + 1 ] += ny;
				normals[ 3 * w + 2 ] += nz;

			}

		}

	}

	const vertices = new Float32Array( vertexCount * 8 );

	for ( let i = 0; i < vertexCount; i ++ ) {

		const nx = normals[ 3 * i ], ny = normals[ 3 * i + 1 ], nz = normals[ 3 * i + 2 ];
		const length = Math.hypot( nx, ny, nz ) || 1;

		vertices.set( [ weldedPositions[ 3 * i ], weldedPositions[ 3 * i + 1 ], weldedPositions[ 3 * i + 2 ], 0, nx / length, ny / length, nz / length, 0 ], 8 * i );

	}

	// twins: halfedge h = 3 * face + corner goes from corner to corner + 1

	const halfedges = new Map();

	for ( let h = 0; h < faceCount * 3; h ++ ) {

		const f = Math.floor( h / 3 ), k = h % 3;
		const key = faces[ 4 * f + k ] * vertexCount + faces[ 4 * f + ( k + 1 ) % 3 ];

		// keep the first halfedge of non-manifold or inconsistently oriented edges

		if ( halfedges.has( key ) === false ) halfedges.set( key, h );

	}

	const twins = new Uint32Array( faceCount * 3 ).fill( INVALID );

	for ( const [ key, h ] of halfedges ) {

		const from = Math.floor( key / vertexCount ), to = key % vertexCount;
		const twin = halfedges.get( to * vertexCount + from );

		if ( twin !== undefined ) twins[ h ] = twin;

	}

	// uvs per original vertex

	let uvs = null;

	if ( uv !== undefined ) {

		uvs = new Float32Array( uv.count * 2 );

		for ( let i = 0; i < uv.count; i ++ ) {

			uvs[ 2 * i ] = uv.getX( i );
			uvs[ 2 * i + 1 ] = uv.getY( i );

		}

	}

	return {
		faceCount,
		vertexCount,
		faces: new Uint32Array( faces ),
		corners: new Uint32Array( corners ),
		twins,
		vertices,
		uvs
	};

}

export { AdaptiveSubdivisionMesh };
