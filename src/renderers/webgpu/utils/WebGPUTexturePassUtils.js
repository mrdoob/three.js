import { GPUTextureViewDimension, GPUIndexFormat, GPUFilterMode, GPUPrimitiveTopology, GPULoadOp, GPUStoreOp } from './WebGPUConstants.js';

class WebGPUTexturePassUtils {

	constructor( device ) {

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
		this.mipmapSampler = device.createSampler( { minFilter: GPUFilterMode.Linear } );
		this.flipYSampler = device.createSampler( { minFilter: GPUFilterMode.Nearest } ); //@TODO?: Consider using textureLoad()

		// We'll need a new pipeline for every texture format used.
		this.transferPipelines = {};
		this.flipYPipelines = {};

		this.mipmapVertexShaderModule = device.createShaderModule( {
			label: 'mipmapVertex',
			code: mipmapVertexSource
		} );

		this.mipmapFragmentShaderModule = device.createShaderModule( {
			label: 'mipmapFragment',
			code: mipmapFragmentSource
		} );

		this.flipYFragmentShaderModule = device.createShaderModule( {
			label: 'flipYFragment',
			code: flipYFragmentSource
		} );

	}

	getTransferPipeline( format ) {

		let pipeline = this.transferPipelines[ format ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
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

	getFlipYPipeline( format ) {

		let pipeline = this.flipYPipelines[ format ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
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

	generateMipmaps( textureGPU, textureGPUDescriptor, baseArrayLayer = 0 ) {

		const pipeline = this.getTransferPipeline( textureGPUDescriptor.format );

		const commandEncoder = this.device.createCommandEncoder( {} );
		const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

		let srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer
		} );

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

			const passEncoder = commandEncoder.beginRenderPass( {
				colorAttachments: [ {
					view: dstView,
					loadOp: GPULoadOp.Clear,
					storeOp: GPUStoreOp.Store,
					clearValue: [ 0, 0, 0, 0 ]
				} ]
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 4, 1, 0, 0 );
			passEncoder.end();

			srcView = dstView;

		}

		this.device.queue.submit( [ commandEncoder.finish() ] );

	}

}

export default WebGPUTexturePassUtils;
