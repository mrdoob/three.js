import { BackSide, BufferAttribute, BufferGeometry, Color, DoubleSide, EquirectangularReflectionMapping, EquirectangularRefractionMapping, FloatType, FrontSide, Matrix4, NodeMaterial, QuadMesh, RendererUtils, RenderTarget, StorageBufferAttribute, StructTypeNode, Vector3 } from 'three/webgpu';
import { Fn, If, Loop, abs, asin, atan, cos, cross, dFdx, dFdy, dot, float, fract, hash, instanceIndex, int, length, luminance, mix, normalize, pmremTexture, screenCoordinate, select, sin, smoothstep, sqrt, storage, texture, textureLoad, uint, uniform, uvec2, vec2, vec3, vec4 } from 'three/tsl';
import { MeshBVH, SAH } from 'three-mesh-bvh';
import { BVHComputeData, bvhNodeBoundsStruct, intersectRayTriangle, rayIntersectionResultStruct, rayStruct, wgslTagCode, wgslTagFn } from 'three-mesh-bvh/webgpu';

import { LightMapper } from './LightMapper.js';

const _a = /*@__PURE__*/ new Vector3();
const _b = /*@__PURE__*/ new Vector3();
const _c = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();

let _rendererState;
const _color = /*@__PURE__*/ new Color();

// fixed point increments of the R2 and R3 low-discrepancy sequences, see
// https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/

const R2 = [ 3242174889, 2447445414 ];
const R3 = [ 3518319154, 2882110346, 2360945575 ];

// latitude-longitude cells of the sky, sampled by their power, which is measured with a grid of
// directions per cell

const SKY_COLUMNS = 128;
const SKY_ROWS = 64;
const SKY_CELLS = SKY_COLUMNS * SKY_ROWS;
const SKY_GRID = 8;

// vec4 items per material, emitter and light

const MATERIAL_STRIDE = 2;
const EMITTER_STRIDE = 4;
const LIGHT_STRIDE = 4;

// the traversal stack holds the far children along the path to a leaf, the trees of three-mesh-bvh
// are at most 40 levels deep

const STACK_DEPTH = 48;

/**
 * Approximates diffuse global illumination with ray traced radiosity, as a source of irradiance for
 * {@link LightMapper}. Every sample casts cosine-distributed rays from each point through a
 * {@link https://github.com/gkjohnson/three-mesh-bvh three-mesh-bvh} BVH of the scene, and looks up
 * the light leaving the hit surfaces in a light map of the bounces. Emissive surfaces and the sky are
 * also sampled directly with shadow rays, so small area lights and suns converge quickly.
 *
 * The bounces are cached in a light map that `update()` solves iteratively, so the meshes need light
 * map UVs in `uv1`, e.g. generated with {@link unwrapUVs}. Meshes without them block light but do not
 * reflect it.
 *
 * ```js
 * const radiosity = new RayTracedRadiosity();
 * radiosity.update( renderer, scene );
 *
 * const lightMapper = new LightMapper( renderer, size, rayTracedRadiosityIrradiance( radiosity ) );
 * ```
 *
 * The scene is collected by `update()`: call it again after changing the scene or the lighting and
 * create new samplers afterwards. The direct light of directional, point and spot lights is left to
 * the materials, like with the other irradiance sources, but the cached bounces include it with shadow
 * rays, so their indirect light is baked. The light of emissive surfaces is baked, since materials do
 * not light each other, and so is the light of an equirectangular or cube texture in `scene.background`,
 * scaled by `scene.backgroundIntensity`; background colors are ignored. Only the colors of the
 * materials are used, texture maps are ignored and all surfaces are opaque. Other lights, and skinned,
 * instanced and batched meshes are ignored.
 *
 * This class can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @three_import import { RayTracedRadiosity, rayTracedRadiosityIrradiance } from 'three/addons/lighting/RayTracedRadiosity.js';
 */
class RayTracedRadiosity {

	/**
	 * Constructs a new ray traced radiosity solver.
	 *
	 * @param {Object} [options] - The options.
	 * @param {number} [options.rays=8] - The number of rays cast per point and sample.
	 * @param {number} [options.bounces=16] - The number of iterations used to solve the cached bounces. Each iteration adds one bounce, `0` disables the cache.
	 * @param {number} [options.cacheSamples=32] - The number of samples accumulated into the bounce cache after the iterations.
	 * @param {number} [options.cacheSize=256] - The size of the bounce cache light map in texels.
	 */
	constructor( { rays = 8, bounces = 16, cacheSamples = 32, cacheSize = 256 } = {} ) {

		/**
		 * The number of rays cast per point and sample.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.rays = rays;

		/**
		 * The number of iterations used to solve the cached bounces.
		 *
		 * @type {number}
		 * @default 16
		 */
		this.bounces = bounces;

		/**
		 * The number of samples accumulated into the bounce cache after the iterations.
		 *
		 * @type {number}
		 * @default 32
		 */
		this.cacheSamples = cacheSamples;

		/**
		 * The size of the bounce cache light map in texels.
		 *
		 * @type {number}
		 * @default 256
		 */
		this.cacheSize = cacheSize;

		/**
		 * World space distance that rays start above the receiving face, to avoid hitting it.
		 *
		 * @type {number}
		 * @default 0.001
		 */
		this.bias = 0.001;

		this._bvh = null;
		this._geometry = null;
		this._trace = null;
		this._surface = null;
		this._visibility = null;
		this._triangles = null;
		this._materials = null;
		this._lights = null;
		this._lightCount = 0;
		this._emitters = null;
		this._emitterCount = 0;
		this._lightMapMeshes = [];
		this._cache = null;
		this._environment = null;
		this._sky = null;

		this._environmentIntensity = uniform( 1 );
		this._environmentRotation = uniform( new Matrix4() );
		this._environmentInverseRotation = uniform( new Matrix4() );

		// the sample sequences continue with every render call of the gathering materials

		this._pass = 0;
		this._passNode = uniform( 0, 'uint' ).onRenderUpdate( () => ++ this._pass );
		this._biasNode = uniform( this.bias ).onRenderUpdate( () => this.bias );

	}

