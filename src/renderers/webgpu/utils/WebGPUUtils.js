import { GPUPrimitiveTopology, GPUTextureFormat } from './WebGPUConstants.js';

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

	}

	/**
	 * Returns the depth/stencil GPU format for the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {String} The depth/stencil GPU texture format.
	 */
	getCurrentDepthStencilFormat( renderContext ) {

		let format;

		if ( renderContext.depthTexture !== null ) {

			format = this.getTextureFormatGPU( renderContext.depthTexture );

		} else if ( renderContext.depth && renderContext.stencil ) {

			format = GPUTextureFormat.Depth24PlusStencil8;

		} else if ( renderContext.depth ) {

			format = GPUTextureFormat.Depth24Plus;

		}

		return format;

	}

	/**
	 * Returns the GPU format for the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @return {String} The GPU texture format.
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

			samples = renderTarget ? renderTarget.samples : renderer.samples;

		} else if ( texture.renderTarget ) {

			samples = texture.renderTarget.samples;

		}

		samples = samples || 1;

		const isMSAA = samples > 1 && texture.renderTarget !== null && ( texture.isDepthTexture !== true && texture.isFramebufferTexture !== true );
		const primarySamples = isMSAA ? 1 : samples;

		return { samples, primarySamples, isMSAA };

	}

	/**
	 * Returns the default color attachment's GPU format of the current render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {String} The GPU texture format of the default color attachment.
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
	 * Returns the output color space of the current render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {String} The output color space.
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
	 * @return {String} The GPU primitive topology.
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
	 * That is required since WebGPU does not support arbitrary sample counts.
	 *
	 * @param {Number} sampleCount - The input sample count.
	 * @return {Number} The (potentially updated) output sample count.
	 */
	getSampleCount( sampleCount ) {

		let count = 1;

		if ( sampleCount > 1 ) {

			// WebGPU only supports power-of-two sample counts and 2 is not a valid value
			count = Math.pow( 2, Math.floor( Math.log2( sampleCount ) ) );

			if ( count === 2 ) {

				count = 4;

			}

		}

		return count;

	}

	/**
	 * Returns the sample count of the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {Number} The sample count.
	 */
	getSampleCountRenderContext( renderContext ) {

		if ( renderContext.textures !== null ) {

			return this.getSampleCount( renderContext.sampleCount );

		}

		return this.getSampleCount( this.backend.renderer.samples );

	}

	/**
	 * Returns the preferred canvas format.
	 *
	 * There is a separate method for this so it's possible to
	 * honor edge cases for specific devices.
	 *
	 * @return {String} The GPU texture format of the canvas.
	 */
	getPreferredCanvasFormat() {

		// TODO: Remove this check when Quest 34.5 is out
		// https://github.com/mrdoob/three.js/pull/29221/files#r1731833949

		if ( navigator.userAgent.includes( 'Quest' ) ) {

			return GPUTextureFormat.BGRA8Unorm;

		} else {

			return navigator.gpu.getPreferredCanvasFormat();

		}

	}

}

export default WebGPUUtils;
