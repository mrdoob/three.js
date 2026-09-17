import Renderer from '../common/Renderer.js';
import WebGPUBackend from './WebGPUBackend.js';
import BasicNodeLibrary from './nodes/BasicNodeLibrary.js';
import { warn } from '../../utils.js';

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
	 * @param {WebGPURenderer~Options} [parameters] - The configuration parameter.
	 */
	constructor( parameters = {} ) {

		const backend = new WebGPUBackend( parameters );

		parameters.getFallback = async () => {

			if ( backend.parameters.forceWebGL !== true ) warn( 'WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

			const { WebGLBackend } = await import( '../../Three.WebGPU.Fallback.js' );

			return new WebGLBackend( parameters );

		};

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
