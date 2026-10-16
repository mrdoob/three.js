import { BackSide, BufferAttribute, BufferGeometry, Color, DoubleSide, Node, NodeUpdateType, StorageBufferAttribute, Vector3 } from 'three/webgpu';
import { Fn, If, Loop, abs, cos, cross, dFdx, dFdy, dot, float, fract, hash, int, length, nodeObject, normalize, screenCoordinate, select, sin, sqrt, storage, texture, uint, uniform, uvec2, vec2, vec3, vec4 } from 'three/tsl';
import { BVHComputeData, rayIntersectionResultStruct, rayStruct, wgslTagFn } from 'three-mesh-bvh/webgpu';

import { LightMapper } from './LightMapper.js';

const _a = /*@__PURE__*/ new Vector3();
const _b = /*@__PURE__*/ new Vector3();
const _c = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();

// fixed point increments of the R2 and R3 low-discrepancy sequences, see
// https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/

const R2 = [ 3242174889, 2447445414 ];
const R3 = [ 3518319154, 2882110346, 2360945575 ];

/**
 * Approximates diffuse global illumination with ray traced radiosity. Every sample casts
 * cosine-distributed rays from each point through a {@link https://github.com/gkjohnson/three-mesh-bvh three-mesh-bvh}
 * BVH of the scene, and looks up the light leaving the hit surfaces in a light map of the bounces.
 * Emissive surfaces are sampled directly, with a shadow ray per sample, unless `lightSampling` is
 * disabled, which makes the gather an exact ray traced counterpart of {@link StochasticRadiosity}.
 *
 * Further bounces are cached in a light map that `update()` solves iteratively, so the meshes need
 * light map UVs in `uv1`, e.g. generated with {@link unwrapUVs}.
 *
 * ```js
 * const radiosity = new RayTracedRadiosity();
 * radiosity.update( renderer, scene );
 *
 * const lightMapper = new LightMapper( renderer, size, rayTracedRadiosityIrradiance( radiosity ) );
 * ```
 *
 * The scene is collected by `update()`: call it again after changing the scene and create new
 * samplers afterwards. Model lights as emissive meshes, analytic lights are ignored. Only the
 * colors of the materials are used, texture maps are ignored. Skinned, instanced and batched meshes
 * are ignored, and all surfaces are treated as opaque.
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
	 * @param {number} [options.rays=8] - The default number of rays cast per point and sample.
	 * @param {boolean} [options.lightSampling=true] - Whether emissive surfaces are sampled directly with shadow rays.
	 * Otherwise they are only found by the gathering rays, which is much noisier for small lights.
	 * @param {number} [options.bounces=16] - The number of iterations used to solve the cached bounces. Each iteration adds one bounce, `0` disables the cache.
	 * @param {number} [options.cacheSamples=32] - The number of samples accumulated into the bounce cache after the iterations.
	 * @param {number} [options.cacheSize=256] - The size of the bounce cache light map in texels.
	 */
	constructor( { rays = 8, lightSampling = true, bounces = 16, cacheSamples = 32, cacheSize = 256 } = {} ) {

		/**
		 * The default number of rays cast per point and sample.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.rays = rays;

		/**
		 * Whether emissive surfaces are sampled directly with shadow rays.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.lightSampling = lightSampling;

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
		this._materials = null;
		this._emitters = null;
		this._emitterCount = 0;
		this._lightMapMeshes = [];
		this._cache = null;

		this._biasNode = uniform( this.bias );
		this._passNode = uniform( 0, 'uint' );
		this._pass = 0;
		this._renderId = - 1;

	}

	/**
	 * The cached indirect irradiance, or `null` if the cache is disabled. It uses `uv1` and the
	 * conventions of {@link LightMapper#texture}.
	 *
	 * @type {?Texture}
	 */
	get texture() {

		return this._cache !== null ? this._cache.texture : null;

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

		if ( this.bounces > 0 ) {

			this._cache = new LightMapper( renderer, this.cacheSize, rayTracedRadiosityIrradiance( this ) );
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
	 * Disposes the BVH and the bounce cache.
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

		if ( this._cache !== null ) {

			this._cache.dispose();
			this._cache = null;

		}

	}

	/**
	 * Merges the visible meshes into one world space geometry, builds its BVH and stores the
	 * materials and emissive triangles.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 */
	_collect( scene ) {

		scene.updateMatrixWorld();

		const positions = [];
		const surfaces = [];
		const materials = [];
		const emitters = [];
		const entries = new Map();
		const lightMapMeshes = [];

		// one entry per material and light map availability: the albedo and front side visibility,
		// then the emitted radiance and back side visibility. Without light map UVs the albedo is
		// zero, since the surface can not sample the cached bounces

		const getEntry = ( material, hasLightMapUV ) => {

			const key = material.uuid + hasLightMapUV;

			if ( entries.has( key ) === false ) {

				const albedo = new Color( 0, 0, 0 );
				const emission = new Color( 0, 0, 0 );

				if ( material.isMeshBasicMaterial === true ) {

					// unlit surfaces emit their color

					if ( material.color !== undefined ) emission.copy( material.color );

				} else {

					if ( material.color !== undefined && hasLightMapUV ) albedo.copy( material.color ).multiplyScalar( 1 - ( material.metalness ?? 0 ) );
					if ( material.emissive !== undefined ) emission.copy( material.emissive ).multiplyScalar( material.emissiveIntensity ?? 1 );

				}

				const front = material.side !== BackSide ? 1 : 0;
				const back = material.side === BackSide || material.side === DoubleSide ? 1 : 0;

				entries.set( key, { index: entries.size, emission, side: material.side } );
				materials.push( albedo.r, albedo.g, albedo.b, front, emission.r, emission.g, emission.b, back );

			}

			return entries.get( key );

		};

		scene.traverseVisible( ( object ) => {

			if ( object.isMesh !== true || object.isSkinnedMesh || object.isInstancedMesh || object.isBatchedMesh ) return;

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
						surfaces.push( uv1 !== undefined ? uv1.getX( vertex ) : 0, uv1 !== undefined ? uv1.getY( vertex ) : 0, entry.index, 0 );

					}

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

		// the triangles are not shared, so each one carries its light map UVs and material

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.setAttribute( 'surface', new BufferAttribute( new Float32Array( surfaces ), 4 ) );
		geometry.setIndex( new BufferAttribute( new Uint32Array( positions.length / 3 ).map( ( value, i ) => i ), 1 ) );

		const bvh = new BVHComputeData( geometry, { attributes: { position: 'vec4f', surface: 'vec4f' } } );
		bvh.update();

		this._geometry = geometry;
		this._bvh = bvh;
		this._lightMapMeshes = lightMapMeshes;

		// storage buffers of length one would be converted to scalars, so they hold at least two items

		this._materials = vec4Storage( materials );
		this._emitters = this._createEmitters( emitters );
		this._emitterCount = emitters.length;

		// traces a ray and returns the light map UV of the hit, the material entry plus one, negated
		// for back faces, and the distance, or zeros if nothing is hit

		const { raycastFirstHit, sampleTrianglePoint } = bvh.fns;

		this._trace = wgslTagFn/* wgsl */`
			// fn
			fn rayTracedRadiosityTrace( origin: vec3f, direction: vec3f, maxDist: f32 ) -> vec4f {

				var ray: ${ rayStruct };
				ray.origin = origin;
				ray.direction = direction;
				ray.maxDist = maxDist;

				var hit: ${ rayIntersectionResultStruct };
				${ raycastFirstHit }( ray, &hit );

				if ( ! hit.didHit ) {

					return vec4f( 0.0 );

				}

				let surface = ${ sampleTrianglePoint }( hit.barycoord, hit.indices.xyz ).surface;

				return vec4f( surface.xy, hit.side * ( round( surface.z ) + 1.0 ), hit.dist );

			}
		`;

	}

	/**
	 * Stores the emissive triangles with the cumulative distribution of their emitted power.
	 *
	 * @private
	 * @param {Array<Object>} emitters - The emissive triangles.
	 * @return {StorageBufferNode} The emitters, four vectors per triangle.
	 */
	_createEmitters( emitters ) {

		const power = emitters.map( ( { area, emission, side } ) => area * ( emission.r + emission.g + emission.b ) * ( side === DoubleSide ? 2 : 1 ) );
		const total = power.reduce( ( sum, value ) => sum + value, 0 );

		const data = [];
		let cumulative = 0;

		for ( let i = 0; i < emitters.length; i ++ ) {

			const { a, e1, e2, area, emission, side } = emitters[ i ];

			cumulative += power[ i ] / total;

			// the inverse of the area density of the samples: the triangle area over its probability

			const weight = area * total / power[ i ];

			data.push(
				a.x, a.y, a.z, i === emitters.length - 1 ? 1 : cumulative,
				e1.x, e1.y, e1.z, weight,
				e2.x, e2.y, e2.z, side === DoubleSide ? 2 : ( side === BackSide ? 1 : 0 ),
				emission.r, emission.g, emission.b, 0
			);

		}

		return vec4Storage( data );

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

		for ( let i = 0; i < this.cacheSamples; i ++ ) cache.update();

	}

	/**
	 * Advances the sample sequence once per render call of the gathering materials.
	 *
	 * @private
	 * @param {NodeFrame} frame - The current node frame.
	 */
	_advance( frame ) {

		if ( frame.renderId === this._renderId ) return;

		this._renderId = frame.renderId;
		this._passNode.value = ++ this._pass;
		this._biasNode.value = this.bias;

	}

	/**
	 * Returns the irradiance gathered with rays at a world-space position and normal.
	 *
	 * @private
	 * @param {Node<vec3>} positionNode - The world-space position.
	 * @param {Node<vec3>} normalNode - The world-space normal.
	 * @param {number} rays - The number of rays per sample.
	 * @return {Node<vec3>} The irradiance.
	 */
	_gather( positionNode, normalNode, rays ) {

		const trace = this._trace;
		const materials = this._materials;
		const emitters = this._emitters;
		const emitterCount = this._emitterCount;
		const lightSampling = this.lightSampling;
		const cache = this._cache !== null ? texture( this._cache.texture ) : null;

		// binary search steps over the cumulative distribution of the emitters

		const steps = Math.ceil( Math.log2( Math.max( emitterCount, 1 ) ) );

		return Fn( () => {

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

			// orthonormal basis around the normal, see "Building an Orthonormal Basis, Revisited" (Duff et al., 2017)

			const signZ = select( normal.z.greaterThanEqual( 0 ), float( 1 ), float( - 1 ) );
			const a = float( - 1 ).div( signZ.add( normal.z ) );
			const b = normal.x.mul( normal.y ).mul( a );
			const tangent = vec3( normal.x.mul( normal.x ).mul( a ).mul( signZ ).add( 1 ), b.mul( signZ ), normal.x.mul( signZ ).negate() ).toVar();
			const bitangent = vec3( b, normal.y.mul( normal.y ).mul( a ).add( signZ ), normal.y.negate() ).toVar();

			// the low-discrepancy sequences continue over the samples, with a random offset per pixel

			const pixel = uvec2( screenCoordinate.xy );
			const seed = pixel.x.add( pixel.y.mul( 65536 ) ).mul( 5 ).toVar();
			const offset = vec4( hash( seed ), hash( seed.add( 1 ) ), hash( seed.add( 2 ) ), hash( seed.add( 3 ) ) ).toVar();
			const lightOffset = hash( seed.add( 4 ) ).toVar();

			const gathered = vec3( 0 ).toVar();
			const direct = vec3( 0 ).toVar();

			Loop( rays, ( { i } ) => {

				const n = this._passNode.mul( rays ).add( uint( i ) ).toVar();

				// cosine-distributed gathering ray

				if ( cache !== null || lightSampling === false ) {

					const u = fract( offset.xy.add( vec2( float( n.mul( R2[ 0 ] ) ), float( n.mul( R2[ 1 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();
					const radius = sqrt( u.x );
					const phi = u.y.mul( 2 * Math.PI );
					const direction = tangent.mul( radius.mul( cos( phi ) ) ).add( bitangent.mul( radius.mul( sin( phi ) ) ) ).add( normal.mul( sqrt( u.x.oneMinus().max( 0 ) ) ) ).toVar();

					If( dot( direction, faceNormal ).greaterThan( 0 ), () => {

						const hit = trace( origin, direction, float( 0 ) ).toVar();

						If( hit.z.notEqual( 0 ), () => {

							const entry = int( abs( hit.z ).sub( 1 ) ).mul( 2 ).toVar();
							const albedo = materials.element( entry ).toVar();
							const emission = materials.element( entry.add( 1 ) ).toVar();

							// light leaving the visible sides of the hit surface, times pi

							const facing = select( hit.z.lessThan( 0 ), emission.w, albedo.w );
							const radiance = vec3( 0 ).toVar();

							if ( cache !== null ) radiance.addAssign( albedo.rgb.mul( cache.sample( hit.xy ).level( 0 ).rgb ) );
							if ( lightSampling === false ) radiance.addAssign( emission.rgb.mul( Math.PI ) );

							gathered.addAssign( radiance.mul( facing ) );

						} );

					} );

				}

				// shadow ray to a random point on an emitter, chosen by power

				if ( lightSampling && emitterCount > 0 ) {

					const v = fract( vec3( lightOffset, offset.z, offset.w ).add( vec3( float( n.mul( R3[ 0 ] ) ), float( n.mul( R3[ 1 ] ) ), float( n.mul( R3[ 2 ] ) ) ).mul( 2 ** - 32 ) ) ).toVar();

					const low = int( 0 ).toVar();
					const high = int( emitterCount - 1 ).toVar();

					if ( steps > 0 ) {

						Loop( steps, () => {

							const middle = low.add( high ).div( 2 ).toVar();

							If( emitters.element( middle.mul( 4 ) ).w.lessThan( v.x ), () => {

								low.assign( middle.add( 1 ) );

							} ).Else( () => {

								high.assign( middle );

							} );

						} );

					}

					const base = low.mul( 4 ).toVar();
					const corner = emitters.element( base ).toVar();
					const edge1 = emitters.element( base.add( 1 ) ).toVar();
					const edge2 = emitters.element( base.add( 2 ) ).toVar();
					const emission = emitters.element( base.add( 3 ) ).toVar();

					const s = sqrt( v.y );
					const target = corner.xyz.add( edge1.xyz.mul( s.mul( v.z.oneMinus() ) ) ).add( edge2.xyz.mul( s.mul( v.z ) ) );
					const toLight = target.sub( origin ).toVar();
					const distanceSq = dot( toLight, toLight ).max( 1e-8 ).toVar();
					const distance = sqrt( distanceSq ).toVar();
					const direction = toLight.div( distance ).toVar();

					// cosine at the emitter, by its emitting sides

					const cosLight = dot( normalize( cross( edge1.xyz, edge2.xyz ) ), direction ).negate().toVar();
					cosLight.assign( select( edge2.w.equal( 2 ), abs( cosLight ), select( edge2.w.equal( 1 ), cosLight.negate(), cosLight ) ) );

					const cosReceiver = dot( normal, direction ).toVar();

					If( cosReceiver.greaterThan( 0 ).and( cosLight.greaterThan( 0 ) ).and( dot( direction, faceNormal ).greaterThan( 0 ) ), () => {

						const shadow = trace( origin, direction, distance.mul( 0.999 ) );

						If( shadow.z.equal( 0 ), () => {

							direct.addAssign( emission.rgb.mul( cosReceiver.mul( cosLight ).mul( edge1.w ).div( distanceSq ) ) );

						} );

					} );

				}

			} );

			return gathered.add( direct ).div( rays );

		} )();

	}

}

/**
 * Gathers the irradiance of a {@link RayTracedRadiosity} solver and advances its sample sequence
 * once per render call.
 *
 * @private
 * @augments Node
 */
class RayTracedRadiosityIrradianceNode extends Node {

	static get type() {

		return 'RayTracedRadiosityIrradianceNode';

	}

	/**
	 * Constructs a new ray traced radiosity irradiance node.
	 *
	 * @param {RayTracedRadiosity} radiosity - The radiosity solver.
	 * @param {Node<vec3>} positionNode - The world-space position.
	 * @param {Node<vec3>} normalNode - The world-space normal.
	 * @param {number} rays - The number of rays per sample.
	 */
	constructor( radiosity, positionNode, normalNode, rays ) {

		super( 'vec3' );

		this.radiosity = radiosity;
		this.positionNode = positionNode;
		this.normalNode = normalNode;
		this.rays = rays;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore( frame ) {

		this.radiosity._advance( frame );

	}

	setup() {

		return this.radiosity._gather( this.positionNode, this.normalNode, this.rays );

	}

}

/**
 * Creates a world-space diffuse irradiance sampler for a prepared {@link RayTracedRadiosity}.
 * Call `radiosity.update( renderer, scene )` before creating it. Every render call that uses the
 * sampler continues the ray sequences, so the samples of {@link LightMapper} converge.
 *
 * @param {RayTracedRadiosity} radiosity - The prepared radiosity solver.
 * @param {Object} [options] - The options.
 * @param {number} [options.rays=radiosity.rays] - The number of rays cast per point and sample.
 * @return {function(Node<vec3>, Node<vec3>): Node<vec3>} The irradiance sampler.
 */
function rayTracedRadiosityIrradiance( radiosity, { rays = radiosity.rays } = {} ) {

	return ( position, normal ) => nodeObject( new RayTracedRadiosityIrradianceNode( radiosity, position, normal, rays ) );

}

/**
 * Creates a read-only storage buffer of vec4 values.
 *
 * @private
 * @param {Array<number>} data - The values, four per item.
 * @return {StorageBufferNode} The storage buffer.
 */
function vec4Storage( data ) {

	const array = new Float32Array( Math.max( data.length, 8 ) );
	array.set( data );

	return storage( new StorageBufferAttribute( array, 4 ), 'vec4', array.length / 4 ).toReadOnly();

}

export { RayTracedRadiosity, rayTracedRadiosityIrradiance };
