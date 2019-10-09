import { WebGLRenderTargetOptions, WebGLRenderTarget } from './WebGLRenderTarget';
import { WebGLRenderer } from './WebGLRenderer';
import { Texture } from './../textures/Texture';

export class WebGLRenderTargetCube extends WebGLRenderTarget {

	constructor(
		width: number,
		height: number,
		options?: WebGLRenderTargetOptions
	);

	fromEquirectangularTexture( renderer: WebGLRenderer, texture: Texture ): this;

}
