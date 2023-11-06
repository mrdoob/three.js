import {
	AddEquation,
	Color,
	CustomBlending,
	DataTexture,
	DepthStencilFormat,
	DepthTexture,
	DstAlphaFactor,
	DstColorFactor,
	HalfFloatType,
	MeshNormalMaterial,
	NearestFilter,
	NoBlending,
	RepeatWrapping,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	UnsignedByteType,
	UnsignedInt248Type,
	WebGLRenderTarget,
	ZeroFactor
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { generateHaboSampleKernelInitializer, HBAOShader, HBAODepthShader } from '../shaders/HBAOShader.js';
import { generatePdSamplePointInitializer, PoissonDenoiseShader } from '../shaders/PoissonDenoiseShader.js';
import { CopyShader } from '../shaders/CopyShader.js';
import { SimplexNoise } from '../math/SimplexNoise.js';

class HBAOPass extends Pass {

	constructor( scene, camera, width, height, parameters ) {

		super();

		this.width = ( width !== undefined ) ? width : 512;
		this.height = ( height !== undefined ) ? height : 512;
		this.clear = true;
		this.camera = camera;
		this.scene = scene;
		this.output = 0;
		this._renderGBuffer = true;
		this._visibilityCache = new Map();

		this.rings = 4;
		this.samples = 16;

		this.noiseTexture = this.generateNoise();

		this.hbaoRenderTarget = new WebGLRenderTarget( this.width, this.height, { type: HalfFloatType } );
		this.pdRenderTarget = this.hbaoRenderTarget.clone();

		this.hbaoMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, HBAOShader.defines ),
			uniforms: UniformsUtils.clone( HBAOShader.uniforms ),
			vertexShader: HBAOShader.vertexShader,
			fragmentShader: HBAOShader.fragmentShader,
			blending: NoBlending,
			depthTest: false,
			depthWrite: false,
		} );
		this.hbaoMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
		this.hbaoMaterial.uniforms[ 'tNoise' ].value = this.noiseTexture;
		this.hbaoMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
		this.hbaoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.hbaoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.hbaoMaterial.uniforms[ 'radius' ].value = 2;
		this.hbaoMaterial.uniforms[ 'distanceExponent' ].value = 2;
		this.hbaoMaterial.uniforms[ 'bias' ].value = 0.01;

		this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

		this.pdMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, PoissonDenoiseShader.defines ),
			uniforms: UniformsUtils.clone( PoissonDenoiseShader.uniforms ),
			vertexShader: PoissonDenoiseShader.vertexShader,
			fragmentShader: PoissonDenoiseShader.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );
		this.pdMaterial.uniforms[ 'tDiffuse' ].value = this.hbaoRenderTarget.texture;
		this.pdMaterial.uniforms[ 'tNoise' ].value = this.noiseTexture;
		this.pdMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
		this.pdMaterial.uniforms[ 'lumaPhi' ].value = 10;
		this.pdMaterial.uniforms[ 'depthPhi' ].value = 2;
		this.pdMaterial.uniforms[ 'normalPhi' ].value = 3;

		this.depthRenderMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, HBAODepthShader.defines ),
			uniforms: UniformsUtils.clone( HBAODepthShader.uniforms ),
			vertexShader: HBAODepthShader.vertexShader,
			fragmentShader: HBAODepthShader.fragmentShader,
			blending: NoBlending
		} );
		this.depthRenderMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.depthRenderMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

		this.copyMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blendSrc: DstColorFactor,
			blendDst: ZeroFactor,
			blendEquation: AddEquation,
			blendSrcAlpha: DstAlphaFactor,
			blendDstAlpha: ZeroFactor,
			blendEquationAlpha: AddEquation
		} );

		this.fsQuad = new FullScreenQuad( null );

		this.originalClearColor = new Color();

		this.setTextures( parameters ? parameters.depthTexture : undefined, parameters ? parameters.normalTexture : undefined );

	}

	dispose() {

		this.noiseTexture.dispose();
		this.normalRenderTarget.dispose();
		this.hbaoRenderTarget.dispose();
		this.pdRenderTarget.dispose();
		this.normalMaterial.dispose();
		this.pdMaterial.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();
		this.fsQuad.dispose();

	}

	setTextures( depthTexture, normalTexture ) {

		if ( depthTexture !== undefined ) {

			this.depthTexture = depthTexture;
			this.normalTexture = normalTexture;
			this._renderGBuffer = false;

		} else {

			this.depthTexture = new DepthTexture();
			this.depthTexture.format = DepthStencilFormat;
			this.depthTexture.type = UnsignedInt248Type;

			this.normalRenderTarget = new WebGLRenderTarget( this.width, this.height, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				type: HalfFloatType,
				depthTexture: this.depthTexture
			} );
			this.normalTexture = this.normalRenderTarget.texture;
			this._renderGBuffer = true;

		}

		const normalVectorType = ( this.normalTexture ) ? 1 : 0;
		const depthValueSource = ( this.depthTexture === this.normalTexture ) ? 1 : 0;

		this.hbaoMaterial.defines[ 'NORMAL_VECTOR_TYPE' ] = normalVectorType;
		this.hbaoMaterial.defines[ 'DEPTH_VALUE_SOURCE' ] = depthValueSource;
		this.hbaoMaterial.uniforms[ 'tNormal' ].value = this.normalTexture;
		this.hbaoMaterial.uniforms[ 'tDepth' ].value = this.depthTexture;

		this.pdMaterial.defines[ 'NORMAL_VECTOR_TYPE' ] = normalVectorType;
		this.pdMaterial.defines[ 'DEPTH_VALUE_SOURCE' ] = depthValueSource;
		this.pdMaterial.uniforms[ 'tNormal' ].value = this.normalTexture;
		this.pdMaterial.uniforms[ 'tDepth' ].value = this.depthTexture;

		this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.normalRenderTarget.depthTexture;

	}

	updateHbaoMaterial( parameters ) {

		if ( parameters.radius !== undefined ) {

			this.hbaoMaterial.uniforms[ 'radius' ].value = parameters.radius;

		}

		if ( parameters.distanceExponent !== undefined ) {

			this.hbaoMaterial.uniforms[ 'distanceExponent' ].value = parameters.distanceExponent;

		}

		if ( parameters.bias !== undefined ) {

			this.hbaoMaterial.uniforms[ 'bias' ].value = parameters.bias;

		}

		if ( parameters.samples !== undefined && parameters.samples !== this.hbaoMaterial.defines[ 'SAMPLES' ] ) {

			this.hbaoMaterial.defines[ 'SAMPLES' ] = parameters.samples;
			this.hbaoMaterial.defines[ 'SAMPLE_VECTORS' ] = generateHaboSampleKernelInitializer( parameters.samples );
			this.hbaoMaterial.needsUpdate = true;

		}

	}

	updatePdMaterial( parameters ) {

		let updateShader = false;

		if ( parameters.lumaPhi !== undefined ) {

			this.pdMaterial.uniforms[ 'lumaPhi' ].value = parameters.lumaPhi;

		}

		if ( parameters.depthPhi !== undefined ) {

			this.pdMaterial.uniforms[ 'depthPhi' ].value = parameters.depthPhi;

		}

		if ( parameters.normalPhi !== undefined ) {

			this.pdMaterial.uniforms[ 'normalPhi' ].value = parameters.normalPhi;

		}

		if ( parameters.radius !== undefined && parameters.radius !== this.radius ) {

			this.pdMaterial.uniforms[ 'radius' ].value = parameters.radius;

		}

		if ( parameters.rings !== undefined && parameters.rings !== this.rings ) {

			this.rings = parameters.rings;
			updateShader = true;

		}

		if ( parameters.samples !== undefined && parameters.samples !== this.samples ) {

			this.samples = parameters.samples;
			updateShader = true;

		}

		if ( updateShader ) {


			this.pdMaterial.defines[ 'SAMPLES' ] = parameters.samples;
			this.pdMaterial.defines[ 'SAMPLE_VECTORS' ] = generatePdSamplePointInitializer( parameters.samples, this.rings );
			this.pdMaterial.needsUpdate = true;

		}

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		// render normals and depth (honor only meshes, points and lines do not contribute to HBAO)

		if ( this._renderGBuffer ) {

			this.overrideVisibility();
			this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );
			this.restoreVisibility();

		}

		// render HBAO

		this.hbaoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.hbaoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.hbaoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.hbaoMaterial.uniforms[ 'cameraProjectionMatrixInverse' ].value.copy( this.camera.projectionMatrixInverse );
		this.renderPass( renderer, this.hbaoMaterial, this.hbaoRenderTarget, 0xffffff, 1.0 );

		// render poisson denoise

		this.pdMaterial.uniforms[ 'cameraProjectionMatrixInverse' ].value.copy( this.camera.projectionMatrixInverse );
		this.renderPass( renderer, this.pdMaterial, this.pdRenderTarget, 0xffffff, 1.0 );

		// output result to screen

		switch ( this.output ) {

			case HBAOPass.OUTPUT.Diffuse:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case HBAOPass.OUTPUT.HBAO:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.hbaoRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case HBAOPass.OUTPUT.Denoise:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.pdRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case HBAOPass.OUTPUT.Depth:

				this.depthRenderMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
				this.depthRenderMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
				this.renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case HBAOPass.OUTPUT.Normal:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case HBAOPass.OUTPUT.Default:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.pdRenderTarget.texture;
				this.copyMaterial.blending = CustomBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.HBAOPass: Unknown output type.' );

		}

	}

	renderPass( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		renderer.getClearColor( this.originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
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

		renderer.getClearColor( this.originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
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

	setSize( width, height ) {

		this.width = width;
		this.height = height;

		this.hbaoRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.pdRenderTarget.setSize( width, height );

		this.hbaoMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.hbaoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.hbaoMaterial.uniforms[ 'cameraProjectionMatrixInverse' ].value.copy( this.camera.projectionMatrixInverse );

		this.pdMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.pdMaterial.uniforms[ 'cameraProjectionMatrixInverse' ].value.copy( this.camera.projectionMatrixInverse );

	}

	overrideVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;

		scene.traverse( function ( object ) {

			cache.set( object, object.visible );

			if ( object.isPoints || object.isLine ) object.visible = false;

		} );

	}

	restoreVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;

		scene.traverse( function ( object ) {

			const visible = cache.get( object );
			object.visible = visible;

		} );

		cache.clear();

	}

	generateNoise( size = 64 ) {

		const simplex = new SimplexNoise();

		const arraySize = size * size * 4;
		const data = new Uint8Array( arraySize );

		for ( let i = 0; i < size; i ++ ) {

			for ( let j = 0; j < size; j ++ ) {

				const x = i;
				const y = j;

				data[ ( i * size + j ) * 4 ] = ( simplex.noise( x, y ) + 1.0 ) * 255.0;
				data[ ( i * size + j ) * 4 + 1 ] = ( simplex.noise( x + size, y ) + 1.0 ) * 255.0;
				data[ ( i * size + j ) * 4 + 2 ] = ( simplex.noise( x, y + size ) + 1.0 ) * 255.0;
				data[ ( i * size + j ) * 4 + 3 ] = ( simplex.noise( x + size, y + size ) + 1.0 ) * 255.0;

			}

		}

		const noiseTexture = new DataTexture( data, size, size, RGBAFormat, UnsignedByteType );
		noiseTexture.wrapS = RepeatWrapping;
		noiseTexture.wrapT = RepeatWrapping;
		noiseTexture.needsUpdate = true;

		return noiseTexture;

	}

}

HBAOPass.OUTPUT = {
	'Default': 0,
	'Diffuse': 1,
	'Depth': 2,
	'Normal': 3,
	'HBAO': 4,
	'Denoise': 5,
};

export { HBAOPass };
