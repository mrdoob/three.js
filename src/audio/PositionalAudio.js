/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PositionalAudio = function ( listener ) {

	THREE.Audio.call( this, listener );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

};

THREE.PositionalAudio.prototype = Object.create( THREE.Audio.prototype );
THREE.PositionalAudio.prototype.constructor = THREE.PositionalAudio;

THREE.PositionalAudio.prototype.getOutput = function () {

	return this.panner;

};

THREE.PositionalAudio.prototype.setRefDistance = function ( value ) {

	this.panner.refDistance = value;

};

THREE.PositionalAudio.prototype.getRefDistance = function () {

	return this.panner.refDistance;

};

THREE.PositionalAudio.prototype.setRolloffFactor = function ( value ) {

	this.panner.rolloffFactor = value;

};

THREE.PositionalAudio.prototype.getRolloffFactor = function () {

	return this.panner.rolloffFactor;

};

THREE.PositionalAudio.prototype.setDistanceModel = function ( value ) {

	this.panner.distanceModel = value;

};

THREE.PositionalAudio.prototype.getDistanceModel = function () {

	return this.panner.distanceModel;

};

THREE.PositionalAudio.prototype.setMaxDistance = function ( value ) {

	this.panner.maxDistance = value;

};

THREE.PositionalAudio.prototype.getMaxDistance = function () {

	return this.panner.maxDistance;

};

THREE.PositionalAudio.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();

	return function updateMatrixWorld( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		this.panner.setPosition( position.x, position.y, position.z );

	};

} )();
