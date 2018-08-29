/**
 * Generated from 'examples\modules\lines\WireframeGeometry2.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./LineSegmentsGeometry.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './LineSegmentsGeometry.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,THREE,LineSegmentsGeometry_js) { 'use strict';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */


exports.WireframeGeometry2 = function ( geometry ) {

	LineSegmentsGeometry_js.LineSegmentsGeometry.call( this );

	this.type = 'WireframeGeometry2';

	this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) );

	// set colors, maybe

};

exports.WireframeGeometry2.prototype = Object.assign( Object.create( LineSegmentsGeometry_js.LineSegmentsGeometry.prototype ), {

	constructor: exports.WireframeGeometry2,

	isWireframeGeometry2: true,

	copy: function ( source ) {

		// todo

		return this;

	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
