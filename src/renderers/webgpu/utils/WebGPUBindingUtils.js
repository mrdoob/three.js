import {
	GPUTextureAspect, GPUTextureViewDimension, GPUTextureSampleType, GPUBufferBindingType, GPUStorageTextureAccess,
	GPUSamplerBindingType, GPUShaderStage
} from './WebGPUConstants.js';

import { FloatType, IntType, UnsignedIntType, Compatibility } from '../../../constants.js';
import { NodeAccess } from '../../../nodes/core/constants.js';
import { isTypedArray, error } from '../../../utils.js';
import { hashString } from '../../../nodes/core/NodeUtils.js';

/**
 * Class representing a WebGPU bind group layout.
 *
 * @private
 */
class BindGroupLayout {

	/**
	 * Constructs a new layout.
	 *
	 * @param {GPUBindGroupLayout} layoutGPU - A GPU Bind Group Layout.
	 */
	constructor( layoutGPU ) {

		/**
		 * The current GPUBindGroupLayout.
		 *
		 * @type {GPUBindGroupLayout}
		 */
		this.layoutGPU = layoutGPU;

		/**
		 * The number of bind groups that use this layout.
		 *
		 * @type {number}
		 */
		this.usedTimes = 0;

	}

}

/**
 * A WebGPU backend utility module for managing bindings.
 *
 * When reading the documentation it's helpful to keep in mind that
 * all class definitions starting with 'GPU*' are modules from the
 * WebGPU API. So for example `BindGroup` is a class from the engine
 * whereas `GPUBindGroup` is a class from WebGPU.
 *
 * @private
 */
