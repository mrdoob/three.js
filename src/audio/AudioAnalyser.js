/**
 * This class can be used to analyse audio data.
 *
 * ```js
 * // create an AudioListener and add it to the camera
 * const listener = new THREE.AudioListener();
 * camera.add( listener );
 *
 * // create an Audio source
 * const sound = new THREE.Audio( listener );
 *
 * // load a sound and set it as the Audio object's buffer
 * const audioLoader = new THREE.AudioLoader();
 * audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
 * 	sound.setBuffer( buffer );
 * 	sound.setLoop(true);
 * 	sound.setVolume(0.5);
 * 	sound.play();
 * });
 *
 * // create an AudioAnalyser, passing in the sound and desired fftSize
 * const analyser = new THREE.AudioAnalyser( sound, 32 );
 *
 * // get the average frequency of the sound
 * const data = analyser.getAverageFrequency();
 * ```
 */
class AudioAnalyser {

	/**
	 * Constructs a new audio analyzer.
	 *
	 * @param {Audio} audio - The audio to analyze.
	 * @param {Audio} [fftSize=2048] - The window size in samples that is used when performing a Fast Fourier Transform (FFT) to get frequency domain data.
	 */
	constructor( audio, fftSize = 2048 ) {

		/**
		 * The global audio listener.
		 *
		 * @type {AnalyserNode}
		 */
		this.analyser = audio.context.createAnalyser();
		this.analyser.fftSize = fftSize;

		/**
		 * Holds the analyzed data.
		 *
		 * @type {Uint8Array}
		 */
		this.data = new Uint8Array( this.analyser.frequencyBinCount );

		audio.getOutput().connect( this.analyser );

	}

	/**
	 * Returns an array with frequency data of the audio.
	 *
	 * Each item in the array represents the decibel value for a specific frequency.
	 * The frequencies are spread linearly from 0 to 1/2 of the sample rate.
	 * For example, for 48000 sample rate, the last item of the array will represent
	 * the decibel value for 24000 Hz.
	 *
	 * @return {Uint8Array} The frequency data.
	 */
	getFrequencyData() {

		this.analyser.getByteFrequencyData( this.data );

		return this.data;

	}

	/**
	 * Returns the average of the frequencies returned by {@link AudioAnalyser#getFrequencyData}.
	 *
	 * @return {number} The average frequency.
	 */
	getAverageFrequency() {

		let value = 0;
		const data = this.getFrequencyData();

		for ( let i = 0; i < data.length; i ++ ) {

			value += data[ i ];

		}

		return value / data.length;

	}

}

export { AudioAnalyser };
