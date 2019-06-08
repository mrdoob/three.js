import { LoadingManager } from './LoadingManager';

/**
 * A loader for loading an image.
 * Unlike other loaders, this one emits events instead of using predefined callbacks. So if you're interested in getting notified when things happen, you need to add listeners to the object.
 */
export class ImageLoader {

	constructor( manager?: LoadingManager );

	manager: LoadingManager;
	crossOrigin: string;
	withCredentials: string;
	path: string;

	/**
	 * Begin loading from url
	 * @param url
	 */
	load(
		url: string,
		onLoad?: ( image: HTMLImageElement ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): HTMLImageElement;
	setCrossOrigin( crossOrigin: string ): ImageLoader;
	setWithCredentials( value: string ): ImageLoader;
	setPath( value: string ): ImageLoader;

}
