import {
	Color, DepthFormat, DepthStencilFormat, DepthTexture, FloatType, HalfFloatType, Matrix3, Matrix4, MeshNormalMaterial,
	NearestFilter, NoBlending, TangentSpaceNormalMap, UnsignedInt248Type, UnsignedIntType, UnsignedShortType, WebGLRenderTarget
} from 'three';
import { Pass } from './Pass.js';

const _textureProperties = [ 'map', 'alphaMap', 'normalMap', 'bumpMap', 'displacementMap' ];
const _materialTextureProperties = [ ..._textureProperties, 'roughnessMap', 'metalnessMap' ];
const _shaderProperties = [ 'side', 'flatShading', 'normalMapType', 'wireframe', 'clippingPlanes', 'clipIntersection' ];

/**
 * Renders shared view-space normals and depth for WebGL postprocessing effects.
 * Add this pass before effects that consume its textures via setGBuffer().
 * It renders mesh geometry; points, lines and sprites do not contribute.
 *
 * Normals are unit view-space vectors encoded as RGB = normal * 0.5 + 0.5 in
 * NoColorSpace, stored in an RGBA half-float texture. Depth is a separate
 * depth texture sampled from red, with near = 0 and far/background = 1. Depth defaults
 * to 24-bit depth/stencil; options.depthTextureType can select 16-bit, 24-bit or
 * 32-bit floating-point depth without stencil.
 * Both textures use nearest filtering, clamp-to-edge wrapping and no mipmaps.
 * Background normals are undefined; consumers identify background through depth.
 * Reversed and logarithmic depth are not supported. Consumers must use the same
 * frame, camera, projection, viewport and physical pixel dimensions.
 *
 * This pass owns its attachments. Consumers must not resize or dispose them.
 * Built-in materials retain alpha-tested coverage, texture transforms, UV channels,
 * material groups, side orientation, normal/bump maps, displacement and clipping.
 * Blended materials without alpha testing do not contribute. Custom shader modifications,
 * including custom vertex deformation and fragment discard, are not reproduced.
 *
 * With options.material, a second color attachment is added holding RG = roughness,
 * metalness (material values multiplied by the roughness map's green channel and
 * metalness map's blue channel; materials without these values write roughness 1,
 * metalness 0) in an RGBA half-float
 * NoColorSpace texture, exposed as materialTexture. It shares the depth buffer.
 *
 * With options.velocity, an optional half-float attachment stores RG = current
 * minus previous unjittered NDC position, B = previous window depth, A = valid
 * history (0 or 1). Use RG * 0.5 for bottom-left-origin UV motion. It includes
 * camera and rigid mesh motion. Skinned, morphing, instanced and batched meshes
 * write invalid history: their previous vertex deformation is not retained.
 * Call resetVelocity() after camera cuts or discontinuous scene changes.
 *
 * ```js
 * const gBufferPass = new GBufferPass( scene, camera, width, height );
 * ssaoPass.setGBuffer( gBufferPass.depthTexture, gBufferPass.normalTexture );
 * composer.addPass( gBufferPass );
 * composer.addPass( ssaoPass );
 * ```
 *
 * @augments Pass
 * @three_import import { GBufferPass } from 'three/addons/postprocessing/GBufferPass.js';
 */
class GBufferPass extends Pass {

