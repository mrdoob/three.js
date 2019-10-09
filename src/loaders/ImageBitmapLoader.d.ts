import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager.js';

export class ImageBitmapLoader extends Loader {

	constructor( manager?: LoadingManager );

	options: undefined | object;

	setOptions( options: object ): ImageBitmapLoader;
	load(
		url: string,
		onLoad?: ( response: string | ArrayBuffer ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): any;

}
