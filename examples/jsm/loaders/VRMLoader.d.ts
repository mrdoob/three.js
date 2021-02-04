import {
	Loader,
	LoadingManager
} from '../../../src/Three';

import { GLTFLoader, GLTF } from './GLTFLoader';
import { DRACOLoader } from './DRACOLoader';

export class VRMLoader extends Loader {

	constructor( manager?: LoadingManager );
	gltfLoader: GLTFLoader;

	load( url: string, onLoad: ( scene: GLTF ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<GLTF>;
	parse( gltf: GLTF, onLoad: ( scene: GLTF ) => void ): void;
	setDRACOLoader( dracoLoader: DRACOLoader ): this;

}
