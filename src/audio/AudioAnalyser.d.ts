export class AudioAnalyser {

	constructor( audio: any, fftSize: number );

	analyser: any;
	data: Uint8Array;

	getFrequencyData(): Uint8Array;
	getAverageFrequency(): number;

	/**
	 * @deprecated Use {@link AudioAnalyser#getFrequencyData .getFrequencyData()} instead.
	 */
	getData( file: any ): any;

}
