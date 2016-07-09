/**
 * @author mrdoob / http://mrdoob.com/
 */

function AudioAnalyser ( audio, fftSize ) {
	this.isAudioAnalyser = true;

	this.analyser = audio.context.createAnalyser();
	this.analyser.fftSize = fftSize !== undefined ? fftSize : 2048;

	this.data = new Uint8Array( this.analyser.frequencyBinCount );

	audio.getOutput().connect( this.analyser );

};

Object.assign( AudioAnalyser.prototype, {

	getFrequencyData: function () {

		this.analyser.getByteFrequencyData( this.data );

		return this.data;

	},

	getAverageFrequency: function () {

		var value = 0, data = this.getFrequencyData();

		for ( var i = 0; i < data.length; i ++ ) {

			value += data[ i ];

		}

		return value / data.length;

	}

} );


export { AudioAnalyser };