import { GPUPrimitiveTopology, GPUTextureFormat } from './WebGPUConstants.js';

class WebGPUUtils {

    constructor( backend ) {

        this.backend = backend;

    }

    getCurrentDepthStencilFormat() {

        const renderer = this.backend.renderer;
		const renderTarget = renderer.getRenderTarget();

        let format;

		if ( renderTarget !== null ) {

			format = this.get( renderTarget ).depthTextureFormat;

		} else {

			format = GPUTextureFormat.Depth24PlusStencil8;

		}

		return format;

    }

    getCurrentColorFormat() {

        const renderer = this.backend.renderer;
		const renderTarget = renderer.getRenderTarget();

        let format;

		if ( renderTarget !== null ) {

			format = this.get( renderTarget ).colorTextureFormat;

		} else {

			format = GPUTextureFormat.BGRA8Unorm; // default context format

		}

		return format;

	}

    getCurrentColorSpace() {

		const renderer = this.backend.renderer;
		const renderTarget = renderer.getRenderTarget();

		if ( renderTarget !== null ) {

			return renderTarget.texture.colorSpace;

		}

		return renderer.outputColorSpace;

	}

    getPrimitiveTopology( object, material ) {

		if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments || ( object.isMesh && material.wireframe === true ) ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;

	}

    getSampleCount() {

		return this.backend.parameters.sampleCount;

	}

}

export default WebGPUUtils;
