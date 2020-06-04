import { WebGLRenderTargetOptions, WebGLRenderTarget } from './WebGLRenderTarget';
import { WebGLRenderer } from './WebGLRenderer';
import { Texture } from './../textures/Texture';

export class WebGLCubeRenderTarget extends WebGLRenderTarget {

	constructor(
		size: number,
		options?: WebGLRenderTargetOptions
	);

	fromEquirectangularTexture( renderer: WebGLRenderer, texture: Texture ): this;

}
