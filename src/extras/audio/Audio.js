/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = Audio;

var Object3D = require( "../../core/Object3D" ),
	Vector3 = require( "../../math/Vector3" );

function Audio( listener ) {

	Object3D.call( this );

	this.type = "Audio";

	this.context = listener.context;
	this.source = this.context.createBufferSource();
	this.source.onended = this.onEnded.bind( this );

	this.gain = this.context.createGain();
	this.gain.connect( this.context.destination );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

	this.autoplay = false;

	this.startTime = 0;
	this.playbackRate = 1;
	this.isPlaying = false;

}

Audio.prototype = Object.create( Object3D.prototype );
Audio.prototype.constructor = Audio;

Audio.prototype.load = function ( file ) {

	var scope = this;

	var request = new XMLHttpRequest();
	request.open( "GET", file, true );
	request.responseType = "arraybuffer";
	request.onload = function () {

		scope.context.decodeAudioData( this.response, function ( buffer ) {

			scope.source.buffer = buffer;

			if( scope.autoplay ) { scope.play(); }

		} );

	};
	request.send();

	return this;

};

Audio.prototype.play = function () {

	if ( this.isPlaying === true ) {

		console.warn( "Audio: Audio is already playing." );
		return;

	}

	var source = this.context.createBufferSource();

	source.buffer = this.source.buffer;
	source.loop = this.source.loop;
	source.onended = this.source.onended;
	source.start( 0, this.startTime );
	source.playbackRate.value = this.playbackRate;

	this.isPlaying = true;

	this.source = source;

	this.connect();

};

Audio.prototype.pause = function () {

	this.source.stop();
	this.startTime = this.context.currentTime;

};

Audio.prototype.stop = function () {

	this.source.stop();
	this.startTime = 0;

};

Audio.prototype.connect = function () {

	if ( this.filter !== undefined ) {

		this.source.connect( this.filter );
		this.filter.connect( this.panner );

	} else {

		this.source.connect( this.panner );

	}

};

Audio.prototype.disconnect = function () {

	if ( this.filter !== undefined ) {

		this.source.disconnect( this.filter );
		this.filter.disconnect( this.panner );

	} else {

		this.source.disconnect( this.panner );

	}

};

Audio.prototype.setFilter = function ( value ) {

	if ( this.isPlaying === true ) {

		this.disconnect();
		this.filter = value;
		this.connect();

	} else {

		this.filter = value;

	}

};

Audio.prototype.getFilter = function () {

	return this.filter;

};

Audio.prototype.setPlaybackRate = function ( value ) {

	this.playbackRate = value;

	if ( this.isPlaying === true ) {

		this.source.playbackRate.value = this.playbackRate;

	}

};

Audio.prototype.getPlaybackRate = function () {

	return this.playbackRate;

};

Audio.prototype.onEnded = function() {

	this.isPlaying = false;

};

Audio.prototype.setLoop = function ( value ) {

	this.source.loop = value;

};

Audio.prototype.getLoop = function () {

	return this.source.loop;

};

Audio.prototype.setRefDistance = function ( value ) {

	this.panner.refDistance = value;

};

Audio.prototype.getRefDistance = function () {

	return this.panner.refDistance;

};

Audio.prototype.setRolloffFactor = function ( value ) {

	this.panner.rolloffFactor = value;

};

Audio.prototype.getRolloffFactor = function () {

	return this.panner.rolloffFactor;

};

Audio.prototype.setVolume = function ( value ) {

	this.gain.gain.value = value;

};

Audio.prototype.getVolume = function () {

	return this.gain.gain.value;

};

Audio.prototype.updateMatrixWorld = ( function () {

	var position;

	return function updateMatrixWorld( force ) {

		if ( position === undefined ) { position = new Vector3(); }

		Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		this.panner.setPosition( position.x, position.y, position.z );

	};

}() );
