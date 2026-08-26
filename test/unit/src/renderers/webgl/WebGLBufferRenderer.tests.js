import { WebGLBufferRenderer } from '../../../../../src/renderers/webgl/WebGLBufferRenderer.js';
import { TrianglesDrawMode } from '../../../../../src/constants.js';

// The renderer only forwards to the context, an extension and WebGLInfo, so
// recording stand-ins are enough to pin down what it emits.
function mockContext() {

	const calls = [];

	return {
		calls,
		drawArrays( ...args ) {

			calls.push( [ 'drawArrays', ...args ] );

		},
		drawArraysInstanced( ...args ) {

			calls.push( [ 'drawArraysInstanced', ...args ] );

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

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLBufferRenderer', () => {

			// INSTANCING
			QUnit.test( 'Instancing - exposes the expected API', ( assert ) => {

				const renderer = new WebGLBufferRenderer( mockContext(), mockExtensions(), mockInfo() );

				for ( const method of [ 'setMode', 'render', 'renderInstances', 'renderMultiDraw' ] ) {

					assert.strictEqual( typeof renderer[ method ], 'function', `${ method }() is exposed` );

				}

			} );

			// render
			QUnit.test( 'render - draws with the mode set by setMode', ( assert ) => {

				const gl = mockContext();
				const renderer = new WebGLBufferRenderer( gl, mockExtensions(), mockInfo() );

				renderer.setMode( TrianglesDrawMode );
				renderer.render( 6, 12 );

				assert.deepEqual( gl.calls, [[ 'drawArrays', TrianglesDrawMode, 6, 12 ]], 'start and count are forwarded verbatim' );

			} );

			QUnit.test( 'render - reports a single instance to info', ( assert ) => {

				const info = mockInfo();
				const renderer = new WebGLBufferRenderer( mockContext(), mockExtensions(), info );

				renderer.setMode( TrianglesDrawMode );
				renderer.render( 0, 12 );

				assert.deepEqual( info.updates, [[ 12, TrianglesDrawMode, 1 ]], 'the vertex count, mode and instance count are recorded' );

			} );

			QUnit.test( 'render - picks up a mode changed between draws', ( assert ) => {

				const gl = mockContext();
				const renderer = new WebGLBufferRenderer( gl, mockExtensions(), mockInfo() );

				renderer.setMode( 1 );
				renderer.render( 0, 3 );
				renderer.setMode( 2 );
				renderer.render( 0, 3 );

				assert.strictEqual( gl.calls[ 0 ][ 1 ], 1, 'the first draw uses the first mode' );
				assert.strictEqual( gl.calls[ 1 ][ 1 ], 2, 'the second draw uses the updated mode' );

			} );

			// renderInstances
			QUnit.test( 'renderInstances - forwards the instance count', ( assert ) => {

				const gl = mockContext();
				const info = mockInfo();
				const renderer = new WebGLBufferRenderer( gl, mockExtensions(), info );

				renderer.setMode( TrianglesDrawMode );
				renderer.renderInstances( 3, 6, 4 );

				assert.deepEqual( gl.calls, [[ 'drawArraysInstanced', TrianglesDrawMode, 3, 6, 4 ]], 'the instanced draw call is issued' );
				assert.deepEqual( info.updates, [[ 6, TrianglesDrawMode, 4 ]], 'info records the instance count' );

			} );

			QUnit.test( 'renderInstances - skips the draw entirely for zero instances', ( assert ) => {

				const gl = mockContext();
				const info = mockInfo();
				const renderer = new WebGLBufferRenderer( gl, mockExtensions(), info );

				renderer.setMode( TrianglesDrawMode );
				renderer.renderInstances( 0, 6, 0 );

				assert.deepEqual( gl.calls, [], 'no draw call is issued' );
				assert.deepEqual( info.updates, [], 'nothing is counted' );

			} );

			// renderMultiDraw
			QUnit.test( 'renderMultiDraw - forwards the draw lists to the extension', ( assert ) => {

				const multiDrawCalls = [];
				const extensions = mockExtensions( {
					multiDrawArraysWEBGL( ...args ) {

						multiDrawCalls.push( args );

					}
				} );

				const renderer = new WebGLBufferRenderer( mockContext(), extensions, mockInfo() );

				const starts = [ 0, 10 ], counts = [ 3, 6 ];

				renderer.setMode( TrianglesDrawMode );
				renderer.renderMultiDraw( starts, counts, 2 );

				assert.deepEqual( extensions.requested, [ 'WEBGL_multi_draw' ], 'the multi draw extension is looked up' );
				assert.deepEqual(
					multiDrawCalls,
					[[ TrianglesDrawMode, starts, 0, counts, 0, 2 ]],
					'the offsets are zero and the draw count is passed through'
				);

			} );

			QUnit.test( 'renderMultiDraw - reports the summed element count to info', ( assert ) => {

				const extensions = mockExtensions( { multiDrawArraysWEBGL() {} } );
				const info = mockInfo();
				const renderer = new WebGLBufferRenderer( mockContext(), extensions, info );

				renderer.setMode( TrianglesDrawMode );
				renderer.renderMultiDraw( [ 0, 10, 20 ], [ 3, 6, 9 ], 3 );

				assert.deepEqual( info.updates, [[ 18, TrianglesDrawMode, 1 ]], 'the counts are summed into one update' );

			} );

			QUnit.test( 'renderMultiDraw - only sums the first drawCount entries', ( assert ) => {

				// The arrays are reused buffers that can be longer than the
				// number of draws actually being issued.
				const extensions = mockExtensions( { multiDrawArraysWEBGL() {} } );
				const info = mockInfo();
				const renderer = new WebGLBufferRenderer( mockContext(), extensions, info );

				renderer.setMode( TrianglesDrawMode );
				renderer.renderMultiDraw( [ 0, 10, 20 ], [ 3, 6, 999 ], 2 );

				assert.deepEqual( info.updates, [[ 9, TrianglesDrawMode, 1 ]], 'the trailing stale entry is ignored' );

			} );

			QUnit.test( 'renderMultiDraw - skips the draw entirely for zero draws', ( assert ) => {

				const extensions = mockExtensions( { multiDrawArraysWEBGL() {} } );
				const info = mockInfo();
				const renderer = new WebGLBufferRenderer( mockContext(), extensions, info );

				renderer.setMode( TrianglesDrawMode );
				renderer.renderMultiDraw( [], [], 0 );

				assert.deepEqual( extensions.requested, [], 'the extension is not even looked up' );
				assert.deepEqual( info.updates, [], 'nothing is counted' );

			} );

		} );

	} );

} );
