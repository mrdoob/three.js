import WebGLState from '../../../../../../src/renderers/webgl-fallback/utils/WebGLState.js';
import { runFramebufferCacheTests } from '../../../../utils/webgl-state-recorder.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLFallback', () => {

		QUnit.module( 'WebGLState', () => {

			runFramebufferCacheTests( ( recorder ) => new WebGLState( {
				gl: recorder.gl,
				renderer: { reversedDepthBuffer: false }
			} ) );

		} );

	} );

} );
