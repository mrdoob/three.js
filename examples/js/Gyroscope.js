/**
 * Generated from 'examples\modules\Gyroscope.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../build/three.module.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../build/three.module.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE));
}(this, (function (exports,THREE) { 'use strict';

/**
 * @author alteredq / http://alteredqualia.com/
 */



exports.Gyroscope = function () {

	THREE.Object3D.call( this );

};

exports.Gyroscope.prototype = Object.create( THREE.Object3D.prototype );
exports.Gyroscope.prototype.constructor = exports.Gyroscope;

exports.Gyroscope.prototype.updateMatrixWorld = ( function () {

	var translationObject = new THREE.Vector3();
	var quaternionObject = new THREE.Quaternion();
	var scaleObject = new THREE.Vector3();

	var translationWorld = new THREE.Vector3();
	var quaternionWorld = new THREE.Quaternion();
	var scaleWorld = new THREE.Vector3();

	return function updateMatrixWorld( force ) {

		this.matrixAutoUpdate && this.updateMatrix();

		// update matrixWorld

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent !== null ) {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

				this.matrixWorld.decompose( translationWorld, quaternionWorld, scaleWorld );
				this.matrix.decompose( translationObject, quaternionObject, scaleObject );

				this.matrixWorld.compose( translationWorld, quaternionObject, scaleWorld );


			} else {

				this.matrixWorld.copy( this.matrix );

			}


			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	};

}() );

Object.defineProperty(exports, '__esModule', { value: true });

})));
