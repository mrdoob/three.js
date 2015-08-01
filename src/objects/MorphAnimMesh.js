/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MorphAnimMesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

	// API

	this.mixer = new THREE.AnimationMixer( this );

};

THREE.MorphAnimMesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.MorphAnimMesh.prototype.constructor = THREE.MorphAnimMesh;

THREE.MorphAnimMesh.prototype.setDirectionForward = function () {

	this.mixer.timeScale = 1.0;

};

THREE.MorphAnimMesh.prototype.setDirectionBackward = function () {

	this.mixer.timeScale = -1.0;

};

THREE.MorphAnimMesh.prototype.parseAnimations = function () {

	this.animationClips = THREE.AnimationClip.FromImplicitMorphTargetAnimations( this.geometry.morphTargets, 20 );
	this.firstAnimationClip = this.animationClips[0];

};

THREE.MorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

	this.mixer.removeAllActions();

	var clip = null;
	for( var i = 0; i < this.animationClips.length; i ++ ) {
		if( this.animationClips[ i ].name === label ) {
			clip = this.animationClips[ i ];
			break;
		}
	}
	
	if ( clip ) {

		var action = new THREE.AnimationAction( clip, 0, 1, 1, true );
		action.timeScale = ( clip.tracks.length * fps ) / clip.duration;
		this.mixer.addAction( action );

	} else {

		throw new Error( 'THREE.MorphAnimMesh: animationClips[' + label + '] undefined in .playAnimation()' );

	}

};

THREE.MorphAnimMesh.prototype.updateAnimation = function ( delta ) {

	this.mixer.update( delta );

};

THREE.MorphAnimMesh.prototype.interpolateTargets = function ( a, b, t ) {

	var influences = this.morphTargetInfluences;

	for ( var i = 0, l = influences.length; i < l; i ++ ) {

		influences[ i ] = 0;

	}

	if ( a > - 1 ) influences[ a ] = 1 - t;
	if ( b > - 1 ) influences[ b ] = t;

};

THREE.MorphAnimMesh.prototype.clone = function () {

	var morph = new THREE.MorphAnimMesh( this.geometry, this.material );
	return morph.copy( this );

};

THREE.MorphAnimMesh.prototype.copy = function ( source ) {

	this.mixer = new THREE.AnimationMixer( this );
	this.animationClips = source.animationClips;
	this.firstAnimationClips = source.firstAnimationClips;

	THREE.Mesh.prototype.copy.call( this, source );

	return this;

};