	/**
	 * Collects the meshes of the scene, builds the BVH and solves the cached bounces. Call this again
	 * after changing the scene or the lighting.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 */
	update( renderer, scene ) {

		this._clear();
		this._collect( scene );
		this._createSky( renderer );
		this._createTrace();

		if ( this.bounces > 0 ) {

			// the cached irradiance includes the direct light of the analytic lights, for their bounces

			this._cache = new LightMapper( renderer, this.cacheSize, ( position, normal ) => this._gather( position, normal, true ) );
			this._solve();

		}

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._clear();

	}

	/**
	 * Disposes the BVH, the scene buffers and the bounce cache.
	 *
	 * @private
	 */
	_clear() {

		if ( this._bvh !== null ) {

			this._bvh.dispose();
			this._geometry.dispose();

			this._bvh = null;
			this._geometry = null;

		}

		for ( const buffer of [ this._triangles, this._materials, this._lights, this._emitters, this._sky ] ) buffer?.value.dispose();

		this._triangles = this._materials = this._lights = this._emitters = this._sky = null;

		if ( this._cache !== null ) {

			this._cache.dispose();
			this._cache = null;

		}

	}

	/**
	 * Merges the visible meshes into one world space geometry, builds its BVH and stores the
	 * materials, emissive triangles and lights.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 */
	_collect( scene ) {

		scene.updateMatrixWorld();

		// a background texture is the sky, oriented like the rendered background

		const background = scene.background;

		if ( background !== null && ( background.isCubeTexture === true || background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) ) {

			this._environment = background;
			this._environmentIntensity.value = scene.backgroundIntensity;
			this._environmentInverseRotation.value.makeRotationFromEuler( scene.backgroundRotation );
			this._environmentRotation.value.copy( this._environmentInverseRotation.value ).transpose();

		} else {

			this._environment = null;

		}

		const positions = [];
		const uvs = [];
		const triangles = [];
		const materials = [];
		const lights = [];
		const emitters = [];
		const entries = new Map();
		const lightMapMeshes = [];

		// one entry per material and light map availability: the diffuse color and front side visibility,
		// then the emitted radiance and back side visibility. Without light map UVs the color is zero, since
		// the surface can not sample the cached bounces

		const getEntry = ( material, hasLightMapUV ) => {

			const key = material.uuid + hasLightMapUV;

			if ( entries.has( key ) === false ) {

				const color = new Color( 0, 0, 0 );
				const emission = new Color( 0, 0, 0 );

				if ( material.isMeshBasicMaterial === true ) {

					// unlit surfaces emit their color

					if ( material.color !== undefined ) emission.copy( material.color );

				} else {

					// metals have no diffuse color

					if ( material.color !== undefined && hasLightMapUV ) color.copy( material.color ).multiplyScalar( 1 - ( material.metalness ?? 0 ) );
					if ( material.emissive !== undefined ) emission.copy( material.emissive ).multiplyScalar( material.emissiveIntensity ?? 1 );

				}

				const front = material.side !== BackSide ? 1 : 0;
				const back = material.side !== FrontSide ? 1 : 0;

				entries.set( key, { index: entries.size, emission, side: material.side } );
				materials.push( color.r, color.g, color.b, front, emission.r, emission.g, emission.b, back );

			}

			return entries.get( key );

		};

		scene.traverseVisible( ( object ) => {

			// directional, point and spot lights: the direction to the light or its position and the type,
			// the color times the intensity, the cutoff distance, decay and cone of point and spot lights,
			// and the axis of spot lights

			if ( object.isDirectionalLight === true || object.isPointLight === true || object.isSpotLight === true ) {

				const color = _color.copy( object.color ).multiplyScalar( object.intensity );

				_a.setFromMatrixPosition( object.matrixWorld );

				if ( object.isDirectionalLight === true ) {

					object.target.updateWorldMatrix( true, false );
					_a.sub( _b.setFromMatrixPosition( object.target.matrixWorld ) ).normalize();
					lights.push( _a.x, _a.y, _a.z, 0, color.r, color.g, color.b, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

				} else if ( object.isPointLight === true ) {

					lights.push( _a.x, _a.y, _a.z, 1, color.r, color.g, color.b, 0, object.distance, object.decay, 0, 0, 0, 0, 0, 0 );

				} else {

					// the cone and penumbra like SpotLightNode

					object.target.updateWorldMatrix( true, false );
					_b.setFromMatrixPosition( object.target.matrixWorld ).subVectors( _a, _b ).normalize();
					lights.push( _a.x, _a.y, _a.z, 2, color.r, color.g, color.b, 0, object.distance, object.decay, Math.cos( object.angle ), Math.cos( object.angle * ( 1 - object.penumbra ) ), _b.x, _b.y, _b.z, 0 );

				}

			}

			if ( object.isMesh !== true || object.isSkinnedMesh === true || object.isInstancedMesh === true || object.isBatchedMesh === true ) return;

			const geometry = object.geometry;
			const position = geometry.getAttribute( 'position' );
			const uv1 = geometry.getAttribute( 'uv1' );
			const index = geometry.getIndex();

			if ( uv1 !== undefined ) lightMapMeshes.push( object );

			// mirrored transforms flip the winding of the world space triangles

			const order = object.matrixWorld.determinant() < 0 ? [ 0, 2, 1 ] : [ 0, 1, 2 ];

			const count = index !== null ? index.count : position.count;
			const drawStart = Math.max( 0, geometry.drawRange.start );
			const drawEnd = Math.min( count, geometry.drawRange.start + geometry.drawRange.count );
			const groups = geometry.groups.length > 0 ? geometry.groups : [ { start: 0, count: Infinity, materialIndex: 0 } ];

			for ( const group of groups ) {

				const material = Array.isArray( object.material ) ? object.material[ group.materialIndex ] : object.material;

				if ( material === undefined || material.visible === false ) continue;

				const entry = getEntry( material, uv1 !== undefined );
				const emissive = entry.emission.r + entry.emission.g + entry.emission.b > 0;

				const start = Math.max( drawStart, group.start );
				const end = Math.min( drawEnd, group.start + group.count );

				for ( let i = start; i + 2 < end; i += 3 ) {

					for ( const v of order ) {

						const vertex = index !== null ? index.getX( i + v ) : i + v;

						_a.fromBufferAttribute( position, vertex ).applyMatrix4( object.matrixWorld );
						positions.push( _a.x, _a.y, _a.z );
						uvs.push( uv1 !== undefined ? uv1.getX( vertex ) : 0, uv1 !== undefined ? uv1.getY( vertex ) : 0 );

					}

					triangles.push( entry.index );

					// emissive triangles are sampled with shadow rays

					if ( emissive ) {

						const p = positions.length - 9;

						_a.fromArray( positions, p );
						_b.fromArray( positions, p + 3 ).sub( _a );
						_c.fromArray( positions, p + 6 ).sub( _a );

						const area = _normal.crossVectors( _b, _c ).length() / 2;

						if ( area > 0 ) emitters.push( { a: _a.clone(), e1: _b.clone(), e2: _c.clone(), area, emission: entry.emission, side: entry.side } );

					}

				}

			}

		} );

		// the triangles are not shared, so each one carries its light map UVs

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.setAttribute( 'uv1', new BufferAttribute( new Float32Array( uvs ), 2 ) );
		geometry.setIndex( new BufferAttribute( new Uint32Array( positions.length / 3 ).map( ( value, i ) => i ), 1 ) );

		// a SAH tree with small leaves traces the rays about 1.7 times faster than the default one, which
		// splits at the centers and is built a little faster

		geometry.boundsTree = new MeshBVH( geometry, { strategy: SAH, targetLeafSize: 4 } );

		const bvh = new BVHComputeData( geometry, { attributes: { uv1: 'vec2f' } } );
		bvh.update();

		// the BVH sorts the triangles of the index, the per triangle data follows their order. The
		// corners are copied next to it, so the intersection tests read one buffer without indirection

		const sorted = geometry.getIndex().array;
		const triangleData = new Float32Array( Math.max( sorted.length / 3, 1 ) * 12 );

		for ( let i = 0; i < sorted.length / 3; i ++ ) {

			for ( let k = 0; k < 3; k ++ ) {

				const vertex = sorted[ i * 3 + k ];

				triangleData.set( positions.slice( vertex * 3, vertex * 3 + 3 ), i * 12 + k * 4 );

			}

			triangleData[ i * 12 + 3 ] = triangles[ sorted[ i * 3 ] / 3 ];

		}

		this._geometry = geometry;
		this._bvh = bvh;
		this._lightMapMeshes = lightMapMeshes;
		this._triangles = vec4Storage( triangleData );
		this._materials = vec4Storage( materials );
		this._lights = vec4Storage( lights );
		this._lightCount = lights.length / ( LIGHT_STRIDE * 4 );
		this._emitters = vec4Storage( createEmitters( emitters ) );
		this._emitterCount = emitters.length;

	}

	/**
	 * Builds the table that samples the sky by the power of its latitude-longitude cells, measured on
	 * the GPU from the radiance that the rays see. So any equirectangular or cube texture works, also
	 * without data on the CPU, like the textures of TextureLoader and CubeTextureLoader, and render
	 * targets. A cell stores its power and the sum of the powers of its row up to it. Then an item per
	 * row stores the power of the row, the sum of the powers of the rows up to it, and the factor that
	 * turns the power of a cell of the row into its density over the solid angle.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 */
	_createSky( renderer ) {

		const environment = this._environment;

		if ( environment === null ) return;

		const attribute = new StorageBufferAttribute( new Float32Array( ( SKY_CELLS + SKY_ROWS ) * 4 ), 4 );
		const table = storage( attribute, 'vec4', SKY_CELLS + SKY_ROWS );

		// the power of a cell is its mean luminance times its solid angle, from a grid of directions that
		// are distributed over the solid angle like the shadow rays, see _gather()

		const target = new RenderTarget( SKY_COLUMNS, SKY_ROWS, { type: FloatType, depthBuffer: false } );
		const material = new NodeMaterial();

		material.fragmentNode = Fn( () => {

			const cell = vec2( uvec2( screenCoordinate.xy ) ).toVar();
			const lower = sin( cell.y.div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ).toVar();
			const upper = sin( cell.y.add( 1 ).div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ).toVar();
			const sum = float( 0 ).toVar();

			Loop( SKY_GRID, SKY_GRID, ( { i, j } ) => {

				const phi = cell.x.add( float( i ).add( 0.5 ).div( SKY_GRID ) ).div( SKY_COLUMNS ).sub( 0.5 ).mul( 2 * Math.PI ).toVar();
				const z = mix( lower, upper, float( j ).add( 0.5 ).div( SKY_GRID ) ).toVar();
				const r = sqrt( z.mul( z ).oneMinus().max( 0 ) );

				sum.addAssign( luminance( pmremTexture( environment, vec3( r.mul( cos( phi ) ), z, r.mul( sin( phi ) ) ), float( 0 ) ).rgb ) );

			} );

			return vec4( sum.mul( upper.sub( lower ).mul( 2 * Math.PI / ( SKY_COLUMNS * SKY_GRID * SKY_GRID ) ) ), 0, 0, 1 );

		} )();

		const quad = new QuadMesh( material );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.setRenderTarget( target );
		quad.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

		// the sums of the powers along the rows, then over the rows. Invalid and infinite powers count as none

		const sumRows = Fn( () => {

			const row = instanceIndex;
			const sum = float( 0 ).toVar();

			Loop( SKY_COLUMNS, ( { i } ) => {

				const power = textureLoad( target.texture, uvec2( i, row ) ).x.toVar();
				const value = select( power.greaterThan( 0 ).and( power.lessThan( 1e30 ) ), power, float( 0 ) ).toVar();

				sum.addAssign( value );
				table.element( row.mul( SKY_COLUMNS ).add( uint( i ) ) ).assign( vec4( value, sum, 0, 0 ) );

			} );

			table.element( row.add( SKY_CELLS ) ).assign( vec4( sum, 0, 0, 0 ) );

		} )().compute( SKY_ROWS );

		const sumSky = Fn( () => {

			const total = float( 0 ).toVar();

			Loop( SKY_ROWS, ( { i } ) => {

				const item = table.element( uint( i ).add( SKY_CELLS ) );

				total.addAssign( item.x );
				item.assign( vec4( item.x, total, 0, 0 ) );

			} );

			// the density of a cell is its share of the total power over its solid angle

			Loop( SKY_ROWS, ( { i } ) => {

				const item = table.element( uint( i ).add( SKY_CELLS ) );
				const row = float( i );
				const solidAngle = sin( row.add( 1 ).div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ).sub( sin( row.div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ) ).mul( 2 * Math.PI / SKY_COLUMNS );

				item.assign( vec4( item.xy, select( total.greaterThan( 0 ), float( 1 ).div( total.mul( solidAngle ) ), float( 0 ) ), 0 ) );

			} );

		} )().compute( 1 );

		renderer.compute( [ sumRows, sumSky ] );

		sumRows.dispose();
		sumSky.dispose();
		material.dispose();
		target.dispose();

		this._sky = storage( attribute, 'vec4', SKY_CELLS + SKY_ROWS ).toReadOnly();

	}

	/**
	 * Creates the functions that trace rays through the BVH.
	 *
	 * @private
	 */
	_createTrace() {

		const bvh = this._bvh;
		const { index, nodes } = bvh.storage;
		const { sampleTrianglePoint } = bvh.fns;
		const triangles = this._triangles;

		// the BVH traversal: the closest hit for the gathering rays and any hit for the shadow rays. The
		// geometry is in world space, so the rays are not transformed

		// the distance to the entry of a ray into a node, or -1 if it misses the node within a distance

		const boundsDistance = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityBoundsDistance( origin: vec3f, invDir: vec3f, bounds: ${ bvhNodeBoundsStruct }, limit: f32 ) -> f32 {

				let tMinPlane = ( vec3f( bounds.min[ 0 ], bounds.min[ 1 ], bounds.min[ 2 ] ) - origin ) * invDir;
				let tMaxPlane = ( vec3f( bounds.max[ 0 ], bounds.max[ 1 ], bounds.max[ 2 ] ) - origin ) * invDir;
				let tMin = min( tMinPlane, tMaxPlane );
				let tMax = max( tMinPlane, tMaxPlane );

				let near = max( max( max( tMin.x, tMin.y ), tMin.z ), 0.0 );
				let far = min( min( tMax.x, tMax.y ), tMax.z );

				return select( - 1.0, near, far >= near && near <= limit );

			}
		`;

		const triangleHit = wgslTagCode/* wgsl */`
			let hit = ${ intersectRayTriangle }( ray, ${ triangles }[ ti * 3u ].xyz, ${ triangles }[ ti * 3u + 1u ].xyz, ${ triangles }[ ti * 3u + 2u ].xyz, 0.0 );
		`;

		// hits at the same distance, e.g. of coplanar triangles, go to the first triangle, so the result
		// does not depend on the order of the traversal

		const closestRange = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityClosestRange( ray: ${ rayStruct }, offset: u32, count: u32, result: ptr<function, ${ rayIntersectionResultStruct }> ) -> bool {

				var didHit = false;

				for ( var ti = offset; ti < offset + count; ti = ti + 1u ) {

					${ triangleHit }

					if ( hit.didHit && ( ray.maxDist <= 0.0 || hit.dist < ray.maxDist ) && ( ! result.didHit || hit.dist < result.dist || ( hit.dist == result.dist && ti < result.indices.w ) ) ) {

						result.didHit = true;
						result.dist = hit.dist;
						result.side = hit.side;
						result.barycoord = hit.barycoord;
						result.indices = vec4u( ${ index }[ ti * 3u ], ${ index }[ ti * 3u + 1u ], ${ index }[ ti * 3u + 2u ], ti );

						didHit = true;

					}

				}

				return didHit;

			}
		`;

		const shadowStruct = new StructTypeNode( { blocked: 'bool' }, 'RayTracedRadiosityShadow' );

		const shadowRange = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityShadowRange( ray: ${ rayStruct }, offset: u32, count: u32, result: ptr<function, ${ shadowStruct }> ) -> bool {

				for ( var ti = offset; ti < offset + count; ti = ti + 1u ) {

					${ triangleHit }

					if ( hit.didHit && ( ray.maxDist <= 0.0 || hit.dist < ray.maxDist ) ) {

						result.blocked = true;

						return true;

					}

				}

				return false;

			}
		`;

		// the merged geometry is one cluster, so the top level of the BVH is a single leaf that points to
		// the root of the triangles. The traversal tests both children of a node, descends into the
		// nearer one and pushes the other one with its entry distance, which is skipped once a closer
		// hit is found, see "Understanding the Efficiency of Ray Traversal on GPUs" (Aila and Laine, 2009)

		const nodeArray = nodes.proxyNode.value.array;
		const root = ( nodeArray[ 7 ] & 0xffff0000 ) !== 0 ? nodeArray[ 6 ] : 0;

		const traverse = ( name, resultStruct, range, closest ) => wgslTagFn/* wgsl */`
			// fn
			fn ${ name }( ray: ${ rayStruct }, result: ptr<function, ${ resultStruct }> ) -> bool {

				let invDir = 1.0 / ray.direction;
				var limit = select( 3.4e38, ray.maxDist, ray.maxDist > 0.0 );

				var stackNode: array<u32, ${ STACK_DEPTH }>;
				var stackDistance: array<f32, ${ STACK_DEPTH }>;
				var pointer = 0u;

				var current = ${ root }u;
				var pop = ${ boundsDistance }( ray.origin, invDir, ${ nodes }[ current ].bounds, limit ) < 0.0;

				loop {

					if ( ! pop ) {

						let node = ${ nodes }[ current ];
						let info = node.splitAxisOrTriangleCount;

						if ( ( info & 0xffff0000u ) != 0u ) {

							${ closest ? wgslTagCode/* wgsl */`

								if ( ${ range }( ray, node.rightChildOrTriangleOffset, info & 0xffffu, result ) ) {

									limit = result.dist;

								}

							` : wgslTagCode/* wgsl */`

								if ( ${ range }( ray, node.rightChildOrTriangleOffset, info & 0xffffu, result ) ) {

									return true;

								}

							` }

							pop = true;

						} else {

							let left = current + 1u;
							let right = current + node.rightChildOrTriangleOffset;
							let leftDistance = ${ boundsDistance }( ray.origin, invDir, ${ nodes }[ left ].bounds, limit );
							let rightDistance = ${ boundsDistance }( ray.origin, invDir, ${ nodes }[ right ].bounds, limit );

							if ( leftDistance >= 0.0 && rightDistance >= 0.0 ) {

								let leftFirst = leftDistance <= rightDistance;

								current = select( right, left, leftFirst );

								if ( pointer < ${ STACK_DEPTH }u ) {

									stackNode[ pointer ] = select( left, right, leftFirst );
									stackDistance[ pointer ] = max( leftDistance, rightDistance );
									pointer += 1u;

								}

							} else if ( leftDistance >= 0.0 ) {

								current = left;

							} else if ( rightDistance >= 0.0 ) {

								current = right;

							} else {

								pop = true;

							}

						}

					}

					if ( pop ) {

						// the pushed nodes behind the closest hit are skipped

						loop {

							if ( pointer == 0u ) {

								return ${ closest ? 'result.didHit' : 'false' };

							}

							pointer -= 1u;

							if ( stackDistance[ pointer ] <= limit ) {

								break;

							}

						}

						current = stackNode[ pointer ];
						pop = false;

					}

				}

			}
		`;

		const closestHit = traverse( 'rayTracedRadiosityClosestHit', rayIntersectionResultStruct, closestRange, true );
		const anyHit = traverse( 'rayTracedRadiosityAnyHit', shadowStruct, shadowRange, false );

		// traces a ray and returns the barycentric coordinates of the hit and the triangle plus one,
		// negated for back faces, or zeros if nothing is hit

		this._trace = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityTrace( origin: vec3f, direction: vec3f ) -> vec3f {

				var ray: ${ rayStruct };
				ray.origin = origin;
				ray.direction = direction;
				ray.maxDist = 0.0;

				var hit: ${ rayIntersectionResultStruct };
				${ closestHit }( ray, &hit );

				if ( ! hit.didHit ) {

					return vec3f( 0.0 );

				}

				return vec3f( hit.barycoord.yz, hit.side * ( f32( hit.indices.w ) + 1.0 ) );

			}
		`;

		// the light map UV of a hit

		this._surface = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiositySurface( hit: vec3f ) -> vec2f {

				let ti = u32( abs( hit.z ) ) - 1u;
				let indices = vec3u( ${ index }[ ti * 3u ], ${ index }[ ti * 3u + 1u ], ${ index }[ ti * 3u + 2u ] );

				return ${ sampleTrianglePoint }( vec3f( 1.0 - hit.x - hit.y, hit.xy ), indices ).uv1;

			}
		`;

		// whether a shadow ray reaches a distance, zero means unbounded

		this._visibility = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityVisibility( origin: vec3f, direction: vec3f, maxDist: f32 ) -> f32 {

				var ray: ${ rayStruct };
				ray.origin = origin;
				ray.direction = direction;
				ray.maxDist = maxDist;

				var shadow: ${ shadowStruct };
				shadow.blocked = false;

				${ anyHit }( ray, &shadow );

				return select( 1.0, 0.0, shadow.blocked );

			}
		`;

	}

	/**
	 * Solves the cached bounces. Every iteration gathers one sample from the previous one, then the
	 * converged estimate is refined by accumulating samples.
	 *
	 * @private
	 */
	_solve() {

		const cache = this._cache;

		cache.addObjects( this._lightMapMeshes );

		// render targets start undefined, the first iteration must sample zero bounces

		cache.update( 0 );

		for ( let i = 0; i < this.bounces; i ++ ) {

			cache.reset();
			cache.update();

		}

		cache.reset();
		cache.update( this.cacheSamples );

	}

	/**
	 * Returns the irradiance gathered with rays at a world-space position and normal.
	 *
	 * @private
	 * @param {Node<vec3>} positionNode - The world-space position.
	 * @param {Node<vec3>} normalNode - The world-space normal.
	 * @param {boolean} analyticLights - Whether to add the direct light of the analytic lights.
	 * @return {Node<vec3>} The irradiance.
	 */
	_gather( positionNode, normalNode, analyticLights ) {

		// the shader is built on first use, after the cache that it samples is created

		return Fn( () => {

			const rays = this.rays;
			const trace = this._trace;
			const visibility = this._visibility;
			const materials = this._materials;
			const triangles = this._triangles;
			const lights = this._lights;
			const emitters = this._emitters;
			const emitterCount = this._emitterCount;
			const cache = this._cache !== null ? texture( this._cache.texture ) : null;
			const environment = this._environment;
			const sky = this._sky;

			// the sky radiance in a world direction, times pi, and the density of sampling it by the sky table

			const skyRadiance = ( direction ) => pmremTexture( environment, this._environmentRotation.mul( direction ), float( 0 ) ).rgb.mul( this._environmentIntensity.mul( Math.PI ) );

			const skyDensity = ( direction ) => {

				const local = this._environmentRotation.mul( direction ).xyz.toVar();
				const column = int( atan( local.z, local.x ).div( 2 * Math.PI ).add( 0.5 ).mul( SKY_COLUMNS ) ).clamp( 0, SKY_COLUMNS - 1 );
				const row = int( asin( local.y.clamp( - 1, 1 ) ).div( Math.PI ).add( 0.5 ).mul( SKY_ROWS ) ).clamp( 0, SKY_ROWS - 1 );

				return sky.element( row.mul( SKY_COLUMNS ).add( column ) ).x.mul( sky.element( row.add( SKY_CELLS ) ).z );

			};

			// the first of the items of the sky table from an offset whose sum of powers exceeds a target, by
			// a binary search of a power of two items

			const searchSky = ( offset, count, target ) => {

				const low = int( 0 ).toVar();
				const high = int( count - 1 ).toVar();

				Loop( Math.log2( count ), () => {

					const middle = low.add( high ).shiftRight( 1 ).toVar();

					If( sky.element( middle.add( offset ) ).y.greaterThan( target ), () => {

						high.assign( middle );

					} ).Else( () => {

						low.assign( middle.add( 1 ) );

					} );

				} );

				return low;

			};

			// power heuristic of two strategies with one sample each

			const misWeight = ( density, otherDensity ) => density.mul( density ).div( density.mul( density ).add( otherDensity.mul( otherDensity ) ).max( 1e-20 ) );

			const position = positionNode.toVar();

			// a degenerate normal would poison the light map with NaNs

			const normalLength = length( normalNode ).toVar();
			const normal = select( normalLength.greaterThan( 1e-8 ), normalNode.div( normalLength ), vec3( 0, 1, 0 ) ).toVar();

			// rays start above the receiving face and must leave it, otherwise they would hit the face
			// itself or the inside of a curved surface

			const face = cross( dFdx( position ), dFdy( position ) ).toVar();
			const faceLength = length( face ).toVar();
			const faceNormal = select( faceLength.greaterThan( 1e-12 ), face.div( faceLength ), normal ).toVar();
			faceNormal.assign( select( dot( faceNormal, normal ).lessThan( 0 ), faceNormal.negate(), faceNormal ) );

			const origin = position.add( faceNormal.mul( this._biasNode ) ).toVar();

			const [ tangent, bitangent ] = orthonormalBasis( normal );

			// the low-discrepancy sequences continue over the samples, with one of nine random offsets per
			// pixel, which decorrelates neighbouring pixels but keeps the rays of a workgroup coherent

			const pixel = uvec2( screenCoordinate.xy );
			const seed = uint( hash( pixel.x.add( pixel.y.mul( 65536 ) ) ).mul( 9 ) ).min( 8 ).mul( 8 ).toVar();
			const offset = vec2( hash( seed ), hash( seed.add( 1 ) ) ).toVar();
			const emitterOffset = vec3( hash( seed.add( 2 ) ), hash( seed.add( 3 ) ), hash( seed.add( 4 ) ) ).toVar();
			const skyOffset = vec3( hash( seed.add( 5 ) ), hash( seed.add( 6 ) ), hash( seed.add( 7 ) ) ).toVar();

			const gathered = vec3( 0 ).toVar();

			Loop( rays, ( { i } ) => {

				const n = this._passNode.mul( rays ).add( uint( i ) ).toVar();

				// cosine-distributed gathering ray

				const u = fract( offset.add( vec2( float( n.mul( R2[ 0 ] ) ), float( n.mul( R2[ 1 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();
				const radius = sqrt( u.x );
				const phi = u.y.mul( 2 * Math.PI );
				const direction = tangent.mul( radius.mul( cos( phi ) ) ).add( bitangent.mul( radius.mul( sin( phi ) ) ) ).add( normal.mul( sqrt( u.x.oneMinus().max( 0 ) ) ) ).toVar();

				If( dot( direction, faceNormal ).greaterThan( 0 ), () => {

					const hit = trace( origin, direction ).toVar();

					const surface = If( hit.z.notEqual( 0 ), () => {

						// light leaving the visible sides of the hit surface, times pi: the cached bounces reflected
						// by the diffuse color. The emitted light is sampled with the shadow rays below

						if ( cache !== null ) {

							const base = int( triangles.element( int( abs( hit.z ) ).sub( 1 ).mul( 3 ) ).w ).mul( MATERIAL_STRIDE ).toVar();
							const front = materials.element( base ).toVar();
							const facing = select( hit.z.lessThan( 0 ), materials.element( base.add( 1 ) ).w, front.w );

							gathered.addAssign( front.rgb.mul( cache.sample( this._surface( hit ) ).level( 0 ).rgb ).mul( facing ) );

						}

					} );

					// rays that leave the scene see the sky, weighted against sampling it with the shadow rays

					if ( environment !== null ) {

						surface.Else( () => {

							gathered.addAssign( skyRadiance( direction ).mul( misWeight( dot( normal, direction ).div( Math.PI ), skyDensity( direction ) ) ) );

						} );

					}

				} );

				// shadow ray to a random point on an emitter, picked by its power with a binary search of the
				// cumulative powers

				if ( emitterCount > 0 ) {

					const v = fract( emitterOffset.add( vec3( float( n.mul( R3[ 0 ] ) ), float( n.mul( R3[ 1 ] ) ), float( n.mul( R3[ 2 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();

					const low = int( 0 ).toVar();
					const high = int( emitterCount - 1 ).toVar();

					Loop( Math.ceil( Math.log2( emitterCount ) ), () => {

						const middle = low.add( high ).shiftRight( 1 ).toVar();

						If( emitters.element( middle.mul( EMITTER_STRIDE ) ).w.lessThan( v.x ), () => {

							low.assign( middle.add( 1 ) );

						} ).Else( () => {

							high.assign( middle );

						} );

					} );

					const base = low.mul( EMITTER_STRIDE ).toVar();
					const corner = emitters.element( base ).toVar();
					const edge1 = emitters.element( base.add( 1 ) ).toVar();
					const edge2 = emitters.element( base.add( 2 ) ).toVar();
					const emission = emitters.element( base.add( 3 ) ).toVar();

					const s = sqrt( v.y );
					const point = corner.xyz.add( edge1.xyz.mul( s.mul( v.z.oneMinus() ) ) ).add( edge2.xyz.mul( s.mul( v.z ) ) );
					const toLight = point.sub( origin ).toVar();
					const distanceSq = dot( toLight, toLight ).max( 1e-8 ).toVar();
					const distance = sqrt( distanceSq ).toVar();
					const direction = toLight.div( distance ).toVar();

					// the cosine at the emitter, by its emitting sides

					const cosLight = dot( normalize( cross( edge1.xyz, edge2.xyz ) ), direction ).negate().toVar();
					cosLight.assign( select( edge2.w.equal( 2 ), abs( cosLight ), select( edge2.w.equal( 1 ), cosLight.negate(), cosLight ) ) );

					const cosReceiver = dot( normal, direction ).toVar();

					If( cosReceiver.greaterThan( 0 ).and( cosLight.greaterThan( 0 ) ).and( dot( direction, faceNormal ).greaterThan( 0 ) ), () => {

						// the irradiance over the probability of the point, with the projected solid angle clamped to
						// the hemisphere next to an emitter

						const scale = cosReceiver.mul( cosLight ).mul( edge1.w ).div( distanceSq ).min( Math.PI ).div( emission.w );

						gathered.addAssign( emission.rgb.mul( scale ).mul( visibility( origin, direction, distance.mul( 0.999 ) ) ) );

					} );

				}

				// shadow ray to the sky, to a cell picked by its power, first its row and then its column by the
				// sums of the powers, and a uniformly distributed direction in the cell

				if ( sky !== null ) {

					const v = fract( skyOffset.add( vec3( float( n.mul( R3[ 0 ] ) ), float( n.mul( R3[ 1 ] ) ), float( n.mul( R3[ 2 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();

					const target = v.x.mul( sky.element( SKY_CELLS + SKY_ROWS - 1 ).y ).toVar();
					const rowIndex = searchSky( SKY_CELLS, SKY_ROWS, target ).toVar();
					const rowItem = sky.element( rowIndex.add( SKY_CELLS ) ).toVar();

					target.subAssign( rowItem.y.sub( rowItem.x ) );

					const columnIndex = searchSky( rowIndex.mul( SKY_COLUMNS ), SKY_COLUMNS, target ).toVar();
					const density = sky.element( rowIndex.mul( SKY_COLUMNS ).add( columnIndex ) ).x.mul( rowItem.z ).toVar();

					const column = float( columnIndex );
					const row = float( rowIndex );
					const phi = column.add( v.y ).div( SKY_COLUMNS ).sub( 0.5 ).mul( 2 * Math.PI ).toVar();
					const z = mix( sin( row.div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ), sin( row.add( 1 ).div( SKY_ROWS ).sub( 0.5 ).mul( Math.PI ) ), v.z ).toVar();
					const r = sqrt( z.mul( z ).oneMinus().max( 0 ) );
					const direction = normalize( this._environmentInverseRotation.mul( vec3( r.mul( cos( phi ) ), z, r.mul( sin( phi ) ) ) ).xyz ).toVar();
					const cosReceiver = dot( normal, direction ).toVar();

					If( cosReceiver.greaterThan( 0 ).and( density.greaterThan( 0 ) ).and( dot( direction, faceNormal ).greaterThan( 0 ) ), () => {

						const weight = misWeight( density, cosReceiver.div( Math.PI ) );

						gathered.addAssign( skyRadiance( direction ).mul( cosReceiver.mul( weight ).mul( visibility( origin, direction, float( 0 ) ) ).div( density.mul( Math.PI ) ) ) );

					} );

				}

			} );

			const irradiance = gathered.div( rays ).toVar();

			// direct light of the directional, point and spot lights with a shadow ray to each one: the
			// distance attenuation of point and spot lights, see getDistanceAttenuation(), and the cone of
			// spot lights, see SpotLightNode

			if ( analyticLights && this._lightCount > 0 ) {

				Loop( this._lightCount, ( { i } ) => {

					const location = lights.element( i.mul( LIGHT_STRIDE ) ).toVar();
					const color = lights.element( i.mul( LIGHT_STRIDE ).add( 1 ) ).toVar();
					const falloff = lights.element( i.mul( LIGHT_STRIDE ).add( 2 ) ).toVar();
					const axis = lights.element( i.mul( LIGHT_STRIDE ).add( 3 ) ).toVar();

					const isLocal = location.w.greaterThan( 0.5 );
					const toLight = select( isLocal, location.xyz.sub( origin ), location.xyz ).toVar();
					const distance = select( isLocal, length( toLight ), float( 0 ) ).toVar();
					const direction = select( isLocal, toLight.div( distance.max( 1e-8 ) ), toLight ).toVar();
					const cosReceiver = dot( normal, direction ).toVar();

					If( cosReceiver.greaterThan( 0 ).and( dot( direction, faceNormal ).greaterThan( 0 ) ), () => {

						const cutoff = select( falloff.x.greaterThan( 0 ), distance.div( falloff.x.max( 1e-8 ) ).pow( 4 ).oneMinus().clamp( 0, 1 ).pow2(), float( 1 ) );
						const spot = select( location.w.greaterThan( 1.5 ), smoothstep( falloff.z, falloff.w, dot( direction, axis.xyz ) ), float( 1 ) );
						const attenuation = select( isLocal, cutoff.mul( spot ).div( distance.pow( falloff.y ).max( 0.01 ) ), float( 1 ) );
						const light = color.rgb.mul( cosReceiver.mul( attenuation ) ).toVar();

						If( dot( light, vec3( 1 ) ).greaterThan( 0 ), () => {

							// the shadow ray ends just before point and spot lights, it is unbounded towards directional lights

							const reach = select( isLocal, distance.mul( 0.999 ).max( 1e-6 ), float( 0 ) );

							irradiance.addAssign( light.mul( visibility( origin, direction, reach ) ) );

						} );

					} );

				} );

			}

			return irradiance;

		} )();

	}

}

/**
 * Creates a world-space diffuse irradiance sampler for a prepared {@link RayTracedRadiosity}, for
 * {@link LightMapper}. Call `radiosity.update( renderer, scene )` before creating it. Every render
 * call that uses the sampler continues the ray sequences, so the samples of a light mapper converge.
 *
 * @param {RayTracedRadiosity} radiosity - The prepared radiosity solver.
 * @param {Object} [options] - The options.
 * @param {boolean} [options.analyticLights=false] - Whether to also gather the direct light of the directional, point and spot lights, with shadow rays. Otherwise it is left to the materials.
 * @return {function(Node<vec3>, Node<vec3>): Node<vec3>} The irradiance sampler.
 */
function rayTracedRadiosityIrradiance( radiosity, { analyticLights = false } = {} ) {

	return ( position, normal ) => radiosity._gather( position, normal, analyticLights );

}

/**
 * Packs the emissive triangles for sampling by their power: the corner and the cumulative share of
 * the power, the edges with the area and the emitting sides, and the emission with the share of the
 * power of the triangle.
 *
 * @private
 * @param {Array<Object>} emitters - The emissive triangles.
 * @return {Array<number>} The emitters, four vectors per triangle.
 */
function createEmitters( emitters ) {

	const powers = emitters.map( ( { area, emission, side } ) => area * ( 0.2126 * emission.r + 0.7152 * emission.g + 0.0722 * emission.b ) * ( side === DoubleSide ? 2 : 1 ) );
	const total = powers.reduce( ( sum, power ) => sum + power, 0 );
	const data = [];

	let cumulative = 0;

	for ( let i = 0; i < emitters.length; i ++ ) {

		const { a, e1, e2, area, emission, side } = emitters[ i ];

		cumulative += powers[ i ];

		data.push(
			a.x, a.y, a.z, i === emitters.length - 1 ? 1 : cumulative / total,
			e1.x, e1.y, e1.z, area,
			e2.x, e2.y, e2.z, side === DoubleSide ? 2 : ( side === BackSide ? 1 : 0 ),
			emission.r, emission.g, emission.b, powers[ i ] / total
		);

	}

	return data;

}

/**
 * Returns a tangent and bitangent around a unit vector, see "Building an Orthonormal Basis,
 * Revisited" (Duff et al., 2017).
 *
 * @private
 * @param {Node<vec3>} normal - The unit vector.
 * @return {Array<Node<vec3>>} The tangent and bitangent.
 */
function orthonormalBasis( normal ) {

	const signZ = select( normal.z.greaterThanEqual( 0 ), float( 1 ), float( - 1 ) );
	const a = float( - 1 ).div( signZ.add( normal.z ) );
	const b = normal.x.mul( normal.y ).mul( a );
	const tangent = vec3( normal.x.mul( normal.x ).mul( a ).mul( signZ ).add( 1 ), b.mul( signZ ), normal.x.mul( signZ ).negate() ).toVar();
	const bitangent = vec3( b, normal.y.mul( normal.y ).mul( a ).add( signZ ), normal.y.negate() ).toVar();

	return [ tangent, bitangent ];

}

/**
 * Creates a read-only storage buffer of vec4 values.
 *
 * @private
 * @param {Array<number>|Float32Array} data - The values, four per item.
 * @return {StorageBufferNode} The storage buffer.
 */
function vec4Storage( data ) {

	const array = new Float32Array( Math.max( data.length, 4 ) );
	array.set( data );

	return storage( new StorageBufferAttribute( array, 4 ), 'vec4', array.length / 4 ).toReadOnly();

}

export { RayTracedRadiosity, rayTracedRadiosityIrradiance };
