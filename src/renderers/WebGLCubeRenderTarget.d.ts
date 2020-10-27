import { WebGLRenderTargetOptions, WebGLRenderTarget } from './WebGLRenderTarget';
import { WebGLRenderer } from './WebGLRenderer';
import { Texture } from './../textures/Texture';
import { CubeTexture } from './../textures/CubeTexture';

export class WebGLCubeRenderTarget extends WebGLRenderTarget {

	constructor(
		size: number,
		options?: WebGLRenderTargetOptions
	);

	texture: CubeTexture;

	fromEquirectangularTexture( renderer: WebGLRenderer, texture: Texture ): this;

}
