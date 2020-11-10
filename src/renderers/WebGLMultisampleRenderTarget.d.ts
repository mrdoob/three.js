import {
	WebGLRenderTarget,
	WebGLRenderTargetOptions,
} from './WebGLRenderTarget';

export class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor(
		width: number,
		height: number,
		options?: WebGLRenderTargetOptions
	);

	readonly isWebGLMultisampleRenderTarget: true;

	/**
	 * Specifies the number of samples to be used for the renderbuffer storage.However, the maximum supported size for multisampling is platform dependent and defined via gl.MAX_SAMPLES.
	 * @default 4
	 */
	samples: number;

}
