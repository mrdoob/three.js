import { Texture } from './Texture.js';

class CanvasTexture extends Texture {

	constructor( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		Object.defineProperty( this, 'isCanvasTexture', { value: true } );

		this.needsUpdate = true;

	}

}

export { CanvasTexture };
