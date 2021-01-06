import {
	Group,
	Loader,
	LoadingManager
} from '../../../src/Three';

export class GCodeLoader extends Loader {

	constructor( manager?: LoadingManager );
	splitLayer: boolean;

	load( url: string, onLoad: ( object: Group ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<Group>;
	parse( data: string ) : Group;

}
