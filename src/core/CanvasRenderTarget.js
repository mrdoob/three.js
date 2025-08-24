import { RenderTarget } from './RenderTarget.js';
import { REVISION } from '../constants.js';

/**
 * CanvasRenderTarget is a specialized RenderTarget for rendering to a Canvas element.
 *
 * @augments RenderTarget
 */
class CanvasRenderTarget extends RenderTarget {

	/**
	 * @param {HTMLCanvasElement|OffscreenCanvas} canvas - The canvas to use as the render target.
	 * @param {Object} [options={}] - Optional parameters for the render target.
	 */
	constructor( canvas, options = {} ) {

		super( canvas.width, canvas.height, options );

		// OffscreenCanvas does not have setAttribute, see #22811
		if ( 'setAttribute' in canvas ) canvas.setAttribute( 'data-engine', `three.js r${ REVISION } webgpu` );

		this.canvas = canvas;

		this.isCanvasRenderTarget = true;

	}

	/**
	 * Sets the size of the canvas.
	 *
	 * @param {number} width - The new width of the canvas.
	 * @param {number} height - The new height of the canvas.
	 * @returns {CanvasRenderTarget} The updated render target.
	 */
	setSize( width, height ) {

		this.canvas.width = width;
		this.canvas.height = height;

		return super.setSize( width, height );

	}

}

export { CanvasRenderTarget };