	/**
	 * Constructs a shared geometry pass.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera used by all consuming effects.
	 * @param {number} [width=512] - Width in physical pixels.
	 * @param {number} [height=512] - Height in physical pixels.
	 * @param {Object} [options] - Buffer options.
	 * @param {number} [options.depthTextureType=UnsignedInt248Type] - UnsignedShortType (16-bit),
	 * UnsignedIntType (24-bit), FloatType (32-bit), or UnsignedInt248Type (24-bit with stencil).
	 * @param {boolean} [options.material=false] - Adds a second attachment with roughness and metalness.
	 * @param {boolean} [options.velocity=false] - Adds rigid mesh and camera motion vectors.
	 */
	constructor( scene, camera, width = 512, height = 512, options = {} ) {

		super();

		/** @type {Scene} */
		this.scene = scene;
		/** @type {Camera} */
		this.camera = camera;
		this.needsSwap = false;

		const depthTextureType = options.depthTextureType ?? UnsignedInt248Type;
		if ( ! [ UnsignedShortType, UnsignedIntType, FloatType, UnsignedInt248Type ].includes( depthTextureType ) ) {

			throw new Error( 'THREE.GBufferPass: Unsupported depth texture type.' );

		}

		const depthTexture = new DepthTexture( width, height, depthTextureType );
		depthTexture.format = depthTextureType === UnsignedInt248Type ? DepthStencilFormat : DepthFormat;
		this._renderTarget = new WebGLRenderTarget( width, height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			depthTexture,
			count: 1 + Number( options.material === true ) + Number( options.velocity === true )
		} );
		this._material = options.material === true;
		this._velocity = options.velocity === true;
		this._velocityKeys = new WeakMap();
		this._velocityHistory = new WeakMap();
		this._velocityFrame = 0;
		this._velocityProjectionMatrix = null;
		this._currentViewProjection = new Matrix4();
		this._previousViewProjection = new Matrix4();
		this._materialCache = new Map();
		this._invisibleMaterial = new MeshNormalMaterial();
		this._invisibleMaterial.visible = false;
		this._clearColor = new Color();

	}

	/**
	 * The shared encoded view-space normal texture.
	 *
	 * @type {Texture}
	 * @readonly
	 */
	get normalTexture() {

		return this._renderTarget.texture;

	}

	/**
	 * The shared roughness (R) and metalness (G) texture, or `null` unless
	 * constructed with `options.material`.
	 *
	 * @type {?Texture}
	 * @readonly
	 */
	get materialTexture() {

		return this._material ? this._renderTarget.textures[ 1 ] : null;

	}

	/**
	 * The shared window depth texture.
	 *
	 * @type {DepthTexture}
	 * @readonly
	 */
	get depthTexture() {

		return this._renderTarget.depthTexture;

	}

	/**
	 * Optional motion texture. Its identity remains stable when resized.
	 *
	 * @type {?Texture}
	 * @readonly
	 */
	get velocityTexture() {

		return this._velocity ? this._renderTarget.textures[ this._material ? 2 : 1 ] : null;

	}

	/**
	 * Supplies an unjittered projection for motion vectors, or null to use the camera.
	 *
	 * @param {?Matrix4} matrix - The projection matrix.
	 * @return {?Matrix4} The previous override.
	 */
	setVelocityProjectionMatrix( matrix ) {

		const previous = this._velocityProjectionMatrix;
		this._velocityProjectionMatrix = matrix;
		return previous;

	}

	/** Clears motion history after a camera cut or discontinuous scene change. */
	resetVelocity() {

		this._velocityHistory = new WeakMap();
		this._velocityFrame = 0;

	}

	_getMaterial( source, object ) {

		if ( source === undefined ) return source;
		if ( source.visible === false || ( source.transparent === true && source.alphaTest === 0 ) ) return this._invisibleMaterial;

		let key = source;
		if ( this._velocity ) {

			let keys = this._velocityKeys.get( object );
			if ( keys === undefined ) {

				keys = new WeakMap();
				this._velocityKeys.set( object, keys );

			}

			key = keys.get( source );
			if ( key === undefined ) {

				key = {};
				keys.set( source, key );

			}

		}

		let entry = this._materialCache.get( key );

		if ( entry === undefined ) {

			const material = new MeshNormalMaterial( { blending: NoBlending } );

			const onDispose = () => {

				material.dispose();
				source.removeEventListener( 'dispose', onDispose );
				this._materialCache.delete( key );

			};

			source.addEventListener( 'dispose', onDispose );
			entry = { source, material, channels: {}, version: - 1, onDispose, uniforms: { gRoughness: { value: 1 }, gMetalness: { value: 0 } } };

			if ( this._material ) {

				entry.uniforms.roughnessMap = { value: null };
				entry.uniforms.metalnessMap = { value: null };
				entry.uniforms.roughnessMapTransform = { value: new Matrix3() };
				entry.uniforms.metalnessMapTransform = { value: new Matrix3() };
				material.customProgramCacheKey = () => 'GBufferPass.material';
				material.onBeforeCompile = shader => {

					Object.assign( shader.uniforms, entry.uniforms );
					shader.fragmentShader = 'uniform float gRoughness;\nuniform float gMetalness;\nlayout(location = 1) out highp vec4 gMaterial;\n' +
						shader.fragmentShader
							.replace( '#include <normalmap_pars_fragment>', '#include <normalmap_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>' )
							.replace( '#ifdef OPAQUE', /* glsl */`
								float roughness = gRoughness;
								float metalness = gMetalness;
								#include <roughnessmap_fragment>
								#include <metalnessmap_fragment>
								gMaterial = vec4( roughnessFactor, metalnessFactor, 0.0, 1.0 );
								#ifdef OPAQUE
							` );

				};

			}

			if ( this._velocity ) {

				Object.assign( entry.uniforms, {
					gCurrentViewProjection: { value: this._currentViewProjection },
					gPreviousViewProjection: { value: this._previousViewProjection },
					gPreviousModelMatrix: { value: new Matrix4() },
					gVelocityValid: { value: 0 }
				} );
				const compileMaterial = material.onBeforeCompile;
				material.customProgramCacheKey = () => 'GBufferPass.velocity.' + this._material;
				material.onBeforeCompile = shader => {

					compileMaterial( shader );
					Object.assign( shader.uniforms, entry.uniforms );
					shader.vertexShader = /* glsl */`
						uniform mat4 gCurrentViewProjection;
						uniform mat4 gPreviousViewProjection;
						uniform mat4 gPreviousModelMatrix;
						varying vec4 vGCurrentClip;
						varying vec4 vGPreviousClip;
					` + shader.vertexShader.replace( '#include <project_vertex>', /* glsl */`
						#include <project_vertex>
						vGCurrentClip = gCurrentViewProjection * modelMatrix * vec4( transformed, 1.0 );
						vGPreviousClip = gPreviousViewProjection * gPreviousModelMatrix * vec4( transformed, 1.0 );
					` );
					shader.fragmentShader = /* glsl */`
						uniform float gVelocityValid;
						varying vec4 vGCurrentClip;
						varying vec4 vGPreviousClip;
						layout(location = ${ this._material ? 2 : 1 }) out highp vec4 gVelocity;
					` + shader.fragmentShader.replace( '#ifdef OPAQUE', /* glsl */`
						vec3 previousNDC = vGPreviousClip.xyz / max( vGPreviousClip.w, 1e-7 );
						vec2 currentNDC = vGCurrentClip.xy / max( vGCurrentClip.w, 1e-7 );
						float valid = gVelocityValid * float( vGPreviousClip.w > 0.0 );
						gVelocity = vec4( currentNDC - previousNDC.xy, previousNDC.z * 0.5 + 0.5, valid );
						#ifdef OPAQUE
					` );

				};

			}

			this._materialCache.set( key, entry );

		}

		if ( this._velocity ) {

			const previous = this._velocityHistory.get( object );
			const valid = previous !== undefined && previous.frame === this._velocityFrame - 1 &&
				! object.isSkinnedMesh && ! object.isInstancedMesh && ! object.isBatchedMesh &&
				object.morphTargetInfluences === undefined;
			entry.uniforms.gPreviousModelMatrix.value.copy( valid ? previous.matrix : object.matrixWorld );
			entry.uniforms.gVelocityValid.value = valid ? 1 : 0;

		}

		const material = entry.material;
		if ( entry.version !== source.version ) material.needsUpdate = true;
		entry.version = source.version;

		for ( const property of this._material ? _materialTextureProperties : _textureProperties ) {

			const texture = ( ( property === 'map' || property === 'alphaMap' ) && source.alphaTest === 0 ) ? null : source[ property ] || null;
			const channel = texture ? texture.channel : undefined;
			if ( material[ property ] !== texture || entry.channels[ property ] !== channel ) material.needsUpdate = true;
			material[ property ] = texture;
			entry.channels[ property ] = channel;

		}

		for ( const property of _shaderProperties ) {

			const value = source[ property ] !== undefined ? source[ property ] : ( property === 'normalMapType' ? TangentSpaceNormalMap : false );
			if ( material[ property ] !== value ) material.needsUpdate = true;
			material[ property ] = value;

		}

		entry.uniforms.gRoughness.value = source.roughness !== undefined ? source.roughness : 1;
		entry.uniforms.gMetalness.value = source.metalness !== undefined ? source.metalness : 0;

		if ( this._material ) {

			// MeshNormalMaterial does not refresh these map uniforms in the renderer.
			for ( const property of [ 'roughnessMap', 'metalnessMap' ] ) {

				const texture = material[ property ];
				entry.uniforms[ property ].value = texture;
				if ( texture ) {

					if ( texture.matrixAutoUpdate ) texture.updateMatrix();
					entry.uniforms[ property + 'Transform' ].value.copy( texture.matrix );

				}

			}

		}

		// The renderer updates texture matrices and uniforms without recompiling these materials.
		material.alphaTest = source.alphaTest;
		material.opacity = source.alphaTest > 0 ? source.opacity : 1;
		if ( source.normalScale ) material.normalScale.copy( source.normalScale );
		material.bumpScale = source.bumpScale !== undefined ? source.bumpScale : 1;
		material.displacementScale = source.displacementScale !== undefined ? source.displacementScale : 1;
		material.displacementBias = source.displacementBias !== undefined ? source.displacementBias : 0;
		material.polygonOffset = source.polygonOffset;
		material.polygonOffsetFactor = source.polygonOffsetFactor;
		material.polygonOffsetUnits = source.polygonOffsetUnits;

		return material;

	}

	/**
	 * Renders the geometry buffers without modifying composer color buffers.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 */
	render( renderer ) {

		if ( renderer.capabilities.reversedDepthBuffer || renderer.capabilities.logarithmicDepthBuffer ) {

			throw new Error( 'THREE.GBufferPass: Conventional depth is required.' );

		}

		const scene = this.scene;
		const overrideMaterial = scene.overrideMaterial;
		const background = scene.background;
		const target = renderer.getRenderTarget();
		const cubeFace = renderer.getActiveCubeFace();
		const mipmapLevel = renderer.getActiveMipmapLevel();
		renderer.getClearColor( this._clearColor );
		const alpha = renderer.getClearAlpha();
		const autoClear = renderer.autoClear;
		const shadowMapEnabled = renderer.shadowMap.enabled;
		const materials = new Map();
		const overrides = new Map();
		const getOverride = ( source, object ) => {

			if ( this._velocity ) return this._getMaterial( source, object );
			if ( ! overrides.has( source ) ) overrides.set( source, this._getMaterial( source, object ) );
			return overrides.get( source );

		};

		if ( this._velocity ) {

			if ( scene.matrixWorldAutoUpdate ) scene.updateMatrixWorld();
			if ( this.camera.parent === null && this.camera.matrixWorldAutoUpdate ) this.camera.updateMatrixWorld();
			this._currentViewProjection.multiplyMatrices( this._velocityProjectionMatrix || this.camera.projectionMatrix, this.camera.matrixWorldInverse );
			if ( this._velocityFrame === 0 ) this._previousViewProjection.copy( this._currentViewProjection );

		}

		try {

			scene.background = null;
			scene.overrideMaterial = null;
			scene.traverseVisible( object => {

				if ( object.material !== undefined ) {

					const source = object.material;
					materials.set( object, source );
					const mesh = object.isMesh && ! object.isLine2;
					object.material = mesh ? ( Array.isArray( source ) ? source.map( material => getOverride( material, object ) ) : getOverride( source, object ) ) : this._invisibleMaterial;

				}

			} );

			// Normal/depth output does not use shadows. Avoid updating them with substituted materials.
			renderer.shadowMap.enabled = false;
			renderer.autoClear = false;
			renderer.setRenderTarget( this._renderTarget );
			renderer.setClearColor( 0x7777ff, 1 );
			renderer.clear();
			renderer.render( scene, this.camera );

			if ( this._velocity ) {

				for ( const object of materials.keys() ) {

					this._velocityHistory.set( object, { matrix: object.matrixWorld.clone(), frame: this._velocityFrame } );

				}

				this._previousViewProjection.copy( this._currentViewProjection );
				this._velocityFrame ++;

			}

		} finally {

			for ( const [ object, material ] of materials ) object.material = material;
			scene.overrideMaterial = overrideMaterial;
			scene.background = background;
			renderer.shadowMap.enabled = shadowMapEnabled;
			renderer.autoClear = autoClear;
			renderer.setClearColor( this._clearColor, alpha );
			renderer.setRenderTarget( target, cubeFace, mipmapLevel );

		}

	}

	/**
	 * Resizes the shared attachments. Texture identities remain stable.
	 *
	 * @param {number} width - Width in physical pixels.
	 * @param {number} height - Height in physical pixels.
	 */
	setSize( width, height ) {

		if ( this._renderTarget.width !== width || this._renderTarget.height !== height ) this.resetVelocity();
		this._renderTarget.setSize( width, height );

	}

	/**
	 * Frees the attachments and material owned by this pass.
	 */
	dispose() {

		this._renderTarget.dispose();
		this._invisibleMaterial.dispose();
		for ( const entry of this._materialCache.values() ) {

			entry.source.removeEventListener( 'dispose', entry.onDispose );
			entry.material.dispose();

		}

		this._materialCache.clear();

	}

}

export { GBufferPass };
