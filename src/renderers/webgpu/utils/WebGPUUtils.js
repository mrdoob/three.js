import { HalfFloatType, UnsignedByteType } from '../../../constants.js';
import { GPUPrimitiveTopology, GPUTextureFormat } from './WebGPUConstants.js';

const _commandList = [ null ];

/**
 * A WebGPU backend utility module with common helpers.
 *
 * @private
 */
class WebGPUUtils {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGPUBackend} backend - The WebGPU backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGPU backend.
		 *
		 * @type {WebGPUBackend}
		 */
		this.backend = backend;

		/**
		 * Caches the preferred canvas format.
		 *
		 * @private
		 * @type {?string}
		 * @default null
		 */
		this._preferredCanvasFormat = null;

	}

	/**
	 * Returns the depth/stencil GPU format for the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {string} The depth/stencil GPU texture format.
	 */
	getCurrentDepthStencilFormat( renderContext ) {

		let format;

		if ( renderContext.depth ) {

			if ( renderContext.depthTexture !== null ) {

				format = this.getTextureFormatGPU( renderContext.depthTexture );

			} else if ( renderContext.stencil ) {

				if ( this.backend.renderer.reversedDepthBuffer === true ) {

					format = GPUTextureFormat.Depth32FloatStencil8;

				} else {

					format = GPUTextureFormat.Depth24PlusStencil8;

				}

			} else {

				if ( this.backend.renderer.reversedDepthBuffer === true ) {

					format = GPUTextureFormat.Depth32Float;

				} else {

					format = GPUTextureFormat.Depth24Plus;

				}

			}

		}

		return format;

	}

	/**
	 * Returns the GPU format for the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @return {string} The GPU texture format.
	 */
	getTextureFormatGPU( texture ) {

		return this.backend.get( texture ).format;

	}

	/**
	 * Returns an object that defines the multi-sampling state of the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @return {Object} The multi-sampling state.
	 */
	getTextureSampleData( texture ) {

		let samples;

		if ( texture.isFramebufferTexture ) {

			samples = 1;

		} else if ( texture.isDepthTexture && ! texture.renderTarget ) {

			const renderer = this.backend.renderer;
			const renderTarget = renderer.getRenderTarget();

			samples = renderTarget ? renderTarget.samples : renderer.currentSamples;

		} else if ( texture.renderTarget ) {

			samples = texture.renderTarget.samples;

		}

		samples = this.getSampleCount( samples || 1 );

		const isMSAA = samples > 1 && texture.renderTarget !== null && ( texture.isDepthTexture !== true && texture.isFramebufferTexture !== true );
		const primarySamples = isMSAA ? 1 : samples;

		return { samples, primarySamples, isMSAA };

	}

	/**
	 * Returns the default color attachment's GPU format of the current render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {string} The GPU texture format of the default color attachment.
	 */
	getCurrentColorFormat( renderContext ) {

		let format;

		if ( renderContext.textures !== null ) {

			format = this.getTextureFormatGPU( renderContext.textures[ 0 ] );

		} else {

			format = this.getPreferredCanvasFormat(); // default context format

		}

		return format;

	}

	/**
	 * Returns the GPU formats of all color attachments of the current render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {Array<string>} The GPU texture formats of all color attachments.
	 */
	getCurrentColorFormats( renderContext ) {

		if ( renderContext.textures !== null ) {

			return renderContext.textures.map( t => this.getTextureFormatGPU( t ) );

		} else {

			return [ this.getPreferredCanvasFormat() ]; // default context format

		}

	}

	/**
	 * Returns the output color space of the current render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {string} The output color space.
	 */
	getCurrentColorSpace( renderContext ) {

		if ( renderContext.textures !== null ) {

			return renderContext.textures[ 0 ].colorSpace;

		}

		return this.backend.renderer.outputColorSpace;

	}

	/**
	 * Returns GPU primitive topology for the given object and material.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {Material} material - The material.
	 * @return {string} The GPU primitive topology.
	 */
	getPrimitiveTopology( object, material ) {

		if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments || ( object.isMesh && material.wireframe === true ) ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;

	}

	/**
	 * Returns a modified sample count from the given sample count value.
	 *
	 * That is required since WebGPU only supports either 1 or 4.
	 *
	 * @param {number} sampleCount - The input sample count.
	 * @return {number} The (potentially updated) output sample count.
	 */
	getSampleCount( sampleCount ) {

		return sampleCount >= 4 ? 4 : 1;

	}

	/**
	 * Returns the sample count of the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {number} The sample count.
	 */
	getSampleCountRenderContext( renderContext ) {

		if ( renderContext.textures !== null ) {

			return this.getSampleCount( renderContext.sampleCount );

		}

		return this.getSampleCount( this.backend.renderer.currentSamples );

	}

	/**
	 * Returns the preferred canvas format.
	 *
	 * There is a separate method for this so it's possible to
	 * honor edge cases for specific devices.
	 *
	 * @return {string} The GPU texture format of the canvas.
	 */
	getPreferredCanvasFormat() {

		const parameters = this.backend.parameters;

		const bufferType = parameters.outputType;

		if ( bufferType === undefined ) {

			if ( this._preferredCanvasFormat === null ) {

				this._preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

			}

			return this._preferredCanvasFormat;

		} else if ( bufferType === UnsignedByteType ) {

			return GPUTextureFormat.BGRA8Unorm;

		} else if ( bufferType === HalfFloatType ) {

			return GPUTextureFormat.RGBA16Float;

		} else {

			throw new Error( 'THREE.WebGPUUtils: Unsupported output buffer type.' );

		}

	}

}

/**
 * Submits a single GPU command to the device queue using a shared, module-scoped
 * array to avoid per-call array allocations.
 *
 * @private
 * @param {GPUDevice} device - The GPU device.
 * @param {GPUCommandBuffer} command - The command buffer to submit.
 */
export function submit( device, command ) {

	_commandList[ 0 ] = command;

	device.queue.submit( _commandList );

	_commandList[ 0 ] = null;

}

export default WebGPUUtils;
