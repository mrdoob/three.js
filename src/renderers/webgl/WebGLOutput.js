import {
	NoToneMapping,
	LinearToneMapping,
	ReinhardToneMapping,
	CineonToneMapping,
	ACESFilmicToneMapping,
	AgXToneMapping,
	NeutralToneMapping,
	CustomToneMapping,
	SRGBTransfer,
	HalfFloatType
} from '../../constants.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../../core/BufferAttribute.js';
import { RawShaderMaterial } from '../../materials/RawShaderMaterial.js';
import { Mesh } from '../../objects/Mesh.js';
import { OrthographicCamera } from '../../cameras/OrthographicCamera.js';
import { WebGLRenderTarget } from '../WebGLRenderTarget.js';
import { ColorManagement } from '../../math/ColorManagement.js';

const toneMappingMap = {
	[ LinearToneMapping ]: 'LINEAR_TONE_MAPPING',
	[ ReinhardToneMapping ]: 'REINHARD_TONE_MAPPING',
	[ CineonToneMapping ]: 'CINEON_TONE_MAPPING',
	[ ACESFilmicToneMapping ]: 'ACES_FILMIC_TONE_MAPPING',
	[ AgXToneMapping ]: 'AGX_TONE_MAPPING',
	[ NeutralToneMapping ]: 'NEUTRAL_TONE_MAPPING',
	[ CustomToneMapping ]: 'CUSTOM_TONE_MAPPING'
};

function WebGLOutput( type, width, height, depth, stencil ) {

	// render targets for scene and post-processing
	const renderTargetA = new WebGLRenderTarget( width, height, {
		type: type,
		depthBuffer: depth,
		stencilBuffer: stencil
	} );

	const renderTargetB = new WebGLRenderTarget( width, height, {
		type: HalfFloatType,
		depthBuffer: false,
		stencilBuffer: false
	} );

	// create fullscreen triangle geometry
	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
	geometry.setAttribute( 'uv', new Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

	// create output material with tone mapping support
	const outputMaterial = new RawShaderMaterial( {
		uniforms: {
			tDiffuse: { value: null }
		},
		vertexShader: /* glsl */`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,
		fragmentShader: /* glsl */`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,
		depthTest: false,
		depthWrite: false
	} );

	const outputMesh = new Mesh( geometry, outputMaterial );
	const outputCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	let _outputColorSpace = null;
	let _outputToneMapping = null;
	let _copyingToCanvas = false;
	let _savedToneMapping;
	let _savedRenderTarget = null;
	let _passes = [];
	let _hasRenderPass = false;

	this.setSize = function ( width, height ) {

		renderTargetA.setSize( width, height );
		renderTargetB.setSize( width, height );

		for ( let i = 0; i < _passes.length; i ++ ) {

			const pass = _passes[ i ];
			if ( pass.setSize ) pass.setSize( width, height );

		}

	};

	this.setPasses = function ( passes ) {

		_passes = passes;
		_hasRenderPass = _passes.length > 0 && _passes[ 0 ].isRenderPass === true;

		const width = renderTargetA.width;
		const height = renderTargetA.height;

		for ( let i = 0; i < _passes.length; i ++ ) {

			const pass = _passes[ i ];
			if ( pass.setSize ) pass.setSize( width, height );

		}

	};

	this.setRenderTarget = function ( renderTarget, isXRPresenting ) {

		// Don't update saved render target during copying phase
		// (post-processing passes call render() which would overwrite this)
		if ( _copyingToCanvas ) return;

		_savedRenderTarget = renderTarget;

		// resize internal buffers to match render target (e.g. XR resolution)
		// Only resize when entering XR, not on every frame
		if ( isXRPresenting && renderTarget !== null ) {

			const width = renderTarget.width;
			const height = renderTarget.height;

			if ( renderTargetA.width !== width || renderTargetA.height !== height ) {

				this.setSize( width, height );

			}

		}

	};

	this.activate = function ( renderer ) {

		if ( renderer.toneMapping === NoToneMapping && _passes.length === 0 ) return false;

		// if first pass is a render pass, it will set its own render target
		if ( _hasRenderPass === false ) {

			renderer.setRenderTarget( renderTargetA );

		}

		// disable tone mapping during render - it will be applied when copying to canvas
		_savedToneMapping = renderer.toneMapping;
		renderer.toneMapping = NoToneMapping;

		return true;

	};

	this.hasRenderPass = function () {

		return _hasRenderPass;

	};

	this.render = function ( renderer, deltaTime ) {

		// restore tone mapping
		renderer.toneMapping = _savedToneMapping;

		_copyingToCanvas = true;

		// run post-processing passes
		let readBuffer = renderTargetA;
		let writeBuffer = renderTargetB;

		for ( let i = 0; i < _passes.length; i ++ ) {

			const pass = _passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.render( renderer, writeBuffer, readBuffer, deltaTime );

			if ( pass.needsSwap !== false ) {

				const temp = readBuffer;
				readBuffer = writeBuffer;
				writeBuffer = temp;

			}

		}

		// update output material defines if settings changed
		if ( _outputColorSpace !== renderer.outputColorSpace || _outputToneMapping !== renderer.toneMapping ) {

			_outputColorSpace = renderer.outputColorSpace;
			_outputToneMapping = renderer.toneMapping;

			outputMaterial.defines = {};

			if ( ColorManagement.getTransfer( _outputColorSpace ) === SRGBTransfer ) outputMaterial.defines.SRGB_TRANSFER = '';

			const toneMapping = toneMappingMap[ _outputToneMapping ];
			if ( toneMapping ) outputMaterial.defines[ toneMapping ] = '';

			outputMaterial.needsUpdate = true;

		}

		// final output to canvas (or XR render target)
		outputMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.setRenderTarget( _savedRenderTarget );
		renderer.render( outputMesh, outputCamera );

		_savedRenderTarget = null;
		_copyingToCanvas = false;

	};

	this.isCopying = function () {

		return _copyingToCanvas;

	};

	this.dispose = function () {

		renderTargetA.dispose();
		renderTargetB.dispose();
		geometry.dispose();
		outputMaterial.dispose();

	};

}

export { WebGLOutput };
