import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';
import { EquirectangularTexture } from './../textures/EquirectangularTexture';

export class EquirectangularTextureLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		urls: Array<string>,
		onLoad?: ( texture: EquirectangularTexture ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): EquirectangularTexture;

}
