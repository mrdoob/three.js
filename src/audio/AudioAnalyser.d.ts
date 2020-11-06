import { Audio } from './Audio';

export class AudioAnalyser {

	/**
	 * @param audio
	 * @param [fftSize=2048]
	 */
	constructor( audio: Audio<AudioNode>, fftSize?: number );

	analyser: AnalyserNode;
	data: Uint8Array;

	getFrequencyData(): Uint8Array;
	getAverageFrequency(): number;

	/**
	 * @deprecated Use {@link AudioAnalyser#getFrequencyData .getFrequencyData()} instead.
	 */
	getData( file: any ): any;

}
