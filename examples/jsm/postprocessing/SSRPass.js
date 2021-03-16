import {
	AddEquation,
	Color,
	NormalBlending,
	DepthTexture,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor,
	LinearFilter,
	MeshNormalMaterial,
	MeshBasicMaterial,
	NearestFilter,
	NoBlending,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	UnsignedShortType,
	WebGLRenderTarget,
	HalfFloatType,
} from '../../../build/three.module.js';
import { Pass } from '../postprocessing/Pass.js';
import { SSRShader } from '../shaders/SSRShader.js';
import { SSRBlurShader } from '../shaders/SSRShader.js';
import { SSRDepthShader } from '../shaders/SSRShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

var SSRPass = function ( { renderer, scene, camera, width, height, selects, encoding, isPerspectiveCamera = true, isBouncing = false, morphTargets = false, groundReflector } ) {

	Pass.call( this );

	this.width = ( width !== undefined ) ? width : 512;
	this.height = ( height !== undefined ) ? height : 512;

	this.clear = true;

	this.renderer = renderer;
	this.scene = scene;
	this.camera = camera;
	this.groundReflector = groundReflector;

	this.opacity = SSRShader.uniforms.opacity.value;
	this.output = 0;

	this.maxDistance = SSRShader.uniforms.maxDistance.value;
	this.surfDist = SSRShader.uniforms.surfDist.value;

	this.encoding = encoding;

	this.tempColor = new Color();

	this._selects = selects;
	this.isSelective = Array.isArray( this._selects );
	Object.defineProperty( this, 'selects', {
		get() {

			return this._selects;

		},
		set( val ) {

			if ( this._selects === val ) return;
			this._selects = val;
			if ( Array.isArray( val ) ) {

				this.isSelective = true;
				this.ssrMaterial.defines.isSelective = true;
				this.ssrMaterial.needsUpdate = true;

			} else {

				this.isSelective = false;
				this.ssrMaterial.defines.isSelective = false;
				this.ssrMaterial.needsUpdate = true;

			}

		}
	} );

	this._isBouncing = isBouncing; ///todo: don't need defineProperty
	Object.defineProperty( this, 'isBouncing', {
		get() {

			return this._isBouncing;

		},
		set( val ) {

			if ( this._isBouncing === val ) return;
			this._isBouncing = val;
			if ( val ) {

				this.ssrMaterial.uniforms[ 'tDiffuse' ].value = this.prevRenderTarget.texture;

			} else {

				this.ssrMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;

			}

		}
	} );

	this.isBlur = true;

	this._isDistanceAttenuation = SSRShader.defines.isDistanceAttenuation;
	Object.defineProperty( this, 'isDistanceAttenuation', {
		get() {

			return this._isDistanceAttenuation;

		},
		set( val ) {

			if ( this._isDistanceAttenuation === val ) return;
			this._isDistanceAttenuation = val;
			this.ssrMaterial.defines.isDistanceAttenuation = val;
			this.ssrMaterial.needsUpdate = true;

		}
	} );


	this._isFresnel = SSRShader.defines.isFresnel;
	Object.defineProperty( this, 'isFresnel', {
		get() {

			return this._isFresnel;

		},
		set( val ) {

			if ( this._isFresnel === val ) return;
			this._isFresnel = val;
			this.ssrMaterial.defines.isFresnel = val;
			this.ssrMaterial.needsUpdate = true;

		}
	} );

	this._isInfiniteThick = SSRShader.defines.isInfiniteThick;
	Object.defineProperty( this, 'isInfiniteThick', {
		get() {

			return this._isInfiniteThick;

		},
		set( val ) {

			if ( this._isInfiniteThick === val ) return;
			this._isInfiniteThick = val;
			this.ssrMaterial.defines.isInfiniteThick = val;
			this.ssrMaterial.needsUpdate = true;

		}
	} );
	this.thickTolerance = SSRShader.uniforms.thickTolerance.value;

	// beauty render target with depth buffer

	var depthTexture = new DepthTexture();
	depthTexture.type = UnsignedShortType;
	depthTexture.minFilter = NearestFilter;
	depthTexture.maxFilter = NearestFilter;

	this.beautyRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat,
		depthTexture: depthTexture,
		depthBuffer: true
	} );

	//for bouncing
	this.prevRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat,
	} );

	// normal render target

	this.normalRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		format: RGBAFormat,
		type: HalfFloatType,
	} );

	// metalness render target

	// if (this.isSelective) {
	this.metalnessRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		format: RGBAFormat
	} );
	// }



	// ssr render target

	this.ssrRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat
	} );

	this.blurRenderTarget = this.ssrRenderTarget.clone();
	this.blurRenderTarget2 = this.ssrRenderTarget.clone();
	// this.blurRenderTarget3 = this.ssrRenderTarget.clone();

	// ssr material

	if ( SSRShader === undefined ) {

		console.error( 'THREE.SSRPass: The pass relies on SSRShader.' );

	}

	this.ssrMaterial = new ShaderMaterial( {
		defines: Object.assign( {
			MAX_STEP: Math.sqrt( window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight )
		}, SSRShader.defines ),
		uniforms: UniformsUtils.clone( SSRShader.uniforms ),
		vertexShader: SSRShader.vertexShader,
		fragmentShader: SSRShader.fragmentShader,
		blending: NoBlending
	} );
	if ( ! isPerspectiveCamera ) {

		this.ssrMaterial.defines.isPerspectiveCamera = isPerspectiveCamera;
		this.ssrMaterial.needsUpdate = true;

	}

	this.ssrMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
	this.ssrMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
	// if (this.isSelective) {
	this.ssrMaterial.defines.isSelective = this.isSelective;
	this.ssrMaterial.needsUpdate = true;
	this.ssrMaterial.uniforms[ 'tMetalness' ].value = this.metalnessRenderTarget.texture;
	// }
	this.ssrMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
	this.ssrMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
	this.ssrMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
	this.ssrMaterial.uniforms[ 'surfDist' ].value = this.surfDist;
	this.ssrMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
	this.ssrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
	this.ssrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

	// normal material

	this.normalMaterial = new MeshNormalMaterial( { morphTargets } );
	this.normalMaterial.blending = NoBlending;

	// if (this.isSelective) {
	// metalnessOn material

	this.metalnessOnMaterial = new MeshBasicMaterial( {
		color: 'white'
	} );

	// metalnessOff material

	this.metalnessOffMaterial = new MeshBasicMaterial( {
		color: 'black'
	} );
	// }

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

	this.fsQuad = new Pass.FullScreenQuad( null );

	this.originalClearColor = new Color();

};

SSRPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: SSRPass,

	dispose: function () {

		// dispose render targets

		this.beautyRenderTarget.dispose();
		this.prevRenderTarget.dispose();
		this.normalRenderTarget.dispose();
		// if (this.isSelective)
		this.metalnessRenderTarget.dispose();
		this.ssrRenderTarget.dispose();
		this.blurRenderTarget.dispose();
		this.blurRenderTarget2.dispose();
		// this.blurRenderTarget3.dispose();

		// dispose materials

		this.normalMaterial.dispose();
		// if (this.isSelective) {
		this.metalnessOnMaterial.dispose();
		this.metalnessOffMaterial.dispose();
		// }
		this.blurMaterial.dispose();
		this.blurMaterial2.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();

		// dipsose full screen quad

		this.fsQuad.dispose();

	},

	render: function ( renderer, writeBuffer /*, readBuffer, deltaTime, maskActive */ ) {

		// render beauty and depth

		if ( this.encoding ) this.beautyRenderTarget.texture.encoding = this.encoding;
		renderer.setRenderTarget( this.beautyRenderTarget );
		renderer.clear();
		if ( this.groundReflector ) {

			this.groundReflector.doRender( this.renderer, this.scene, this.camera );
			this.groundReflector.visible = true;

		}

		renderer.render( this.scene, this.camera );
		if ( this.groundReflector ) this.groundReflector.visible = false;

		// render normals

		this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0, 0 );

		// render metalnesses

		if ( this.isSelective ) {

			this.renderMetalness( renderer, this.metalnessOnMaterial, this.metalnessRenderTarget, 0, 0 );

		}

		// render SSR

		this.ssrMaterial.uniforms[ 'opacity' ].value = this.opacity;
		this.ssrMaterial.uniforms[ 'maxDistance' ].value = this.maxDistance;
		this.ssrMaterial.uniforms[ 'surfDist' ].value = this.surfDist;
		this.ssrMaterial.uniforms[ 'thickTolerance' ].value = this.thickTolerance;
		this.renderPass( renderer, this.ssrMaterial, this.ssrRenderTarget );


		// render blur

		if ( this.isBlur ) {

			this.renderPass( renderer, this.blurMaterial, this.blurRenderTarget );
			this.renderPass( renderer, this.blurMaterial2, this.blurRenderTarget2 );
			// this.renderPass(renderer, this.blurMaterial3, this.blurRenderTarget3);

		}

		// output result to screen

		switch ( this.output ) {

			case SSRPass.OUTPUT.Default:

				if ( this.isBouncing ) {

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this.renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

					if ( this.isBlur )
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
					else
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
					this.copyMaterial.blending = NormalBlending;
					this.renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.prevRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				} else {

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

					if ( this.isBlur )
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
					else
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
					this.copyMaterial.blending = NormalBlending;
					this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				}

				break;
			case SSRPass.OUTPUT.SSR:

				if ( this.isBlur )
					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
				else
					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				if ( this.isBouncing ) {

					if ( this.isBlur )
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
					else
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this.renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
					this.copyMaterial.blending = NormalBlending;
					this.renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

				}

				break;

			case SSRPass.OUTPUT.Beauty:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRPass.OUTPUT.Depth:

				this.renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRPass.OUTPUT.Normal:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRPass.OUTPUT.Metalness:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.metalnessRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.SSRPass: Unknown output type.' );

		}

	},

	renderPass: function ( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		var originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		var originalAutoClear = renderer.autoClear;

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

	},

	renderOverride: function ( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		var originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		var originalAutoClear = renderer.autoClear;

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

	},

	renderMetalness: function ( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		var originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		var originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.traverseVisible( child => {

			child._SSRPassMaterialBack = child.material;
			if ( this._selects.includes( child ) ) {

				child.material = this.metalnessOnMaterial;

			} else {

				child.material = this.metalnessOffMaterial;

			}

		} );
		renderer.render( this.scene, this.camera );
		this.scene.traverseVisible( child => {

			child.material = child._SSRPassMaterialBack;

		} );

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},

	setSize: function ( width, height ) {

		this.width = width;
		this.height = height;

		this.ssrMaterial.defines.MAX_STEP = Math.sqrt( width * width + height * height );
		this.ssrMaterial.needsUpdate = true;
		this.beautyRenderTarget.setSize( width, height );
		this.prevRenderTarget.setSize( width, height );
		this.ssrRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		// if (this.isSelective)
		this.metalnessRenderTarget.setSize( width, height );
		this.blurRenderTarget.setSize( width, height );
		this.blurRenderTarget2.setSize( width, height );
		// this.blurRenderTarget3.setSize(width, height);

		this.ssrMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.ssrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

		this.blurMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.blurMaterial2.uniforms[ 'resolution' ].value.set( width, height );

	},

} );

SSRPass.OUTPUT = {
	'Default': 0,
	'SSR': 1,
	'Beauty': 3,
	'Depth': 4,
	'Normal': 5,
	'Metalness': 7,
};

export { SSRPass };
