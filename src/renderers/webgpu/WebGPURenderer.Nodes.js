import Renderer from '../common/Renderer.js';
import WebGLBackend from '../webgl-fallback/WebGLBackend.js';
import WebGPUBackend from './WebGPUBackend.js';
import BasicNodeLibrary from './nodes/BasicNodeLibrary.js';

/**
 * This alternative version of {@link WebGPURenderer} only supports node materials.
 * So classes like `MeshBasicMaterial` are not compatible.
 *
 * @augments module:Renderer~Renderer
 */
class WebGPURenderer extends Renderer {

	/**
	 * Constructs a new WebGPU renderer.
	 *
	 * @param {Object} parameters - The configuration parameter.
	 * @param {Boolean} [parameters.logarithmicDepthBuffer=false] - Whether logarithmic depth buffer is enabled or not.
	 * @param {Boolean} [parameters.alpha=true] - Whether the default framebuffer (which represents the final contents of the canvas) should be transparent or opaque.
	 * @param {Boolean} [parameters.depth=true] - Whether the default framebuffer should have a depth buffer or not.
	 * @param {Boolean} [parameters.stencil=false] - Whether the default framebuffer should have a stencil buffer or not.
	 * @param {Boolean} [parameters.antialias=false] - Whether MSAA as the default anti-aliasing should be enabled or not.
	 * @param {Number} [parameters.samples=0] - When `antialias` is `true`, `4` samples are used by default. Set this parameter to any other integer value than 0
	 * to overwrite the default.
	 * @param {Boolean} [parameters.forceWebGL=false] - If set to `true`, the renderer uses it
	 * WebGL 2 backend no matter if WebGPU is supported or not.
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
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
