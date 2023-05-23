import {
	GPUTextureAspect, GPUTextureViewDimension
} from './WebGPUConstants.js';

class WebGPUBindingUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	createBindings( bindings, pipeline ) {

		const backend = this.backend;
		const bindingsData = backend.get( bindings );

		// setup (static) binding layout and (dynamic) binding group

		const pipelineGPU = backend.get( pipeline ).pipeline;

		const bindLayoutGPU = pipelineGPU.getBindGroupLayout( 0 );
		const bindGroupGPU = this.createBindGroup( bindings, bindLayoutGPU );

		bindingsData.layout = bindLayoutGPU;
		bindingsData.group = bindGroupGPU;
		bindingsData.bindings = bindings;

	}

	updateBinding( binding ) {

		const backend = this.backend;
		const device = backend.device;

		const buffer = binding.buffer;
		const bufferGPU = backend.get( binding ).buffer;

		device.queue.writeBuffer( bufferGPU, 0, buffer, 0 );

	}

	createBindGroup( bindings, layoutGPU ) {

		const backend = this.backend;
		const device = backend.device;

		let bindingPoint = 0;
		const entriesGPU = [];

		for ( const binding of bindings ) {

			if ( binding.isUniformBuffer ) {

				const bindingData = backend.get( binding );

				if ( bindingData.buffer === undefined ) {

					const byteLength = binding.byteLength;

					const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

					const bufferGPU = device.createBuffer( {
						label: 'bindingBuffer',
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

				} else {

					dimensionViewGPU = GPUTextureViewDimension.TwoD;

				}

				let resourceGPU;

				if ( textureData.externalTexture !== undefined ) {

					resourceGPU = device.importExternalTexture( { source: textureData.externalTexture } );

				} else {

					const aspectGPU = GPUTextureAspect.All;

					resourceGPU = textureData.texture.createView( { aspect: aspectGPU, dimension: dimensionViewGPU } );

				}

				entriesGPU.push( { binding: bindingPoint, resource: resourceGPU } );

			}

			bindingPoint ++;

		}

		return device.createBindGroup( {
			layout: layoutGPU,
			entries: entriesGPU
		} );

	}

}

export default WebGPUBindingUtils;
