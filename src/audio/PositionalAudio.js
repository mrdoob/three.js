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



THREE.PositionalAudio.prototype.connect = function () {

	if ( this.filter !== undefined ) {

		this.source.connect( this.filter );
		this.filter.connect( this.panner );

	} else {

		this.source.connect( this.panner );

	}

};

THREE.PositionalAudio.prototype.disconnect = function () {

	if ( this.filter !== undefined ) {

		this.source.disconnect( this.filter );
		this.filter.disconnect( this.panner );

	} else {

		this.source.disconnect( this.panner );

	}

};

THREE.PositionalAudio.prototype.setFilter = function ( value ) {

	if ( this.isPlaying === true ) {

		this.disconnect();
		this.filter = value;
		this.connect();

	} else {

		this.filter = value;

	}

};

THREE.PositionalAudio.prototype.getFilter = function () {

	return this.filter;

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

THREE.PositionalAudio.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();

	return function updateMatrixWorld( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		this.panner.setPosition( position.x, position.y, position.z );

	};

} )();
