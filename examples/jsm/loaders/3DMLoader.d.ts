import {
	Loader,
	LoadingManager,
	Object3D
} from '../../../src/Three';

export class Rhino3dmLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( object: Object3D ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<Object3D>;
	parse( data: ArrayBufferLike, onLoad: ( object: Object3D ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	setLibraryPath( path: string ): Rhino3dmLoader;
	setWorkerLimit( workerLimit: number ): Rhino3dmLoader;
	dispose(): Rhino3dmLoader;

}
