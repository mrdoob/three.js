import {
	Color, DepthFormat, DepthStencilFormat, DepthTexture, FloatType, HalfFloatType, MeshNormalMaterial,
	NearestFilter, NoBlending, TangentSpaceNormalMap, UnsignedInt248Type, UnsignedIntType, UnsignedShortType, WebGLRenderTarget
} from 'three';
import { Pass } from './Pass.js';

const _textureProperties = [ 'map', 'alphaMap', 'normalMap', 'bumpMap', 'displacementMap' ];
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
			depthTexture
		} );
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
	 * The shared window depth texture.
	 *
	 * @type {DepthTexture}
	 * @readonly
	 */
	get depthTexture() {

		return this._renderTarget.depthTexture;

	}

	_getMaterial( source ) {

		if ( source === undefined ) return source;
		if ( source.visible === false || ( source.transparent === true && source.alphaTest === 0 ) ) return this._invisibleMaterial;

		let entry = this._materialCache.get( source );

		if ( entry === undefined ) {

			const material = new MeshNormalMaterial( { blending: NoBlending } );

			const onDispose = () => {

				material.dispose();
				source.removeEventListener( 'dispose', onDispose );
				this._materialCache.delete( source );

			};

			source.addEventListener( 'dispose', onDispose );
			entry = { material, channels: {}, version: - 1, onDispose };
			this._materialCache.set( source, entry );

		}

		const material = entry.material;
		if ( entry.version !== source.version ) material.needsUpdate = true;
		entry.version = source.version;

		for ( const property of _textureProperties ) {

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
		const getOverride = source => {

			if ( ! overrides.has( source ) ) overrides.set( source, this._getMaterial( source ) );
			return overrides.get( source );

		};

		try {

			scene.background = null;
			scene.overrideMaterial = null;
			scene.traverseVisible( object => {

				if ( object.material !== undefined ) {

					const source = object.material;
					materials.set( object, source );
					const mesh = object.isMesh && ! object.isLine2;
					object.material = mesh ? ( Array.isArray( source ) ? source.map( getOverride ) : getOverride( source ) ) : this._invisibleMaterial;

				}

			} );

			// Normal/depth output does not use shadows. Avoid updating them with substituted materials.
			renderer.shadowMap.enabled = false;
			renderer.autoClear = false;
			renderer.setRenderTarget( this._renderTarget );
			renderer.setClearColor( 0x7777ff, 1 );
			renderer.clear();
			renderer.render( scene, this.camera );

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

		this._renderTarget.setSize( width, height );

	}

	/**
	 * Frees the attachments and material owned by this pass.
	 */
	dispose() {

		this._renderTarget.dispose();
		this._invisibleMaterial.dispose();
		for ( const [ source, entry ] of this._materialCache ) {

			source.removeEventListener( 'dispose', entry.onDispose );
			entry.material.dispose();

		}

		this._materialCache.clear();

	}

}

export { GBufferPass };
