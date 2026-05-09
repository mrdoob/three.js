import { Object3D } from '../core/Object3D.js';
import { warn } from '../utils.js';

/**
 * Represents a non-positional ( global ) audio object.
 *
 * This and related audio modules make use of the [Web Audio API](https://www.w3.org/TR/webaudio-1.1/).
 *
 * ```js
 * // create an AudioListener and add it to the camera
 * const listener = new THREE.AudioListener();
 * camera.add( listener );
 *
 * // create a global audio source
 * const sound = new THREE.Audio( listener );
 *
 * // load a sound and set it as the Audio object's buffer
 * const audioLoader = new THREE.AudioLoader();
 * audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
 * 	sound.setBuffer( buffer );
 * 	sound.setLoop( true );
 * 	sound.setVolume( 0.5 );
 * 	sound.play();
 * });
 * ```
 *
 * @augments Object3D
 */
class Audio extends Object3D {

	/**
	 * Constructs a new audio.
	 *
	 * @param {AudioListener} listener - The global audio listener.
	 */
	constructor( listener ) {

		super();

		this.type = 'Audio';

		/**
		 * The global audio listener.
		 *
		 * @type {AudioListener}
		 * @readonly
		 */
		this.listener = listener;

		/**
		 * The audio context.
		 *
		 * @type {AudioContext}
		 * @readonly
		 */
		this.context = listener.context;

		/**
		 * The gain node used for volume control.
		 *
		 * @type {GainNode}
		 * @readonly
		 */
		this.gain = this.context.createGain();
		this.gain.connect( listener.getInput() );

		/**
		 * Whether to start playback automatically or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.autoplay = false;

		/**
		 * A reference to an audio buffer.
		 *
		 * Defined via {@link Audio#setBuffer}.
		 *
		 * @type {?AudioBuffer}
		 * @default null
		 * @readonly
		 */
		this.buffer = null;

		/**
		 * Modify pitch, measured in cents. +/- 100 is a semitone.
		 * +/- 1200 is an octave.
		 *
		 * Defined via {@link Audio#setDetune}.
		 *
		 * @type {number}
		 * @default 0
		 * @readonly
		 */
		this.detune = 0;

		/**
		 * Whether the audio should loop or not.
		 *
		 * Defined via {@link Audio#setLoop}.
		 *
		 * @type {boolean}
		 * @default false
		 * @readonly
		 */
		this.loop = false;

		/**
		 * Defines where in the audio buffer the replay should
		 * start, in seconds.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.loopStart = 0;

		/**
		 * Defines where in the audio buffer the replay should
		 * stop, in seconds.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.loopEnd = 0;

		/**
		 * An offset to the time within the audio buffer the playback
		 * should begin, in seconds.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.offset = 0;

		/**
		 * Overrides the default duration of the audio.
		 *
		 * @type {undefined|number}
		 * @default undefined
		 */
		this.duration = undefined;

		/**
		 * The playback speed.
		 *
		 * Defined via {@link Audio#setPlaybackRate}.
		 *
		 * @type {number}
		 * @readonly
		 * @default 1
		 */
		this.playbackRate = 1;

		/**
		 * Indicates whether the audio is playing or not.
		 *
		 * This flag will be automatically set when using {@link Audio#play},
		 * {@link Audio#pause}, {@link Audio#stop}.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isPlaying = false;

		/**
		 * Indicates whether the audio playback can be controlled
		 * with method like {@link Audio#play} or {@link Audio#pause}.
		 *
		 * This flag will be automatically set when audio sources are
		 * defined.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.hasPlaybackControl = true;

		/**
		 * Holds a reference to the current audio source.
		 *
		 * The property is automatically by one of the `set*()` methods.
		 *
		 * @type {?AudioNode}
		 * @readonly
		 * @default null
		 */
		this.source = null;

		/**
		 * Defines the source type.
		 *
		 * The property is automatically set by one of the `set*()` methods.
		 *
		 * @type {('empty'|'audioNode'|'mediaNode'|'mediaStreamNode'|'buffer')}
		 * @readonly
		 * @default 'empty'
		 */
		this.sourceType = 'empty';

		this._startedAt = 0;
		this._progress = 0;
		this._connected = false;

		/**
		 * Can be used to apply a variety of low-order filters to create
		 * more complex sound effects e.g. via `BiquadFilterNode`.
		 *
		 * The property is automatically set by {@link Audio#setFilters}.
		 *
		 * @type {Array<AudioNode>}
		 * @readonly
		 */
		this.filters = [];

	}

