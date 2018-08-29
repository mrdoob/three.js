/**
 * Generated from 'examples\modules\lines\Line2.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./LineGeometry.js'), require('./LineMaterial.js'), require('./LineSegments2.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './LineGeometry.js', './LineMaterial.js', './LineSegments2.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE,global.THREE,global.THREE));
}(this, (function (exports,three_module_js,LineGeometry_js,LineMaterial_js,LineSegments2_js) { 'use strict';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */


exports.Line2 = function ( geometry, material ) {

	LineSegments2_js.LineSegments2.call( this );

	this.type = 'Line2';

	this.geometry = geometry !== undefined ? geometry : new LineGeometry_js.LineGeometry();
	this.material = material !== undefined ? material : new LineMaterial_js.LineMaterial( { color: Math.random() * 0xffffff } );

};

exports.Line2.prototype = Object.assign( Object.create( LineSegments2_js.LineSegments2.prototype ), {

	constructor: exports.Line2,

	isLine2: true,

	copy: function ( source ) {

		// todo

		return this;

	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
