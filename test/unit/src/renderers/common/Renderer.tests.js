import Renderer from '../../../../../src/renderers/common/Renderer.js';
import ReadbackBuffer from '../../../../../src/renderers/common/ReadbackBuffer.js';

function createRenderer() {

	const domElement = {
		style: {},
		addEventListener() {},
		removeEventListener() {}
	};

	const backend = {
		getDomElement: () => domElement,
		copyTextureToBuffer: async ( ...args ) => args,
		init: async () => {},
		get: () => ( {} ),
		has: () => false,
		updateSize: () => {},
		getDrawingBufferSize: () => ( { width: 1, height: 1 } ),
		getPixelRatio: () => 1
	};

	return new Renderer( backend );

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Renderer', () => {

		QUnit.test( 'readRenderTargetPixelsAsync', async ( assert ) => {

			const renderer = createRenderer();
			const texture0 = { name: 'texture0' };
			const texture1 = { name: 'texture1' };
			const renderTarget = { textures: [ texture0, texture1 ] };

			let result = await renderer.readRenderTargetPixelsAsync( renderTarget, 1, 2, 3, 4, 1, 5 );

			assert.strictEqual( result[ 0 ], texture1, 'numeric target keeps previous textureIndex argument behavior' );
			assert.strictEqual( result[ 5 ], 5, 'numeric target keeps previous faceIndex argument behavior' );
			assert.strictEqual( result[ 6 ], null, 'numeric target does not forward a readback target' );

			const target = new Uint8Array( 16 );

			result = await renderer.readRenderTargetPixelsAsync( renderTarget, 1, 2, 3, 4, target, 5, 1 );

			assert.strictEqual( result[ 0 ], texture1, 'typed array target forwards the selected MRT texture' );
			assert.strictEqual( result[ 5 ], 5, 'typed array target forwards the face index' );
			assert.strictEqual( result[ 6 ], target, 'typed array target is forwarded to the backend' );

			result = await renderer.readRenderTargetPixelsAsync( renderTarget, 1, 2, 3, 4, target, 5 );

			assert.strictEqual( result[ 0 ], texture0, 'typed array target without texture index keeps the default texture' );
			assert.strictEqual( result[ 5 ], 5, 'typed array target without texture index treats the next argument as faceIndex' );

			const readbackBuffer = new ReadbackBuffer( 16 );

			result = await renderer.readRenderTargetPixelsAsync( renderTarget, 1, 2, 3, 4, readbackBuffer, 5, 0 );

			assert.strictEqual( result[ 5 ], 5, 'ReadbackBuffer target forwards the face index' );
			assert.strictEqual( result[ 6 ], readbackBuffer, 'ReadbackBuffer target is forwarded to the backend' );
			assert.strictEqual( renderer.info.memory.readbackBuffers, 1, 'ReadbackBuffer target is tracked' );
			assert.strictEqual( renderer.info.memory.readbackBuffersSize, 16, 'ReadbackBuffer target size is tracked' );

			readbackBuffer.dispose();

			assert.strictEqual( renderer.info.memory.readbackBuffers, 0, 'ReadbackBuffer dispose clears tracking' );
			assert.strictEqual( renderer.info.memory.readbackBuffersSize, 0, 'ReadbackBuffer dispose clears tracked size' );

			result = await renderer.readRenderTargetPixelsAsync( renderTarget, 1, 2, 3, 4, readbackBuffer );

			assert.strictEqual( result[ 6 ], readbackBuffer, 'ReadbackBuffer target can be tracked again after dispose' );

			renderer.info.dispose();

			assert.strictEqual( renderer.info.memory.readbackBuffers, 0, 'renderer info dispose clears tracked readback buffers' );
			assert.strictEqual( renderer.info.memory.readbackBuffersSize, 0, 'renderer info dispose clears tracked readback buffer size' );
			assert.strictEqual( renderer.info.memory.total, 0, 'renderer info dispose clears total memory' );
			assert.strictEqual( readbackBuffer.dispose(), undefined, 'ReadbackBuffer dispose after renderer info dispose does not throw' );
			assert.strictEqual( renderer.info.memory.readbackBuffers, 0, 'late ReadbackBuffer dispose keeps tracking at zero' );
			assert.strictEqual( renderer.info.memory.readbackBuffersSize, 0, 'late ReadbackBuffer dispose keeps tracked size at zero' );

		} );

	} );

} );
