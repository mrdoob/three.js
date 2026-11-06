import { getSharedRenderer } from '../../nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLFallback', () => {

		QUnit.module( 'WebGLBackend', () => {

			QUnit.test( 'hasFeature( float32-filterable )', async ( assert ) => {

				const renderer = await getSharedRenderer( 'webgl' );

				if ( renderer === null ) {

					assert.ok( true, 'SKIPPED: "webgl" backend is not available in this environment.' );
					return;

				}

				const supported = renderer.backend.gl.getSupportedExtensions().includes( 'OES_texture_float_linear' );

				assert.strictEqual( renderer.hasFeature( 'float32-filterable' ), supported, 'follows OES_texture_float_linear' );

			} );

		} );

	} );

} );
