console.warn( "THREE.MorphAnimMesh: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
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

	this.mixer.timeScale = - 1.0;

};

THREE.MorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

	if ( this.activeAction ) {

		this.activeAction.stop();
		this.activeAction = null;

	}

	var clip = THREE.AnimationClip.findByName( this, label );

	if ( clip ) {

		var action = this.mixer.clipAction( clip );
		action.timeScale = ( clip.tracks.length * fps ) / clip.duration;
		this.activeAction = action.play();

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
