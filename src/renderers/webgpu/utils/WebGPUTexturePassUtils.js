import DataMap from '../../common/DataMap.js';
import { GPUFilterMode, GPULoadOp, GPUStoreOp } from './WebGPUConstants.js';
import { submit } from './WebGPUUtils.js';
import GPUBindGroupDescriptor from '../descriptors/GPUBindGroupDescriptor.js';
import GPUBufferDescriptor from '../descriptors/GPUBufferDescriptor.js';
import GPUCommandEncoderDescriptor from '../descriptors/GPUCommandEncoderDescriptor.js';
import GPURenderBundleEncoderDescriptor from '../descriptors/GPURenderBundleEncoderDescriptor.js';
import GPURenderPassColorAttachment from '../descriptors/GPURenderPassColorAttachment.js';
import GPURenderPassDescriptor from '../descriptors/GPURenderPassDescriptor.js';
import GPURenderPipelineDescriptor from '../descriptors/GPURenderPipelineDescriptor.js';
import GPUShaderModuleDescriptor from '../descriptors/GPUShaderModuleDescriptor.js';
import GPUTextureDescriptor from '../descriptors/GPUTextureDescriptor.js';
import GPUTextureViewDescriptor from '../descriptors/GPUTextureViewDescriptor.js';

const _bindGroupDescriptor = new GPUBindGroupDescriptor();
const _bufferDescriptor = new GPUBufferDescriptor();
const _commandEncoderDescriptor = new GPUCommandEncoderDescriptor();
const _renderBundleEncoderDescriptor = new GPURenderBundleEncoderDescriptor();
const _renderPassDescriptor = new GPURenderPassDescriptor();
const _renderPipelineDescriptor = new GPURenderPipelineDescriptor();
const _colorAttachment = new GPURenderPassColorAttachment();
const _shaderModuleDescriptor = new GPUShaderModuleDescriptor();
const _textureDescriptor = new GPUTextureDescriptor();
const _viewDescriptor = new GPUTextureViewDescriptor();

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
		_bufferDescriptor.size = 4;
		_bufferDescriptor.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

		this.flipUniformBuffer = device.createBuffer( _bufferDescriptor );

		_bufferDescriptor.reset();

		device.queue.writeBuffer( this.flipUniformBuffer, 0, new Uint32Array( [ 1 ] ) );

		/**
		 * no flip uniform buffer
		 * @type {GPUBuffer}
		 */
		_bufferDescriptor.size = 4;
		_bufferDescriptor.usage = GPUBufferUsage.UNIFORM;

		this.noFlipUniformBuffer = device.createBuffer( _bufferDescriptor );

		_bufferDescriptor.reset();

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
		_shaderModuleDescriptor.label = 'mipmap';
		_shaderModuleDescriptor.code = mipmapSource;

		this.mipmapShaderModule = device.createShaderModule( _shaderModuleDescriptor );

		_shaderModuleDescriptor.reset();

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

			_renderPipelineDescriptor.label = `mipmap-${ format }-${ textureBindingViewDimension }`;
			_renderPipelineDescriptor.vertex = { module: this.mipmapShaderModule };
			_renderPipelineDescriptor.fragment = {
				module: this.mipmapShaderModule,
				entryPoint: `main_${ textureBindingViewDimension.replace( '-', '_' ) }`,
				targets: [ { format } ]
			};
			_renderPipelineDescriptor.layout = 'auto';

			pipeline = this.device.createRenderPipeline( _renderPipelineDescriptor );

			_renderPipelineDescriptor.reset();

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

		_textureDescriptor.size.width = width;
		_textureDescriptor.size.height = height;
		_textureDescriptor.format = format;
		_textureDescriptor.usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING;

		const tempTexture = this.device.createTexture( _textureDescriptor );

		_textureDescriptor.reset();

		const copyTransferPipeline = this.getTransferPipeline( format, textureGPU.textureBindingViewDimension );
		const flipTransferPipeline = this.getTransferPipeline( format, tempTexture.textureBindingViewDimension );

		const commandEncoder = this.device.createCommandEncoder( _commandEncoderDescriptor );

		const pass = ( pipeline, sourceTexture, sourceArrayLayer, destinationTexture, destinationArrayLayer, flipY ) => {

			const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

			_viewDescriptor.dimension = sourceTexture.textureBindingViewDimension || '2d-array';
			_viewDescriptor.mipLevelCount = 1;

			const sourceView = sourceTexture.createView( _viewDescriptor );

			_viewDescriptor.reset();

			_bindGroupDescriptor.layout = bindGroupLayout;
			_bindGroupDescriptor.entries.push( {
				binding: 0,
				resource: this.flipYSampler
			}, {
				binding: 1,
				resource: sourceView,
			}, {
				binding: 2,
				resource: { buffer: flipY ? this.flipUniformBuffer : this.noFlipUniformBuffer }
			} );

			const bindGroup = this.device.createBindGroup( _bindGroupDescriptor );

			_bindGroupDescriptor.reset();

			_viewDescriptor.dimension = '2d';
			_viewDescriptor.mipLevelCount = 1;
			_viewDescriptor.baseArrayLayer = destinationArrayLayer;
			_viewDescriptor.arrayLayerCount = 1;

			const destinationView = destinationTexture.createView( _viewDescriptor );

			_viewDescriptor.reset();

			_colorAttachment.view = destinationView;
			_colorAttachment.loadOp = GPULoadOp.Clear;
			_colorAttachment.storeOp = GPUStoreOp.Store;

			_renderPassDescriptor.colorAttachments.push( _colorAttachment );

			const passEncoder = commandEncoder.beginRenderPass( _renderPassDescriptor );

			_renderPassDescriptor.reset();
			_colorAttachment.reset();

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 3, 1, 0, sourceArrayLayer );
			passEncoder.end();

		};

		pass( copyTransferPipeline, textureGPU, baseArrayLayer, tempTexture, 0, false );
		pass( flipTransferPipeline, tempTexture, 0, textureGPU, baseArrayLayer, true );

		submit( this.device, commandEncoder.finish() );

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

		let commandEncoder = encoder;

		if ( commandEncoder === null ) {

			_commandEncoderDescriptor.label = 'mipmapEncoder';
			commandEncoder = this.device.createCommandEncoder( _commandEncoderDescriptor );
			_commandEncoderDescriptor.reset();

		}

		this._mipmapRunBundles( commandEncoder, passes );

		if ( encoder === null ) submit( this.device, commandEncoder.finish() );

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

				_viewDescriptor.dimension = textureBindingViewDimension;
				_viewDescriptor.baseMipLevel = baseMipLevel - 1;
				_viewDescriptor.mipLevelCount = 1;

				const sourceView = textureGPU.createView( _viewDescriptor );

				_viewDescriptor.reset();

				_bindGroupDescriptor.layout = bindGroupLayout;
				_bindGroupDescriptor.entries.push( {
					binding: 0,
					resource: this.mipmapSampler
				}, {
					binding: 1,
					resource: sourceView,
				}, {
					binding: 2,
					resource: { buffer: this.noFlipUniformBuffer }
				} );

				const bindGroup = this.device.createBindGroup( _bindGroupDescriptor );

				_bindGroupDescriptor.reset();

				_viewDescriptor.dimension = '2d';
				_viewDescriptor.baseMipLevel = baseMipLevel;
				_viewDescriptor.mipLevelCount = 1;
				_viewDescriptor.baseArrayLayer = baseArrayLayer;
				_viewDescriptor.arrayLayerCount = 1;

				const destinationView = textureGPU.createView( _viewDescriptor );

				_viewDescriptor.reset();

				const passColorAttachment = new GPURenderPassColorAttachment();
				passColorAttachment.view = destinationView;
				passColorAttachment.loadOp = GPULoadOp.Clear;
				passColorAttachment.storeOp = GPUStoreOp.Store;

				const passDescriptor = new GPURenderPassDescriptor();
				passDescriptor.colorAttachments.push( passColorAttachment );

				_renderBundleEncoderDescriptor.colorFormats = [ textureGPU.format ];

				const passEncoder = this.device.createRenderBundleEncoder( _renderBundleEncoderDescriptor );

				_renderBundleEncoderDescriptor.reset();

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