class WebGPUBindingUtils {

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
		 * A cache that maps combinations of layout entries to existing bind group layouts.
		 *
		 * @private
		 * @type {Map<string, BindGroupLayout>}
		 */
		this._bindGroupLayoutCache = new Map();

	}

	/**
	 * Creates a GPU bind group layout for the given bind group.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 * @return {GPUBindGroupLayout} The GPU bind group layout.
	 */
	createBindingsLayout( bindGroup ) {

		const backend = this.backend;
		const device = backend.device;

		const bindingsData = backend.get( bindGroup );

		// check if the the bind group already has a layout

		if ( bindingsData.layout ) {

			return bindingsData.layout.layoutGPU;

		}

		// if not, assing one

		const entries = this._createLayoutEntries( bindGroup );
		const bindGroupLayoutKey = hashString( JSON.stringify( entries ) );

		// try to find an existing layout in the cache

		let bindGroupLayout = this._bindGroupLayoutCache.get( bindGroupLayoutKey );

		// if not create a new one

		if ( bindGroupLayout === undefined ) {

			bindGroupLayout = new BindGroupLayout( device.createBindGroupLayout( { entries } ) );
			this._bindGroupLayoutCache.set( bindGroupLayoutKey, bindGroupLayout );

		}

		bindGroupLayout.usedTimes ++;

		bindingsData.layout = bindGroupLayout;
		bindingsData.layoutKey = bindGroupLayoutKey;

		return bindGroupLayout.layoutGPU;

	}

	/**
	 * Creates bindings from the given bind group definition.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {Array<BindGroup>} bindings - Array of bind groups.
	 * @param {number} cacheIndex - The cache index.
	 * @param {number} version - The version.
	 */
	createBindings( bindGroup, bindings, cacheIndex, version = 0 ) {

		const { backend } = this;
		const bindingsData = backend.get( bindGroup );

		// setup (static) binding layout and (dynamic) binding group

		const bindLayoutGPU = this.createBindingsLayout( bindGroup );

		let bindGroupGPU;

		if ( cacheIndex > 0 ) {

			if ( bindingsData.groups === undefined ) {

				bindingsData.groups = [];
				bindingsData.versions = [];

			}

			if ( bindingsData.versions[ cacheIndex ] === version ) {

				bindGroupGPU = bindingsData.groups[ cacheIndex ];

			}

		}

		if ( bindGroupGPU === undefined ) {

			bindGroupGPU = this.createBindGroup( bindGroup, bindLayoutGPU );

			if ( cacheIndex > 0 ) {

				bindingsData.groups[ cacheIndex ] = bindGroupGPU;
				bindingsData.versions[ cacheIndex ] = version;

			}

		}

		bindingsData.group = bindGroupGPU;

	}

	/**
	 * Updates a buffer binding.
	 *
	 *  @param {Buffer} binding - The buffer binding to update.
	 */
	updateBinding( binding ) {

		const backend = this.backend;
		const device = backend.device;

		const array = binding.buffer; // cpu
		const buffer = backend.get( binding ).buffer; // gpu

		const updateRanges = binding.updateRanges;

		if ( updateRanges.length === 0 ) {

			device.queue.writeBuffer(
				buffer,
				0,
				array,
				0
			);

		} else {

			const isTyped = isTypedArray( array );
			const byteOffsetFactor = isTyped ? 1 : array.BYTES_PER_ELEMENT;

			for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

				const range = updateRanges[ i ];

				const dataOffset = range.start * byteOffsetFactor;
				const size = range.count * byteOffsetFactor;

				const bufferOffset = dataOffset * ( isTyped ? array.BYTES_PER_ELEMENT : 1 ); // bufferOffset is always in bytes

				device.queue.writeBuffer(
					buffer,
					bufferOffset,
					array,
					dataOffset,
					size
				);

			}

		}

	}

	/**
	 * Creates a GPU bind group for the camera index.
	 *
	 * @param {Uint32Array} data - The index data.
	 * @param {GPUBindGroupLayout} layoutGPU - The GPU bind group layout.
	 * @return {GPUBindGroup} The GPU bind group.
	 */
	createBindGroupIndex( data, layoutGPU ) {

		const backend = this.backend;
		const device = backend.device;

		const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
		const index = data[ 0 ];

		const buffer = device.createBuffer( {
			label: 'bindingCameraIndex_' + index,
			size: 16, // uint(4) * 4
			usage: usage
		} );

		device.queue.writeBuffer( buffer, 0, data, 0 );

		const entries = [ { binding: 0, resource: { buffer } } ];

		return device.createBindGroup( {
			label: 'bindGroupCameraIndex_' + index,
			layout: layoutGPU,
			entries
		} );

	}

	/**
	 * Creates a GPU bind group for the given bind group and GPU layout.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {GPUBindGroupLayout} layoutGPU - The GPU bind group layout.
	 * @return {GPUBindGroup} The GPU bind group.
	 */
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

					const visibilities = [];
					if ( binding.visibility & GPUShaderStage.VERTEX ) {

						visibilities.push( 'vertex' );

					}

					if ( binding.visibility & GPUShaderStage.FRAGMENT ) {

						visibilities.push( 'fragment' );

					}

					if ( binding.visibility & GPUShaderStage.COMPUTE ) {

						visibilities.push( 'compute' );

					}

					const bufferVisibility = `(${visibilities.join( ',' )})`;

					const bufferGPU = device.createBuffer( {
						label: `bindingBuffer${binding.id}_${binding.name}_${bufferVisibility}`,
						size: byteLength,
						usage: usage
					} );

					bindingData.buffer = bufferGPU;

				}

				entriesGPU.push( { binding: bindingPoint, resource: { buffer: bindingData.buffer } } );

			} else if ( binding.isStorageBuffer ) {

				const buffer = backend.get( binding.attribute ).buffer;

				entriesGPU.push( { binding: bindingPoint, resource: { buffer: buffer } } );

			} else if ( binding.isSampledTexture ) {

				const textureData = backend.get( binding.texture );

				let resourceGPU;

				if ( textureData.externalTexture !== undefined ) {

					resourceGPU = device.importExternalTexture( { source: textureData.externalTexture } );

				} else {

					const mipLevelCount = binding.store ? 1 : textureData.texture.mipLevelCount;
					const baseMipLevel = binding.store ? binding.mipLevel : 0;
					let propertyName = `view-${ textureData.texture.width }-${ textureData.texture.height }`;

					if ( textureData.texture.depthOrArrayLayers > 1 ) {

						propertyName += `-${ textureData.texture.depthOrArrayLayers }`;

					}

					propertyName += `-${ mipLevelCount }-${ baseMipLevel }`;

					resourceGPU = textureData[ propertyName ];

					if ( resourceGPU === undefined ) {

						const aspectGPU = GPUTextureAspect.All;

						let dimensionViewGPU;

						if ( binding.isSampledCubeTexture ) {

							dimensionViewGPU = GPUTextureViewDimension.Cube;

						} else if ( binding.isSampledTexture3D ) {

							dimensionViewGPU = GPUTextureViewDimension.ThreeD;

						} else if ( binding.texture.isArrayTexture || binding.texture.isDataArrayTexture || binding.texture.isCompressedArrayTexture ) {

							dimensionViewGPU = GPUTextureViewDimension.TwoDArray;

						} else {

							dimensionViewGPU = GPUTextureViewDimension.TwoD;

						}

						resourceGPU = textureData[ propertyName ] = textureData.texture.createView( { aspect: aspectGPU, dimension: dimensionViewGPU, mipLevelCount, baseMipLevel } );

					}

				}

				entriesGPU.push( { binding: bindingPoint, resource: resourceGPU } );

			} else if ( binding.isSampler ) {

				const textureGPU = backend.get( binding.texture );

				entriesGPU.push( { binding: bindingPoint, resource: textureGPU.sampler } );

			}

			bindingPoint ++;

		}

		return device.createBindGroup( {
			label: 'bindGroup_' + bindGroup.name,
			layout: layoutGPU,
			entries: entriesGPU
		} );

	}

	/**
	 * Creates a GPU bind group layout entries for the given bind group.
	 *
	 * @private
	 * @param {BindGroup} bindGroup - The bind group.
	 * @return {Array<GPUBindGroupLayoutEntry>} The GPU bind group layout entries.
	 */
	_createLayoutEntries( bindGroup ) {

		const entries = [];
		let index = 0;

		for ( const binding of bindGroup.bindings ) {

			const backend = this.backend;

			const bindingGPU = {
				binding: index,
				visibility: binding.visibility
			};

			if ( binding.isUniformBuffer || binding.isStorageBuffer ) {

				const buffer = {}; // GPUBufferBindingLayout

				if ( binding.isStorageBuffer ) {

					if ( binding.visibility & GPUShaderStage.COMPUTE ) {

						// compute

						if ( binding.access === NodeAccess.READ_WRITE || binding.access === NodeAccess.WRITE_ONLY ) {

							buffer.type = GPUBufferBindingType.Storage;

						} else {

							buffer.type = GPUBufferBindingType.ReadOnlyStorage;

						}

					} else {

						buffer.type = GPUBufferBindingType.ReadOnlyStorage;

					}

				}

				bindingGPU.buffer = buffer;

			} else if ( binding.isSampledTexture && binding.store ) {

				const storageTexture = {}; // GPUStorageTextureBindingLayout
				storageTexture.format = this.backend.get( binding.texture ).texture.format;

				const access = binding.access;

				if ( access === NodeAccess.READ_WRITE ) {

					storageTexture.access = GPUStorageTextureAccess.ReadWrite;

				} else if ( access === NodeAccess.WRITE_ONLY ) {

					storageTexture.access = GPUStorageTextureAccess.WriteOnly;

				} else {

					storageTexture.access = GPUStorageTextureAccess.ReadOnly;

				}

				if ( binding.texture.isArrayTexture ) {

					storageTexture.viewDimension = GPUTextureViewDimension.TwoDArray;

				} else if ( binding.texture.is3DTexture ) {

					storageTexture.viewDimension = GPUTextureViewDimension.ThreeD;

				}

				bindingGPU.storageTexture = storageTexture;

			} else if ( binding.isSampledTexture ) {

				const texture = {}; // GPUTextureBindingLayout

				const { primarySamples } = backend.utils.getTextureSampleData( binding.texture );

				if ( primarySamples > 1 ) {

					texture.multisampled = true;

					if ( ! binding.texture.isDepthTexture ) {

						texture.sampleType = GPUTextureSampleType.UnfilterableFloat;

					}

				}

				if ( binding.texture.isDepthTexture ) {

					if ( backend.compatibilityMode && binding.texture.compareFunction === null ) {

						texture.sampleType = GPUTextureSampleType.UnfilterableFloat;

					} else {

						texture.sampleType = GPUTextureSampleType.Depth;

					}

				} else if ( binding.texture.isDataTexture || binding.texture.isDataArrayTexture || binding.texture.isData3DTexture ) {

					const type = binding.texture.type;

					if ( type === IntType ) {

						texture.sampleType = GPUTextureSampleType.SInt;

					} else if ( type === UnsignedIntType ) {

						texture.sampleType = GPUTextureSampleType.UInt;

					} else if ( type === FloatType ) {

						if ( this.backend.hasFeature( 'float32-filterable' ) ) {

							texture.sampleType = GPUTextureSampleType.Float;

						} else {

							texture.sampleType = GPUTextureSampleType.UnfilterableFloat;

						}

					}

				}

				if ( binding.isSampledCubeTexture ) {

					texture.viewDimension = GPUTextureViewDimension.Cube;

				} else if ( binding.texture.isArrayTexture || binding.texture.isDataArrayTexture || binding.texture.isCompressedArrayTexture ) {

					texture.viewDimension = GPUTextureViewDimension.TwoDArray;

				} else if ( binding.isSampledTexture3D ) {

					texture.viewDimension = GPUTextureViewDimension.ThreeD;

				}

				bindingGPU.texture = texture;

			} else if ( binding.isSampler ) {

				const sampler = {}; // GPUSamplerBindingLayout

				if ( binding.texture.isDepthTexture ) {

					if ( binding.texture.compareFunction !== null && backend.hasCompatibility( Compatibility.TEXTURE_COMPARE ) ) {

						sampler.type = GPUSamplerBindingType.Comparison;

					} else {

						// Depth textures without compare must use non-filtering sampler
						sampler.type = GPUSamplerBindingType.NonFiltering;

					}

				}

				bindingGPU.sampler = sampler;

			} else {

				error( `WebGPUBindingUtils: Unsupported binding "${ binding }".` );

			}

			entries.push( bindingGPU );
			index ++;

		}

		return entries;

	}

	/**
	 * Delete the data associated with a bind group.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 */
	deleteBindGroupData( bindGroup ) {

		const { backend } = this;

		const bindingsData = backend.get( bindGroup );

		if ( bindingsData.layout ) {

			bindingsData.layout.usedTimes --;

			if ( bindingsData.layout.usedTimes === 0 ) {

				this._bindGroupLayoutCache.delete( bindingsData.layoutKey );

			}

			bindingsData.layout = undefined;
			bindingsData.layoutKey = undefined;

		}

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this._bindGroupLayoutCache.clear();

	}

}

export default WebGPUBindingUtils;
