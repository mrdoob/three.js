import {
	AddEquation,
	Color,
	CustomBlending,
	DataTexture,
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
	WebGLRenderTarget,
	ZeroFactor
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { generateAoSampleKernelInitializer, generateMagicSquareNoise, AOShader, AODepthShader, AoBlendShader } from '../shaders/AOShader.js';
import { generatePdSamplePointInitializer, PoissonDenoiseShader } from '../shaders/PoissonDenoiseShader.js';
import { CopyShader } from '../shaders/CopyShader.js';
import { SimplexNoise } from '../math/SimplexNoise.js';

class AOPass extends Pass {

	constructor( scene, camera, width, height, parameters, aoParameters, pdParameters ) {

		super();

		this.width = ( width !== undefined ) ? width : 512;
		this.height = ( height !== undefined ) ? height : 512;
		this.clear = true;
		this.camera = camera;
		this.scene = scene;
		this.output = 0;
		this._renderGBuffer = true;
		this._visibilityCache = new Map();
		this.intensity = 1.;

		this.pdRings = 2.;
		this.pdRadiusExponent = 2.;
		this.pdSamples = 16;

		this.aoNoiseTextureMagicSquare = generateMagicSquareNoise();
		this.aoNoiseTextureRandom = this.generateNoise();
		this.pdNoiseTexture = this.generateNoise();

		this.aoaoRenderTarget = new WebGLRenderTarget( this.width, this.height, { type: HalfFloatType } );
		this.pdRenderTarget = this.aoaoRenderTarget.clone();

		this.aoMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, AOShader.defines ),
			uniforms: UniformsUtils.clone( AOShader.uniforms ),
			vertexShader: AOShader.vertexShader,
			fragmentShader: AOShader.fragmentShader,
			blending: NoBlending,
			depthTest: false,
			depthWrite: false,
		} );
		this.aoMaterial.definesPERSPECTIVE_CAMERA = this.camera.isPerspectiveCamera ? 1 : 0;
		this.aoMaterial.uniforms.tNoise.value = this.aoNoiseTextureMagicSquare;
		this.aoMaterial.uniforms.resolution.value.set( this.width, this.height );
		this.aoMaterial.uniforms.cameraNear.value = this.camera.near;
		this.aoMaterial.uniforms.cameraFar.value = this.camera.far;

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
		this.pdMaterial.uniforms.tDiffuse.value = this.aoaoRenderTarget.texture;
		this.pdMaterial.uniforms.tNoise.value = this.pdNoiseTexture;
		this.pdMaterial.uniforms.resolution.value.set( this.width, this.height );

		this.depthRenderMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, AODepthShader.defines ),
			uniforms: UniformsUtils.clone( AODepthShader.uniforms ),
			vertexShader: AODepthShader.vertexShader,
			fragmentShader: AODepthShader.fragmentShader,
			blending: NoBlending
		} );
		this.depthRenderMaterial.uniforms.cameraNear.value = this.camera.near;
		this.depthRenderMaterial.uniforms.cameraFar.value = this.camera.far;

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

		this.blendMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( AoBlendShader.uniforms ),
			vertexShader: AoBlendShader.vertexShader,
			fragmentShader: AoBlendShader.fragmentShader,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blending: CustomBlending,
			blendSrc: DstColorFactor,
			blendDst: ZeroFactor,
			blendEquation: AddEquation,
			blendSrcAlpha: DstAlphaFactor,
			blendDstAlpha: ZeroFactor,
			blendEquationAlpha: AddEquation
		} );

		this.fsQuad = new FullScreenQuad( null );

		this.originalClearColor = new Color();

		this.setGBuffer( parameters ? parameters.depthTexture : undefined, parameters ? parameters.normalTexture : undefined );

		if ( aoParameters !== undefined ) {

			this.updateAoMaterial( aoParameters );

		}

		if ( pdParameters !== undefined ) {

			this.updatePdMaterial( pdParameters );

		}

	}

	dispose() {

		this.aoNoiseTextureMagicSquare.dispose();
		this.aoNoiseTextureRandom.dispose();
		this.pdNoiseTexture.dispose();
		this.normalRenderTarget.dispose();
		this.aoaoRenderTarget.dispose();
		this.pdRenderTarget.dispose();
		this.normalMaterial.dispose();
		this.pdMaterial.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();
		this.fsQuad.dispose();

	}

	setGBuffer( depthTexture, normalTexture ) {

		if ( depthTexture !== undefined ) {

			this.depthTexture = depthTexture;
			this.normalTexture = normalTexture;
			this._renderGBuffer = false;

		} else {

			this.depthTexture = new DepthTexture();
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
		const depthValueSource = ( this.depthTexture === this.normalTexture ) ? 'w' : 'x';

		this.aoMaterial.defines.NORMAL_VECTOR_TYPE = normalVectorType;
		this.aoMaterial.defines.DEPTH_SWIZZLING = depthValueSource;
		this.aoMaterial.uniforms.tNormal.value = this.normalTexture;
		this.aoMaterial.uniforms.tDepth.value = this.depthTexture;

		this.pdMaterial.defines.NORMAL_VECTOR_TYPE = normalVectorType;
		this.pdMaterial.defines.DEPTH_SWIZZLING = depthValueSource;
		this.pdMaterial.uniforms.tNormal.value = this.normalTexture;
		this.pdMaterial.uniforms.tDepth.value = this.depthTexture;

		this.depthRenderMaterial.uniforms.tDepth.value = this.normalRenderTarget.depthTexture;

	}

	setSceneClipBox( box ) {

		if ( box ) {

			this.aoMaterial.needsUpdate = this.aoMaterial.defines.SCENE_CLIP_BOX !== 1;
			this.aoMaterial.defines.SCENE_CLIP_BOX = 1;
			this.aoMaterial.uniforms.sceneBoxMin.value.copy( box.min );
			this.aoMaterial.uniforms.sceneBoxMax.value.copy( box.max );

		} else {

			this.aoMaterial.needsUpdate = this.aoMaterial.defines.SCENE_CLIP_BOX === 0;
			this.aoMaterial.defines.SCENE_CLIP_BOX = 0;

		}

	}

	updateAoMaterial( parameters ) {

		if ( parameters.radius !== undefined ) {

			this.aoMaterial.uniforms.radius.value = parameters.radius;

		}

		if ( parameters.distanceExponent !== undefined ) {

			this.aoMaterial.uniforms.distanceExponent.value = parameters.distanceExponent;

		}

		if ( parameters.thickness !== undefined ) {

			this.aoMaterial.uniforms.thickness.value = parameters.thickness;

		}

		if ( parameters.bias !== undefined ) {

			this.aoMaterial.uniforms.bias.value = parameters.bias;

		}

		if ( parameters.scale !== undefined ) {

			this.aoMaterial.uniforms.scale.value = parameters.scale;

		}

		if ( parameters.samples !== undefined && parameters.samples !== this.aoMaterial.defines.SAMPLES ) {

			this.aoMaterial.defines.SAMPLES = parameters.samples;
			this.aoMaterial.defines.SAMPLE_VECTORS = generateAoSampleKernelInitializer( parameters.samples );
			this.aoMaterial.needsUpdate = true;

		}

		if ( parameters.algorithm !== undefined && parameters.algorithm !== this.aoMaterial.defines.AO_ALGORITHM ) {

			this.aoMaterial.defines.AO_ALGORITHM = parameters.algorithm;
			this.aoMaterial.needsUpdate = true;

		}

		if ( parameters.distanceFallOff !== undefined && ( parameters.distanceFallOff ? 1 : 0 ) !== this.aoMaterial.defines.DISTANCE_FALL_OFF ) {

			this.aoMaterial.defines.DISTANCE_FALL_OFF = parameters.distanceFallOff ? 1 : 0;
			this.aoMaterial.needsUpdate = true;

		}

		if ( parameters.depthRelativeBias !== undefined && ( parameters.depthRelativeBias ? 1 : 0 ) !== this.aoMaterial.defines.BIAS_RELATIVE_TO_DEPTH ) {

			this.aoMaterial.defines.BIAS_RELATIVE_TO_DEPTH = parameters.depthRelativeBias ? 1 : 0;
			this.aoMaterial.needsUpdate = true;

		}

		if ( parameters.nvAlignedSamples !== undefined && ( parameters.nvAlignedSamples ? 1 : 0 ) !== this.aoMaterial.defines.NORMAL_VECTOR_ALIGNED_SAMPLES ) {

			this.aoMaterial.defines.NV_ALIGNED_SAMPLES = parameters.nvAlignedSamples ? 1 : 0;
			this.aoMaterial.needsUpdate = true;

		}

		if ( parameters.screenSpaceRadius !== undefined && ( parameters.screenSpaceRadius ? 1 : 0 ) !== this.aoMaterial.defines.SCREEN_SPACE_RADIUS ) {

			this.aoMaterial.defines.SCREEN_SPACE_RADIUS = parameters.screenSpaceRadius ? 1 : 0;
			this.aoMaterial.needsUpdate = true;

		}

		if ( parameters.aoNoiseType !== undefined ) {

			if ( parameters.aoNoiseType === 'magic-square' ) {

				this.aoMaterial.uniforms.tNoise.value = this.aoNoiseTextureMagicSquare;

			} else if ( parameters.aoNoiseType === 'random' ) {

				this.aoMaterial.uniforms.tNoise.value = this.aoNoiseTextureRandom;

			}

		}

	}

	updatePdMaterial( parameters ) {

		let updateShader = false;

		if ( parameters.lumaPhi !== undefined ) {

			this.pdMaterial.uniforms.lumaPhi.value = parameters.lumaPhi;

		}

		if ( parameters.depthPhi !== undefined ) {

			this.pdMaterial.uniforms.depthPhi.value = parameters.depthPhi;

		}

		if ( parameters.normalPhi !== undefined ) {

			this.pdMaterial.uniforms.normalPhi.value = parameters.normalPhi;

		}

		if ( parameters.radius !== undefined && parameters.radius !== this.radius ) {

			this.pdMaterial.uniforms.radius.value = parameters.radius;

		}

		if ( parameters.radiusExponent !== undefined && parameters.radiusExponent !== this.pdRadiusExponent ) {

			this.pdRadiusExponent = parameters.radiusExponent;
			updateShader = true;

		}

		if ( parameters.rings !== undefined && parameters.rings !== this.pdRings ) {

			this.pdRings = parameters.rings;
			updateShader = true;

		}

		if ( parameters.samples !== undefined && parameters.samples !== this.pdSamples ) {

			this.pdSamples = parameters.samples;
			updateShader = true;

		}

		if ( updateShader ) {

			this.pdMaterial.defines.SAMPLES = this.pdSamples;
			this.pdMaterial.defines.SAMPLE_VECTORS = generatePdSamplePointInitializer( this.pdSamples, this.pdRings, this.pdRadiusExponent );
			this.pdMaterial.needsUpdate = true;

		}

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		// render normals and depth (honor only meshes, points and lines do not contribute to AO)

		if ( this._renderGBuffer ) {

			this.overrideVisibility();
			this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );
			this.restoreVisibility();

		}

		// render AO

		this.aoMaterial.uniforms.cameraNear.value = this.camera.near;
		this.aoMaterial.uniforms.cameraFar.value = this.camera.far;
		this.aoMaterial.uniforms.cameraProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this.aoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );
		this.aoMaterial.uniforms.cameraWorldMatrix.value.copy( this.camera.matrixWorld );
		this.renderPass( renderer, this.aoMaterial, this.aoaoRenderTarget, 0xffffff, 1.0 );

		// render poisson denoise

		this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );
		this.renderPass( renderer, this.pdMaterial, this.pdRenderTarget, 0xffffff, 1.0 );

		// output result to screen

		switch ( this.output ) {

			case AOPass.OUTPUT.Diffuse:

				this.copyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case AOPass.OUTPUT.AO:

				this.copyMaterial.uniforms.tDiffuse.value = this.aoaoRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case AOPass.OUTPUT.Denoise:

				this.copyMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case AOPass.OUTPUT.Depth:

				this.depthRenderMaterial.uniforms.cameraNear.value = this.camera.near;
				this.depthRenderMaterial.uniforms.cameraFar.value = this.camera.far;
				this.renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case AOPass.OUTPUT.Normal:

				this.copyMaterial.uniforms.tDiffuse.value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case AOPass.OUTPUT.Default:

				this.copyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				this.blendMaterial.uniforms.intensity.value = this.intensity;
				this.blendMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture;
				this.renderPass( renderer, this.blendMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.AOPass: Unknown output type.' );

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

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	setSize( width, height ) {

		this.width = width;
		this.height = height;

		this.aoaoRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.pdRenderTarget.setSize( width, height );

		this.aoMaterial.uniforms.resolution.value.set( width, height );
		this.aoMaterial.uniforms.cameraProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this.aoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );

		this.pdMaterial.uniforms.resolution.value.set( width, height );
		this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );

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

				data[ ( i * size + j ) * 4 ] = ( simplex.noise( x, y ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 1 ] = ( simplex.noise( x + size, y ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 2 ] = ( simplex.noise( x, y + size ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 3 ] = ( simplex.noise( x + size, y + size ) * 0.5 + 0.5 ) * 255;

			}

		}

		const noiseTexture = new DataTexture( data, size, size, RGBAFormat, UnsignedByteType );
		noiseTexture.wrapS = RepeatWrapping;
		noiseTexture.wrapT = RepeatWrapping;
		noiseTexture.needsUpdate = true;

		return noiseTexture;

	}

}

AOPass.OUTPUT = {
	'Default': 0,
	'Diffuse': 1,
	'Depth': 2,
	'Normal': 3,
	'AO': 4,
	'Denoise': 5,
};

export { AOPass };
