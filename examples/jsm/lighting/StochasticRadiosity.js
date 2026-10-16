import { ArrayCamera, Box3, FloatType, Mesh, MeshBasicNodeMaterial, MeshLambertNodeMaterial, NearestFilter, Node, NodeUpdateType, OrthographicCamera, Quaternion, RendererUtils, RenderTarget, Scene, Vector2, Vector3, Vector4 } from 'three/webgpu';
import { Fn, If, Loop, cameraIndex, context, cross, dFdx, dFdy, dot, float, hash, int, interleavedGradientNoise, ivec2, length, lights, nodeObject, output, positionWorld, screenCoordinate, select, texture, uniform, uniformArray, vec2, vec3, vec4 } from 'three/tsl';

import { LightMapper } from './LightMapper.js';

const _box = /*@__PURE__*/ new Box3();
const _quaternion = /*@__PURE__*/ new Quaternion();
const _corner = /*@__PURE__*/ new Vector3();
const _target = /*@__PURE__*/ new Vector3();
const _center = /*@__PURE__*/ new Vector3();

let _rendererState;

/**
 * Approximates diffuse global illumination with radiosity based on stochastic depth buffering,
 * following [Approximate Radiosity using Stochastic Depth Buffering]{@link https://www.xevius.org/papers/approxradpaper2010.pdf}
 * (Thomsen and Nielsen, 2010).
 *
 * Every illumination pass rasterizes the scene along a set of global directions at once with an
 * {@link ArrayCamera}: each direction is an orthographic view fitted to the scene and rendered into
 * its own tile of one "illumination map", storing the outgoing diffuse radiance and the distance
 * along the direction of the visible surface. A random fragment depth shuffles overlapping
 * surfaces, so a small texel neighborhood statistically represents all surfaces along a ray.
 * Irradiance is gathered by projecting a point into every tile and taking the nearest surface in
 * front of it. The directions are rotated by a low-discrepancy sequence on every pass, so the
 * samples converge as they are accumulated, e.g. by {@link LightMapper}.
 *
 * Direct lights are evaluated analytically with their shadow maps. Further bounces are cached in a
 * light map that `update()` solves iteratively, so the meshes need light map UVs in `uv1`, e.g.
 * generated with {@link unwrapUVs}. Emissive surfaces are light sources as well.
 *
 * ```js
 * const radiosity = new StochasticRadiosity();
 * radiosity.update( renderer, scene );
 *
 * const lightMapper = new LightMapper( renderer, size, radiosityIrradiance( radiosity ) );
 * ```
 *
 * Call `update()` again after changing the scene or the lighting. Lights should cast shadows, and
 * `renderer.shadowMap` must be enabled; unshadowed lights shine through walls. Rect area lights are
 * ignored, model area lights as emissive meshes instead, which the gather also shadows. Skinned,
 * instanced and batched meshes are ignored, and all surfaces are treated as opaque.
 *
 * This class can only be used with {@link WebGPURenderer}.
 *
 * @three_import import { StochasticRadiosity, radiosityIrradiance } from 'three/addons/lighting/StochasticRadiosity.js';
 */
class StochasticRadiosity {

