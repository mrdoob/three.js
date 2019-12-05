import {
	AnimationClip,
	Camera,
	Loader,
	LoadingManager,
	Scene
} from '../../../src/Three';

import { DRACOLoader } from './DRACOLoader';
import { DDSLoader } from './DDSLoader';

export interface GLTF {
	animations: AnimationClip[];
	scene: Scene;
	scenes: Scene[];
	cameras: Camera[];
	asset: object;
}

export class GLTFLoader extends Loader {

	constructor( manager?: LoadingManager );
	dracoLoader: DRACOLoader | null;
	ddsLoader: DDSLoader | null;

	load( url: string, onLoad: ( gltf: GLTF ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
	setDRACOLoader( dracoLoader: DRACOLoader ): GLTFLoader;
	setDDSLoader( ddsLoader: DDSLoader ): GLTFLoader;
	parse( data: ArrayBuffer | string, path: string, onLoad: ( gltf: GLTF ) => void, onError?: ( event: ErrorEvent ) => void ) : void;

}
