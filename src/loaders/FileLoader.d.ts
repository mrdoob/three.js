import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';

export class FileLoader extends Loader {

	constructor( manager?: LoadingManager );

	mimeType: undefined | MimeType;
	responseType: undefined |string;
	responseModifier: (
		response: string | ArrayBuffer,
		callback: ( response: any ) => void
	) => void;
	load(
		url: string,
		onLoad?: ( response: string | ArrayBuffer ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): any;
	setMimeType( mimeType: MimeType ): FileLoader;
	setResponseModifier( responseModifier: ( response: string | ArrayBuffer, callback: ( response: any ) => void ) => void ): FileLoader;
	setResponseType( responseType: string ): FileLoader;

}
