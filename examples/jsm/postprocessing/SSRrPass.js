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
	MeshStandardMaterial
} from '../../../build/three.module.js';
import { Pass, FullScreenQuad } from '../postprocessing/Pass.js';
import { SSRrShader } from '../shaders/SSRrShader.js';
import { SSRrDepthShader } from '../shaders/SSRrShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

class SSRrPass extends Pass {

	constructor( { renderer, scene, camera, width, height, selects, encoding } ) {

		super();

		this.width = ( width !== undefined ) ? width : 512;
		this.height = ( height !== undefined ) ? height : 512;

		this.clear = true;

		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;

		this.output = 0;
		// this.output = 1;

		this.ior = SSRrShader.uniforms.ior.value;
		this.maxDistance = SSRrShader.uniforms.maxDistance.value;
		this.surfDist = SSRrShader.uniforms.surfDist.value;

		this.encoding = encoding;

		this.tempColor = new Color();

		this.selects = selects;

		this._specular = SSRrShader.defines.SPECULAR;
		Object.defineProperty( this, 'specular', {
			get() {

				return this._specular;

			},
			set( val ) {

				if ( this._specular === val ) return;
				this._specular = val;
				this.ssrrMaterial.defines.SPECULAR = val;
				this.ssrrMaterial.needsUpdate = true;

			}
		} );

		this._fillHole = SSRrShader.defines.FILL_HOLE;
		Object.defineProperty( this, 'fillHole', {
			get() {

				return this._fillHole;

			},
			set( val ) {

				if ( this._fillHole === val ) return;
				this._fillHole = val;
				this.ssrrMaterial.defines.FILL_HOLE = val;
				this.ssrrMaterial.needsUpdate = true;

			}
		} );

		this._infiniteThick = SSRrShader.defines.INFINITE_THICK;
		Object.defineProperty( this, 'infiniteThick', {
			get() {

				return this._infiniteThick;

			},
			set( val ) {

				if ( this._infiniteThick === val ) return;
				this._infiniteThick = val;
				this.ssrrMaterial.defines.INFINITE_THICK = val;
				this.ssrrMaterial.needsUpdate = true;

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

		this.specularRenderTarget = new WebGLRenderTarget( this.width, this.height, { // TODO: Can merge with refractiveRenderTarget?
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat,
		} );

		// normalSelects render target

		const depthTextureSelects = new DepthTexture();
		depthTextureSelects.type = UnsignedShortType;
		depthTextureSelects.minFilter = NearestFilter;
		depthTextureSelects.magFilter = NearestFilter;

		this.normalSelectsRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat,
			type: HalfFloatType,
			depthTexture: depthTextureSelects,
			depthBuffer: true
		} );

		// refractive render target

		this.refractiveRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		} );

		// ssrr render target

