/**
 * @author fernandojsg / http://fernandojsg.com
 * @author Takahiro https://github.com/takahirox
 */

import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultiviewRenderTarget extends WebGLRenderTarget {

	constructor( width, height, numViews, options = {} ) {

		super( width, height, options );

		this.depthBuffer = false;
		this.stencilBuffer = false;

		this.numViews = numViews;

	}

	copy( source ) {

		super.copy( source );

		this.numViews = source.numViews;

		return this;

	}

}

WebGLMultiviewRenderTarget.prototype.isWebGLMultiviewRenderTarget = true;

export { WebGLMultiviewRenderTarget };
