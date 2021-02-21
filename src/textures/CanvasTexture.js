import { Texture } from './Texture.js';

class CanvasTexture extends Texture {

	constructor( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.needsUpdate = true;

	}

}

CanvasTexture.prototype.isCanvasTexture = true;

export { CanvasTexture };
