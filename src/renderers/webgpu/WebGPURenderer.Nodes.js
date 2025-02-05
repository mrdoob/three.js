import Renderer from '../common/Renderer.js';
import WebGLBackend from '../webgl-fallback/WebGLBackend.js';
import WebGPUBackend from './WebGPUBackend.js';
import BasicNodeLibrary from './nodes/BasicNodeLibrary.js';

/**
 * This alternative version of {@link WebGPURenderer} only supports node materials.
 * So classes like `MeshBasicMaterial` are not compatible.
 *
 * @private
 * @augments Renderer
 */
class WebGPURenderer extends Renderer {

	/**
	 * Constructs a new WebGPU renderer.
	 *
	 * @param {Object} parameters - The configuration parameter.
	 * @param {boolean} [parameters.logarithmicDepthBuffer=false] - Whether logarithmic depth buffer is enabled or not.
	 * @param {boolean} [parameters.alpha=true] - Whether the default framebuffer (which represents the final contents of the canvas) should be transparent or opaque.
	 * @param {boolean} [parameters.depth=true] - Whether the default framebuffer should have a depth buffer or not.
	 * @param {boolean} [parameters.stencil=false] - Whether the default framebuffer should have a stencil buffer or not.
	 * @param {boolean} [parameters.antialias=false] - Whether MSAA as the default anti-aliasing should be enabled or not.
	 * @param {number} [parameters.samples=0] - When `antialias` is `true`, `4` samples are used by default. Set this parameter to any other integer value than 0 to overwrite the default.
	 * @param {boolean} [parameters.forceWebGL=false] - If set to `true`, the renderer uses it WebGL 2 backend no matter if WebGPU is supported or not.
	 * @param {number} [parameters.outputType=undefined] - Texture type for output to canvas. By default, device's preferred format is used; other formats may incur overhead.
	 * @param {number} [parameters.colorBufferType=HalfFloatType] - Defines the type of color buffers. The default `HalfFloatType` is recommend for best
	 * quality. To save memory and bandwidth, `UnsignedByteType` might be used. This will reduce rendering quality though.
	 */
	constructor( parameters = {} ) {

		let BackendClass;

		if ( parameters.forceWebGL ) {

			BackendClass = WebGLBackend;

		} else {

			BackendClass = WebGPUBackend;

			parameters.getFallback = () => {

				console.warn( 'THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

				return new WebGLBackend( parameters );

			};

		}

		const backend = new BackendClass( parameters );

		super( backend, parameters );

		/**
		 * The generic default value is overwritten with the
		 * standard node library for type mapping. Material
		 * mapping is not supported with this version.
		 *
		 * @type {BasicNodeLibrary}
		 */
		this.library = new BasicNodeLibrary();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
