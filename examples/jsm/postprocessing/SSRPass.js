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
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	UnsignedShortType,
	WebGLRenderTarget,
	HalfFloatType,
} from '../../../build/three.module.js';
import { Pass, FullScreenQuad } from '../postprocessing/Pass.js';
import { SSRShader } from '../shaders/SSRShader.js';
import { SSRBlurShader } from '../shaders/SSRShader.js';
import { SSRDepthShader } from '../shaders/SSRShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

class SSRPass extends Pass {

	constructor( { renderer, scene, camera, width, height, selects, encoding, bouncing = false, morphTargets = false, groundReflector } ) {

		super();

		this.width = ( width !== undefined ) ? width : 512;
		this.height = ( height !== undefined ) ? height : 512;

		this.clear = true;

		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.groundReflector = groundReflector;

		this.opacity = SSRShader.uniforms.opacity.value;
		this.defaultIntensity = 1;
		this.output = 0;

		this.maxDistance = SSRShader.uniforms.maxDistance.value;
		this.thickness = SSRShader.uniforms.thickness.value;

		this.encoding = encoding;

		this.tempColor = new Color();

		this.selects = [];

		this._bouncing = bouncing;
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

		this.blur = true;

		this._distanceAttenuation = SSRShader.defines.DISTANCE_ATTENUATION;
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
			format: RGBAFormat,
			depthTexture: depthTexture,
			depthBuffer: true
		} );

		//for bouncing
		this.prevRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat,
		} );

		// normal render target

		this.normalRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat,
			type: HalfFloatType,
		} );

		// intensity render target

		this.intensityRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		} );



		// ssr render target

		this.ssrRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
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
		this.ssrMaterial.needsUpdate = true;
		this.ssrMaterial.uniforms[ 'tIntensity' ].value = this.intensityRenderTarget.texture;
		this.ssrMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
		this.ssrMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.ssrMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.ssrMaterial.uniforms[ 'thickness' ].value = this.thickness;
		this.ssrMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
		this.ssrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

		// normal material

		this.normalMaterial = new MeshNormalMaterial( { morphTargets } );
		this.normalMaterial.blending = NoBlending;

		// intensity material

		this.intensityMaterial = new MeshBasicMaterial( {
			color: 'white'
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

		this.setSelects( selects );

	}

	dispose() {

		// dispose render targets

		this.beautyRenderTarget.dispose();
		this.prevRenderTarget.dispose();
		this.normalRenderTarget.dispose();
		this.intensityRenderTarget.dispose();
		this.ssrRenderTarget.dispose();
		this.blurRenderTarget.dispose();
		this.blurRenderTarget2.dispose();
		// this.blurRenderTarget3.dispose();

		// dispose materials

		this.normalMaterial.dispose();
		this.intensityMaterial.dispose();
		this.blurMaterial.dispose();
		this.blurMaterial2.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();

		// dipsose full screen quad

		this.fsQuad.dispose();

	}

	render( renderer, writeBuffer /*, readBuffer, deltaTime, maskActive */ ) {

		// render beauty and depth

		if ( this.encoding ) this.beautyRenderTarget.texture.encoding = this.encoding;
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

		this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0, 0 );

		// render intensities

		this.renderIntensity( renderer, this.intensityRenderTarget, 0, 0 );

		// render SSR

		this.ssrMaterial.uniforms[ 'opacity' ].value = this.opacity;
		this.ssrMaterial.uniforms[ 'maxDistance' ].value = this.maxDistance;
		this.ssrMaterial.uniforms[ 'thickness' ].value = this.thickness;
		this.renderPass( renderer, this.ssrMaterial, this.ssrRenderTarget );


		// render blur

		if ( this.blur ) {

			this.renderPass( renderer, this.blurMaterial, this.blurRenderTarget );
			this.renderPass( renderer, this.blurMaterial2, this.blurRenderTarget2 );
			// this.renderPass(renderer, this.blurMaterial3, this.blurRenderTarget3);

		}

		// output result to screen

		switch ( this.output ) {

			case SSRPass.OUTPUT.Default:

				if ( this.bouncing ) {

					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
					this.copyMaterial.blending = NoBlending;
					this.renderPass( renderer, this.copyMaterial, this.prevRenderTarget );

					if ( this.blur )
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

					if ( this.blur )
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
					else
						this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
					this.copyMaterial.blending = NormalBlending;
					this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				}

				break;
			case SSRPass.OUTPUT.SSR:

				if ( this.blur )
					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget2.texture;
				else
					this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				if ( this.bouncing ) {

					if ( this.blur )
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

			case SSRPass.OUTPUT.Intensity:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.intensityRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.SSRPass: Unknown output type.' );

		}

	}

	renderPass( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

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

	renderOverride( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

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

	renderIntensity( renderer, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		const originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.traverseVisible( child => {

			if ( this.selects.includes( child ) && child.material ) {

				if ( child.material.type === 'MeshStandardMaterial' || child.material.type === 'MeshPhysicalMaterial' ) {

					this.intensityMaterial.color.setScalar( child.material.envMapIntensity );

				} else {

					this.intensityMaterial.color.setScalar( this.defaultIntensity );

				}

				const materialBack = child.material;
				child.material = this.intensityMaterial;
				renderer.render( child, this.camera, false );
				child.material = materialBack;

			}

		} );

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	setSelects( selects ) {

		this.selects = [];
		selects.forEach( obj3d=>{

			obj3d.traverseVisible( child=>{

				if ( child.type === 'Mesh' ) {

					this.selects.push( child );

				}

			} );

		} );
		this.selects = Array.from( new Set( this.selects ) );

	}

	setSize( width, height ) {

		this.width = width;
		this.height = height;

		this.ssrMaterial.defines.MAX_STEP = Math.sqrt( width * width + height * height );
		this.ssrMaterial.needsUpdate = true;
		this.beautyRenderTarget.setSize( width, height );
		this.prevRenderTarget.setSize( width, height );
		this.ssrRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.intensityRenderTarget.setSize( width, height );
		this.blurRenderTarget.setSize( width, height );
		this.blurRenderTarget2.setSize( width, height );
		// this.blurRenderTarget3.setSize(width, height);

		this.ssrMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.ssrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

		this.blurMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.blurMaterial2.uniforms[ 'resolution' ].value.set( width, height );

	}

}

SSRPass.OUTPUT = {
	'Default': 0,
	'SSR': 1,
	'Beauty': 3,
	'Depth': 4,
	'Normal': 5,
	'Intensity': 7,
};

export { SSRPass };
