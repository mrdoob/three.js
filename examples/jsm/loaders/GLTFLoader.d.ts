import {CanvasTextureLoader} from "../../../src/loaders/CanvasTextureLoader";
import {
	AnimationClip,
	Camera,
	Group,
	Loader,
	LoadingManager, TextureLoader
} from '../../../src/Three';

import { DRACOLoader } from './DRACOLoader';
import { DDSLoader } from './DDSLoader';

export interface GLTF {
	animations: AnimationClip[];
	scene: Group;
	scenes: Group[];
	cameras: Camera[];
	asset: {
		copyright?: string;
		generator?: string;
		version?: string;
		minVersion?: string;
		extensions?: any;
		extras?: any;
	};
	parser: GLTFParser;
	userData: any;
}

export class GLTFLoader extends Loader {

	constructor( manager?: LoadingManager );
	dracoLoader: DRACOLoader | null;
	ddsLoader: DDSLoader | null;
	textureLoader: TextureLoader | CanvasTextureLoader;

	load( url: string, onLoad: ( gltf: GLTF ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
	setDRACOLoader( dracoLoader: DRACOLoader ): GLTFLoader;
	setDDSLoader( ddsLoader: DDSLoader ): GLTFLoader;
	setTextureLoader( textureLoader: TextureLoader | CanvasTextureLoader ): GLTFLoader;
	parse( data: ArrayBuffer | string, path: string, onLoad: ( gltf: GLTF ) => void, onError?: ( event: ErrorEvent ) => void ) : void;

}

export class GLTFParser {

	json: any;

	getDependency: ( type: string, index: number ) => Promise<any>;
	getDependencies: ( type: string ) => Promise<any[]>;

}
