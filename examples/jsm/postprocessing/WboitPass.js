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
	NormalBlending,
	OneFactor,
	OneMinusSrcAlphaFactor,
	RGBAFormat,
	SrcAlphaFactor,
	UnsignedByteType,
	Vector2,
	WebGLRenderTarget,
	ZeroFactor
} from 'three';

import { Pass } from './postprocessing/Pass.js';
import { ShaderPass } from './postprocessing/ShaderPass.js';

import { CopyShader } from '../shaders/CopyShader.js';
import { FillShader } from '../shaders/FillShader.js';
import { WboitCompositeShader } from '../shaders/WboitCompositeShader.js';
import { WboitStages } from '../materials/MeshWboitMaterial.js';

const _clearColorZero = new Color( 0.0, 0.0, 0.0 );
const _clearColorOne = new Color( 1.0, 1.0, 1.0 );

class WboitPass extends Pass {

	constructor ( renderer, scene, camera, clearColor, clearAlpha ) {

		if ( ! renderer ) return console.error( `WboitPass: Renderer must be supplied!` );

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
		this._depthTestCache = new Map();
		this._depthWriteCache = new Map();
		this._visibilityCache = new Map();

		// Passes

		this.blendPass = new ShaderPass( CopyShader );
		this.blendPass.material.depthTest = false;
		this.blendPass.material.depthWrite = false;
		this.blendPass.material.blending = CustomBlending;
		this.blendPass.material.blendEquation = AddEquation;
		this.blendPass.material.blendSrc = SrcAlphaFactor;
		this.blendPass.material.blendDst = OneMinusSrcAlphaFactor;

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

			function fuzzyCompare( a, b, epsilon = 0.01 ) { return Math.abs( a - b ) < epsilon; }

			let complete = gl.checkFramebufferStatus( gl.FRAMEBUFFER ) === gl.FRAMEBUFFER_COMPLETE;
			complete = complete && fuzzyCompare( rgba[ 0 ], testR );
			complete = complete && fuzzyCompare( rgba[ 1 ], testG );
			complete = complete && fuzzyCompare( rgba[ 2 ], testB );
			complete = complete && fuzzyCompare( rgba[ 3 ], testA );
			complete = complete || i === targetTypes.length - 1;

			testTarget.dispose();

			if ( complete ) {

				targetType = targetTypes[ i ];
				break;

			}

		}

		testPass.dispose();
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

		this.blendPass.dispose();
		this.copyPass.dispose();
		this.compositePass.dispose();

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
		const testCache = this._depthTestCache;
		const writeCache = this._depthWriteCache;

		const opaqueMeshes = [];
		const transparentMeshes = [];

		function gatherMeshes() {

			scene.traverse( ( object ) => {

				if ( ! object.material ) return;

				let materials = Array.isArray( object.material ) ? object.material : [ object.material ];
				let isWboitCapable = true;

				for ( let i = 0; i < materials.length; i ++ ) {

					if ( materials[i].isMeshWboitMaterial !== true || materials[i].transparent !== true ) {

						isWboitCapable = false;
						break;

					}

				}

				if ( ! isWboitCapable ) {

					opaqueMeshes.push( object );

				} else {

					transparentMeshes.push( object );

				}

				cache.set( object, object.visible );

			} );

		}

		function changeVisible( opaqueVisible = true, transparentVisible = true ) {

			opaqueMeshes.forEach( mesh => mesh.visible = opaqueVisible );
			transparentMeshes.forEach( mesh => mesh.visible = transparentVisible );

		}

		function resetVisible() {

			for ( const [ key, value ] of cache ) {

				key.visible = value;

			}

		}

		function prepareWboitBlending( stage ) {

			transparentMeshes.forEach( ( mesh ) => {

				const materials = Array.isArray( mesh.material ) ? mesh.material : [ mesh.material ];

				for ( let i = 0; i < materials.length; i ++ ) {

					if ( materials[i].isMeshWboitMaterial !== true || materials[i].transparent !== true ) continue;

					materials[i].uniforms[ 'renderStage' ].value = stage.toFixed( 1 );

					switch ( stage ) {

						case WboitStages.Acummulation:

							testCache.set( materials[i], materials[i].depthTest );
							writeCache.set( materials[i], materials[i].depthWrite );
							materials[i].blending = CustomBlending;
							materials[i].blendEquation = AddEquation;
							materials[i].blendSrc = OneFactor;
							materials[i].blendDst = OneFactor;
							materials[i].depthWrite = false;
							materials[i].depthTest = true;

							break;

						case WboitStages.Revealage:

							materials[i].blending = CustomBlending;
							materials[i].blendEquation = AddEquation;
							materials[i].blendSrc = ZeroFactor;
							materials[i].blendDst = OneMinusSrcAlphaFactor;
							materials[i].depthWrite = false;
							materials[i].depthTest = true;

							break;

						default:

							materials[i].blending = NormalBlending;
							materials[i].blendEquation = AddEquation
							materials[i].blendSrc = SrcAlphaFactor;
							materials[i].blendDst = OneMinusSrcAlphaFactor;
							materials[i].depthWrite = testCache.get( materials[i] );
							materials[i].depthTest = writeCache.get( materials[i] );

					}

				}

			} );

		}

		// Save Current State
		const oldAutoClear = renderer.autoClear;;
		const oldClearAlpha = renderer.getClearAlpha();
		const oldRenderTarget = renderer.getRenderTarget();
		const oldOverrideMaterial = scene.overrideMaterial;
		renderer.autoClear = false;
		renderer.getClearColor( this._oldClearColor );
		scene.overrideMaterial = null;

		// Gather Opaque / Transparent Meshes
		gatherMeshes();

		// Render Opaque Objects
		changeVisible( true, false );
		renderer.setRenderTarget( this.baseTarget );
		renderer.setClearColor( _clearColorZero, 0.0 );
		renderer.clear();
		renderer.render( scene, this.camera );
		changeVisible( false, true );

		// Copy Opaque Render to Write Buffer (so we can re-use depth buffer)
		if ( this.clearColor ) {
			renderer.setRenderTarget( writeBuffer );
			renderer.setClearColor( this.clearColor, this.clearAlpha );
			renderer.clearColor();
		}
		this.blendPass.render( renderer, writeBuffer, this.baseTarget );

		// Render Transparent Objects, Accumulation Pass
		prepareWboitBlending( WboitStages.Acummulation );
		renderer.setRenderTarget( this.baseTarget );
		renderer.setClearColor( _clearColorZero, 0.0 );
		renderer.clearColor();
		renderer.render( scene, this.camera );

		// Copy Accumulation Render to temp target (so we can re-use depth buffer)
		this.copyPass.render( renderer, this.accumulationTarget, this.baseTarget );

		// Render Transparent Objects, Revealage Pass
		prepareWboitBlending( WboitStages.Revealage );
		renderer.setRenderTarget( this.baseTarget );
		renderer.setClearColor( _clearColorOne, 1.0 );
		renderer.clearColor();
		renderer.render( scene, this.camera );

		// Composite Transparent Objects
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
		testCache.clear();
		writeCache.clear();

	}

}

export { WboitPass };
