/**
 * Generated from 'examples\modules\lines\Wireframe.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./LineMaterial.js'), require('./LineSegmentsGeometry.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './LineMaterial.js', './LineSegmentsGeometry.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE,global.THREE));
}(this, (function (exports,THREE,LineMaterial_js,LineSegmentsGeometry_js) { 'use strict';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */


exports.Wireframe = function ( geometry, material ) {

	THREE.Mesh.call( this );

	this.type = 'Wireframe';

	this.geometry = geometry !== undefined ? geometry : new LineSegmentsGeometry_js.LineSegmentsGeometry();
	this.material = material !== undefined ? material : new LineMaterial_js.LineMaterial( { color: Math.random() * 0xffffff } );

};

exports.Wireframe.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

	constructor: exports.Wireframe,

	isWireframe: true,

	computeLineDistances: ( function () { // for backwards-compatability, but could be a method of LineSegmentsGeometry...

		var start = new THREE.Vector3();
		var end = new THREE.Vector3();

		return function computeLineDistances() {

			var geometry = this.geometry;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;
			var lineDistances = new Float32Array( 2 * instanceStart.data.count );

			for ( var i = 0, j = 0, l = instanceStart.data.count; i < l; i ++, j += 2 ) {

				start.fromBufferAttribute( instanceStart, i );
				end.fromBufferAttribute( instanceEnd, i );

				lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
				lineDistances[ j + 1 ] = lineDistances[ j ] + start.distanceTo( end );

			}

			var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

			geometry.addAttribute( 'instanceDistanceStart', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
			geometry.addAttribute( 'instanceDistanceEnd', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

			return this;

		};

	}() ),

	copy: function ( source ) {

		// todo

		return this;

	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
