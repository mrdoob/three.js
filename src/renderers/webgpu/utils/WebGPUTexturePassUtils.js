import DataMap from '../../common/DataMap.js';
import { GPUFilterMode, GPULoadOp, GPUStoreOp } from './WebGPUConstants.js';

/**
 * A WebGPU backend utility module used by {@link WebGPUTextureUtils}.
 *
 * @private
 */
class WebGPUTexturePassUtils extends DataMap {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {GPUDevice} device - The WebGPU device.
	 */
	constructor( device ) {

		super();

		/**
		 * The WebGPU device.
		 *
		 * @type {GPUDevice}
		 */
		this.device = device;

		const mipmapSource = `
struct VarysStruct {
	@builtin( position ) Position: vec4f,
	@location( 0 ) vTex : vec2f,
	@location( 1 ) @interpolate(flat, either) vBaseArrayLayer: u32,
};

@group( 0 ) @binding ( 2 )
var<uniform> flipY: u32;

@vertex
fn mainVS(
		@builtin( vertex_index ) vertexIndex : u32,
		@builtin( instance_index ) instanceIndex : u32 ) -> VarysStruct {

	var Varys : VarysStruct;

	var pos = array(
		vec2f( -1, -1 ),
		vec2f( -1,  3 ),
		vec2f(  3, -1 ),
	);

	let p = pos[ vertexIndex ];
	let mult = select( vec2f( 0.5, -0.5 ), vec2f( 0.5, 0.5 ), flipY != 0 );
	Varys.vTex = p * mult + vec2f( 0.5 );
	Varys.Position = vec4f( p, 0, 1 );
	Varys.vBaseArrayLayer = instanceIndex;

	return Varys;

}

@group( 0 ) @binding( 0 )
var imgSampler : sampler;

@group( 0 ) @binding( 1 )
var img2d : texture_2d<f32>;

@fragment
fn main_2d( Varys: VarysStruct ) -> @location( 0 ) vec4<f32> {

	return textureSample( img2d, imgSampler, Varys.vTex );

}

@group( 0 ) @binding( 1 )
var img2dArray : texture_2d_array<f32>;

@fragment
fn main_2d_array( Varys: VarysStruct ) -> @location( 0 ) vec4<f32> {

	return textureSample( img2dArray, imgSampler, Varys.vTex, Varys.vBaseArrayLayer );

}

const faceMat = array(
  mat3x3f(  0,  0,  -2,  0, -2,   0,  1,  1,   1 ),   // pos-x
  mat3x3f(  0,  0,   2,  0, -2,   0, -1,  1,  -1 ),   // neg-x
  mat3x3f(  2,  0,   0,  0,  0,   2, -1,  1,  -1 ),   // pos-y
  mat3x3f(  2,  0,   0,  0,  0,  -2, -1, -1,   1 ),   // neg-y
  mat3x3f(  2,  0,   0,  0, -2,   0, -1,  1,   1 ),   // pos-z
  mat3x3f( -2,  0,   0,  0, -2,   0,  1,  1,  -1 ),   // neg-z
);

@group( 0 ) @binding( 1 )
var imgCube : texture_cube<f32>;

@fragment
fn main_cube( Varys: VarysStruct ) -> @location( 0 ) vec4<f32> {

	return textureSample( imgCube, imgSampler, faceMat[ Varys.vBaseArrayLayer ] * vec3f( fract( Varys.vTex ), 1 ) );

}
`;

		/**
		 * The mipmap GPU sampler.
		 *
		 * @type {GPUSampler}
		 */
		this.mipmapSampler = device.createSampler( { minFilter: GPUFilterMode.Linear } );

		/**
		 * The flipY GPU sampler.
		 *
		 * @type {GPUSampler}
		 */
		this.flipYSampler = device.createSampler( { minFilter: GPUFilterMode.Nearest } ); //@TODO?: Consider using textureLoad()

		/**
		 * flip uniform buffer
		 * @type {GPUBuffer}
		 */
		this.flipUniformBuffer = device.createBuffer( {
			size: 4,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		} );
		device.queue.writeBuffer( this.flipUniformBuffer, 0, new Uint32Array( [ 1 ] ) );

		/**
		 * no flip uniform buffer
		 * @type {GPUBuffer}
		 */
		this.noFlipUniformBuffer = device.createBuffer( {
			size: 4,
			usage: GPUBufferUsage.UNIFORM
		} );

		/**
		 * A cache for GPU render pipelines used for copy/transfer passes.
		 * Every texture format and textureBindingViewDimension combo requires a unique pipeline.
		 *
		 * @type {Object<string,GPURenderPipeline>}
		 */
		this.transferPipelines = {};

		/**
		 * The mipmap shader module.
		 *
		 * @type {GPUShaderModule}
		 */
		this.mipmapShaderModule = device.createShaderModule( {
			label: 'mipmap',
			code: mipmapSource
		} );

	}

