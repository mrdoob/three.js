/**
 * Generated from 'examples\modules\postprocessing\RenderPass.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./Pass.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './Pass.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,three_module_js,Pass_js) { 'use strict';

/**
 * @author alteredq / http://alteredqualia.com/
 */


exports.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	Pass_js.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	this.clear = true;
	this.clearDepth = false;
	this.needsSwap = false;

};

exports.RenderPass.prototype = Object.assign( Object.create( Pass_js.Pass.prototype ), {

	constructor: exports.RenderPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.scene.overrideMaterial = this.overrideMaterial;

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.clearDepth();

		}

		renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;
	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
