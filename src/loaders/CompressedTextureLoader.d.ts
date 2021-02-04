import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';
import { CompressedTexture } from './../textures/CompressedTexture';

export class CompressedTextureLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: ( texture: CompressedTexture ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): CompressedTexture;

	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<CompressedTexture>;

}
