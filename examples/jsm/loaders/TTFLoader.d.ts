import {
	Loader,
	LoadingManager
} from '../../../src/Three';

export class TTFLoader extends Loader {

	constructor( manager?: LoadingManager );
	reversed: boolean;

	load( url: string, onLoad: ( json: object ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( arraybuffer: ArrayBuffer ): object;

}
