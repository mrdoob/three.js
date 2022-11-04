/**
 * Weighted, blended order independent transparency pass.
 * Transparent meshes should use MeshWboitMaterial.
 */

import {
	AddEquation,
	Color,
	CustomBlending,
	FloatType,
	HalfFloatType,
	NearestFilter,
	OneFactor,
	OneMinusSrcAlphaFactor,
	RGBAFormat,
	SrcAlphaFactor,
	UnsignedByteType,
	Vector2,
	WebGLRenderTarget,
	ZeroFactor
} from 'three';

import { Pass } from './Pass.js';
import { ShaderPass } from './ShaderPass.js';

import { CopyShader } from '../shaders/CopyShader.js';
import { FillShader } from '../shaders/FillShader.js';
import { WboitCompositeShader } from '../shaders/WboitCompositeShader.js';
import { WboitStages } from '../materials/MeshWboitMaterial.js';

const _clearColorZero = new Color( 0.0, 0.0, 0.0 );
const _clearColorOne = new Color( 1.0, 1.0, 1.0 );

const OpaqueShader = {

	uniforms: {

		'tDiffuse': { value: null },

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 color = texture2D( tDiffuse, vUv );
			if ( color.a == 0.0 ) discard;
			gl_FragColor = color;

		}`

};

class WboitPass extends Pass {

	constructor( renderer, scene, camera, clearColor, clearAlpha ) {

		if ( ! renderer ) return console.error( 'WboitPass: Renderer must be supplied!' );

		super();

		this.scene = scene;
		this.camera = camera;

		this.clearColor = clearColor;
		this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

		this.clear = false;
		this.clearDepth = false;
		this.needsSwap = false;

		// Internal

		this._oldClearColor = new Color();
		this._blendingCache = new Map();
		this._blendEquationCache = new Map();
		this._blendSrcCache = new Map();
		this._blendDstCache = new Map();
		this._depthTestCache = new Map();
		this._depthWriteCache = new Map();
		this._visibilityCache = new Map();

		// Passes

		this.opaquePass = new ShaderPass( OpaqueShader );
		this.opaquePass.material.depthTest = false;
		this.opaquePass.material.depthWrite = false;
		this.opaquePass.material.blending = CustomBlending;
		this.opaquePass.material.blendEquation = AddEquation;
		this.opaquePass.material.blendSrc = OneFactor;
		this.opaquePass.material.blendDst = ZeroFactor;

		this.transparentPass = new ShaderPass( CopyShader );
		this.transparentPass.material.depthTest = false;
		this.transparentPass.material.depthWrite = false;
		this.transparentPass.material.blending = CustomBlending;
		this.transparentPass.material.blendEquation = AddEquation;
		this.transparentPass.material.blendSrc = OneFactor;
		this.transparentPass.material.blendDst = OneMinusSrcAlphaFactor;

		this.copyPass = new ShaderPass( CopyShader );
		this.copyPass.material.depthTest = false;
		this.copyPass.material.depthWrite = false;
		this.copyPass.material.blending = CustomBlending;
		this.copyPass.material.blendEquation = AddEquation;
		this.copyPass.material.blendSrc = OneFactor;
		this.copyPass.material.blendDst = ZeroFactor;

		this.compositePass = new ShaderPass( WboitCompositeShader );
		this.compositePass.material.transparent = true;
		this.compositePass.material.blending = CustomBlending;
		this.compositePass.material.blendEquation = AddEquation;
		this.compositePass.material.blendSrc = OneMinusSrcAlphaFactor;
		this.compositePass.material.blendDst = SrcAlphaFactor;

		const testPass = new ShaderPass( FillShader );
		const testR = 1.0;
		const testG = 1.0;
		const testB = 1.0;
		const testA = 0.0;
		testPass.material.uniforms[ 'color' ].value = new Color( testR, testG, testB );
		testPass.material.uniforms[ 'opacity' ].value = testA;
		testPass.material.blending = CustomBlending;
		testPass.material.blendEquation = AddEquation;
		testPass.material.blendSrc = OneFactor;
		testPass.material.blendDst = ZeroFactor;

		// Find Best Render Target Type
		// gl.getExtension( 'EXT_color_buffer_float' ) - lacking support, see:
		// https://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture

		const size = renderer.getSize( new Vector2() );
		const pixelRatio = renderer.getPixelRatio();
		const effectiveWidth = size.width * pixelRatio;
		const effectiveHeight = size.height * pixelRatio;

		const gl = renderer.getContext();

		const oldTarget = renderer.getRenderTarget();
		const oldClearAlpha = renderer.getClearAlpha();
		renderer.getClearColor( this._oldClearColor );

		const targetTypes = [ FloatType, HalfFloatType, UnsignedByteType ];
		const targetGlTypes = [ gl.FLOAT, gl.HALF_FLOAT, gl.UNSIGNED_BYTE ];
		const targetBuffers = [ new Float32Array( 4 ), new Uint16Array( 4 ), new Uint8Array( 4 ) ];
		const targetDivisor = [ 1, 15360, 255 ];

		let targetType;

		for ( let i = 0; i < targetTypes.length; i ++ ) {

			const testTarget = new WebGLRenderTarget( 1, 1, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				type: targetTypes[ i ],
				format: RGBAFormat,
				stencilBuffer: false,
				depthBuffer: true,
			} );

			testPass.render( renderer, testTarget );

			gl.readPixels( 0, 0, 1, 1, gl.RGBA, targetGlTypes[ i ], targetBuffers[ i ] );
			const rgba = Array.apply( [], targetBuffers[ i ] );
			rgba[ 0 ] /= targetDivisor[ i ];
			rgba[ 1 ] /= targetDivisor[ i ];
			rgba[ 2 ] /= targetDivisor[ i ];
			rgba[ 3 ] /= targetDivisor[ i ];

			function fuzzyEqual( a, b, epsilon = 0.01 ) {

				return ( ( a < ( b + epsilon ) ) && ( a > ( b - epsilon ) ) );

			}

			let complete = gl.checkFramebufferStatus( gl.FRAMEBUFFER ) === gl.FRAMEBUFFER_COMPLETE;
			complete = complete && fuzzyEqual( rgba[ 0 ], testR );
			complete = complete && fuzzyEqual( rgba[ 1 ], testG );
			complete = complete && fuzzyEqual( rgba[ 2 ], testB );
			complete = complete && fuzzyEqual( rgba[ 3 ], testA );
			complete = complete || i === targetTypes.length - 1;

			testTarget.dispose();

			if ( complete ) {

				targetType = targetTypes[ i ];
				break;

			}

		}

		if ( testPass.dispose ) testPass.dispose();
		renderer.setRenderTarget( oldTarget );
		renderer.setClearColor( this._oldClearColor, oldClearAlpha );

		// Render Targets

		this.baseTarget = new WebGLRenderTarget( effectiveWidth, effectiveHeight, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: targetType,
			format: RGBAFormat,
			stencilBuffer: false,
			depthBuffer: true,
		} );

		this.accumulationTarget = new WebGLRenderTarget( effectiveWidth, effectiveHeight, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: targetType,
			format: RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
		} );

	}

	dispose() {

		if ( this.opaquePass.dispose ) this.opaquePass.dispose();
		if ( this.transparentPass.dispose ) this.transparentPass.dispose();
		if ( this.copyPass.dispose ) this.copyPass.dispose();
		if ( this.compositePass.dispose ) this.compositePass.dispose();

		this.baseTarget.dispose();
		this.accumulationTarget.dispose();

	}

	setSize( width, height ) {

		this.baseTarget.setSize( width, height );
		this.accumulationTarget.setSize( width, height );

	}

	render( renderer, writeBuffer = null /* readBuffer = null, deltaTime, maskActive */ ) {

		const scene = this.scene;
		if ( ! scene || ! scene.isScene ) return;

		const cache = this._visibilityCache;
		const blendingCache = this._blendingCache;
		const blendEquationCache = this._blendEquationCache;
		const blendSrcCache = this._blendSrcCache;
		const blendDstCache = this._blendDstCache;
		const testCache = this._depthTestCache;
		const writeCache = this._depthWriteCache;

		const opaqueMeshes = [];
		const transparentMeshes = [];
		const wboitMeshes = [];

		function gatherMeshes() {

			scene.traverse( ( object ) => {

				if ( ! object.material ) return;

				const materials = Array.isArray( object.material ) ? object.material : [ object.material ];
				let isTransparent = true;
				let isWboitCapable = true;

				for ( let i = 0; i < materials.length; i ++ ) {

					isTransparent = isTransparent && materials[ i ].transparent;
					isWboitCapable = isWboitCapable && isTransparent && materials[ i ].wboitEnabled;

					testCache.set( materials[ i ], materials[ i ].depthTest );
					writeCache.set( materials[ i ], materials[ i ].depthWrite );

				}

				if ( ! isWboitCapable ) {

					if ( ! isTransparent ) {

						opaqueMeshes.push( object );

						for ( let i = 0; i < materials.length; i ++ ) {

							materials[ i ].depthTest = true;
							materials[ i ].depthWrite = true;

						}

					} else {

						transparentMeshes.push( object );

						for ( let i = 0; i < materials.length; i ++ ) {

							materials[ i ].depthTest = true;
							materials[ i ].depthWrite = false;

						}

					}

				} else {

					wboitMeshes.push( object );

					for ( let i = 0; i < materials.length; i ++ ) {

						blendingCache.set( materials[ i ], materials[ i ].blending );
						blendEquationCache.set( materials[ i ], materials[ i ].blendEquation );
						blendSrcCache.set( materials[ i ], materials[ i ].blendSrc );
						blendDstCache.set( materials[ i ], materials[ i ].blendDst );

					}

				}

				cache.set( object, object.visible );

			} );

		}

		function changeVisible( opaqueVisible = true, transparentVisible = true, wboitVisible = true ) {

			opaqueMeshes.forEach( mesh => mesh.visible = opaqueVisible );
			transparentMeshes.forEach( mesh => mesh.visible = transparentVisible );
			wboitMeshes.forEach( mesh => mesh.visible = wboitVisible );

		}

		function resetVisible() {

			for ( const [ key, value ] of cache ) {

				key.visible = value;

				if ( key.material ) {

					const materials = Array.isArray( key.material ) ? key.material : [ key.material ];

					for ( let i = 0; i < materials.length; i ++ ) {

						materials[ i ].depthWrite = testCache.get( materials[ i ] );
						materials[ i ].depthTest = writeCache.get( materials[ i ] );

					}

				}

			}

		}

		function prepareWboitBlending( stage ) {

			wboitMeshes.forEach( ( mesh ) => {

				const materials = Array.isArray( mesh.material ) ? mesh.material : [ mesh.material ];

				for ( let i = 0; i < materials.length; i ++ ) {

					if ( materials[ i ].wboitEnabled !== true || materials[ i ].transparent !== true ) continue;

					if ( materials[ i ].renderStage ) {

						materials[ i ].renderStage = stage;

					} else if ( materials[ i ].uniforms && materials[ i ].uniforms[ 'renderStage' ] ) {

						materials[ i ].uniforms[ 'renderStage' ].value = stage.toFixed( 1 );

					}

					switch ( stage ) {

						case WboitStages.Acummulation:

							materials[ i ].blending = CustomBlending;
							materials[ i ].blendEquation = AddEquation;
							materials[ i ].blendSrc = OneFactor;
							materials[ i ].blendDst = OneFactor;
							materials[ i ].depthWrite = false;
							materials[ i ].depthTest = true;

							break;

						case WboitStages.Revealage:

							materials[ i ].blending = CustomBlending;
							materials[ i ].blendEquation = AddEquation;
							materials[ i ].blendSrc = ZeroFactor;
							materials[ i ].blendDst = OneMinusSrcAlphaFactor;
							materials[ i ].depthWrite = false;
							materials[ i ].depthTest = true;

							break;

						default:

							materials[ i ].blending = blendingCache.get( materials[ i ] );
							materials[ i ].blendEquation = blendEquationCache.get( materials[ i ] );
							materials[ i ].blendSrc = blendSrcCache.get( materials[ i ] );
							materials[ i ].blendDst = blendDstCache.get( materials[ i ] );

					}

				}

			} );

		}

		// Save Current State
		const oldAutoClear = renderer.autoClear;
		const oldClearAlpha = renderer.getClearAlpha();
		const oldRenderTarget = renderer.getRenderTarget();
		const oldOverrideMaterial = scene.overrideMaterial;
		renderer.autoClear = false;
		renderer.getClearColor( this._oldClearColor );
		scene.overrideMaterial = null;

		// Gather Opaque / Transparent Meshes
		gatherMeshes();

		// Clear Write Buffer

		if ( this.clearColor ) {

			renderer.setRenderTarget( writeBuffer );
			renderer.setClearColor( this.clearColor, this.clearAlpha );
			renderer.clearColor();

		}

		// Render Opaque Objects (copy render to write buffer so we can re-use depth buffer)

		changeVisible( true, false, false );
		renderer.setRenderTarget( this.baseTarget );
		renderer.setClearColor( _clearColorZero, 0.0 );
		renderer.clear();
		renderer.render( scene, this.camera );
		this.opaquePass.render( renderer, writeBuffer, this.baseTarget );

		// Render Transparent Objects (copy render to write buffer so we can re-use depth buffer)

		changeVisible( false, true, false );
		renderer.setRenderTarget( this.baseTarget );
		renderer.clearColor();
		renderer.render( scene, this.camera );
		this.transparentPass.render( renderer, writeBuffer, this.baseTarget );

		// Render Wboit Objects, Accumulation Pass (copy render to write buffer so we can re-use depth buffer)

		changeVisible( false, false, true );
		prepareWboitBlending( WboitStages.Acummulation );
		renderer.setRenderTarget( this.baseTarget );
		renderer.clearColor();
		renderer.render( scene, this.camera );
		this.copyPass.render( renderer, this.accumulationTarget, this.baseTarget );

		// Render Wboit Objects, Revealage Pass

		prepareWboitBlending( WboitStages.Revealage );
		renderer.setRenderTarget( this.baseTarget );
		renderer.setClearColor( _clearColorOne, 1.0 );
		renderer.clearColor();
		renderer.render( scene, this.camera );

		// Composite Wboit Objects

		renderer.setRenderTarget( writeBuffer );
		this.compositePass.uniforms[ 'tAccumulation' ].value = this.accumulationTarget.texture;
		this.compositePass.uniforms[ 'tRevealage' ].value = this.baseTarget.texture; /* now holds revealage render */
		this.compositePass.render( renderer, writeBuffer );

		// Restore Original State

		prepareWboitBlending( WboitStages.Normal );
		resetVisible();
		renderer.setRenderTarget( oldRenderTarget );
		renderer.setClearColor( this._oldClearColor, oldClearAlpha );
		scene.overrideMaterial = oldOverrideMaterial;
		renderer.autoClear = oldAutoClear;

		// Clear Caches

		cache.clear();
		blendingCache.clear();
		blendEquationCache.clear();
		blendSrcCache.clear();
		blendDstCache.clear();
		testCache.clear();
		writeCache.clear();

	}

}

export { WboitPass };
