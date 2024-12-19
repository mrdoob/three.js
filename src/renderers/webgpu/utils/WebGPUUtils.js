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

		return this.backend.get( texture ).format;

	}

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

	getCurrentColorFormat( renderContext ) {

		let format;

		if ( renderContext.textures !== null ) {

			format = this.getTextureFormatGPU( renderContext.textures[ 0 ] );

		} else {

			format = this.getPreferredCanvasFormat(); // default context format

		}

		return format;

	}

	getCurrentColorSpace( renderContext ) {

		if ( renderContext.textures !== null ) {

			return renderContext.textures[ 0 ].colorSpace;

		}

		return this.backend.renderer.outputColorSpace;

	}

	getPrimitiveTopology( object, material ) {

		if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments || ( object.isMesh && material.wireframe === true ) ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;

	}

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

	getSampleCountRenderContext( renderContext ) {

		if ( renderContext.textures !== null ) {

			return this.getSampleCount( renderContext.sampleCount );

		}

		return this.getSampleCount( this.backend.renderer.samples );

	}

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