	/**
	 * Returns a render pipeline for the internal copy render pass. The pass
	 * requires a unique render pipeline for each texture format.
	 *
	 * @param {string} format - The GPU texture format
	 * @param {string?} textureBindingViewDimension - The GPU texture binding view dimension
	 * @return {GPURenderPipeline} The GPU render pipeline.
	 */
	getTransferPipeline( format, textureBindingViewDimension ) {

		textureBindingViewDimension = textureBindingViewDimension || '2d-array';
		const key = `${ format }-${ textureBindingViewDimension }`;
		let pipeline = this.transferPipelines[ key ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
				label: `mipmap-${ format }-${ textureBindingViewDimension }`,
				vertex: {
					module: this.mipmapShaderModule,
				},
				fragment: {
					module: this.mipmapShaderModule,
					entryPoint: `main_${ textureBindingViewDimension.replace( '-', '_' ) }`,
					targets: [ { format } ]
				},
				layout: 'auto'
			} );

			this.transferPipelines[ key ] = pipeline;

		}

		return pipeline;

	}

	/**
	 * Flip the contents of the given GPU texture along its vertical axis.
	 *
	 * @param {GPUTexture} textureGPU - The GPU texture object.
	 * @param {Object} textureGPUDescriptor - The texture descriptor.
	 * @param {number} [baseArrayLayer=0] - The index of the first array layer accessible to the texture view.
	 */
	flipY( textureGPU, textureGPUDescriptor, baseArrayLayer = 0 ) {

		const format = textureGPUDescriptor.format;
		const { width, height } = textureGPUDescriptor.size;

		const tempTexture = this.device.createTexture( {
			size: { width, height },
			format,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
		} );

		const copyTransferPipeline = this.getTransferPipeline( format, textureGPU.textureBindingViewDimension );
		const flipTransferPipeline = this.getTransferPipeline( format, tempTexture.textureBindingViewDimension );

		const commandEncoder = this.device.createCommandEncoder( {} );

		const pass = ( pipeline, sourceTexture, sourceArrayLayer, destinationTexture, destinationArrayLayer, flipY ) => {

			const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

			const bindGroup = this.device.createBindGroup( {
				layout: bindGroupLayout,
				entries: [ {
					binding: 0,
					resource: this.flipYSampler
				}, {
					binding: 1,
					resource: sourceTexture.createView( {
						dimension: sourceTexture.textureBindingViewDimension || '2d-array',
						baseMipLevel: 0,
						mipLevelCount: 1,
					} ),
				}, {
					binding: 2,
					resource: { buffer: flipY ? this.flipUniformBuffer : this.noFlipUniformBuffer }
				} ]
			} );

			const passEncoder = commandEncoder.beginRenderPass( {
				colorAttachments: [ {
					view: destinationTexture.createView( {
						dimension: '2d',
						baseMipLevel: 0,
						mipLevelCount: 1,
						baseArrayLayer: destinationArrayLayer,
						arrayLayerCount: 1,
					} ),
					loadOp: GPULoadOp.Clear,
					storeOp: GPUStoreOp.Store,
				} ]
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 3, 1, 0, sourceArrayLayer );
			passEncoder.end();

		};

		pass( copyTransferPipeline, textureGPU, baseArrayLayer, tempTexture, 0, false );
		pass( flipTransferPipeline, tempTexture, 0, textureGPU, baseArrayLayer, true );

		this.device.queue.submit( [ commandEncoder.finish() ] );

		tempTexture.destroy();

	}

	/**
	 * Generates mipmaps for the given GPU texture.
	 *
	 * @param {GPUTexture} textureGPU - The GPU texture object.
	 * @param {?GPUCommandEncoder} [encoder=null] - An optional command encoder used to generate mipmaps.
	 */
	generateMipmaps( textureGPU, encoder = null ) {

		const textureData = this.get( textureGPU );

		const passes = textureData.layers || this._mipmapCreateBundles( textureGPU );

		const commandEncoder = encoder || this.device.createCommandEncoder( { label: 'mipmapEncoder' } );

		this._mipmapRunBundles( commandEncoder, passes );

		if ( encoder === null ) this.device.queue.submit( [ commandEncoder.finish() ] );

		textureData.layers = passes;

	}

	/**
	 * Since multiple copy render passes are required to generate mipmaps, the passes
	 * are managed as render bundles to improve performance.
	 *
	 * @param {GPUTexture} textureGPU - The GPU texture object.
	 * @return {Array<Object>} An array of render bundles.
	 */
	_mipmapCreateBundles( textureGPU ) {

		const textureBindingViewDimension = textureGPU.textureBindingViewDimension || '2d-array';
		const pipeline = this.getTransferPipeline( textureGPU.format, textureBindingViewDimension );

		const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

		const passes = [];

		for ( let baseMipLevel = 1; baseMipLevel < textureGPU.mipLevelCount; baseMipLevel ++ ) {

			for ( let baseArrayLayer = 0; baseArrayLayer < textureGPU.depthOrArrayLayers; baseArrayLayer ++ ) {

				const bindGroup = this.device.createBindGroup( {
					layout: bindGroupLayout,
					entries: [ {
						binding: 0,
						resource: this.mipmapSampler
					}, {
						binding: 1,
						resource: textureGPU.createView( {
							dimension: textureBindingViewDimension,
							baseMipLevel: baseMipLevel - 1,
							mipLevelCount: 1,
						} ),
					}, {
						binding: 2,
						resource: { buffer: this.noFlipUniformBuffer }
					} ]
				} );

				const passDescriptor = {
					colorAttachments: [ {
						view: textureGPU.createView( {
							dimension: '2d',
							baseMipLevel,
							mipLevelCount: 1,
							baseArrayLayer,
							arrayLayerCount: 1,
						} ),
						loadOp: GPULoadOp.Clear,
						storeOp: GPUStoreOp.Store,
					} ]
				};

				const passEncoder = this.device.createRenderBundleEncoder( {
					colorFormats: [ textureGPU.format ]
				} );

				passEncoder.setPipeline( pipeline );
				passEncoder.setBindGroup( 0, bindGroup );
				passEncoder.draw( 3, 1, 0, baseArrayLayer );

				passes.push( {
					renderBundles: [ passEncoder.finish() ],
					passDescriptor
				} );

			}

		}

		return passes;

	}

	/**
	 * Executes the render bundles.
	 *
	 * @param {GPUCommandEncoder} commandEncoder - The GPU command encoder.
	 * @param {Array<Object>} passes - An array of render bundles.
	 */
	_mipmapRunBundles( commandEncoder, passes ) {

		const levels = passes.length;

		for ( let i = 0; i < levels; i ++ ) {

			const pass = passes[ i ];

			const passEncoder = commandEncoder.beginRenderPass( pass.passDescriptor );

			passEncoder.executeBundles( pass.renderBundles );

			passEncoder.end();

		}

	}

}

export default WebGPUTexturePassUtils;
