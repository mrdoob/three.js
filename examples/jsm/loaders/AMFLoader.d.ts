import {
	Loader,
	LoadingManager,
	Group
} from '../../../src/Three';

export class AMFLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( object: Group ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( data: ArrayBuffer ): Group;

}
