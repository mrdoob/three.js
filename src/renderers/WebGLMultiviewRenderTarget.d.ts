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

	setNumViews( numViews: number ): this;

}