	/**
	 * Constructs a new stochastic radiosity solver.
	 *
	 * @param {Object} [options] - The options.
	 * @param {number} [options.directions=16] - The number of directions rasterized per illumination pass.
	 * @param {number} [options.resolution=256] - The resolution of each direction's tile in the illumination map.
	 * @param {number} [options.gatherRadius=1] - The half width of the gathered texel neighborhood, `1` is 3x3 and `2` is 5x5.
	 * Larger neighborhoods find more occluders and leak less light, but are slower.
	 * @param {number} [options.bounces=16] - The number of iterations used to solve the cached bounces. Each iteration adds one bounce, `0` disables the cache.
	 * @param {number} [options.cacheSamples=32] - The number of samples accumulated into the bounce cache after the iterations.
	 * @param {number} [options.cacheSize=256] - The size of the bounce cache light map in texels.
	 */
	constructor( { directions = 16, resolution = 256, gatherRadius = 1, bounces = 16, cacheSamples = 32, cacheSize = 256 } = {} ) {

		/**
		 * The number of directions rasterized per illumination pass.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.directions = directions;

		/**
		 * The resolution of each direction's tile in the illumination map.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.resolution = resolution;

		/**
		 * The half width of the gathered texel neighborhood.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.gatherRadius = gatherRadius;

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
		 * Distance, in illumination map texels, that a gathered surface must lie in front of the
		 * plane of the receiving face. Raise it if surfaces show self-illumination acne, lower it if
		 * contact shadows leak, e.g. under round objects resting on the floor.
		 *
		 * @type {number}
		 * @default 0.05
		 */
		this.bias = 0.05;

		// illumination map, one tile per direction. Float distances keep the reconstructed surfaces
		// exact enough for a bias far below a texel, which closes contact gaps.

		this._tilesX = Math.ceil( Math.sqrt( directions ) );
		this._tilesY = Math.ceil( directions / this._tilesX );

		this._illuminationMap = new RenderTarget( this._tilesX * resolution, this._tilesY * resolution, {
			type: FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			generateMipmaps: false
		} );

		this._directionData = [];
		this._originData = [];
		this._basisUData = [];
		this._basisVData = [];
		this._sizeData = [];
		this._baseDirections = [];
		this._cameras = [];

		for ( let i = 0; i < directions; i ++ ) {

			this._directionData.push( new Vector3( 0, 0, - 1 ) );
			this._originData.push( new Vector3() );
			this._basisUData.push( new Vector3( 1, 0, 0 ) );
			this._basisVData.push( new Vector3( 0, 1, 0 ) );
			this._sizeData.push( new Vector2( 1, 1 ) );
			this._baseDirections.push( fibonacciSphere( i, directions ) );

			const camera = new OrthographicCamera();
			camera.viewport = new Vector4( ( i % this._tilesX ) * resolution, Math.floor( i / this._tilesX ) * resolution, resolution, resolution );
			this._cameras.push( camera );

		}

		this._arrayCamera = new ArrayCamera( this._cameras );

		this._directionNode = uniformArray( this._directionData, 'vec3' );
		this._originNode = uniformArray( this._originData, 'vec3' );
		this._basisUNode = uniformArray( this._basisUData, 'vec3' );
		this._basisVNode = uniformArray( this._basisVData, 'vec3' );
		this._sizeNode = uniformArray( this._sizeData, 'vec2' );
		this._biasNode = uniform( 0 );
		this._seedNode = uniform( 0 );

		// one binding shared by all taps of the gather

		this._illuminationNode = texture( this._illuminationMap.texture );

		// scene proxies rendered by the illumination pass

		this._scene = new Scene();
		this._proxies = [];
		this._materials = [];
		this._lights = [];
		this._lightMapMeshes = [];
		this._bounds = new Box3();
		this._radius = 1;
		this._pass = 0;
		this._renderId = - 1;
		this._rendering = false;
		this._cache = null;

		// nested renders inherit the context of the outer render, e.g. a pass node that applies
		// the gathered irradiance, so the internal renders use their own

		this._contextNode = context();

		// renders the shadow maps of the collected scene, see _renderShadows()

		this._shadowTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._shadowCamera = new OrthographicCamera();

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
	 * Collects the meshes and lights of the scene, renders the shadow maps of the lights and solves
	 * the cached bounces. Call this again after changing the scene or the lighting.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 */
	update( renderer, scene ) {

		this._clear();

		if ( this.bounces > 0 ) this._cache = new LightMapper( renderer, this.cacheSize, radiosityIrradiance( this ) );

		this._collect( scene );
		this._renderShadows( renderer );

		if ( this._cache !== null ) this._solve();

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._clear();

		this._illuminationMap.dispose();
		this._shadowTarget.dispose();

	}

	/**
	 * Removes the collected scene and disposes the bounce cache.
	 *
	 * @private
	 */
	_clear() {

		for ( const material of this._materials ) material.dispose();

		this._scene.clear();
		this._proxies = [];
		this._materials = [];
		this._lights = [];
		this._lightMapMeshes = [];

		if ( this._cache !== null ) {

			this._cache.dispose();
			this._cache = null;

		}

	}

	/**
	 * Collects the meshes and lights of the scene and creates the illumination proxies.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 */
	_collect( scene ) {

		scene.updateMatrixWorld();

		// rect area lights are not supported, they orient themselves by the parent camera of the
		// array camera instead of by each direction

		scene.traverseVisible( ( object ) => {

			if ( object.isDirectionalLight || object.isPointLight || object.isSpotLight ) this._lights.push( object );

		} );

		const lightsNode = lights( this._lights );
		const materials = new Map();

		const getMaterials = ( source, hasLightMapUV ) => {

			const key = source.uuid + hasLightMapUV;

			if ( materials.has( key ) === false ) {

				const illumination = this._createIlluminationMaterial( source, lightsNode, hasLightMapUV );

				// depth-only lit material, only used to render the shadow maps

				const shadow = new MeshLambertNodeMaterial();
				shadow.side = source.side;
				shadow.shadowSide = source.shadowSide;
				shadow.lightsNode = lightsNode;

				materials.set( key, { illumination, shadow } );
				this._materials.push( illumination, shadow );

			}

			return materials.get( key );

		};

		this._bounds.makeEmpty();

		scene.traverseVisible( ( object ) => {

			if ( object.isMesh !== true || object.isSkinnedMesh || object.isInstancedMesh || object.isBatchedMesh ) return;

			const geometry = object.geometry;
			const hasLightMapUV = geometry.hasAttribute( 'uv1' );

			let illumination, shadow;

			if ( Array.isArray( object.material ) ) {

				const pairs = object.material.map( ( material ) => getMaterials( material, hasLightMapUV ) );
				illumination = pairs.map( ( pair ) => pair.illumination );
				shadow = pairs.map( ( pair ) => pair.shadow );

			} else {

				if ( object.material.visible === false ) return;

				( { illumination, shadow } = getMaterials( object.material, hasLightMapUV ) );

			}

			const proxy = new Mesh( geometry, illumination );
			proxy.matrixAutoUpdate = false;
			proxy.matrix.copy( object.matrixWorld );
			proxy.frustumCulled = false;
			proxy.castShadow = object.castShadow;
			proxy.receiveShadow = object.receiveShadow;

			this._scene.add( proxy );
			this._proxies.push( { proxy, illumination, shadow } );

			if ( hasLightMapUV ) this._lightMapMeshes.push( object );

			if ( geometry.boundingBox === null ) geometry.computeBoundingBox();

			this._bounds.union( _box.copy( geometry.boundingBox ).applyMatrix4( object.matrixWorld ) );

		} );

		this._scene.updateMatrixWorld();

		this._radius = this._bounds.isEmpty() ? 1 : Math.max( this._bounds.getSize( _corner ).length() / 2, 1e-3 );

	}

	/**
	 * Creates the material that stores the outgoing diffuse radiance and the distance along the
	 * direction of a surface in the illumination map, with a stochastic fragment depth.
	 *
	 * @private
	 * @param {Material} source - The material of the mesh.
	 * @param {LightsNode} lightsNode - The direct lights.
	 * @param {boolean} hasLightMapUV - Whether the mesh can sample the bounce cache.
	 * @return {NodeMaterial} The material.
	 */
	_createIlluminationMaterial( source, lightsNode, hasLightMapUV ) {

		const unlit = source.isMeshBasicMaterial === true;
		const material = unlit ? new MeshBasicNodeMaterial() : new MeshLambertNodeMaterial();

		material.side = source.side;

		// diffuse albedo

		if ( source.color !== undefined ) material.color.copy( source.color );
		if ( source.metalness !== undefined ) material.color.multiplyScalar( 1 - source.metalness );
		if ( source.map !== undefined ) material.map = source.map;
		if ( source.vertexColors !== undefined ) material.vertexColors = source.vertexColors;
		if ( source.colorNode ) material.colorNode = source.colorNode;

		if ( unlit === false ) {

			if ( source.emissive !== undefined ) material.emissive.copy( source.emissive );
			if ( source.emissiveIntensity !== undefined ) material.emissiveIntensity = source.emissiveIntensity;
			if ( source.emissiveMap !== undefined ) material.emissiveMap = source.emissiveMap;
			if ( source.emissiveNode ) material.emissiveNode = source.emissiveNode;

			material.lightsNode = lightsNode;

			// the cached bounces are applied like a light map, including the material's occlusion

			if ( this._cache !== null && hasLightMapUV ) material.lightMap = this._cache.texture;
			if ( source.aoMap !== undefined ) material.aoMap = source.aoMap;
			if ( source.aoMapIntensity !== undefined ) material.aoMapIntensity = source.aoMapIntensity;

		}

		// alpha stores the distance from the near plane, offset by one so that zero marks empty texels

		const direction = this._directionNode.element( cameraIndex );
		const distance = dot( positionWorld.sub( this._originNode.element( cameraIndex ) ), direction ).add( 1 );

		material.outputNode = vec4( output.rgb, distance );

		// a random depth per surface, offset by an animated blue noise dither shared by the pixel,
		// shuffles overlapping surfaces and decorrelates the visible surface of neighboring texels

		const rank = hash( dot( positionWorld, direction ).mul( 7 ) );
		const dither = interleavedGradientNoise( screenCoordinate.xy ).add( this._seedNode.mul( 0.618034 ) );

		material.depthNode = rank.add( dither ).fract();

		return material;

	}

	/**
	 * Renders the shadow maps of the lights from the collected scene. The illumination pass reuses
	 * them, since shadow passes inherit the stochastic depth of its materials.
	 *
	 * @private
	 * @param {WebGPURenderer} renderer - The renderer.
	 */
	_renderShadows( renderer ) {

		const casters = this._lights.filter( ( light ) => light.castShadow === true );

		if ( casters.length === 0 || renderer.shadowMap.enabled === false ) return;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		for ( const { proxy, shadow } of this._proxies ) proxy.material = shadow;
		for ( const light of casters ) light.shadow.needsUpdate = true;

		const contextNode = renderer.contextNode;
		renderer.contextNode = this._contextNode;

		renderer.setRenderTarget( this._shadowTarget );
		renderer.render( this._scene, this._shadowCamera );

		renderer.contextNode = contextNode;

		for ( const { proxy, illumination } of this._proxies ) proxy.material = illumination;

		RendererUtils.restoreRendererState( renderer, _rendererState );

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
	 * Rotates the directions and renders the illumination map, once per render call of the
	 * gathering materials.
	 *
	 * @private
	 * @param {NodeFrame} frame - The current node frame.
	 */
	_renderIllumination( frame ) {

		// nested renders restore the render id, so this skips the other gathering materials

		if ( frame.renderId === this._renderId || this._rendering === true || this._proxies.length === 0 ) return;

		this._renderId = frame.renderId;
		this._rendering = true;

		const renderer = frame.renderer;

		this._pass ++;
		this._seedNode.value = this._pass;
		this._updateDirections();

		// the views span at most the bounding sphere, their texel size bounds the bias

		this._biasNode.value = this.bias * 2 * this._radius / this.resolution;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// keep the shadow maps, re-rendering them from here would use the stochastic depth

		const shadows = [];

		for ( const light of this._lights ) {

			if ( light.shadow === undefined ) continue;

			shadows.push( light.shadow.autoUpdate, light.shadow.needsUpdate );
			light.shadow.autoUpdate = false;
			light.shadow.needsUpdate = false;

		}

		const contextNode = renderer.contextNode;
		renderer.contextNode = this._contextNode;

		renderer.setClearColor( 0x000000, 0 );
		renderer.setRenderTarget( this._illuminationMap );
		renderer.render( this._scene, this._arrayCamera );

		renderer.contextNode = contextNode;

		let i = 0;

		for ( const light of this._lights ) {

			if ( light.shadow === undefined ) continue;

			light.shadow.autoUpdate = shadows[ i ++ ];
			light.shadow.needsUpdate = shadows[ i ++ ];

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

		this._rendering = false;

	}

	/**
	 * Rotates the directions and fits an orthographic view to the scene bounds along each one.
	 *
	 * @private
	 */
	_updateDirections() {

		const bounds = this._bounds;
		const center = bounds.getCenter( _center );
		const margin = 4 * this._radius / this.resolution;

		// a low-discrepancy rotation per pass stratifies the directions over time

		stratifiedRotation( _quaternion, this._pass );

		for ( let i = 0; i < this.directions; i ++ ) {

			const direction = this._directionData[ i ].copy( this._baseDirections[ i ] ).applyQuaternion( _quaternion ).normalize();
			const camera = this._cameras[ i ];

			camera.up.set( 0, 1, 0 );
			if ( Math.abs( direction.y ) > 0.99 ) camera.up.set( 0, 0, 1 );

			camera.position.copy( center );
			camera.lookAt( _target.copy( center ).add( direction ) );
			camera.updateMatrixWorld();

			const basisU = this._basisUData[ i ].setFromMatrixColumn( camera.matrixWorld, 0 );
			const basisV = this._basisVData[ i ].setFromMatrixColumn( camera.matrixWorld, 1 );

			// fit the view to the corners of the bounds

			let minU = Infinity, maxU = - Infinity, minV = Infinity, maxV = - Infinity, minD = Infinity, maxD = - Infinity;

			for ( let c = 0; c < 8; c ++ ) {

				_corner.set( c & 1 ? bounds.max.x : bounds.min.x, c & 2 ? bounds.max.y : bounds.min.y, c & 4 ? bounds.max.z : bounds.min.z ).sub( center );

				const u = _corner.dot( basisU ), v = _corner.dot( basisV ), d = _corner.dot( direction );

				minU = Math.min( minU, u ); maxU = Math.max( maxU, u );
				minV = Math.min( minV, v ); maxV = Math.max( maxV, v );
				minD = Math.min( minD, d ); maxD = Math.max( maxD, d );

			}

			const halfU = ( maxU - minU ) / 2 + margin;
			const halfV = ( maxV - minV ) / 2 + margin;
			const near = minD - margin;

			// the camera sits on the near plane

			camera.position.copy( center )
				.addScaledVector( basisU, ( minU + maxU ) / 2 )
				.addScaledVector( basisV, ( minV + maxV ) / 2 )
				.addScaledVector( direction, near );

			camera.left = - halfU;
			camera.right = halfU;
			camera.top = halfV;
			camera.bottom = - halfV;
			camera.near = 0;
			camera.far = maxD + margin - near;
			camera.updateMatrixWorld();
			camera.updateProjectionMatrix();

			this._originData[ i ].copy( camera.position );
			this._sizeData[ i ].set( halfU, halfV );

		}

	}

	/**
	 * Returns the irradiance gathered from the illumination map at a world-space position and normal.
	 *
	 * @private
	 * @param {Node<vec3>} positionNode - The world-space position.
	 * @param {Node<vec3>} normalNode - The world-space normal.
	 * @return {Node<vec3>} The irradiance.
	 */
	_gather( positionNode, normalNode ) {

		const resolution = this.resolution;
		const radius = this.gatherRadius;
		const tilesX = this._tilesX;
		const maxTexel = ivec2( resolution - 1 );

		return Fn( () => {

			const position = positionNode.toVar();

			// a degenerate normal would poison the light map with NaNs

			const normalLength = length( normalNode ).toVar();
			const normal = select( normalLength.greaterThan( 1e-8 ), normalNode.div( normalLength ), vec3( 0, 1, 0 ) ).toVar();

			// gathered surfaces must lie in front of the plane of the receiving face rather than of the
			// interpolated normal, so neighboring faces of a curved surface never shadow it

			const face = cross( dFdx( position ), dFdy( position ) ).toVar();
			const faceLength = length( face ).toVar();
			const faceNormal = select( faceLength.greaterThan( 1e-12 ), face.div( faceLength ), normal ).toVar();
			faceNormal.assign( select( dot( faceNormal, normal ).lessThan( 0 ), faceNormal.negate(), faceNormal ) );

			const irradiance = vec3( 0 ).toVar();

			Loop( this.directions, ( { i } ) => {

				const direction = this._directionNode.element( i ).toVar();
				const cosine = dot( normal, direction ).toVar();

				If( cosine.greaterThan( 0 ), () => {

					const basisU = this._basisUNode.element( i ).toVar();
					const basisV = this._basisVNode.element( i ).toVar();
					const size = this._sizeNode.element( i ).toVar();
					const offset = position.sub( this._originNode.element( i ) ).toVar();
					const depth = dot( offset, direction ).toVar();

					// texel of the position in the tile of this direction, rows run top to bottom

					const ndc = vec2( dot( offset, basisU ).div( size.x ), dot( offset, basisV ).div( size.y ).negate() );
					const texel = ivec2( ndc.mul( 0.5 ).add( 0.5 ).mul( resolution ).floor() ).toVar();
					const tile = ivec2( int( i ).mod( tilesX ), int( i ).div( tilesX ) ).mul( resolution ).toVar();

					const nearest = float( 1e20 ).toVar();
					const radiance = vec3( 0 ).toVar();

					for ( let y = - radius; y <= radius; y ++ ) {

						for ( let x = - radius; x <= radius; x ++ ) {

							const coord = texel.add( ivec2( x, y ) ).clamp( ivec2( 0 ), maxTexel ).toVar();
							const sample = this._illuminationNode.load( tile.add( coord ) ).toVar();

							If( sample.a.greaterThan( 0.5 ), () => {

								// reconstruct the surface from the texel center, relative to the position

								const u = float( coord.x ).add( 0.5 ).div( resolution ).mul( 2 ).sub( 1 ).mul( size.x );
								const v = float( coord.y ).add( 0.5 ).div( resolution ).mul( 2 ).sub( 1 ).mul( size.y ).negate();
								const distance = sample.a.sub( 1 ).sub( depth ).toVar();
								const delta = basisU.mul( u ).add( basisV.mul( v ) ).add( direction.mul( sample.a.sub( 1 ) ) ).sub( offset );

								// keep the nearest surface ahead along the direction and in front of the receiver

								If( distance.greaterThan( 0 ).and( distance.lessThan( nearest ) ).and( dot( delta, faceNormal ).greaterThan( this._biasNode ) ), () => {

									nearest.assign( distance );
									radiance.assign( sample.rgb );

								} );

							} );

						}

					}

					irradiance.addAssign( radiance.mul( cosine ) );

				} );

			} );

			// uniformly distributed directions, so each one covers a solid angle of 4 pi / N

			return irradiance.mul( 4 * Math.PI / this.directions );

		} )();

	}

}

/**
 * Gathers the irradiance of a {@link StochasticRadiosity} solver and re-renders its illumination
 * map with rotated directions once per render call.
 *
 * @private
 * @augments Node
 */
class RadiosityIrradianceNode extends Node {

	static get type() {

		return 'RadiosityIrradianceNode';

	}

	/**
	 * Constructs a new radiosity irradiance node.
	 *
	 * @param {StochasticRadiosity} radiosity - The radiosity solver.
	 * @param {Node<vec3>} positionNode - The world-space position.
	 * @param {Node<vec3>} normalNode - The world-space normal.
	 */
	constructor( radiosity, positionNode, normalNode ) {

		super( 'vec3' );

		this.radiosity = radiosity;
		this.positionNode = positionNode;
		this.normalNode = normalNode;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore( frame ) {

		this.radiosity._renderIllumination( frame );

	}

	setup() {

		return this.radiosity._gather( this.positionNode, this.normalNode );

	}

}

/**
 * Creates a world-space diffuse irradiance sampler for a prepared {@link StochasticRadiosity}.
 * Call `radiosity.update( renderer, scene )` before baking. Every render call that uses the sampler
 * gathers a new set of directions, so the samples of {@link LightMapper} converge.
 *
 * @param {StochasticRadiosity} radiosity - The prepared radiosity solver.
 * @return {function(Node<vec3>, Node<vec3>): Node<vec3>} The irradiance sampler.
 */
function radiosityIrradiance( radiosity ) {

	return ( position, normal ) => nodeObject( new RadiosityIrradianceNode( radiosity, position, normal ) );

}

/**
 * Returns the i-th of n points of a Fibonacci sphere.
 *
 * @private
 * @param {number} i - The point index.
 * @param {number} n - The number of points.
 * @return {Vector3} The direction.
 */
function fibonacciSphere( i, n ) {

	const y = 1 - ( i + 0.5 ) / n * 2;
	const r = Math.sqrt( 1 - y * y );
	const phi = i * Math.PI * ( 3 - Math.sqrt( 5 ) );

	return new Vector3( Math.cos( phi ) * r, y, Math.sin( phi ) * r );

}

/**
 * Writes the n-th rotation of a low-discrepancy sequence of uniformly distributed rotations: the R3
 * sequence mapped to unit quaternions (Shoemake).
 *
 * @private
 * @param {Quaternion} target - The result.
 * @param {number} n - The sequence index.
 * @return {Quaternion} The rotation.
 */
function stratifiedRotation( target, n ) {

	const u1 = ( 0.5 + 0.8191725133961644 * n ) % 1;
	const u2 = ( 0.5 + 0.6710436067037893 * n ) % 1;
	const u3 = ( 0.5 + 0.5497004779019702 * n ) % 1;

	const s1 = Math.sqrt( 1 - u1 );
	const s2 = Math.sqrt( u1 );

	return target.set( s1 * Math.sin( 2 * Math.PI * u2 ), s1 * Math.cos( 2 * Math.PI * u2 ), s2 * Math.sin( 2 * Math.PI * u3 ), s2 * Math.cos( 2 * Math.PI * u3 ) );

}

export { StochasticRadiosity, radiosityIrradiance };