		this.ssrrRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		} );

		// ssrr material

		if ( SSRrShader === undefined ) {

			console.error( 'THREE.SSRrPass: The pass relies on SSRrShader.' );

		}

		this.ssrrMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SSRrShader.defines, {
				MAX_STEP: Math.sqrt( this.width * this.width + this.height * this.height )
			} ),
			uniforms: UniformsUtils.clone( SSRrShader.uniforms ),
			vertexShader: SSRrShader.vertexShader,
			fragmentShader: SSRrShader.fragmentShader,
			blending: NoBlending
		} );

		this.ssrrMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
		this.ssrrMaterial.uniforms[ 'tSpecular' ].value = this.specularRenderTarget.texture;
		this.ssrrMaterial.uniforms[ 'tNormalSelects' ].value = this.normalSelectsRenderTarget.texture;
		this.ssrrMaterial.needsUpdate = true;
		this.ssrrMaterial.uniforms[ 'tRefractive' ].value = this.refractiveRenderTarget.texture;
		this.ssrrMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
		this.ssrrMaterial.uniforms[ 'tDepthSelects' ].value = this.normalSelectsRenderTarget.depthTexture;
		this.ssrrMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.ssrrMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.ssrrMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
		this.ssrrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

		// normal material

		this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

		// refractiveOn material

		this.refractiveOnMaterial = new MeshBasicMaterial( {
			color: 'white'
		} );

		// refractiveOff material

		this.refractiveOffMaterial = new MeshBasicMaterial( {
			color: 'black'
		} );

		// specular material
		this.specularMaterial = new MeshStandardMaterial( {
			color: 'black',
			metalness: 0,
			roughness: .2,
		} );

		// material for rendering the depth

		this.depthRenderMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SSRrDepthShader.defines ),
			uniforms: UniformsUtils.clone( SSRrDepthShader.uniforms ),
			vertexShader: SSRrDepthShader.vertexShader,
			fragmentShader: SSRrDepthShader.fragmentShader,
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

	dispose() {

		// dispose render targets

		this.beautyRenderTarget.dispose();
		this.specularRenderTarget.dispose();
		this.normalSelectsRenderTarget.dispose();
		this.refractiveRenderTarget.dispose();
		this.ssrrRenderTarget.dispose();

		// dispose materials

		this.normalMaterial.dispose();
		this.refractiveOnMaterial.dispose();
		this.refractiveOffMaterial.dispose();
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
		this.scene.children.forEach( child => {

			if ( this.selects.includes( child ) ) {

				child.visible = false;

			} else {

				child.visible = true;

			}

		} );
		renderer.render( this.scene, this.camera );

		renderer.setRenderTarget( this.specularRenderTarget );
		renderer.clear();
		this.scene.children.forEach( child => {

			if ( this.selects.includes( child ) ) {

				child.visible = true;
				child._SSRrPassBackupMaterial = child.material;
				child.material = this.specularMaterial;

			} else if ( ! child.isLight ) {

				child.visible = false;

			}

		} );
		renderer.render( this.scene, this.camera );
		this.scene.children.forEach( child => {

			if ( this.selects.includes( child ) ) {

				child.material = child._SSRrPassBackupMaterial;

			}

		} );


		// render normalSelectss

		this.scene.children.forEach( child => {

			if ( this.selects.includes( child ) ) {

				child.visible = true;

			} else {

				child.visible = false;

			}

		} );

		this.renderOverride( renderer, this.normalMaterial, this.normalSelectsRenderTarget, 0, 0 );

		this.renderRefractive( renderer, this.refractiveOnMaterial, this.refractiveRenderTarget, 0, 0 );

		// render SSRr

		this.ssrrMaterial.uniforms[ 'ior' ].value = this.ior;
		this.ssrrMaterial.uniforms[ 'maxDistance' ].value = this.maxDistance;
		this.ssrrMaterial.uniforms[ 'surfDist' ].value = this.surfDist;
		this.ssrrMaterial.uniforms[ 'tSpecular' ].value = this.specularRenderTarget.texture;
		this.renderPass( renderer, this.ssrrMaterial, this.ssrrRenderTarget );

		// output result to screen

		switch ( this.output ) {

			case SSRrPass.OUTPUT.Default:


				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrrRenderTarget.texture;
				this.copyMaterial.blending = NormalBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;
			case SSRrPass.OUTPUT.SSRr:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrrRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Beauty:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Depth:

				this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
				this.renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.DepthSelects:

				this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.normalSelectsRenderTarget.depthTexture;
				this.renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.NormalSelects:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.normalSelectsRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Refractive:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.refractiveRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Specular:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.specularRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.SSRrPass: Unknown output type.' );

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

	renderRefractive( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

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

		this.scene.children.forEach( child => {

			child.visible = true;

		} );
		this.scene.traverse( child => {

			child._SSRrPassBackupMaterial = child.material;
			if ( this.selects.includes( child ) ) {

				child.material = this.refractiveOnMaterial;

			} else {

				child.material = this.refractiveOffMaterial;

			}

		} );
		this.scene._SSRrPassBackupBackground = this.scene.background;
		this.scene.background = null;
		this.scene._SSRrPassBackupFog = this.scene.fog;
		this.scene.fog = null;
		renderer.render( this.scene, this.camera );
		this.scene.fog = this.scene._SSRrPassBackupFog;
		this.scene.background = this.scene._SSRrPassBackupBackground;
		this.scene.traverse( child => {

			child.material = child._SSRrPassBackupMaterial;

		} );

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	setSize( width, height ) {

		this.width = width;
		this.height = height;

		this.ssrrMaterial.defines.MAX_STEP = Math.sqrt( width * width + height * height );
		this.ssrrMaterial.needsUpdate = true;
		this.beautyRenderTarget.setSize( width, height );
		this.specularRenderTarget.setSize( width, height );
		this.ssrrRenderTarget.setSize( width, height );
		this.normalSelectsRenderTarget.setSize( width, height );
		this.refractiveRenderTarget.setSize( width, height );

		this.ssrrMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.ssrrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

	}

}

SSRrPass.OUTPUT = {
	'Default': 0,
	'SSRr': 1,
	'Beauty': 3,
	'Depth': 4,
	'DepthSelects': 9,
	'NormalSelects': 5,
	'Refractive': 7,
	'Specular': 8,
};

export { SSRrPass };
