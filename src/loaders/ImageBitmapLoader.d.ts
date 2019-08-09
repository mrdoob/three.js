import { LoadingManager } from './LoadingManager.js';

export class ImageBitmapLoader {

	constructor( manager?: LoadingManager );

	manager: LoadingManager;

	setOptions( options: any ): ImageBitmapLoader;
	load(
		url: string,
		onLoad?: ( response: string | ArrayBuffer ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): any;
	setCrossOrigin(): ImageBitmapLoader;
	setPath( path: string ): ImageBitmapLoader;

}
