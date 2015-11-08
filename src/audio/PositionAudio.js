/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PositionAudio = function ( listener ) {

	THREE.Audio.call( this, listener );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

};

THREE.PositionAudio.prototype = Object.create( THREE.Audio.prototype );
THREE.PositionAudio.prototype.constructor = THREE.PositionAudio;



THREE.PositionAudio.prototype.connect = function () {

	if ( this.filter !== undefined ) {

		this.source.connect( this.filter );
		this.filter.connect( this.panner );

	} else {

		this.source.connect( this.panner );

	}

};

THREE.PositionAudio.prototype.disconnect = function () {

	if ( this.filter !== undefined ) {

		this.source.disconnect( this.filter );
		this.filter.disconnect( this.panner );

	} else {

		this.source.disconnect( this.panner );

	}

};

THREE.PositionAudio.prototype.setFilter = function ( value ) {

	if ( this.isPlaying === true ) {

		this.disconnect();
		this.filter = value;
		this.connect();

	} else {

		this.filter = value;

	}

};

THREE.PositionAudio.prototype.getFilter = function () {

	return this.filter;

};

THREE.PositionAudio.prototype.setRefDistance = function ( value ) {

	this.panner.refDistance = value;

};

THREE.PositionAudio.prototype.getRefDistance = function () {

	return this.panner.refDistance;

};

THREE.PositionAudio.prototype.setRolloffFactor = function ( value ) {

	this.panner.rolloffFactor = value;

};

THREE.PositionAudio.prototype.getRolloffFactor = function () {

	return this.panner.rolloffFactor;

};

THREE.PositionAudio.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();

	return function updateMatrixWorld( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		this.panner.setPosition( position.x, position.y, position.z );

	};

} )();
