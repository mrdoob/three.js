/**
 * @author mrdoob / http://mrdoob.com/
 */

function AudioAnalyser( audio, fftSize ) {

	this.analyser = audio.context.createAnalyser();
	this.analyser.fftSize = fftSize !== undefined ? fftSize : 2048;

	this.data = new Uint8Array( this.analyser.frequencyBinCount );

	audio.getOutput().connect( this.analyser );

}

Object.assign( AudioAnalyser.prototype, {

	getFrequencyData: function () {

		this.analyser.getByteFrequencyData( this.data );

		return this.data;

	},

	getAverageFrequency: function () {

		let value = 0;
		const data = this.getFrequencyData();

		for ( let i = 0; i < data.length; i ++ ) {

			value += data[ i ];

		}

		return value / data.length;

	}

} );

export { AudioAnalyser };
