import {
	Loader,
	LoadingManager,
	BufferGeometry
} from '../../../src/Three';

export class DRACOLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( geometry: BufferGeometry ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	setDecoderPath( path: string ): DRACOLoader;
	setDecoderConfig( config: object ): DRACOLoader;
	setWorkerLimit( workerLimit: number ): DRACOLoader;
	dispose(): DRACOLoader;

}
