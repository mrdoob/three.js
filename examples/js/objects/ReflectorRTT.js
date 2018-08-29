/**
 * Generated from 'examples\modules\objects\ReflectorRTT.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./Reflector.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './Reflector.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,three_module_js,Reflector_js) { 'use strict';

exports.ReflectorRTT = function ( geometry, options ) {

	Reflector_js.Reflector.call( this, geometry, options );

	this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

};

exports.ReflectorRTT.prototype = Object.create( Reflector_js.Reflector.prototype );

Object.defineProperty(exports, '__esModule', { value: true });

})));
