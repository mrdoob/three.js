import { GPUPrimitiveTopology, GPUTextureFormat } from './WebGPUConstants.js';

class WebGPUUtils {

	constructor( backend ) {

		this.backend = backend;

	}

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

	getTextureFormatGPU( texture ) {

		return this.backend.get( texture ).texture.format;

	}

	getCurrentColorFormat( renderContext ) {

		let format;

		if ( renderContext.texture !== null ) {

			format = this.getTextureFormatGPU( renderContext.texture );

		} else {

			format = GPUTextureFormat.BGRA8Unorm; // default context format

		}

		return format;

	}

	getCurrentColorSpace( renderContext ) {

		if ( renderContext.texture !== null ) {

			return renderContext.texture.colorSpace;

		}

		return this.backend.renderer.outputColorSpace;

	}

	getPrimitiveTopology( object, material ) {

		if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments || ( object.isMesh && material.wireframe === true ) ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;

	}

	getSampleCount( renderContext ) {

		if ( renderContext.texture !== null ) {

			return renderContext.sampleCount;

		}

		return this.backend.parameters.sampleCount;

	}

}

export default WebGPUUtils;
