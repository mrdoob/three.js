/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Audio = function ( listener ) {

	THREE.Object3D.call( this );

	this.type = 'Audio';

	this.context = listener.context;
	this.source = this.context.createBufferSource();

	this.gain = this.context.createGain();
	this.gain.connect( this.context.destination );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

	this.startTime = 0;
	this.isPlaying = false;

};

THREE.Audio.prototype = Object.create( THREE.Object3D.prototype );
THREE.Audio.prototype.constructor = THREE.Audio;

THREE.Audio.prototype.load = function ( file, playImmediately ) {

	var scope = this;

	var request = new XMLHttpRequest();
	request.open( 'GET', file, true );
	request.responseType = 'arraybuffer';
	request.onload = function ( e ) {

		scope.context.decodeAudioData( this.response, function ( buffer ) {

			scope.source.buffer = buffer;

			if( playImmediately !== false ) scope.play();

		} );

	};
	request.send();

	return this;

};

THREE.Audio.prototype.play = function () {

	if ( ! this.isPlaying ) {

		var source = this.context.createBufferSource();

		source.buffer = this.source.buffer;
		source.loop = this.source.loop;
		source.connect( this.panner );
		source.start( 0, this.startTime );

		this.isPlaying = true;

		this.source = source;

	}

	else {

		console.warn("Audio is already playing.")

	}

};

THREE.Audio.prototype.pause = function () {

	this.source.stop();
	this.startTime = this.context.currentTime;
	this.isPlaying = false;

};

THREE.Audio.prototype.stop = function () {

	this.source.stop();
	this.startTime = 0;
	this.isPlaying = false;

};

THREE.Audio.prototype.setLoop = function ( value ) {

	this.source.loop = value;

};

THREE.Audio.prototype.setRefDistance = function ( value ) {

	this.panner.refDistance = value;

};

THREE.Audio.prototype.setRolloffFactor = function ( value ) {

	this.panner.rolloffFactor = value;

};

THREE.Audio.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();

	return function ( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		this.panner.setPosition( position.x, position.y, position.z );

	};

} )();
