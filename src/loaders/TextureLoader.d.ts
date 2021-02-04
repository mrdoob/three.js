import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';
import { Texture } from './../textures/Texture';

/**
 * Class for loading a texture.
 * Unlike other loaders, this one emits events instead of using predefined callbacks. So if you're interested in getting notified when things happen, you need to add listeners to the object.
 */
export class TextureLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad?: ( texture: Texture ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): Texture;

	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<Texture>;

}
