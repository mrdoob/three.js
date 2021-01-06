import {
	Loader,
	LoadingManager
} from '../../../src/Three';

export class VOXLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( chunks: Array<object> ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<Array<object>>;
	parse( data: ArrayBuffer ): Array<object>;

}
