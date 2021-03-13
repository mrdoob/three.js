import {
	BufferGeometry,
	Loader,
	LoadingManager
} from 'three';

export class IfcLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( geometry: BufferGeometry ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( data: ArrayBuffer ): BufferGeometry;

}