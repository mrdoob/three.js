import Renderer from '../common/Renderer.js';
import WebGLBackend from '../webgl-fallback/WebGLBackend.js';
import WebGPUBackend from './WebGPUBackend.js';
import StandardNodeLibrary from './nodes/StandardNodeLibrary.js';
import { warn } from '../../utils.js';
/*
const debugHandler = {

	get: function ( target, name ) {

		// Add |update
		if ( /^(create|destroy)/.test( name ) ) log( 'WebGPUBackend.' + name );

		return target[ name ];

	}

};
*/

/**
 * This renderer is the new alternative of `WebGLRenderer`. `WebGPURenderer` has the ability
 * to target different backends. By default, the renderer tries to use a WebGPU backend if the
 * browser supports WebGPU. If not, `WebGPURenderer` falls backs to a WebGL 2 backend.
 *
 * The renderer initializes asynchronously: call `await renderer.init()` before using
 * `render()`, or define the animation loop with `setAnimationLoop()` which waits for
 * the initialization.
 *
 * @augments Renderer
 */
class WebGPURenderer extends Renderer {

	/**
	 * WebGPURenderer options.
	 *
	 * @typedef {Object} WebGPURenderer~Options
	 * @property {boolean} [logarithmicDepthBuffer=false] - Whether logarithmic depth buffer is enabled or not. Ignored when a reversed depth buffer is in use.
	 * @property {boolean} [reversedDepthBuffer=false] - Whether reversed depth buffer is enabled or not. The WebGL 2 backend requires
	 * `EXT_clip_control` and otherwise uses a regular depth buffer.
	 * @property {boolean} [alpha=true] - Whether the default framebuffer (which represents the final contents of the canvas) should be transparent or opaque.
	 * @property {boolean} [depth=true] - Whether the default framebuffer should have a depth buffer or not.
	 * @property {boolean} [stencil=false] - Whether the default framebuffer should have a stencil buffer or not.
	 * @property {boolean} [antialias=false] - Whether MSAA as the default anti-aliasing should be enabled or not. MSAA is disabled on devices
	 * running in WebGPU compatibility mode.
	 * @property {number} [samples=0] - The number of MSAA samples. When `antialias` is `true`, `4` samples are used by default. A value other than `0`
	 * overwrites the default and enables MSAA even without `antialias`. The WebGPU backend only supports `4` samples (higher values are
	 * clamped to `4`).
	 * @property {boolean} [forceWebGL=false] - If set to `true`, the renderer uses a WebGL 2 backend no matter if WebGPU is supported or not.
	 * @property {boolean} [multiview=false] - If set to `true`, the renderer will use multiview during WebXR rendering if `OVR_multiview2` and WebXR layers are supported.
	 * WebGL 2 backend only.
	 * @property {HTMLCanvasElement|OffscreenCanvas} [canvas] - The canvas the renderer draws its output to. If not provided, a new canvas is created.
	 * @property {GPUCanvasContext|WebGL2RenderingContext} [context] - An existing rendering context of `canvas`. It must match the backend in use:
	 * a `GPUCanvasContext` for WebGPU or a `WebGL2RenderingContext` for WebGL 2.
	 * @property {string} [powerPreference] - A hint for the GPU adapter selection, either `'low-power'` or `'high-performance'`. WebGPU backend only.
	 * @property {Object} [requiredLimits={}] - The device limits to request. If the adapter cannot provide them, the WebGPU initialization fails
	 * and the renderer falls back to the WebGL 2 backend.
	 * @property {GPUDevice} [device] - An existing GPU device to use instead of requesting a new one. `powerPreference` and `requiredLimits`
	 * are ignored in this case, and the device is not destroyed when the renderer is disposed.
	 * @property {number} [outputType=undefined] - Texture type for output to canvas. Either `UnsignedByteType` or `HalfFloatType` (extended range,
	 * for HDR displays); other types are not supported. By default, device's preferred format is used; other formats may incur overhead.
	 * WebGPU backend only.
	 * @property {number} [outputBufferType=HalfFloatType] - Defines the type of output buffers. The default `HalfFloatType` is recommend for best
	 * quality. To save memory and bandwidth, `UnsignedByteType` might be used. This will reduce rendering quality though.
	 */

	/**
	 * Constructs a new WebGPU renderer.
	 *
	 * @param {WebGPURenderer~Options} [parameters] - The configuration parameter.
	 */
	constructor( parameters = {} ) {

		let BackendClass;

		if ( parameters.forceWebGL ) {

			BackendClass = WebGLBackend;

		} else {

			BackendClass = WebGPUBackend;

			parameters.getFallback = () => {

				warn( 'WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

				return new WebGLBackend( parameters );

			};

		}

		const backend = new BackendClass( parameters );

		//super( new Proxy( backend, debugHandler ) );
		super( backend, parameters );

		/**
		 * The generic default value is overwritten with the
		 * standard node library for type mapping.
		 *
		 * @type {StandardNodeLibrary}
		 */
		this.library = new StandardNodeLibrary();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGPURenderer = true;

		if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

			__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) );

		}

	}

}

export default WebGPURenderer;
