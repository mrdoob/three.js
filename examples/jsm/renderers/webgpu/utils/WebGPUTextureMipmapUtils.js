import { GPUTextureViewDimension, GPUIndexFormat, GPUFilterMode, GPUPrimitiveTopology, GPULoadOp, GPUStoreOp } from './WebGPUConstants.js';

class WebGPUTextureMipmapUtils {

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

		this.sampler = device.createSampler( { minFilter: GPUFilterMode.Linear } );

		// We'll need a new pipeline for every texture format used.
		this.pipelines = {};

		this.mipmapVertexShaderModule = device.createShaderModule( {
			label: 'mipmapVertex',
			code: mipmapVertexSource
		} );

		this.mipmapFragmentShaderModule = device.createShaderModule( {
			label: 'mipmapFragment',
			code: mipmapFragmentSource
		} );

	}

	getMipmapPipeline( format ) {

		let pipeline = this.pipelines[ format ];

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

			this.pipelines[ format ] = pipeline;

		}

		return pipeline;

	}

	generateMipmaps( textureGPU, textureGPUDescriptor, baseArrayLayer = 0 ) {

		const pipeline = this.getMipmapPipeline( textureGPUDescriptor.format );

		const commandEncoder = this.device.createCommandEncoder( {} );
		const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

		let srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer
		} );

		for ( let i = 1; i < textureGPUDescriptor.mipLevelCount; i ++ ) {

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

			const bindGroup = this.device.createBindGroup( {
				layout: bindGroupLayout,
				entries: [ {
					binding: 0,
					resource: this.sampler
				}, {
					binding: 1,
					resource: srcView
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

export default WebGPUTextureMipmapUtils;
