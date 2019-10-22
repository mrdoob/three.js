import {
	AnimationClip,
	Camera,
	Loader,
	LoadingManager,
	Scene
} from '../../../../src/Three';

export interface GLTF {
	animations: AnimationClip[];
	scene: Scene;
	scenes: Scene[];
	cameras: Camera[];
}

export class LegacyGLTFLoader extends Loader {

	constructor( manager?: LoadingManager );

	load( url: string, onLoad: ( gltf: GLTF ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( data: ArrayBuffer | string, path: string, callback: ( gltf: GLTF ) => void ): void;

}
