/**
 * Generated from 'examples\modules\postprocessing\EffectComposer.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./MaskPass.js'), require('./Pass.js'), require('./ShaderPass.js'), require('../shaders/CopyShader.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './MaskPass.js', './Pass.js', './ShaderPass.js', '../shaders/CopyShader.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE,global.THREE,global.THREE,global.THREE));
}(this, (function (exports,THREE,MaskPass_js,Pass_js,ShaderPass_js,CopyShader_js) { 'use strict';

/**
 * @author alteredq / http://alteredqualia.com/
 */


if ( Pass_js.Pass === undefined ) {

	console.warn( 'Pass has been moved into a separate file, "postprocessing/Pass.js". Include it, as well.' );

}

exports.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};

		var size = renderer.getDrawingBufferSize();
		renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );
		renderTarget.texture.name = 'EffectComposer.rt1';

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.renderTarget2.texture.name = 'EffectComposer.rt2';

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	// dependencies

	if ( CopyShader_js.CopyShader === undefined ) {

		console.error( '__EffectComposer relies on CopyShader' );

	}

	if ( ShaderPass_js.ShaderPass === undefined ) {

		console.error( '__EffectComposer relies on ShaderPass' );

	}

	this.copyPass = new ShaderPass_js.ShaderPass( CopyShader_js.CopyShader );

};

Object.assign( exports.EffectComposer.prototype, {

	swapBuffers: function () {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

		var size = this.renderer.getDrawingBufferSize();
		pass.setSize( size.width, size.height );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( MaskPass_js.MaskPass !== undefined ) {

				if ( pass instanceof MaskPass_js.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof MaskPass_js.ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getDrawingBufferSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( width, height );

		}

	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
