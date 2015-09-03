/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MorphAnimMesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

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

THREE.MorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

	this.mixer.removeAllActions();

	var clip = null;
	for( var i = 0; i < this.geometry.clips.length; i ++ ) {
		if( this.geometry.clips[ i ].name === label ) {
			clip = this.geometry.clips[ i ];
			break;
		}
	}
	
	if ( clip ) {

		var action = new THREE.AnimationAction( clip, 0, 1, 1, true );
		action.timeScale = ( clip.tracks.length * fps ) / clip.duration;
		this.mixer.addAction( action );

	} else {

		throw new Error( 'THREE.MorphAnimMesh: clips[' + label + '] undefined in .playAnimation()' );

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

THREE.MorphAnimMesh.prototype.copy = function ( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	this.mixer = new THREE.AnimationMixer( this );

	return this;

};
