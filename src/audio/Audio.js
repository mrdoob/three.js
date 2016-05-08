/**
 * @author mrdoob / http://mrdoob.com/
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 */

THREE.Audio = function ( listener ) {

	THREE.Object3D.call( this );

	this.type = 'Audio';

	this.context = listener.context;
	this.source = this.context.createBufferSource();
	this.source.onended = this.onEnded.bind( this );

	this.gain = this.context.createGain();
	this.gain.connect( listener.getInput() );

	this.autoplay = false;

	this.startTime = 0;
	this.playbackRate = 1;
	this.isPlaying = false;
	this.hasPlaybackControl = true;
	this.sourceType = 'empty';

	this.filter = null;

};

THREE.Audio.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

	constructor: THREE.Audio,

	getOutput: function () {

		return this.gain;

	},

	setNodeSource: function ( audioNode ) {

		this.hasPlaybackControl = false;
		this.sourceType = 'audioNode';
		this.source = audioNode;
		this.connect();

		return this;

	},

	setBuffer: function ( audioBuffer ) {

		var scope = this;

		scope.source.buffer = audioBuffer;
		scope.sourceType = 'buffer';
		if ( scope.autoplay ) scope.play();

		return this;

	},

	play: function () {

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

	},

	pause: function () {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this.source.stop();
		this.startTime = this.context.currentTime;

	},

	stop: function () {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this.source.stop();
		this.startTime = 0;

	},

	connect: function () {

		if ( this.filter !== null ) {

			this.source.connect( this.filter );
			this.filter.connect( this.getOutput() );

		} else {

			this.source.connect( this.getOutput() );

		}

	},

	disconnect: function () {

		if ( this.filter !== null ) {

			this.source.disconnect( this.filter );
			this.filter.disconnect( this.getOutput() );

		} else {

			this.source.disconnect( this.getOutput() );

		}

	},

	getFilter: function () {

		return this.filter;

	},

	setFilter: function ( value ) {

		if ( value === undefined ) value = null;

		if ( this.isPlaying === true ) {

			this.disconnect();
			this.filter = value;
			this.connect();

		} else {

			this.filter = value;

		}

	},

	setPlaybackRate: function ( value ) {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this.playbackRate = value;

		if ( this.isPlaying === true ) {

			this.source.playbackRate.value = this.playbackRate;

		}

	},

	getPlaybackRate: function () {

		return this.playbackRate;

	},

	onEnded: function () {

		this.isPlaying = false;

	},

	getLoop: function () {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return false;

		}

		return this.source.loop;

	},

	setLoop: function ( value ) {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this.source.loop = value;

	},

	getVolume: function () {

		return this.gain.gain.value;

	},


	setVolume: function ( value ) {

		this.gain.gain.value = value;

	}

} );
