import { EventDispatcher } from '../../core/EventDispatcher.js';
import { Vector4 } from '../../math/Vector4.js';
import { FramebufferTexture } from '../../textures/FramebufferTexture.js';
import { DepthTexture } from '../../textures/DepthTexture.js';

/**
 * CanvasTarget is a class that represents the final output destination of the renderer.
 *
 * @augments EventDispatcher
 */
class CanvasTarget extends EventDispatcher {

	/**
	 * Constructs a new CanvasTarget.
	 *
	 * @param {HTMLCanvasElement|OffscreenCanvas} domElement - The canvas element to render to.
	 */
	constructor( domElement ) {

		super();

		/**
		 * A reference to the canvas element the renderer is drawing to.
		 * This value of this property will automatically be created by
		 * the renderer.
		 *
		 * @type {HTMLCanvasElement|OffscreenCanvas}
		 */
		this.domElement = domElement;

		/**
		 * The renderer's pixel ratio.
		 *
		 * @private
		 * @type {number}
		 * @default 1
		 */
		this._pixelRatio = 1;

		/**
		 * The width of the renderer's default framebuffer in logical pixel unit.
		 *
		 * @private
		 * @type {number}
		 */
		this._width = this.domElement.width;

		/**
		 * The height of the renderer's default framebuffer in logical pixel unit.
		 *
		 * @private
		 * @type {number}
		 */
		this._height = this.domElement.height;

		/**
		 * The viewport of the renderer in logical pixel unit.
		 *
		 * @private
		 * @type {Vector4}
		 */
		this._viewport = new Vector4( 0, 0, this._width, this._height );

		/**
		 * The scissor rectangle of the renderer in logical pixel unit.
		 *
		 * @private
		 * @type {Vector4}
		 */
		this._scissor = new Vector4( 0, 0, this._width, this._height );

		/**
		 * Whether the scissor test should be enabled or not.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._scissorTest = false;

		/**
		 * The color texture of the default framebuffer.
		 *
		 * @type {FramebufferTexture}
		 */
		this.colorTexture = new FramebufferTexture();

		/**
		 * The depth texture of the default framebuffer.
		 *
		 * @type {DepthTexture}
		 */
		this.depthTexture = new DepthTexture();

	}

	/**
	 * Returns the pixel ratio.
	 *
	 * @return {number} The pixel ratio.
	 */
	getPixelRatio() {

		return this._pixelRatio;

	}

	/**
	 * Returns the drawing buffer size in physical pixels. This method honors the pixel ratio.
	 *
	 * @param {Vector2} target - The method writes the result in this target object.
	 * @return {Vector2} The drawing buffer size.
	 */
	getDrawingBufferSize( target ) {

		return target.set( this._width * this._pixelRatio, this._height * this._pixelRatio ).floor();

	}

	/**
	 * Returns the renderer's size in logical pixels. This method does not honor the pixel ratio.
	 *
	 * @param {Vector2} target - The method writes the result in this target object.
	 * @return {Vector2} The renderer's size in logical pixels.
	 */
	getSize( target ) {

		return target.set( this._width, this._height );

	}

	/**
	 * Sets the given pixel ratio and resizes the canvas if necessary.
	 *
	 * @param {number} [value=1] - The pixel ratio.
	 */
	setPixelRatio( value = 1 ) {

		if ( this._pixelRatio === value ) return;

		this._pixelRatio = value;

		this.setSize( this._width, this._height, false );

	}

	/**
	 * This method allows to define the drawing buffer size by specifying
	 * width, height and pixel ratio all at once. The size of the drawing
	 * buffer is computed with this formula:
	 * ```js
	 * size.x = width * pixelRatio;
	 * size.y = height * pixelRatio;
	 * ```
	 *
	 * @param {number} width - The width in logical pixels.
	 * @param {number} height - The height in logical pixels.
	 * @param {number} pixelRatio - The pixel ratio.
	 */
	setDrawingBufferSize( width, height, pixelRatio ) {

		// Renderer can't be resized while presenting in XR.
		if ( this.xr && this.xr.isPresenting ) return;

		this._width = width;
		this._height = height;

		this._pixelRatio = pixelRatio;

		this.domElement.width = Math.floor( width * pixelRatio );
		this.domElement.height = Math.floor( height * pixelRatio );

		this.setViewport( 0, 0, width, height );

		this._dispatchResize();

	}

