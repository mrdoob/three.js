import {
	GPUTextureAspect, GPUTextureViewDimension, GPUTextureSampleType
} from './WebGPUConstants.js';

import { FloatType, IntType, UnsignedIntType } from '../../../constants.js';

class WebGPUBindingUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	createBindingsLayout( bindGroup ) {

		const backend = this.backend;
		const device = backend.device;

		const entries = [];

		let index = 0;

		for ( const binding of bindGroup.bindings ) {

			const bindingGPU = {
				binding: index ++,
				visibility: binding.visibility
			};

			if ( binding.isUniformBuffer || binding.isStorageBuffer ) {

				const buffer = {}; // GPUBufferBindingLayout

				if ( binding.isStorageBuffer ) {

					buffer.type = binding.access;

				}

				bindingGPU.buffer = buffer;

			} else if ( binding.isSampler ) {

				const sampler = {}; // GPUSamplerBindingLayout

				if ( binding.texture.isDepthTexture ) {

					if ( binding.texture.compareFunction !== null ) {

						sampler.type = 'comparison';

					}

				}

				bindingGPU.sampler = sampler;

			} else if ( binding.isSampledTexture && binding.texture.isVideoTexture ) {

				bindingGPU.externalTexture = {}; // GPUExternalTextureBindingLayout

			} else if ( binding.isSampledTexture && binding.store ) {

				const format = this.backend.get( binding.texture ).texture.format;
				const access = binding.access;

				bindingGPU.storageTexture = { format, access }; // GPUStorageTextureBindingLayout

			} else if ( binding.isSampledTexture ) {

				const texture = {}; // GPUTextureBindingLayout

				if ( binding.texture.isMultisampleRenderTargetTexture === true ) {

					texture.multisampled = true;

				}

				if ( binding.texture.isDepthTexture ) {

					texture.sampleType = GPUTextureSampleType.Depth;

				} else if ( binding.texture.isDataTexture || binding.texture.isDataArrayTexture || binding.texture.isData3DTexture ) {

					const type = binding.texture.type;

					if ( type === IntType ) {

						texture.sampleType = GPUTextureSampleType.SInt;

					} else if ( type === UnsignedIntType ) {

						texture.sampleType = GPUTextureSampleType.UInt;

					} else if ( type === FloatType ) {

						// @TODO: Add support for this soon: backend.hasFeature( 'float32-filterable' )

						texture.sampleType = GPUTextureSampleType.UnfilterableFloat;

					}

				}

				if ( binding.isSampledCubeTexture ) {

					texture.viewDimension = GPUTextureViewDimension.Cube;

				} else if ( binding.texture.isDataArrayTexture ) {

					texture.viewDimension = GPUTextureViewDimension.TwoDArray;

				} else if ( binding.isSampledTexture3D ) {

					texture.viewDimension = GPUTextureViewDimension.ThreeD;

				}

				bindingGPU.texture = texture;

			} else {

				console.error( `WebGPUBindingUtils: Unsupported binding "${ binding }".` );

			}

			entries.push( bindingGPU );

		}

		return device.createBindGroupLayout( { entries } );

	}

	createBindings( bindGroup ) {

		const backend = this.backend;
		const bindingsData = backend.get( bindGroup );

		// setup (static) binding layout and (dynamic) binding group

		const bindLayoutGPU = this.createBindingsLayout( bindGroup );
		const bindGroupGPU = this.createBindGroup( bindGroup, bindLayoutGPU );

		bindingsData.layout = bindLayoutGPU;
		bindingsData.group = bindGroupGPU;

	}

	updateBinding( binding ) {

		const backend = this.backend;
		const device = backend.device;

		const buffer = binding.buffer;
		const bufferGPU = backend.get( binding ).buffer;

		device.queue.writeBuffer( bufferGPU, 0, buffer, 0 );

	}

	createBindGroup( bindGroup, layoutGPU ) {

		const backend = this.backend;
		const device = backend.device;

		let bindingPoint = 0;
		const entriesGPU = [];

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isUniformBuffer ) {

				const bindingData = backend.get( binding );

				if ( bindingData.buffer === undefined ) {

					const byteLength = binding.byteLength;

					const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

					const bufferGPU = device.createBuffer( {
						label: 'bindingBuffer_' + binding.name,
						size: byteLength,
						usage: usage
					} );

					bindingData.buffer = bufferGPU;

				}

				entriesGPU.push( { binding: bindingPoint, resource: { buffer: bindingData.buffer } } );

			} else if ( binding.isStorageBuffer ) {

				const bindingData = backend.get( binding );

				if ( bindingData.buffer === undefined ) {

					const attribute = binding.attribute;
					//const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | /*GPUBufferUsage.COPY_SRC |*/ GPUBufferUsage.COPY_DST;

					//backend.attributeUtils.createAttribute( attribute, usage ); // @TODO: Move it to universal renderer

					bindingData.buffer = backend.get( attribute ).buffer;

				}

				entriesGPU.push( { binding: bindingPoint, resource: { buffer: bindingData.buffer } } );

			} else if ( binding.isSampler ) {

				const textureGPU = backend.get( binding.texture );

				entriesGPU.push( { binding: bindingPoint, resource: textureGPU.sampler } );

			} else if ( binding.isSampledTexture ) {

				const textureData = backend.get( binding.texture );

				let dimensionViewGPU;

				if ( binding.isSampledCubeTexture ) {

					dimensionViewGPU = GPUTextureViewDimension.Cube;

				} else if ( binding.isSampledTexture3D ) {

					dimensionViewGPU = GPUTextureViewDimension.ThreeD;

				} else if ( binding.texture.isDataArrayTexture ) {

					dimensionViewGPU = GPUTextureViewDimension.TwoDArray;

				} else {

					dimensionViewGPU = GPUTextureViewDimension.TwoD;

				}

				let resourceGPU;

				if ( textureData.externalTexture !== undefined ) {

					resourceGPU = device.importExternalTexture( { source: textureData.externalTexture } );

				} else {

					const aspectGPU = GPUTextureAspect.All;

					resourceGPU = textureData.texture.createView( { aspect: aspectGPU, dimension: dimensionViewGPU, mipLevelCount: binding.store ? 1 : textureData.mipLevelCount } );

				}

				entriesGPU.push( { binding: bindingPoint, resource: resourceGPU } );

			}

			bindingPoint ++;

		}

		return device.createBindGroup( {
			label: 'bindGroup_' + bindGroup.name,
			layout: layoutGPU,
			entries: entriesGPU
		} );

	}

}

export default WebGPUBindingUtils;
