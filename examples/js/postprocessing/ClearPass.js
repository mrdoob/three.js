/**
 * Generated from 'examples\modules\postprocessing\ClearPass.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./Pass.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './Pass.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,three_module_js,Pass_js) { 'use strict';

/**
 * @author mrdoob / http://mrdoob.com/
 */


exports.ClearPass = function ( clearColor, clearAlpha ) {

	Pass_js.Pass.call( this );

	this.needsSwap = false;

	this.clearColor = ( clearColor !== undefined ) ? clearColor : 0x000000;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

};

exports.ClearPass.prototype = Object.assign( Object.create( Pass_js.Pass.prototype ), {

	constructor: exports.ClearPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		renderer.clear();

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
