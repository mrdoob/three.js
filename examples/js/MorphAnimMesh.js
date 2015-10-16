/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MorphAnimMesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

	this.mixer = new THREE.AnimationMixer( this );
	this.activeAction = null;
};

THREE.MorphAnimMesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.MorphAnimMesh.prototype.constructor = THREE.MorphAnimMesh;

THREE.MorphAnimMesh.prototype.setDirectionForward = function () {

	this.mixer.timeScale = 1.0;

};

THREE.MorphAnimMesh.prototype.setDirectionBackward = function () {

	this.mixer.timeScale = -1.0;

};

THREE.MorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

	if( this.activeAction ) {

		this.mixer.removeAction( this.activeAction );
		this.activeAction = null;
		
	}

	var clip = THREE.AnimationClip.findByName( this.geometry.animations, label );

	if ( clip ) {

		var action = new THREE.AnimationAction( clip );
		action.timeScale = ( clip.tracks.length * fps ) / clip.duration;
		this.mixer.addAction( action );
		this.activeAction = action;

	} else {

		throw new Error( 'THREE.MorphAnimMesh: animations[' + label + '] undefined in .playAnimation()' );

	}

};

THREE.MorphAnimMesh.prototype.updateAnimation = function ( delta ) {

	this.mixer.update( delta );

};

THREE.MorphAnimMesh.prototype.copy = function ( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	this.mixer = new THREE.AnimationMixer( this );

	return this;

};
