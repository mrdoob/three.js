import {
	AnimationClip,
	AnimationMixer,
	Mesh
} from '../../../build/three.module.js';

var MorphAnimMesh = function ( geometry, material ) {

	Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

	this.mixer = new AnimationMixer( this );
	this.activeAction = null;

};

MorphAnimMesh.prototype = Object.create( Mesh.prototype );
MorphAnimMesh.prototype.constructor = MorphAnimMesh;

MorphAnimMesh.prototype.setDirectionForward = function () {

	this.mixer.timeScale = 1.0;

};

MorphAnimMesh.prototype.setDirectionBackward = function () {

	this.mixer.timeScale = - 1.0;

};

MorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

	if ( this.activeAction ) {

		this.activeAction.stop();
		this.activeAction = null;

	}

	var clip = AnimationClip.findByName( this, label );

	if ( clip ) {

		var action = this.mixer.clipAction( clip );
		action.timeScale = ( clip.tracks.length * fps ) / clip.duration;
		this.activeAction = action.play();

	} else {

		throw new Error( 'THREE.MorphAnimMesh: animations[' + label + '] undefined in .playAnimation()' );

	}

};

MorphAnimMesh.prototype.updateAnimation = function ( delta ) {

	this.mixer.update( delta );

};

MorphAnimMesh.prototype.copy = function ( source ) {

	Mesh.prototype.copy.call( this, source );

	this.mixer = new AnimationMixer( this );

	return this;

};

export { MorphAnimMesh };
