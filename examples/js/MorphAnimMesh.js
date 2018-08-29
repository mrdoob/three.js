/**
 * Generated from 'examples\modules\MorphAnimMesh.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../build/three.module.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../build/three.module.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE));
}(this, (function (exports,THREE) { 'use strict';

/**
 * @author alteredq / http://alteredqualia.com/
 */



exports.MorphAnimMesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

	this.mixer = new THREE.AnimationMixer( this );
	this.activeAction = null;
};

exports.MorphAnimMesh.prototype = Object.create( THREE.Mesh.prototype );
exports.MorphAnimMesh.prototype.constructor = exports.MorphAnimMesh;

exports.MorphAnimMesh.prototype.setDirectionForward = function () {

	this.mixer.timeScale = 1.0;

};

exports.MorphAnimMesh.prototype.setDirectionBackward = function () {

	this.mixer.timeScale = -1.0;

};

exports.MorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

	if( this.activeAction ) {

		this.activeAction.stop();
		this.activeAction = null;
		
	}

	var clip = THREE.AnimationClip.findByName( this, label );

	if ( clip ) {

		var action = this.mixer.clipAction( clip );
		action.timeScale = ( clip.tracks.length * fps ) / clip.duration;
		this.activeAction = action.play();

	} else {

		throw new Error( '__MorphAnimMesh: animations[' + label + '] undefined in .playAnimation()' );

	}

};

exports.MorphAnimMesh.prototype.updateAnimation = function ( delta ) {

	this.mixer.update( delta );

};

exports.MorphAnimMesh.prototype.copy = function ( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	this.mixer = new THREE.AnimationMixer( this );

	return this;

};

Object.defineProperty(exports, '__esModule', { value: true });

})));
