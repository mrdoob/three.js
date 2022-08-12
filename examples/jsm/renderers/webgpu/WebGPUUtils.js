import { GPUPrimitiveTopology, GPUTextureFormat } from './constants.js';

class WebGPUUtils {

	constructor( renderer ) {

		this.renderer = renderer;

	}

	getCurrentEncoding() {

		const renderer = this.renderer;

		const renderTarget = renderer.getRenderTarget();
		return ( renderTarget !== null ) ? renderTarget.texture.encoding : renderer.outputEncoding;

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

	getPrimitiveTopology( object ) {

		if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;
		else if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;

	}

	getSampleCount() {

		return this.renderer._parameters.sampleCount;

	}

}

export default WebGPUUtils;
