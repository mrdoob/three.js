import {
	Loader,
	LoadingManager
} from '../../../src/Three';

export class VOXLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( chunks: Array<object> ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( data: ArrayBuffer ): Array<object>;

}
