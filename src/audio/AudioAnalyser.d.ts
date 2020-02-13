import { AudioWeaken } from './Audio';

export class AudioAnalyser {

	constructor( audio: AudioWeaken, fftSize: number );

	analyser: AnalyserNode;
	data: Uint8Array;

	getFrequencyData(): Uint8Array;
	getAverageFrequency(): number;

	/**
	 * @deprecated Use {@link AudioAnalyser#getFrequencyData .getFrequencyData()} instead.
	 */
	getData( file: any ): any;

}
