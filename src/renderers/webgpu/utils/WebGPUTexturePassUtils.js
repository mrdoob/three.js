import DataMap from '../../common/DataMap.js';
import { GPUTextureViewDimension, GPUIndexFormat, GPUFilterMode, GPUPrimitiveTopology, GPULoadOp, GPUStoreOp } from './WebGPUConstants.js';

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

		const mipmapVertexSource = `
struct VarysStruct {
	@builtin( position ) Position: vec4<f32>,
	@location( 0 ) vTex : vec2<f32>
};

@vertex
fn main( @builtin( vertex_index ) vertexIndex : u32 ) -> VarysStruct {

	var Varys : VarysStruct;

	var pos = array< vec2<f32>, 4 >(
		vec2<f32>( -1.0,  1.0 ),
		vec2<f32>(  1.0,  1.0 ),
		vec2<f32>( -1.0, -1.0 ),
		vec2<f32>(  1.0, -1.0 )
	);

	var tex = array< vec2<f32>, 4 >(
		vec2<f32>( 0.0, 0.0 ),
		vec2<f32>( 1.0, 0.0 ),
		vec2<f32>( 0.0, 1.0 ),
		vec2<f32>( 1.0, 1.0 )
	);

	Varys.vTex = tex[ vertexIndex ];
	Varys.Position = vec4<f32>( pos[ vertexIndex ], 0.0, 1.0 );

	return Varys;

}
`;

		const mipmapFragmentSource = `
@group( 0 ) @binding( 0 )
var imgSampler : sampler;

@group( 0 ) @binding( 1 )
var img : texture_2d<f32>;

@fragment
fn main( @location( 0 ) vTex : vec2<f32> ) -> @location( 0 ) vec4<f32> {

	return textureSample( img, imgSampler, vTex );

}
`;

		const flipYFragmentSource = `
@group( 0 ) @binding( 0 )
var imgSampler : sampler;

@group( 0 ) @binding( 1 )
var img : texture_2d<f32>;

@fragment
fn main( @location( 0 ) vTex : vec2<f32> ) -> @location( 0 ) vec4<f32> {

	return textureSample( img, imgSampler, vec2( vTex.x, 1.0 - vTex.y ) );

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
		 * A cache for GPU render pipelines used for copy/transfer passes.
		 * Every texture format requires a unique pipeline.
		 *
		 * @type {Object<string,GPURenderPipeline>}
		 */
		this.transferPipelines = {};

		/**
		 * A cache for GPU render pipelines used for flipY passes.
		 * Every texture format requires a unique pipeline.
		 *
		 * @type {Object<string,GPURenderPipeline>}
		 */
		this.flipYPipelines = {};

		/**
		 * The mipmap vertex shader module.
		 *
		 * @type {GPUShaderModule}
		 */
		this.mipmapVertexShaderModule = device.createShaderModule( {
			label: 'mipmapVertex',
			code: mipmapVertexSource
		} );

		/**
		 * The mipmap fragment shader module.
		 *
		 * @type {GPUShaderModule}
		 */
		this.mipmapFragmentShaderModule = device.createShaderModule( {
			label: 'mipmapFragment',
			code: mipmapFragmentSource
		} );

		/**
		 * The flipY fragment shader module.
		 *
		 * @type {GPUShaderModule}
		 */
		this.flipYFragmentShaderModule = device.createShaderModule( {
			label: 'flipYFragment',
			code: flipYFragmentSource
		} );

	}

	/**
	 * Returns a render pipeline for the internal copy render pass. The pass
	 * requires a unique render pipeline for each texture format.
	 *
	 * @param {string} format - The GPU texture format
	 * @return {GPURenderPipeline} The GPU render pipeline.
	 */
	getTransferPipeline( format ) {

		let pipeline = this.transferPipelines[ format ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
				label: `mipmap-${ format }`,
				vertex: {
					module: this.mipmapVertexShaderModule,
					entryPoint: 'main'
				},
				fragment: {
					module: this.mipmapFragmentShaderModule,
					entryPoint: 'main',
					targets: [ { format } ]
				},
				primitive: {
					topology: GPUPrimitiveTopology.TriangleStrip,
					stripIndexFormat: GPUIndexFormat.Uint32
				},
				layout: 'auto'
			} );

			this.transferPipelines[ format ] = pipeline;

		}

		return pipeline;

	}

	/**
	 * Returns a render pipeline for the flipY render pass. The pass
	 * requires a unique render pipeline for each texture format.
	 *
	 * @param {string} format - The GPU texture format
	 * @return {GPURenderPipeline} The GPU render pipeline.
	 */
	getFlipYPipeline( format ) {

		let pipeline = this.flipYPipelines[ format ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
				label: `flipY-${ format }`,
				vertex: {
					module: this.mipmapVertexShaderModule,
					entryPoint: 'main'
				},
				fragment: {
					module: this.flipYFragmentShaderModule,
					entryPoint: 'main',
					targets: [ { format } ]
				},
				primitive: {
					topology: GPUPrimitiveTopology.TriangleStrip,
					stripIndexFormat: GPUIndexFormat.Uint32
				},
				layout: 'auto'
			} );

			this.flipYPipelines[ format ] = pipeline;

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

		const transferPipeline = this.getTransferPipeline( format );
		const flipYPipeline = this.getFlipYPipeline( format );

		const tempTexture = this.device.createTexture( {
			size: { width, height, depthOrArrayLayers: 1 },
			format,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
		} );

		const srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer
		} );

		const dstView = tempTexture.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer: 0
		} );

		const commandEncoder = this.device.createCommandEncoder( {} );

		const pass = ( pipeline, sourceView, destinationView ) => {

			const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

			const bindGroup = this.device.createBindGroup( {
				layout: bindGroupLayout,
				entries: [ {
					binding: 0,
					resource: this.flipYSampler
				}, {
					binding: 1,
					resource: sourceView
				} ]
			} );

			const passEncoder = commandEncoder.beginRenderPass( {
				colorAttachments: [ {
					view: destinationView,
					loadOp: GPULoadOp.Clear,
					storeOp: GPUStoreOp.Store,
					clearValue: [ 0, 0, 0, 0 ]
				} ]
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 4, 1, 0, 0 );
			passEncoder.end();

		};

		pass( transferPipeline, srcView, dstView );
		pass( flipYPipeline, dstView, srcView );

		this.device.queue.submit( [ commandEncoder.finish() ] );

		tempTexture.destroy();

	}

	/**
	 * Generates mipmaps for the given GPU texture.
	 *
	 * @param {GPUTexture} textureGPU - The GPU texture object.
	 * @param {Object} textureGPUDescriptor - The texture descriptor.
	 * @param {number} [baseArrayLayer=0] - The index of the first array layer accessible to the texture view.
	 * @param {?GPUCommandEncoder} [encoder=null] - An optional command encoder used to generate mipmaps.
	 */
	generateMipmaps( textureGPU, textureGPUDescriptor, baseArrayLayer = 0, encoder = null ) {

		const textureData = this.get( textureGPU );

		if ( textureData.layers === undefined ) {

			textureData.layers = [];

		}

		const passes = textureData.layers[ baseArrayLayer ] || this._mipmapCreateBundles( textureGPU, textureGPUDescriptor, baseArrayLayer );

		const commandEncoder = encoder || this.device.createCommandEncoder( { label: 'mipmapEncoder' } );

		this._mipmapRunBundles( commandEncoder, passes );

		if ( encoder === null ) this.device.queue.submit( [ commandEncoder.finish() ] );

		textureData.layers[ baseArrayLayer ] = passes;

	}

	/**
	 * Since multiple copy render passes are required to generate mipmaps, the passes
	 * are managed as render bundles to improve performance.
	 *
	 * @param {GPUTexture} textureGPU - The GPU texture object.
	 * @param {Object} textureGPUDescriptor - The texture descriptor.
	 * @param {number} baseArrayLayer - The index of the first array layer accessible to the texture view.
	 * @return {Array<Object>} An array of render bundles.
	 */
	_mipmapCreateBundles( textureGPU, textureGPUDescriptor, baseArrayLayer ) {

		const pipeline = this.getTransferPipeline( textureGPUDescriptor.format );

		const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

		let srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer
		} );

		const passes = [];

		for ( let i = 1; i < textureGPUDescriptor.mipLevelCount; i ++ ) {

			const bindGroup = this.device.createBindGroup( {
				layout: bindGroupLayout,
				entries: [ {
					binding: 0,
					resource: this.mipmapSampler
				}, {
					binding: 1,
					resource: srcView
				} ]
			} );

			const dstView = textureGPU.createView( {
				baseMipLevel: i,
				mipLevelCount: 1,
				dimension: GPUTextureViewDimension.TwoD,
				baseArrayLayer
			} );

			const passDescriptor = {
				colorAttachments: [ {
					view: dstView,
					loadOp: GPULoadOp.Clear,
					storeOp: GPUStoreOp.Store,
					clearValue: [ 0, 0, 0, 0 ]
				} ]
			};

			const passEncoder = this.device.createRenderBundleEncoder( {
				colorFormats: [ textureGPUDescriptor.format ]
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 4, 1, 0, 0 );

			passes.push( {
				renderBundles: [ passEncoder.finish() ],
				passDescriptor
			} );

			srcView = dstView;

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
