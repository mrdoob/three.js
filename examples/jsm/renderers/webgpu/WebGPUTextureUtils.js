// Copyright 2020 Brandon Jones
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { GPUIndexFormat, GPUFilterMode, GPUPrimitiveTopology } from './constants.js';

// ported from https://github.com/toji/web-texture-tool/blob/master/src/webgpu-mipmap-generator.js

class WebGPUTextureUtils {

	constructor( device, glslang ) {

		this.device = device;

		const mipmapVertexSource = `#version 450
			const vec2 pos[4] = vec2[4](vec2(-1.0f, 1.0f), vec2(1.0f, 1.0f), vec2(-1.0f, -1.0f), vec2(1.0f, -1.0f));
			const vec2 tex[4] = vec2[4](vec2(0.0f, 0.0f), vec2(1.0f, 0.0f), vec2(0.0f, 1.0f), vec2(1.0f, 1.0f));
			layout(location = 0) out vec2 vTex;
			void main() {
				vTex = tex[gl_VertexIndex];
				gl_Position = vec4(pos[gl_VertexIndex], 0.0, 1.0);
			}
		`;

		const mipmapFragmentSource = `#version 450
			layout(set = 0, binding = 0) uniform sampler imgSampler;
			layout(set = 0, binding = 1) uniform texture2D img;
			layout(location = 0) in vec2 vTex;
			layout(location = 0) out vec4 outColor;
			void main() {
				outColor = texture(sampler2D(img, imgSampler), vTex);
			}`;

		this.sampler = device.createSampler( { minFilter: GPUFilterMode.Linear } );

		// We'll need a new pipeline for every texture format used.
		this.pipelines = {};

		this.mipmapVertexShaderModule = device.createShaderModule( {
			code: glslang.compileGLSL( mipmapVertexSource, 'vertex' ),
		} );
		this.mipmapFragmentShaderModule = device.createShaderModule( {
			code: glslang.compileGLSL( mipmapFragmentSource, 'fragment' ),
		} );

	}

	getMipmapPipeline( format ) {

		let pipeline = this.pipelines[ format ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
				vertex: {
					module: this.mipmapVertexShaderModule,
					entryPoint: 'main',
				},
				fragment: {
					module: this.mipmapFragmentShaderModule,
					entryPoint: 'main',
					targets: [ { format } ],
				},
				primitive: {
					topology: GPUPrimitiveTopology.TriangleStrip,
					stripIndexFormat: GPUIndexFormat.Uint32
				}
			} );
			this.pipelines[ format ] = pipeline;

		}

		return pipeline;

	}

	generateMipmaps( textureGPU, textureGPUDescriptor ) {

		const pipeline = this.getMipmapPipeline( textureGPUDescriptor.format );

		const commandEncoder = this.device.createCommandEncoder( {} );
		const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

		let srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
		} );

		for ( let i = 1; i < textureGPUDescriptor.mipLevelCount; i ++ ) {

			const dstView = textureGPU.createView( {
				baseMipLevel: i,
				mipLevelCount: 1,
			} );

			const passEncoder = commandEncoder.beginRenderPass( {
				colorAttachments: [ {
					attachment: dstView,
					loadValue: [ 0, 0, 0, 0 ],
				} ],
			} );

			const bindGroup = this.device.createBindGroup( {
				layout: bindGroupLayout,
				entries: [ {
					binding: 0,
					resource: this.sampler,
				}, {
					binding: 1,
					resource: srcView,
				} ],
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 4, 1, 0, 0 );
			passEncoder.endPass();

			srcView = dstView;

		}

		this.device.queue.submit( [ commandEncoder.finish() ] );

	}

}

export default WebGPUTextureUtils;
