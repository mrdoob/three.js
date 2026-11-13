import WebGPUBackend from '../../../../../src/renderers/webgpu/WebGPUBackend.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPUBackend', () => {

		QUnit.test( 'getRenderCacheKey: includes every color attachment format', ( assert ) => {

			const backend = Object.create( WebGPUBackend.prototype );

			backend.utils = {
				getSampleCountRenderContext: () => 1,
				getCurrentColorSpace: () => 'srgb',
				getCurrentColorFormat: ( context ) => context.textures[ 0 ].format,
				getCurrentDepthStencilFormat: () => 'depth24plus',
				getPrimitiveTopology: () => 'triangle-list',
				getStripIndexFormat: () => undefined
			};

			backend.attributeUtils = {
				getVertexBufferLayoutCacheKey: () => 'vertex-layout'
			};

			const object = { isMesh: false };
			const geometry = {};
			const material = {
				transparent: false,
				blending: 1,
				premultipliedAlpha: false,
				blendSrc: 1,
				blendDst: 1,
				blendEquation: 1,
				blendSrcAlpha: 1,
				blendDstAlpha: 1,
				blendEquationAlpha: 1,
				colorWrite: true,
				depthWrite: true,
				depthTest: true,
				depthFunc: 1,
				stencilWrite: false,
				stencilFunc: 1,
				stencilFail: 1,
				stencilZFail: 1,
				stencilZPass: 1,
				stencilFuncMask: 1,
				stencilWriteMask: 1,
				polygonOffset: false,
				polygonOffsetFactor: 0,
				polygonOffsetUnits: 0,
				side: 0,
				alphaToCoverage: false
			};

			const getRenderObject = ( secondaryFormat ) => ( {
				object,
				material,
				geometry,
				context: {
					textures: [
						{ format: 'rgba8unorm' },
						{ format: secondaryFormat }
					]
				},
				clippingContextCacheKey: ''
			} );

			const rgba8 = backend.getRenderCacheKey( getRenderObject( 'rgba8unorm' ) );
			const rgba16 = backend.getRenderCacheKey( getRenderObject( 'rgba16float' ) );

			assert.notStrictEqual( rgba8, rgba16, 'different secondary MRT attachment formats produce different pipeline cache keys' );

		} );

	} );

} );
