import {
	Loader,
	LoadingManager,
	Group
} from '../../../src/Three';
import {
	MTLLoader
} from './MTLLoader';

export class OBJLoader extends Loader {

	constructor( manager?: LoadingManager );
	materials: MTLLoader.MaterialCreator;

	load( url: string, onLoad: ( group: Group ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( data: string ) : Group;
	setMaterials( materials: MTLLoader.MaterialCreator ) : this;

}
