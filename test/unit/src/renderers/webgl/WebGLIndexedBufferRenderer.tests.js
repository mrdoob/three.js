import { WebGLIndexedBufferRenderer } from '../../../../../src/renderers/webgl/WebGLIndexedBufferRenderer.js';
import { TrianglesDrawMode } from '../../../../../src/constants.js';

// Recording stand-ins for the context, the multi-draw extension and WebGLInfo.
function mockContext() {

	const calls = [];

	return {
		calls,
		drawElements( ...args ) {

			calls.push( [ 'drawElements', ...args ] );

		},
		drawElementsInstanced( ...args ) {

			calls.push( [ 'drawElementsInstanced', ...args ] );

		}
	};

}

function mockExtensions( extension ) {

	return {
		requested: [],
		get( name ) {

			this.requested.push( name );
			return extension;

		}
	};

}

function mockInfo() {

	const updates = [];

	return {
		updates,
		update( count, mode, instanceCount ) {

			updates.push( [ count, mode, instanceCount ] );

		}
	};

}

// Stands in for the index attribute's buffer description, which is all
// setIndex() reads.
const UINT16_INDEX = { type: 5123, bytesPerElement: 2 };
const UINT32_INDEX = { type: 5125, bytesPerElement: 4 };

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLIndexedBufferRenderer', () => {

			// INSTANCING
			QUnit.test( 'Instancing - exposes the expected API', ( assert ) => {

				const renderer = new WebGLIndexedBufferRenderer( mockContext(), mockExtensions(), mockInfo() );

				for ( const method of [ 'setMode', 'setIndex', 'render', 'renderInstances', 'renderMultiDraw' ] ) {

					assert.strictEqual( typeof renderer[ method ], 'function', `${ method }() is exposed` );

				}

			} );

			// render
			QUnit.test( 'render - converts the start index into a byte offset', ( assert ) => {

				// drawElements takes a byte offset, not an element index, so the
				// start has to be scaled by the index type's size.
				const gl = mockContext();
				const renderer = new WebGLIndexedBufferRenderer( gl, mockExtensions(), mockInfo() );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.render( 3, 6 );

				assert.deepEqual(
					gl.calls,
					[[ 'drawElements', TrianglesDrawMode, 6, UINT16_INDEX.type, 3 * 2 ]],
					'a 16-bit index scales the start by 2'
				);

			} );

			QUnit.test( 'render - scales the offset by the current index type', ( assert ) => {

				const gl = mockContext();
				const renderer = new WebGLIndexedBufferRenderer( gl, mockExtensions(), mockInfo() );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT32_INDEX );
				renderer.render( 3, 6 );

				assert.strictEqual( gl.calls[ 0 ][ 3 ], UINT32_INDEX.type, 'the index type is forwarded' );
				assert.strictEqual( gl.calls[ 0 ][ 4 ], 3 * 4, 'a 32-bit index scales the start by 4' );

			} );

			QUnit.test( 'render - picks up an index changed between draws', ( assert ) => {

				const gl = mockContext();
				const renderer = new WebGLIndexedBufferRenderer( gl, mockExtensions(), mockInfo() );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.render( 1, 3 );
				renderer.setIndex( UINT32_INDEX );
				renderer.render( 1, 3 );

				assert.strictEqual( gl.calls[ 0 ][ 4 ], 2, 'the first draw uses the 16-bit stride' );
				assert.strictEqual( gl.calls[ 1 ][ 4 ], 4, 'the second draw uses the 32-bit stride' );

			} );

			QUnit.test( 'render - reports a single instance to info', ( assert ) => {

				const info = mockInfo();
				const renderer = new WebGLIndexedBufferRenderer( mockContext(), mockExtensions(), info );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.render( 0, 12 );

				assert.deepEqual( info.updates, [[ 12, TrianglesDrawMode, 1 ]], 'the index count, mode and instance count are recorded' );

			} );

			// renderInstances
			QUnit.test( 'renderInstances - forwards the instance count', ( assert ) => {

				const gl = mockContext();
				const info = mockInfo();
				const renderer = new WebGLIndexedBufferRenderer( gl, mockExtensions(), info );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.renderInstances( 3, 6, 4 );

				assert.deepEqual(
					gl.calls,
					[[ 'drawElementsInstanced', TrianglesDrawMode, 6, UINT16_INDEX.type, 3 * 2, 4 ]],
					'the instanced draw call carries the same byte offset'
				);
				assert.deepEqual( info.updates, [[ 6, TrianglesDrawMode, 4 ]], 'info records the instance count' );

			} );

			QUnit.test( 'renderInstances - skips the draw entirely for zero instances', ( assert ) => {

				const gl = mockContext();
				const info = mockInfo();
				const renderer = new WebGLIndexedBufferRenderer( gl, mockExtensions(), info );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.renderInstances( 0, 6, 0 );

				assert.deepEqual( gl.calls, [], 'no draw call is issued' );
				assert.deepEqual( info.updates, [], 'nothing is counted' );

			} );

			// renderMultiDraw
			QUnit.test( 'renderMultiDraw - forwards the draw lists to the extension', ( assert ) => {

				const multiDrawCalls = [];
				const extensions = mockExtensions( {
					multiDrawElementsWEBGL( ...args ) {

						multiDrawCalls.push( args );

					}
				} );

				const renderer = new WebGLIndexedBufferRenderer( mockContext(), extensions, mockInfo() );

				const starts = [ 0, 20 ], counts = [ 3, 6 ];

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.renderMultiDraw( starts, counts, 2 );

				assert.deepEqual( extensions.requested, [ 'WEBGL_multi_draw' ], 'the multi draw extension is looked up' );

				// Note the argument order differs from the non-indexed variant:
				// counts come before the index type, starts after it.
				assert.deepEqual(
					multiDrawCalls,
					[[ TrianglesDrawMode, counts, 0, UINT16_INDEX.type, starts, 0, 2 ]],
					'counts, index type and starts are passed in the order the extension expects'
				);

			} );

			QUnit.test( 'renderMultiDraw - reports the summed element count to info', ( assert ) => {

				const extensions = mockExtensions( { multiDrawElementsWEBGL() {} } );
				const info = mockInfo();
				const renderer = new WebGLIndexedBufferRenderer( mockContext(), extensions, info );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.renderMultiDraw( [ 0, 10, 20 ], [ 3, 6, 9 ], 3 );

				assert.deepEqual( info.updates, [[ 18, TrianglesDrawMode, 1 ]], 'the counts are summed into one update' );

			} );

			QUnit.test( 'renderMultiDraw - only sums the first drawCount entries', ( assert ) => {

				const extensions = mockExtensions( { multiDrawElementsWEBGL() {} } );
				const info = mockInfo();
				const renderer = new WebGLIndexedBufferRenderer( mockContext(), extensions, info );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.renderMultiDraw( [ 0, 10, 20 ], [ 3, 6, 999 ], 2 );

				assert.deepEqual( info.updates, [[ 9, TrianglesDrawMode, 1 ]], 'the trailing stale entry is ignored' );

			} );

			QUnit.test( 'renderMultiDraw - skips the draw entirely for zero draws', ( assert ) => {

				const extensions = mockExtensions( { multiDrawElementsWEBGL() {} } );
				const info = mockInfo();
				const renderer = new WebGLIndexedBufferRenderer( mockContext(), extensions, info );

				renderer.setMode( TrianglesDrawMode );
				renderer.setIndex( UINT16_INDEX );
				renderer.renderMultiDraw( [], [], 0 );

				assert.deepEqual( extensions.requested, [], 'the extension is not even looked up' );
				assert.deepEqual( info.updates, [], 'nothing is counted' );

			} );

		} );

	} );

} );
