import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';

export class FileLoader extends Loader {

	constructor( manager?: LoadingManager );

	mimeType: undefined | MimeType;
	responseType: undefined |string;
	withCredentials: undefined |string;
	requestHeader: undefined | { [header: string]: string };

	load(
		url: string,
		onLoad?: ( response: string | ArrayBuffer ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): any;
	setMimeType( mimeType: MimeType ): FileLoader;
	setResponseType( responseType: string ): FileLoader;
	setWithCredentials( value: string ): FileLoader;
	setRequestHeader( value: { [header: string]: string } ): FileLoader;

}
