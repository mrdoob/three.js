import { AudioAnalyser } from '../../../../src/audio/AudioAnalyser.js';

// Stands in for an Audio plus its AnalyserNode. `frequencies` is what the
// mock analyser writes on getByteFrequencyData(), which is the only input
// getAverageFrequency() has.
function mockAudio( { frequencies = null } = {} ) {

	const connections = [];
	const output = {
		connect( node ) {

			connections.push( node );

		}
	};

	return {
		connections,
		output,
		getOutput() {

			return output;

		},
		context: {
			createAnalyser() {

				return {
					fftSize: 2048,
					get frequencyBinCount() {

						return this.fftSize / 2;

					},
					getByteFrequencyData( array ) {

						if ( frequencies === null ) return;

						for ( let i = 0; i < array.length; i ++ ) {

							array[ i ] = frequencies[ i % frequencies.length ];

						}

					}
				};

			}
		}
	};

}

export default QUnit.module( 'Audios', () => {

	QUnit.module( 'AudioAnalyser', () => {

		// INSTANCING
		QUnit.test( 'Instancing - creates an analyser on the audio context', ( assert ) => {

			const analyser = new AudioAnalyser( mockAudio() );

			assert.ok( analyser.analyser !== undefined, 'the analyser node is exposed' );

		} );

		QUnit.test( 'Instancing - defaults to an fftSize of 2048', ( assert ) => {

			const analyser = new AudioAnalyser( mockAudio() );

			assert.strictEqual( analyser.analyser.fftSize, 2048, 'the default window size is 2048 samples' );

		} );

		QUnit.test( 'Instancing - applies a custom fftSize', ( assert ) => {

			const analyser = new AudioAnalyser( mockAudio(), 32 );

			assert.strictEqual( analyser.analyser.fftSize, 32, 'the requested window size is used' );

		} );

		QUnit.test( 'Instancing - sizes the data buffer to the bin count', ( assert ) => {

			// frequencyBinCount is always half the fftSize, so a 32-sample
			// window produces 16 frequency bins.
			const analyser = new AudioAnalyser( mockAudio(), 32 );

			assert.ok( analyser.data instanceof Uint8Array, 'the data buffer is a Uint8Array' );
			assert.strictEqual( analyser.data.length, 16, 'the buffer holds one entry per frequency bin' );

		} );

		QUnit.test( 'Instancing - connects the audio output into the analyser', ( assert ) => {

			const audio = mockAudio();
			const analyser = new AudioAnalyser( audio, 32 );

			assert.deepEqual( audio.connections, [ analyser.analyser ], 'the audio output feeds the analyser node' );

		} );

		// getFrequencyData
		QUnit.test( 'getFrequencyData - fills and returns the data buffer', ( assert ) => {

			const analyser = new AudioAnalyser( mockAudio( { frequencies: [ 10, 20, 30, 40 ] } ), 8 );

			const data = analyser.getFrequencyData();

			assert.strictEqual( data, analyser.data, 'the buffer is returned rather than a copy' );
			assert.deepEqual( Array.from( data ), [ 10, 20, 30, 40 ], 'the analyser node wrote into it' );

		} );

		QUnit.test( 'getFrequencyData - reuses the same buffer across calls', ( assert ) => {

			// The buffer is allocated once and refilled, so callers holding a
			// reference see the updated values.
			const analyser = new AudioAnalyser( mockAudio( { frequencies: [ 1, 2, 3, 4 ] } ), 8 );

			assert.strictEqual( analyser.getFrequencyData(), analyser.getFrequencyData(), 'the same array comes back every time' );

		} );

		// getAverageFrequency
		QUnit.test( 'getAverageFrequency - averages the frequency bins', ( assert ) => {

			const analyser = new AudioAnalyser( mockAudio( { frequencies: [ 10, 20, 30, 40 ] } ), 8 );

			assert.numEqual( analyser.getAverageFrequency(), 25, 'the mean of the four bins is returned' );

		} );

		QUnit.test( 'getAverageFrequency - returns zero for silence', ( assert ) => {

			const analyser = new AudioAnalyser( mockAudio( { frequencies: [ 0, 0, 0, 0 ] } ), 8 );

			assert.strictEqual( analyser.getAverageFrequency(), 0, 'silent input averages to zero' );

		} );

		QUnit.test( 'getAverageFrequency - handles the full byte range', ( assert ) => {

			const analyser = new AudioAnalyser( mockAudio( { frequencies: [ 255, 255, 255, 255 ] } ), 8 );

			assert.strictEqual( analyser.getAverageFrequency(), 255, 'a saturated spectrum averages to 255' );

		} );

		QUnit.test( 'getAverageFrequency - refreshes the data before averaging', ( assert ) => {

			// The average has to reflect the current audio, so it must pull new
			// data rather than reuse whatever was last read.
			let call = 0;

			const audio = mockAudio();
			const analyser = new AudioAnalyser( audio, 8 );

			analyser.analyser.getByteFrequencyData = ( array ) => {

				array.fill( ++ call * 10 );

			};

			assert.numEqual( analyser.getAverageFrequency(), 10, 'the first call reads the first sample' );
			assert.numEqual( analyser.getAverageFrequency(), 20, 'the second call reads fresh data' );

		} );

	} );

} );
