import { GPUPrimitiveTopology, GPUTextureFormat } from './constants.js';

class WebGPUUtils {

	constructor( renderer ) {

		this.renderer = renderer;

	}

	getCurrentColorSpace() {

		const renderer = this.renderer;

		const renderTarget = renderer.getRenderTarget();

		if ( renderTarget !== null ) {

			return renderTarget.texture.colorSpace;

		}

		return renderer.outputColorSpace;

	}

	getCurrentColorFormat() {

		let format;

		const renderer = this.renderer;
		const renderTarget = renderer.getRenderTarget();

		if ( renderTarget !== null ) {

			const renderTargetProperties = renderer._properties.get( renderTarget );
			format = renderTargetProperties.colorTextureFormat;

		} else {

			format = GPUTextureFormat.BGRA8Unorm; // default context format

		}

		return format;

	}

	getCurrentDepthStencilFormat() {

		let format;

		const renderer = this.renderer;
		const renderTarget = renderer.getRenderTarget();

		if ( renderTarget !== null ) {

			const renderTargetProperties = renderer._properties.get( renderTarget );
			format = renderTargetProperties.depthTextureFormat;

		} else {

			format = GPUTextureFormat.Depth24PlusStencil8;

		}

		return format;

	}

	getPrimitiveTopology( object, material ) {

		if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments || ( object.isMesh && material.wireframe === true ) ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;

	}

	getSampleCount() {

		return this.renderer._parameters.sampleCount;

	}

}

export default WebGPUUtils;
