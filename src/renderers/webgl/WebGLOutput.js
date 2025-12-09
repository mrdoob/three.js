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
	const targetA = new WebGLRenderTarget( width, height, {
		type: type,
		depthBuffer: depth,
		stencilBuffer: stencil
	} );

	const targetB = new WebGLRenderTarget( width, height, {
		type: HalfFloatType,
		depthBuffer: false,
		stencilBuffer: false
	} );

	// create fullscreen triangle geometry
	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
	geometry.setAttribute( 'uv', new Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

	// create output material with tone mapping support
	const material = new RawShaderMaterial( {
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

	const mesh = new Mesh( geometry, material );
	const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	let _outputColorSpace = null;
	let _outputToneMapping = null;
	let _isCompositing = false;
	let _savedToneMapping;
	let _savedRenderTarget = null;
	let _effects = [];
	let _hasRenderPass = false;

	this.setSize = function ( width, height ) {

		targetA.setSize( width, height );
		targetB.setSize( width, height );

		for ( let i = 0; i < _effects.length; i ++ ) {

			const effect = _effects[ i ];
			if ( effect.setSize ) effect.setSize( width, height );

		}

	};

	this.setEffects = function ( effects ) {

		_effects = effects;
		_hasRenderPass = _effects.length > 0 && _effects[ 0 ].isRenderPass === true;

		const width = targetA.width;
		const height = targetA.height;

		for ( let i = 0; i < _effects.length; i ++ ) {

			const effect = _effects[ i ];
			if ( effect.setSize ) effect.setSize( width, height );

		}

	};

	this.begin = function ( renderer, renderTarget ) {

		// Don't begin during compositing phase (post-processing effects call render())
		if ( _isCompositing ) return false;

		if ( renderer.toneMapping === NoToneMapping && _effects.length === 0 ) return false;

		_savedRenderTarget = renderTarget;

		// resize internal buffers to match render target (e.g. XR resolution)
		if ( renderTarget !== null ) {

			const width = renderTarget.width;
			const height = renderTarget.height;

			if ( targetA.width !== width || targetA.height !== height ) {

				this.setSize( width, height );

			}

		}

		// if first effect is a RenderPass, it will set its own render target
		if ( _hasRenderPass === false ) {

			renderer.setRenderTarget( targetA );

		}

		// disable tone mapping during render - it will be applied in end()
		_savedToneMapping = renderer.toneMapping;
		renderer.toneMapping = NoToneMapping;

		return true;

	};

	this.hasRenderPass = function () {

		return _hasRenderPass;

	};

	this.end = function ( renderer, deltaTime ) {

		// restore tone mapping
		renderer.toneMapping = _savedToneMapping;

		_isCompositing = true;

		// run post-processing effects
		let readBuffer = targetA;
		let writeBuffer = targetB;

		for ( let i = 0; i < _effects.length; i ++ ) {

			const effect = _effects[ i ];

			if ( effect.enabled === false ) continue;

			effect.render( renderer, writeBuffer, readBuffer, deltaTime );

			if ( effect.needsSwap !== false ) {

				const temp = readBuffer;
				readBuffer = writeBuffer;
				writeBuffer = temp;

			}

		}

		// update output material defines if settings changed
		if ( _outputColorSpace !== renderer.outputColorSpace || _outputToneMapping !== renderer.toneMapping ) {

			_outputColorSpace = renderer.outputColorSpace;
			_outputToneMapping = renderer.toneMapping;

			material.defines = {};

			if ( ColorManagement.getTransfer( _outputColorSpace ) === SRGBTransfer ) material.defines.SRGB_TRANSFER = '';

			const toneMapping = toneMappingMap[ _outputToneMapping ];
			if ( toneMapping ) material.defines[ toneMapping ] = '';

			material.needsUpdate = true;

		}

		// final output to canvas (or XR render target)
		material.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.setRenderTarget( _savedRenderTarget );
		renderer.render( mesh, camera );

		_savedRenderTarget = null;
		_isCompositing = false;

	};

	this.isCompositing = function () {

		return _isCompositing;

	};

	this.dispose = function () {

		targetA.dispose();
		targetB.dispose();
		geometry.dispose();
		material.dispose();

	};

}

export { WebGLOutput };
