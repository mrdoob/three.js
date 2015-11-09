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
	this.gain.connect( listener.getOutputNode());

	this.autoplay = false;

	this.startTime = 0;
	this.playbackRate = 1;
	this.isPlaying = false;
	this.hasPlaybackControl = true;
	this.sourceType = 'empty';

};

THREE.Audio.prototype = Object.create( THREE.Object3D.prototype );
THREE.Audio.prototype.constructor = THREE.Audio;


THREE.Audio.prototype.setNodeSource = function ( audioNode ) {

	this.hasPlaybackControl = false;
	this.sourceType = 'audioNode';
	this.source = audioNode;
	this.connect();
	
	return this;

};



THREE.Audio.prototype.setBuffer = function ( audioBuffer ) {

	var scope = this;
	
	audioBuffer.onReady(function(buffer) {
		scope.source.buffer = buffer;
		scope.sourceType = 'buffer';
		if ( scope.autoplay ) scope.play();
	});

	return this;

};



THREE.Audio.prototype.play = function () {

	if ( this.isPlaying === true ) {

		console.warn( 'THREE.Audio: Audio is already playing.' );
		return;

	}
	
	if ( this.hasPlaybackControl === false ) {

		console.warn( 'THREE.Audio: this Audio has no playback control.' );
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

	if (this.hasPlaybackControl === false) {
		
		console.warn( 'THREE.Audio: this Audio has no playback control.' );
		return;
		
	}
	
	this.source.stop();
	this.startTime = this.context.currentTime;

};

THREE.Audio.prototype.stop = function () {

	if (this.hasPlaybackControl === false) {
		
		console.warn( 'THREE.Audio: this Audio has no playback control.' );
		return;
		
	}

	this.source.stop();
	this.startTime = 0;

};

THREE.Audio.prototype.connect = function () {

	if ( this.filter !== undefined ) {

		this.source.connect( this.filter );
		this.filter.connect( this.gain );

	} else {

		this.source.connect( this.gain );

	}

};

THREE.Audio.prototype.disconnect = function () {

	if ( this.filter !== undefined ) {

		this.source.disconnect( this.filter );
		this.filter.disconnect( this.gain );

	} else {

		this.source.disconnect( this.gain );

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

	if (this.hasPlaybackControl === false) {
		
		console.warn( 'THREE.Audio: this Audio has no playback control.' );
		return;
		
	}

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

	if (this.hasPlaybackControl === false) {
		
		console.warn( 'THREE.Audio: this Audio has no playback control.' );
		return;
		
	}

	this.source.loop = value;

};

THREE.Audio.prototype.getLoop = function () {
	
	if (this.hasPlaybackControl === false) {
		
		console.warn( 'THREE.Audio: this Audio has no playback control.' );
		return false;
		
	}

	return this.source.loop;

};


THREE.Audio.prototype.setVolume = function ( value ) {

	this.gain.gain.value = value;

};

THREE.Audio.prototype.getVolume = function () {

	return this.gain.gain.value;

};

