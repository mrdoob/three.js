import WebGLBackend from '../../../../../src/renderers/webgl-fallback/WebGLBackend.js';
import WebGLState from '../../../../../src/renderers/webgl-fallback/utils/WebGLState.js';
import { Color } from '../../../../../src/math/Color.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL Fallback', () => {

		QUnit.module( 'WebGLBackend', () => {

			// PUBLIC
			QUnit.test( 'clear() re-enables the color write mask', ( assert ) => {

				// mock context that tracks the color mask like a real one

				let colorMask = [ true, true, true, true ];
				const maskAtClear = [];

				const glMock = {
					COLOR_BUFFER_BIT: 0x4000,
					DEPTH_BUFFER_BIT: 0x0100,
					STENCIL_BUFFER_BIT: 0x0400,
					colorMask: ( r, g, b, a ) => {

						colorMask = [ r, g, b, a ];

					},
					getParameter: () => [ 0, 0, 0, 0 ],
					depthMask: () => {},
					stencilMask: () => {},
					clearColor: () => {},
					clearDepth: () => {},
					clearStencil: () => {},
					clear: () => {

						maskAtClear.push( colorMask.slice() );

					}
				};

				// any other gl member used while constructing WebGLState is a no-op

				const gl = new Proxy( glMock, {
					get: ( target, prop ) => ( prop in target ) ? target[ prop ] : () => {}
				} );

				const renderer = {
					getClearDepth: () => 1,
					getClearStencil: () => 0
				};

				const backend = {
					gl,
					renderer,
					getClearColor: () => new Color( 1, 0, 0 )
				};

				backend.state = new WebGLState( backend );

				// simulate a previous draw with `colorWrite: false`

				backend.state.setColorMask( false );
				assert.deepEqual( colorMask, [ false, false, false, false ], 'color writes are disabled before the clear.' );

				WebGLBackend.prototype.clear.call( backend, true, true, false );

				assert.deepEqual( maskAtClear[ 0 ], [ true, true, true, true ], 'color writes are enabled when gl.clear() is called.' );

			} );

		} );

	} );

} );