	/**
	 * Returns the output audio node.
	 *
	 * @return {GainNode} The output node.
	 */
	getOutput() {

		return this.gain;

	}

	/**
	 * Sets the given audio node as the source of this instance.
	 *
	 * {@link Audio#sourceType} is set to `audioNode` and {@link Audio#hasPlaybackControl} to `false`.
	 *
	 * @param {AudioNode} audioNode - The audio node like an instance of `OscillatorNode`.
	 * @return {Audio} A reference to this instance.
	 */
	setNodeSource( audioNode ) {

		this.hasPlaybackControl = false;
		this.sourceType = 'audioNode';
		this.source = audioNode;
		this.connect();

		return this;

	}

	/**
	 * Sets the given media element as the source of this instance.
	 *
	 * {@link Audio#sourceType} is set to `mediaNode` and {@link Audio#hasPlaybackControl} to `false`.
	 *
	 * @param {HTMLMediaElement} mediaElement - The media element.
	 * @return {Audio} A reference to this instance.
	 */
	setMediaElementSource( mediaElement ) {

		this.hasPlaybackControl = false;
		this.sourceType = 'mediaNode';
		this.source = this.context.createMediaElementSource( mediaElement );
		this.connect();

		return this;

	}

	/**
	 * Sets the given media stream as the source of this instance.
	 *
	 * {@link Audio#sourceType} is set to `mediaStreamNode` and {@link Audio#hasPlaybackControl} to `false`.
	 *
	 * @param {MediaStream} mediaStream - The media stream.
	 * @return {Audio} A reference to this instance.
	 */
	setMediaStreamSource( mediaStream ) {

		this.hasPlaybackControl = false;
		this.sourceType = 'mediaStreamNode';
		this.source = this.context.createMediaStreamSource( mediaStream );
		this.connect();

		return this;

	}

	/**
	 * Sets the given audio buffer as the source of this instance.
	 *
	 * {@link Audio#sourceType} is set to `buffer` and {@link Audio#hasPlaybackControl} to `true`.
	 *
	 * @param {AudioBuffer} audioBuffer - The audio buffer.
	 * @return {Audio} A reference to this instance.
	 */
	setBuffer( audioBuffer ) {

		this.buffer = audioBuffer;
		this.sourceType = 'buffer';

		if ( this.autoplay ) this.play();

		return this;

	}

	/**
	 * Starts the playback of the audio.
	 *
	 * Can only be used with compatible audio sources that allow playback control.
	 *
	 * @param {number} [delay=0] - The delay, in seconds, at which the audio should start playing.
	 * @return {Audio|undefined} A reference to this instance.
	 */
	play( delay = 0 ) {

		if ( this.isPlaying === true ) {

			warn( 'Audio: Audio is already playing.' );
			return;

		}

		if ( this.hasPlaybackControl === false ) {

			warn( 'Audio: this Audio has no playback control.' );
			return;

		}

		this._startedAt = this.context.currentTime + delay;

		const source = this.context.createBufferSource();
		source.buffer = this.buffer;
		source.loop = this.loop;
		source.loopStart = this.loopStart;
		source.loopEnd = this.loopEnd;
		source.onended = this.onEnded.bind( this );
		source.start( this._startedAt, this._progress + this.offset, this.duration );

		this.isPlaying = true;

		this.source = source;

		this.setDetune( this.detune );
		this.setPlaybackRate( this.playbackRate );

		return this.connect();

	}

