import WebGPUTextureUtils from '../../../../../src/renderers/webgpu/utils/WebGPUTextureUtils.js';
import Backend from '../../../../../src/renderers/common/Backend.js';
import CanvasTarget from '../../../../../src/renderers/common/CanvasTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPUTextureUtils', () => {

		QUnit.test( 'dispose releases depth and color buffers for all canvas targets', ( assert ) => {

			const targets = [ new CanvasTarget( document.createElement( 'canvas' ) ), new CanvasTarget( document.createElement( 'canvas' ) ) ];
			let target = targets[ 0 ];
			let size = 64;
			const backend = new Backend();
			backend.renderer = { currentSamples: 1, getCanvasTarget: () => target };
			backend.getDrawingBufferSize = () => ( { width: size, height: size } );
			const utils = new WebGPUTextureUtils( backend );
			const destroyed = [];
			backend.device = { createTexture: () => {

				const textureGPU = { destroy: () => destroyed.push( textureGPU ) };
				return textureGPU;

			} };
			backend.utils = { getSampleCount: () => 4, getPreferredCanvasFormat: () => 'rgba8unorm' };
			utils.createTexture = texture => {

				const textureGPU = { destroy: () => destroyed.push( textureGPU ) };
				backend.get( texture ).texture = textureGPU;

			};

			const initial = utils.getDepthBuffer();
			const initialColor = utils.getColorBuffer();
			size = 128;
			const resized = utils.getDepthBuffer();
			const resizedColor = utils.getColorBuffer();
			assert.deepEqual( destroyed, [ initial, initialColor ], 'Resizing destroys the previous canvas buffers' );

			target = targets[ 1 ];
			const second = utils.getDepthBuffer();
			const secondColor = utils.getColorBuffer();
			utils.dispose();

			assert.strictEqual( destroyed.length, 6, 'Disposal releases all remaining canvas buffers' );

			for ( const texture of [ resized, resizedColor, second, secondColor ] ) {

				assert.true( destroyed.includes( texture ), 'Canvas buffer is destroyed' );

			}

			assert.false( backend.has( targets[ 0 ].depthTexture ), 'First canvas depth data is removed' );
			assert.false( backend.has( targets[ 1 ].depthTexture ), 'Second canvas depth data is removed' );

			utils.dispose();
			assert.false( backend.has( targets[ 0 ].colorTexture ), 'First canvas color data is removed' );
			assert.false( backend.has( targets[ 1 ].colorTexture ), 'Second canvas color data is removed' );
			assert.strictEqual( destroyed.length, 6, 'Repeated disposal does not destroy buffers twice' );

		} );

	} );

} );
