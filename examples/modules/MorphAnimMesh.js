/**
 * @author alteredq / http://alteredqualia.com/
 */
import * as THREE from '../../build/three.module.js';

var __MorphAnimMesh;

__MorphAnimMesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

	this.mixer = new THREE.AnimationMixer( this );
	this.activeAction = null;
};

__MorphAnimMesh.prototype = Object.create( THREE.Mesh.prototype );
__MorphAnimMesh.prototype.constructor = __MorphAnimMesh;

__MorphAnimMesh.prototype.setDirectionForward = function () {

	this.mixer.timeScale = 1.0;

};

__MorphAnimMesh.prototype.setDirectionBackward = function () {

	this.mixer.timeScale = -1.0;

};

__MorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

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

__MorphAnimMesh.prototype.updateAnimation = function ( delta ) {

	this.mixer.update( delta );

};

__MorphAnimMesh.prototype.copy = function ( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	this.mixer = new THREE.AnimationMixer( this );

	return this;

};

export { __MorphAnimMesh as MorphAnimMesh };