	/**
	 * Pauses the playback of the audio.
	 *
	 * Can only be used with compatible audio sources that allow playback control.
	 *
	 * @return {Audio|undefined} A reference to this instance.
	 */
	pause() {

		if ( this.hasPlaybackControl === false ) {

			warn( 'Audio: this Audio has no playback control.' );
			return;

		}

		if ( this.isPlaying === true ) {

			// update current progress

			this._progress += Math.max( this.context.currentTime - this._startedAt, 0 ) * this.playbackRate;

			if ( this.loop === true ) {

				// ensure _progress does not exceed duration with looped audios

				this._progress = this._progress % ( this.duration || this.buffer.duration );

			}

			this.source.stop();
			this.source.onended = null;

			this.isPlaying = false;

		}

		return this;

	}

	/**
	 * Stops the playback of the audio.
	 *
	 * Can only be used with compatible audio sources that allow playback control.
	 *
	 * @param {number} [delay=0] - The delay, in seconds, at which the audio should stop playing.
	 * @return {Audio|undefined} A reference to this instance.
	 */
	stop( delay = 0 ) {

		if ( this.hasPlaybackControl === false ) {

			warn( 'Audio: this Audio has no playback control.' );
			return;

		}

		this._progress = 0;

		if ( this.source !== null ) {

			this.source.stop( this.context.currentTime + delay );
			this.source.onended = null;

		}

		this.isPlaying = false;

		return this;

	}

	/**
	 * Connects to the audio source. This is used internally on
	 * initialisation and when setting / removing filters.
	 *
	 * @return {Audio} A reference to this instance.
	 */
	connect() {

		if ( this.filters.length > 0 ) {

			this.source.connect( this.filters[ 0 ] );

			for ( let i = 1, l = this.filters.length; i < l; i ++ ) {

				this.filters[ i - 1 ].connect( this.filters[ i ] );

			}

			this.filters[ this.filters.length - 1 ].connect( this.getOutput() );

		} else {

			this.source.connect( this.getOutput() );

		}

		this._connected = true;

		return this;

	}

	/**
	 * Disconnects to the audio source. This is used internally on
	 * initialisation and when setting / removing filters.
	 *
	 * @return {Audio|undefined} A reference to this instance.
	 */
	disconnect() {

		if ( this._connected === false ) {

			return;

		}

		if ( this.filters.length > 0 ) {

			this.source.disconnect( this.filters[ 0 ] );

			for ( let i = 1, l = this.filters.length; i < l; i ++ ) {

				this.filters[ i - 1 ].disconnect( this.filters[ i ] );

			}

			this.filters[ this.filters.length - 1 ].disconnect( this.getOutput() );

		} else {

			this.source.disconnect( this.getOutput() );

		}

		this._connected = false;

		return this;

	}

	/**
	 * Returns the current set filters.
	 *
	 * @return {Array<AudioNode>} The list of filters.
	 */
	getFilters() {

		return this.filters;

	}

	/**
	 * Sets an array of filters and connects them with the audio source.
	 *
	 * @param {Array<AudioNode>} [value] - A list of filters.
	 * @return {Audio} A reference to this instance.
	 */
	setFilters( value ) {

		if ( ! value ) value = [];

		if ( this._connected === true ) {

			this.disconnect();
			this.filters = value.slice();
			this.connect();

		} else {

			this.filters = value.slice();

		}

		return this;

	}

	/**
	 * Defines the detuning of oscillation in cents.
	 *
	 * @param {number} value - The detuning of oscillation in cents.
	 * @return {Audio} A reference to this instance.
	 */
	setDetune( value ) {

		this.detune = value;

		if ( this.isPlaying === true && this.source.detune !== undefined ) {

			this.source.detune.setTargetAtTime( this.detune, this.context.currentTime, 0.01 );

		}

		return this;

	}

	/**
	 * Returns the detuning of oscillation in cents.
	 *
	 * @return {number} The detuning of oscillation in cents.
	 */
	getDetune() {

		return this.detune;

	}

