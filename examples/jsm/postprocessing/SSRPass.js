import {
	AddEquation,
	Color,
	NormalBlending,
	DepthTexture,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor,
	MeshNormalMaterial,
	MeshBasicMaterial,
	NearestFilter,
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
	UnsignedShortType,
	WebGLRenderTarget,
	HalfFloatType,
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { SSRBlurShader, SSRDepthShader, SSRShader } from '../shaders/SSRShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

/**
 * A pass for a basic SSR effect.
 *
 * ```js
 * const ssrPass = new SSRPass( {
 * 	renderer,
 * 	scene,
 * 	camera,
 * 	width: innerWidth,
 * 	height: innerHeight
 * } );
 * composer.addPass( ssrPass );
 * ```
 *
 * @augments Pass
 * @three_import import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
 */
class SSRPass extends Pass {

	/**
	 * Constructs a new SSR pass.
	 *
	 * @param {SSRPass~Options} options - The pass options.
	 */
	constructor( { renderer, scene, camera, width = 512, height = 512, selects = null, bouncing = false, groundReflector = null } ) {

		super();

		/**
		 * The width of the effect.
		 *
		 * @type {number}
		 * @default 512
		 */
		this.width = width;

		/**
		 * The height of the effect.
		 *
		 * @type {number}
		 * @default 512
		 */
		this.height = height;

		/**
		 * Overwritten to perform a clear operation by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.clear = true;

		/**
		 * The renderer.
		 *
		 * @type {WebGLRenderer}
		 */
		this.renderer = renderer;

		/**
		 * The scene to render.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The camera.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The ground reflector.
		 *
		 * @type {?ReflectorForSSRPass}
		 * @default 0
		 */
		this.groundReflector = groundReflector;

		/**
		 * The opacity.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.opacity = SSRShader.uniforms.opacity.value;

		/**
		 * The output configuration.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.output = 0;

		/**
		 * Controls how far a fragment can reflect.
		 *
		 * @type {number}
		 * @default 180
		 */
		this.maxDistance = SSRShader.uniforms.maxDistance.value;

		/**
		 * Controls the cutoff between what counts as a
		 * possible reflection hit and what does not.
		 *
		 * @type {number}
		 * @default .018
		 */
		this.thickness = SSRShader.uniforms.thickness.value;

		this.tempColor = new Color();

		this._selects = selects;

		/**
		 * Whether the pass is selective or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.selective = Array.isArray( this._selects );

		/**
		 * Which 3D objects should be affected by SSR. If not set, the entire scene is affected.
		 *
		 * @name SSRPass#selects
		 * @type {?Array<Object3D>}
		 * @default null
		 */
		Object.defineProperty( this, 'selects', {
			get() {

				return this._selects;

			},
			set( val ) {

				if ( this._selects === val ) return;
				this._selects = val;
				if ( Array.isArray( val ) ) {

					this.selective = true;
					this.ssrMaterial.defines.SELECTIVE = true;
					this.ssrMaterial.needsUpdate = true;

				} else {

					this.selective = false;
					this.ssrMaterial.defines.SELECTIVE = false;
					this.ssrMaterial.needsUpdate = true;

				}

			}
		} );

		this._bouncing = bouncing;

		/**
		 * Whether bouncing is enabled or not.
		 *
		 * @name SSRPass#bouncing
		 * @type {boolean}
		 * @default false
		 */
		Object.defineProperty( this, 'bouncing', {
			get() {

				return this._bouncing;

			},
			set( val ) {

				if ( this._bouncing === val ) return;
				this._bouncing = val;
				if ( val ) {

					this.ssrMaterial.uniforms[ 'tDiffuse' ].value = this.prevRenderTarget.texture;

				} else {

					this.ssrMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;

				}

			}
		} );

		/**
		 * Whether to blur reflections or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.blur = true;

		this._distanceAttenuation = SSRShader.defines.DISTANCE_ATTENUATION;

		/**
		 * Whether to use distance attenuation or not.
		 *
		 * @name SSRPass#distanceAttenuation
		 * @type {boolean}
		 * @default true
		 */
		Object.defineProperty( this, 'distanceAttenuation', {
			get() {

				return this._distanceAttenuation;

			},
			set( val ) {

				if ( this._distanceAttenuation === val ) return;
				this._distanceAttenuation = val;
				this.ssrMaterial.defines.DISTANCE_ATTENUATION = val;
				this.ssrMaterial.needsUpdate = true;

			}
		} );


		this._fresnel = SSRShader.defines.FRESNEL;

		/**
		 * Whether to use fresnel or not.
		 *
		 * @name SSRPass#fresnel
		 * @type {boolean}
		 * @default true
		 */
		Object.defineProperty( this, 'fresnel', {
			get() {

				return this._fresnel;

			},
			set( val ) {

				if ( this._fresnel === val ) return;
				this._fresnel = val;
				this.ssrMaterial.defines.FRESNEL = val;
				this.ssrMaterial.needsUpdate = true;

			}
		} );

		this._infiniteThick = SSRShader.defines.INFINITE_THICK;

		/**
		 * Whether to use infinite thickness or not.
		 *
		 * @name SSRPass#infiniteThick
		 * @type {boolean}
		 * @default false
		 */
		Object.defineProperty( this, 'infiniteThick', {
			get() {

				return this._infiniteThick;

			},
			set( val ) {

				if ( this._infiniteThick === val ) return;
				this._infiniteThick = val;
				this.ssrMaterial.defines.INFINITE_THICK = val;
				this.ssrMaterial.needsUpdate = true;

			}
		} );

		// beauty render target with depth buffer

		const depthTexture = new DepthTexture();
		depthTexture.type = UnsignedShortType;
		depthTexture.minFilter = NearestFilter;
		depthTexture.magFilter = NearestFilter;

		this.beautyRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			depthTexture: depthTexture,
			depthBuffer: true
		} );

		//for bouncing
		this.prevRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter
		} );

		// normal render target

		this.normalRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
		} );

		// metalness render target

		this.metalnessRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
		} );



		// ssr render target

		this.ssrRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter
		} );

		this.blurRenderTarget = this.ssrRenderTarget.clone();
		this.blurRenderTarget2 = this.ssrRenderTarget.clone();
		// this.blurRenderTarget3 = this.ssrRenderTarget.clone();

		// ssr material

		this.ssrMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SSRShader.defines, {
				MAX_STEP: Math.sqrt( this.width * this.width + this.height * this.height )
			} ),
			uniforms: UniformsUtils.clone( SSRShader.uniforms ),
			vertexShader: SSRShader.vertexShader,
			fragmentShader: SSRShader.fragmentShader,
			blending: NoBlending
		} );

		this.ssrMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
		this.ssrMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
		this.ssrMaterial.defines.SELECTIVE = this.selective;
		this.ssrMaterial.needsUpdate = true;
		this.ssrMaterial.uniforms[ 'tMetalness' ].value = this.metalnessRenderTarget.texture;
		this.ssrMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
		this.ssrMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.ssrMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.ssrMaterial.uniforms[ 'thickness' ].value = this.thickness;
		this.ssrMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
		this.ssrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

		// normal material

		this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

		// metalnessOn material

		this.metalnessOnMaterial = new MeshBasicMaterial( {
			color: 'white'
		} );

		// metalnessOff material

		this.metalnessOffMaterial = new MeshBasicMaterial( {
			color: 'black'
		} );

		// blur material

		this.blurMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SSRBlurShader.defines ),
			uniforms: UniformsUtils.clone( SSRBlurShader.uniforms ),
			vertexShader: SSRBlurShader.vertexShader,
			fragmentShader: SSRBlurShader.fragmentShader
		} );
		this.blurMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
		this.blurMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );

		// blur material 2

		this.blurMaterial2 = new ShaderMaterial( {
			defines: Object.assign( {}, SSRBlurShader.defines ),
			uniforms: UniformsUtils.clone( SSRBlurShader.uniforms ),
			vertexShader: SSRBlurShader.vertexShader,
			fragmentShader: SSRBlurShader.fragmentShader
		} );
		this.blurMaterial2.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget.texture;
		this.blurMaterial2.uniforms[ 'resolution' ].value.set( this.width, this.height );

		// // blur material 3

		// this.blurMaterial3 = new ShaderMaterial({
		//   defines: Object.assign({}, SSRBlurShader.defines),
		//   uniforms: UniformsUtils.clone(SSRBlurShader.uniforms),
		//   vertexShader: SSRBlurShader.vertexShader,
		//   fragmentShader: SSRBlurShader.fragmentShader
		// });
		// this.blurMaterial3.uniforms['tDiffuse'].value = this.blurRenderTarget2.texture;
		// this.blurMaterial3.uniforms['resolution'].value.set(this.width, this.height);

		// material for rendering the depth

		this.depthRenderMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SSRDepthShader.defines ),
			uniforms: UniformsUtils.clone( SSRDepthShader.uniforms ),
			vertexShader: SSRDepthShader.vertexShader,
			fragmentShader: SSRDepthShader.fragmentShader,
			blending: NoBlending
		} );
		this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
		this.depthRenderMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.depthRenderMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

		// material for rendering the content of a render target

		this.copyMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blendSrc: SrcAlphaFactor,
			blendDst: OneMinusSrcAlphaFactor,
			blendEquation: AddEquation,
			blendSrcAlpha: SrcAlphaFactor,
			blendDstAlpha: OneMinusSrcAlphaFactor,
			blendEquationAlpha: AddEquation,
			// premultipliedAlpha:true,
		} );

		this.fsQuad = new FullScreenQuad( null );

		this.originalClearColor = new Color();

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		// dispose render targets

		this.beautyRenderTarget.dispose();
		this.prevRenderTarget.dispose();
		this.normalRenderTarget.dispose();
		this.metalnessRenderTarget.dispose();
		this.ssrRenderTarget.dispose();
		this.blurRenderTarget.dispose();
		this.blurRenderTarget2.dispose();
		// this.blurRenderTarget3.dispose();

		// dispose materials

		this.normalMaterial.dispose();
		this.metalnessOnMaterial.dispose();
		this.metalnessOffMaterial.dispose();
		this.blurMaterial.dispose();
		this.blurMaterial2.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();

		// dispose full screen quad

		this.fsQuad.dispose();

	}

	/**
	 * Performs the SSR pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer /*, readBuffer, deltaTime, maskActive */ ) {

		// render beauty and depth

		renderer.setRenderTarget( this.beautyRenderTarget );
		renderer.clear();
		if ( this.groundReflector ) {

			this.groundReflector.visible = false;
			this.groundReflector.doRender( this.renderer, this.scene, this.camera );
			this.groundReflector.visible = true;

		}

		renderer.render( this.scene, this.camera );
		if ( this.groundReflector ) this.groundReflector.visible = false;

		// render normals

		this._renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0, 0 );

		// render metalnesses

		if ( this.selective ) {

			this._renderMetalness( renderer, this.metalnessOnMaterial, this.metalnessRenderTarget, 0, 0 );

		}

		// render SSR

		this.ssrMaterial.uniforms[ 'opacity' ].value = this.opacity;
		this.ssrMaterial.uniforms[ 'maxDistance' ].value = this.maxDistance;
		this.ssrMaterial.uniforms[ 'thickness' ].value = this.thickness;
		this._renderPass( renderer, this.ssrMaterial, this.ssrRenderTarget );


		// render blur

		if ( this.blur ) {

			this._renderPass( renderer, this.blurMaterial, this.blurRenderTarget );
			this._renderPass( renderer, this.blurMaterial2, this.blurRenderTarget2 );
			// this._renderPass(renderer, this.blurMaterial3, this.blurRenderTarget3);

		}

		// output result to screen

		switch ( this.output ) {

			case SSRPass.OUTPUT.Default:

				if ( this.bouncing ) {

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this._renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

					if ( this.blur )
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
					else
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
					this.copyMaterial.blending = NormalBlending;
					this._renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.prevRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				} else {

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

					if ( this.blur )
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
					else
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
					this.copyMaterial.blending = NormalBlending;
					this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				}

				break;
			case SSRPass.OUTPUT.SSR:

				if ( this.blur )
					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
				else
					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				if ( this.bouncing ) {

					if ( this.blur )
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
					else
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this._renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
					this.copyMaterial.blending = NormalBlending;
					this._renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

				}

				break;

			case SSRPass.OUTPUT.Beauty:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRPass.OUTPUT.Depth:

				this._renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRPass.OUTPUT.Normal:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRPass.OUTPUT.Metalness:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.metalnessRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.SSRPass: Unknown output type.' );

		}

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The height to set.
	 */
	setSize( width, height ) {

		this.width = width;
		this.height = height;

		this.ssrMaterial.defines.MAX_STEP = Math.sqrt( width * width + height * height );
		this.ssrMaterial.needsUpdate = true;
		this.beautyRenderTarget.setSize( width, height );
		this.prevRenderTarget.setSize( width, height );
		this.ssrRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.metalnessRenderTarget.setSize( width, height );
		this.blurRenderTarget.setSize( width, height );
		this.blurRenderTarget2.setSize( width, height );
		// this.blurRenderTarget3.setSize(width, height);

		this.ssrMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.ssrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

		this.blurMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.blurMaterial2.uniforms[ 'resolution' ].value.set( width, height );

	}

	// internals

	_renderPass( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		const originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );

		// setup pass state
		renderer.autoClear = false;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.fsQuad.material = passMaterial;
		this.fsQuad.render( renderer );

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	_renderOverride( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		const originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.overrideMaterial = overrideMaterial;
		renderer.render( this.scene, this.camera );
		this.scene.overrideMaterial = null;

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	_renderMetalness( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		const originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		const originalAutoClear = renderer.autoClear;
		const originalBackground = this.scene.background;
		const originalFog = this.scene.fog;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;
		this.scene.background = null;
		this.scene.fog = null;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.traverseVisible( child => {

			child._SSRPassBackupMaterial = child.material;
			if ( this._selects.includes( child ) ) {

				child.material = this.metalnessOnMaterial;

			} else {

				child.material = this.metalnessOffMaterial;

			}

		} );
		renderer.render( this.scene, this.camera );
		this.scene.traverseVisible( child => {

			child.material = child._SSRPassBackupMaterial;

		} );

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );
		this.scene.background = originalBackground;
		this.scene.fog = originalFog;

	}

}

/**
 * Constructor options of `SSRPass`.
 *
 * @typedef {Object} SSRPass~Options
 * @property {WebGLRenderer} renderer - The renderer.
 * @property {Scene} scene - The scene to render.
 * @property {Camera} camera - The camera.
 * @property {number} [width=512] - The width of the effect.
 * @property {number} [height=512] - The width of the effect.
 * @property {?Array<Object3D>} [selects=null] - Which 3D objects should be affected by SSR. If not set, the entire scene is affected.
 * @property {boolean} [bouncing=false] - Whether bouncing is enabled or not.
 * @property {?ReflectorForSSRPass} [groundReflector=null] - A ground reflector.
 **/

SSRPass.OUTPUT = {
	'Default': 0,
	'SSR': 1,
	'Beauty': 3,
	'Depth': 4,
	'Normal': 5,
	'Metalness': 7,
};

export { SSRPass };
