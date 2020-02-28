import {CanvasTexture} from "../textures/CanvasTexture";
import { Texture } from '../textures/Texture';
import { ImageBitmapLoader } from "./ImageBitmapLoader";
import { Loader } from "./Loader";
import { LoadingManager } from './LoadingManager';

/**
 * Class for loading a texture based by using ImageBitmap.
 * It works well inside Web Worker.
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/loaders/ImageBitmapLoader.js">src/loaders/ImageBitmapLoader.js</a>
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/textures/CanvasTexture.js">src/textures/CanvasTexture.js</a>
 * @see <a href="https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap">ImageBitmap API</a>
 */
export class CanvasTextureLoader extends Loader {

	constructor( manager?: LoadingManager );

	options: undefined | object;

	setOptions( options: object ): ImageBitmapLoader;

	load(
		url: string,
		onLoad?: ( texture: CanvasTexture ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): Texture;

}