	/**
	 * Returns the first filter in the list of filters.
	 *
	 * @return {AudioNode|undefined} The first filter in the list of filters.
	 */
	getFilter() {

		return this.getFilters()[ 0 ];

	}

	/**
	 * Applies a single filter node to the audio.
	 *
	 * @param {AudioNode} [filter] - The filter to set.
	 * @return {Audio} A reference to this instance.
	 */
	setFilter( filter ) {

		return this.setFilters( filter ? [ filter ] : [] );

	}

	/**
	 * Sets the playback rate.
	 *
	 * Can only be used with compatible audio sources that allow playback control.
	 *
	 * @param {number} [value] - The playback rate to set.
	 * @return {Audio|undefined} A reference to this instance.
	 */
	setPlaybackRate( value ) {

		if ( this.hasPlaybackControl === false ) {

			warn( 'Audio: this Audio has no playback control.' );
			return;

		}

		this.playbackRate = value;

		if ( this.isPlaying === true ) {

			this.source.playbackRate.setTargetAtTime( this.playbackRate, this.context.currentTime, 0.01 );

		}

		return this;

	}

	/**
	 * Returns the current playback rate.

	 * @return {number} The playback rate.
	 */
	getPlaybackRate() {

		return this.playbackRate;

	}

	/**
	 * Automatically called when playback finished.
	 */
	onEnded() {

		this.isPlaying = false;
		this._progress = 0;

	}

	/**
	 * Returns the loop flag.
	 *
	 * Can only be used with compatible audio sources that allow playback control.
	 *
	 * @return {boolean} Whether the audio should loop or not.
	 */
	getLoop() {

		if ( this.hasPlaybackControl === false ) {

			warn( 'Audio: this Audio has no playback control.' );
			return false;

		}

		return this.loop;

	}

	/**
	 * Sets the loop flag.
	 *
	 * Can only be used with compatible audio sources that allow playback control.
	 *
	 * @param {boolean} value - Whether the audio should loop or not.
	 * @return {Audio|undefined} A reference to this instance.
	 */
	setLoop( value ) {

		if ( this.hasPlaybackControl === false ) {

			warn( 'Audio: this Audio has no playback control.' );
			return;

		}

		this.loop = value;

		if ( this.isPlaying === true ) {

			this.source.loop = this.loop;

		}

		return this;

	}

	/**
	 * Sets the loop start value which defines where in the audio buffer the replay should
	 * start, in seconds.
	 *
	 * @param {number} value - The loop start value.
	 * @return {Audio} A reference to this instance.
	 */
	setLoopStart( value ) {

		this.loopStart = value;

		return this;

	}

	/**
	 * Sets the loop end value which defines where in the audio buffer the replay should
	 * stop, in seconds.
	 *
	 * @param {number} value - The loop end value.
	 * @return {Audio} A reference to this instance.
	 */
	setLoopEnd( value ) {

		this.loopEnd = value;

		return this;

	}

	/**
	 * Returns the volume.
	 *
	 * @return {number} The volume.
	 */
	getVolume() {

		return this.gain.gain.value;

	}

	/**
	 * Sets the volume.
	 *
	 * @param {number} value - The volume to set.
	 * @return {Audio} A reference to this instance.
	 */
	setVolume( value ) {

		this.gain.gain.setTargetAtTime( value, this.context.currentTime, 0.01 );

		return this;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.sourceType !== 'buffer' ) {

			warn( 'Audio: Audio source type cannot be copied.' );

			return this;

		}

		this.autoplay = source.autoplay;

		this.buffer = source.buffer;
		this.detune = source.detune;
		this.loop = source.loop;
		this.loopStart = source.loopStart;
		this.loopEnd = source.loopEnd;
		this.offset = source.offset;
		this.duration = source.duration;
		this.playbackRate = source.playbackRate;
		this.hasPlaybackControl = source.hasPlaybackControl;
		this.sourceType = source.sourceType;

		this.filters = source.filters.slice();

		return this;

	}

	clone( recursive ) {

		return new this.constructor( this.listener ).copy( this, recursive );

	}

}

export { Audio };
