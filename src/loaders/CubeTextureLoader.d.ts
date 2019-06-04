import { LoadingManager } from './LoadingManager';
import { CubeTexture } from './../textures/CubeTexture';

export class CubeTextureLoader {

	constructor( manager?: LoadingManager );

	manager: LoadingManager;
	crossOrigin: string;
	path?: string;

	load(
		urls: Array<string>,
		onLoad?: ( texture: CubeTexture ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): CubeTexture;
	setCrossOrigin( crossOrigin: string ): this;
	setPath( path: string ): this;

}
