import {
	WebGLRenderTarget,
	WebGLRenderTargetOptions,
} from './WebGLRenderTarget';

export class WebGLMultiviewRenderTarget extends WebGLRenderTarget {

	constructor(
		width: number,
		height: number,
		numViews: number,
		options?: WebGLRenderTargetOptions
	);

	readonly isWebGLMultiviewRenderTarget: true;
	setNumViews( numViews: number ): this;

}