	/**
	 * Sets the size of the renderer.
	 *
	 * @param {number} width - The width in logical pixels.
	 * @param {number} height - The height in logical pixels.
	 * @param {boolean} [updateStyle=true] - Whether to update the `style` attribute of the canvas or not.
	 */
	setSize( width, height, updateStyle = true ) {

		// Renderer can't be resized while presenting in XR.
		if ( this.xr && this.xr.isPresenting ) return;

		this._width = width;
		this._height = height;

		this.domElement.width = Math.floor( width * this._pixelRatio );
		this.domElement.height = Math.floor( height * this._pixelRatio );

		if ( updateStyle === true ) {

			this.domElement.style.width = width + 'px';
			this.domElement.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

		this._dispatchResize();

	}

	/**
	 * Returns the scissor rectangle.
	 *
	 * @param {Vector4} target - The method writes the result in this target object.
	 * @return {Vector4} The scissor rectangle.
	 */
	getScissor( target ) {

		const scissor = this._scissor;

		target.x = scissor.x;
		target.y = scissor.y;
		target.width = scissor.width;
		target.height = scissor.height;

		return target;

	}

	/**
	 * Defines the scissor rectangle.
	 *
	 * @param {number | Vector4} x - The horizontal coordinate for the lower left corner of the box in logical pixel unit.
	 * Instead of passing four arguments, the method also works with a single four-dimensional vector.
	 * @param {number} y - The vertical coordinate for the lower left corner of the box in logical pixel unit.
	 * @param {number} width - The width of the scissor box in logical pixel unit.
	 * @param {number} height - The height of the scissor box in logical pixel unit.
	 */
	setScissor( x, y, width, height ) {

		const scissor = this._scissor;

		if ( x.isVector4 ) {

			scissor.copy( x );

		} else {

			scissor.set( x, y, width, height );

		}

	}

	/**
	 * Returns the scissor test value.
	 *
	 * @return {boolean} Whether the scissor test should be enabled or not.
	 */
	getScissorTest() {

		return this._scissorTest;

	}

	/**
	 * Defines the scissor test.
	 *
	 * @param {boolean} boolean - Whether the scissor test should be enabled or not.
	 */
	setScissorTest( boolean ) {

		this._scissorTest = boolean;

	}

	/**
	 * Returns the viewport definition.
	 *
	 * @param {Vector4} target - The method writes the result in this target object.
	 * @return {Vector4} The viewport definition.
	 */
	getViewport( target ) {

		return target.copy( this._viewport );

	}

	/**
	 * Defines the viewport.
	 *
	 * @param {number | Vector4} x - The horizontal coordinate for the lower left corner of the viewport origin in logical pixel unit.
	 * @param {number} y - The vertical coordinate for the lower left corner of the viewport origin  in logical pixel unit.
	 * @param {number} width - The width of the viewport in logical pixel unit.
	 * @param {number} height - The height of the viewport in logical pixel unit.
	 * @param {number} minDepth - The minimum depth value of the viewport. WebGPU only.
	 * @param {number} maxDepth - The maximum depth value of the viewport. WebGPU only.
	 */
	setViewport( x, y, width, height, minDepth = 0, maxDepth = 1 ) {

		const viewport = this._viewport;

		if ( x.isVector4 ) {

			viewport.copy( x );

		} else {

			viewport.set( x, y, width, height );

		}

		viewport.minDepth = minDepth;
		viewport.maxDepth = maxDepth;

	}

	/**
	 * Dispatches the resize event.
	 *
	 * @private
	 */
	_dispatchResize() {

		this.dispatchEvent( { type: 'resize' } );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * @fires RenderTarget#dispose
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export default CanvasTarget;
