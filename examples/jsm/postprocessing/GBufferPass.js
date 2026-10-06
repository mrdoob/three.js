import {
	Color, DepthStencilFormat, DepthTexture, HalfFloatType, MeshNormalMaterial,
	NearestFilter, NoBlending, UnsignedInt248Type, WebGLRenderTarget
} from 'three';
import { Pass } from './Pass.js';

/**
 * Renders shared view-space normals and depth for WebGL postprocessing effects.
 * Add this pass before effects that consume its textures via setGBuffer().
 * It renders mesh geometry; points and lines do not contribute.
 *
 * Normals are unit view-space vectors encoded as RGB = normal * 0.5 + 0.5 in
 * NoColorSpace. Depth is sampled from red, with near = 0 and far/background = 1.
 * Reversed and logarithmic depth are not supported. Consumers must use the same
 * frame, camera, projection, viewport and physical pixel dimensions.
 *
 * This pass owns its attachments. Consumers must not resize or dispose them.
 * The MeshNormalMaterial override has the same geometry semantics as the AO passes;
 * it does not reproduce each source material's normal maps or transparency settings.
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
	 */
	constructor( scene, camera, width = 512, height = 512 ) {

		super();

		/** @type {Scene} */
		this.scene = scene;
		/** @type {Camera} */
		this.camera = camera;
		this.needsSwap = false;

		const depthTexture = new DepthTexture( width, height );
		depthTexture.format = DepthStencilFormat;
		depthTexture.type = UnsignedInt248Type;
		this._renderTarget = new WebGLRenderTarget( width, height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			depthTexture
		} );
		this._normalMaterial = new MeshNormalMaterial( { blending: NoBlending } );
		this._clearColor = new Color();
		this._visibilityCache = [];

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
		const visibility = this._visibilityCache;
		const overrideMaterial = scene.overrideMaterial;
		const target = renderer.getRenderTarget();
		renderer.getClearColor( this._clearColor );
		const alpha = renderer.getClearAlpha();
		const autoClear = renderer.autoClear;

		try {

			scene.traverse( object => {

				if ( ( object.isPoints || object.isLine || object.isLine2 ) && object.visible ) {

					visibility.push( object );
					object.visible = false;

				}

			} );

			scene.overrideMaterial = this._normalMaterial;
			renderer.autoClear = false;
			renderer.setRenderTarget( this._renderTarget );
			renderer.setClearColor( 0x7777ff, 1 );
			renderer.clear();
			renderer.render( scene, this.camera );

		} finally {

			scene.overrideMaterial = overrideMaterial;
			for ( const object of visibility ) object.visible = true;
			visibility.length = 0;
			renderer.autoClear = autoClear;
			renderer.setClearColor( this._clearColor, alpha );
			renderer.setRenderTarget( target );

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
		this._normalMaterial.dispose();

	}

}

export { GBufferPass };
