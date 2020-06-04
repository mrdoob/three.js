import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';

export class AudioLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: ( audioBuffer: AudioBuffer ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): void;

}
