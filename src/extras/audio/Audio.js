/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Audio = function ( listener ) {

	THREE.Object3D.call( this );

	this.type = 'Audio';

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

};

THREE.Audio.prototype = Object.create( THREE.Object3D.prototype );
THREE.Audio.prototype.constructor = THREE.Audio;

THREE.Audio.prototype.load = function ( file ) {

	var scope = this;

	var request = new XMLHttpRequest();
	request.open( 'GET', file, true );
	request.responseType = 'arraybuffer';
	request.onload = function ( e ) {

		scope.context.decodeAudioData( this.response, function ( buffer ) {

			scope.source.buffer = buffer;

			if ( scope.autoplay ) scope.play();

		} );

	};
	request.send();

	return this;

};

THREE.Audio.prototype.play = function () {

	if ( this.isPlaying === true ) {

		console.warn( 'THREE.Audio: Audio is already playing.' );
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

THREE.Audio.prototype.pause = function () {

	this.source.stop();
	this.startTime = this.context.currentTime;

};

THREE.Audio.prototype.stop = function () {

	this.source.stop();
	this.startTime = 0;

};

THREE.Audio.prototype.connect = function () {

	if ( this.filter !== undefined ) {

		this.source.connect( this.filter );
		this.filter.connect( this.panner );

	} else {

		this.source.connect( this.panner );

	}

};

THREE.Audio.prototype.disconnect = function () {

	if ( this.filter !== undefined ) {

		this.source.disconnect( this.filter );
		this.filter.disconnect( this.panner );

	} else {

		this.source.disconnect( this.panner );

	}

};

THREE.Audio.prototype.setFilter = function ( value ) {

	if ( this.isPlaying === true ) {

		this.disconnect();
		this.filter = value;
		this.connect();

	} else {

		this.filter = value;

	}

};

THREE.Audio.prototype.getFilter = function () {

	return this.filter;

};

THREE.Audio.prototype.setPlaybackRate = function ( value ) {

	this.playbackRate = value;

	if ( this.isPlaying === true ) {

		this.source.playbackRate.value = this.playbackRate;

	}

};

THREE.Audio.prototype.getPlaybackRate = function () {

	return this.playbackRate;

};

THREE.Audio.prototype.onEnded = function() {

	this.isPlaying = false;

};

THREE.Audio.prototype.setLoop = function ( value ) {

	this.source.loop = value;

};

THREE.Audio.prototype.getLoop = function () {

	return this.source.loop;

};

THREE.Audio.prototype.setRefDistance = function ( value ) {

	this.panner.refDistance = value;

};

THREE.Audio.prototype.getRefDistance = function () {

	return this.panner.refDistance;

};

THREE.Audio.prototype.setRolloffFactor = function ( value ) {

	this.panner.rolloffFactor = value;

};

THREE.Audio.prototype.getRolloffFactor = function () {

	return this.panner.rolloffFactor;

};

THREE.Audio.prototype.setVolume = function ( value ) {

	this.gain.gain.value = value;

};

THREE.Audio.prototype.getVolume = function () {

	return this.gain.gain.value;

};

THREE.Audio.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();

	return function updateMatrixWorld( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		this.panner.setPosition( position.x, position.y, position.z );

	};

} )();
