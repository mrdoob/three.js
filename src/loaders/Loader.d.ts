import { LoadingManager } from './LoadingManager';

/**
 * Base class for implementing loaders.
 */
export class Loader {

	constructor( manager?: LoadingManager );

	crossOrigin: string;
	path: string;
	resourcePath: string;
	manager: LoadingManager;
	requestHeader: { [header: string]: string };

	/*
	load(): void;
	parse(): void;
	*/

	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<any>;

	setCrossOrigin( crossOrigin: string ): this;
	setPath( path: string ): this;
	setResourcePath( resourcePath: string ): this;
	setRequestHeader( requestHeader: { [header: string]: string } ): this;

}
