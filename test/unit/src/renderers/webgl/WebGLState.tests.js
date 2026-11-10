import { WebGLState } from '../../../../../src/renderers/webgl/WebGLState.js';
import { runFramebufferCacheTests } from '../../../utils/webgl-state-recorder.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLState', () => {

			runFramebufferCacheTests( ( recorder ) => new WebGLState( recorder.gl, { get: () => null } ) );

		} );

	} );

} );
