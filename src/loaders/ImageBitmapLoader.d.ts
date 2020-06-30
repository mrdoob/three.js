import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';

export class ImageBitmapLoader extends Loader {

	constructor( manager?: LoadingManager );

	options: undefined | object;

	readonly isImageBitmapLoader: true;

	setOptions( options: object ): ImageBitmapLoader;
	load(
		url: string,
		onLoad?: ( response: ImageBitmap ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): any;

}
