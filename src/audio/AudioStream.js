/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function AudioStream( path, listener ) {

	this.audioElement = new Audio( path );
	this.context = listener.context;

	this.gain = this.context.createGain();
	this.gain.connect( listener.getInput() );

	this.source = listener.context.createMediaElementSource( this.audioElement );

	this.connect();

}

Object.assign( AudioStream.prototype, {

	getOutput: function () {

		return this.gain;

	},

	play: function () {

		this.audioElement.play();

		return this;

	},

	pause: function () {

		this.audioElement.pause();

		return this;

	},

	getCurrentTime: function () {

		return this.audioElement.currentTime;

	},

	setCurrentTime: function ( value ) {

		this.audioElement.currentTime = value;

		return this;

	},

	getVolume: function () {

		return this.gain.gain.value;

	},

	setVolume: function ( value ) {

		this.gain.gain.value = value;

		return this;

	},

	connect: function () {

		this.source.connect( this.getOutput() );

		return this;

	},

	disconnect: function () {

		this.source.disconnect( this.getOutput() );

		return this;

	}

} );

export { AudioStream };
