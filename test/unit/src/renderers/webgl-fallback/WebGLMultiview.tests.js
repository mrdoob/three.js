import WebGLBackend from '../../../../../src/renderers/webgl-fallback/WebGLBackend.js';
import WebGLExtensions from '../../../../../src/renderers/webgl-fallback/utils/WebGLExtensions.js';

import { CONSOLE_LEVEL } from '../../../utils/console-wrapper.js';

function createProvider( name, singleSample = true, multisample = false ) {

	const provider = {
		name,
		calls: []
	};

	if ( singleSample ) {

		provider.framebufferTextureMultiviewOVR = function ( ...args ) {

			this.calls.push( { method: 'singleSample', args } );

		};

	}

	if ( multisample ) {

		provider.framebufferTextureMultisampleMultiviewOVR = function ( ...args ) {

			this.calls.push( { method: 'multisample', args } );

		};

	}

	return provider;

}

function createBackend( providers = {}, antialias = false, supportedExtensions = Object.keys( providers ) ) {

	const gl = {
		getContextAttributes() {

			return { antialias };

		},
		getExtension( name ) {

			return providers[ name ] || null;

		},
		getSupportedExtensions() {

			return supportedExtensions;

		}
	};

	const backend = new WebGLBackend();
	backend.gl = gl;
	backend.extensions = new WebGLExtensions( { gl } );

	return backend;

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLFallback', () => {

		QUnit.module( 'Multiview', () => {

			QUnit.test( 'OCULUS_multiview only', ( assert ) => {

				const oculus = createProvider( 'OCULUS_multiview', true, true );
				const backend = createBackend( { OCULUS_multiview: oculus } );

				assert.strictEqual( backend.extensions.getMultiviewExtension( false ), oculus, 'uses the Oculus provider for a non-multisampled target' );
				assert.true( backend.hasFeature( 'multiview' ), 'exposes the backend-neutral multiview feature' );
				assert.true( backend.hasFeature( 'OCULUS_multiview' ), 'preserves extension-name feature lookup' );
				assert.false( backend.hasFeature( 'OVR_multiview2' ), 'does not report an unavailable OVR provider' );

			} );

			QUnit.test( 'OVR_multiview2 only', ( assert ) => {

				const ovr = createProvider( 'OVR_multiview2' );
				const backend = createBackend( { OVR_multiview2: ovr } );

				assert.strictEqual( backend.extensions.getMultiviewExtension( false ), ovr, 'uses the OVR provider for a non-multisampled target' );
				assert.true( backend.hasFeature( 'multiview' ), 'supports single-sample multiview through OVR' );
				assert.true( backend.hasFeature( 'OVR_multiview2' ), 'preserves the OVR extension-name feature lookup' );
				assert.false( backend.hasFeature( 'OCULUS_multiview' ), 'does not report an unavailable Oculus provider' );

			} );

			QUnit.test( 'both providers prefer Oculus', ( assert ) => {

				const oculus = createProvider( 'OCULUS_multiview', true, true );
				const ovr = createProvider( 'OVR_multiview2' );
				const backend = createBackend( { OCULUS_multiview: oculus, OVR_multiview2: ovr }, true );

				assert.strictEqual( backend.extensions.getMultiviewExtension( false ), oculus, 'prefers Oculus for single-sample multiview' );
				assert.strictEqual( backend.extensions.getMultiviewExtension( true ), oculus, 'prefers Oculus for multisampled multiview' );
				assert.true( backend.hasFeature( 'multiview' ), 'supports multiview for an antialiased context' );
				assert.true( backend.hasFeature( 'OCULUS_multiview' ), 'preserves the Oculus extension-name feature lookup' );
				assert.true( backend.hasFeature( 'OVR_multiview2' ), 'preserves the OVR extension-name feature lookup' );

			} );

			QUnit.test( 'provider method fallback', ( assert ) => {

				const oculus = createProvider( 'OCULUS_multiview', false, true );
				const ovr = createProvider( 'OVR_multiview2' );
				const backend = createBackend( { OCULUS_multiview: oculus, OVR_multiview2: ovr } );

				assert.strictEqual( backend.extensions.getMultiviewExtension( false ), ovr, 'uses OVR when Oculus lacks the single-sample method' );
				assert.strictEqual( backend.extensions.getMultiviewExtension( true ), oculus, 'uses Oculus for the available multisampled method' );

			} );

			QUnit.test( 'neither provider', ( assert ) => {

				const backend = createBackend();

				assert.strictEqual( backend.extensions.getMultiviewExtension( false ), null, 'has no single-sample provider' );
				assert.strictEqual( backend.extensions.getMultiviewExtension( true ), null, 'has no multisampled provider' );
				assert.false( backend.hasFeature( 'multiview' ), 'does not expose the multiview feature' );

			} );

			QUnit.test( 'missing multisampled method fails safely', ( assert ) => {

				const ovr = createProvider( 'OVR_multiview2' );
				const backend = createBackend( { OVR_multiview2: ovr }, true );

				assert.strictEqual( backend.extensions.getMultiviewExtension( true ), null, 'rejects a provider without the required method' );
				assert.false( backend.hasFeature( 'multiview' ), 'disables multiview for the unsupported sample configuration' );

				let exception = null;

				try {

					console.level = CONSOLE_LEVEL.OFF;
					backend._attachMultiviewTexture( 1, 2, {}, 0, 4, 0, 2 );

				} catch ( error ) {

					exception = error;

				} finally {

					console.level = CONSOLE_LEVEL.DEFAULT;

				}

				assert.strictEqual( exception, null, 'does not attempt an undefined function call' );
				assert.strictEqual( ovr.calls.length, 0, 'does not call the single-sample method for a multisampled target' );

			} );

			QUnit.test( 'OVR non-multisampled attachment', ( assert ) => {

				const ovr = createProvider( 'OVR_multiview2' );
				const backend = createBackend( { OVR_multiview2: ovr } );
				const texture = {};

				backend._attachMultiviewTexture( 1, 2, texture, 3, 0, 4, 2 );

				assert.strictEqual( ovr.calls.length, 1, 'performs one attachment' );
				assert.strictEqual( ovr.calls[ 0 ].method, 'singleSample', 'uses the non-multisampled entry point' );
				assert.deepEqual( ovr.calls[ 0 ].args, [ 1, 2, texture, 3, 4, 2 ], 'passes the OVR argument shape' );

			} );

			QUnit.test( 'Oculus multisampled attachment', ( assert ) => {

				const oculus = createProvider( 'OCULUS_multiview', true, true );
				const backend = createBackend( { OCULUS_multiview: oculus }, true );
				const texture = {};

				backend._attachMultiviewTexture( 1, 2, texture, 3, 4, 5, 2 );

				assert.strictEqual( oculus.calls.length, 1, 'performs one attachment' );
				assert.strictEqual( oculus.calls[ 0 ].method, 'multisample', 'uses the multisampled entry point' );
				assert.deepEqual( oculus.calls[ 0 ].args, [ 1, 2, texture, 3, 4, 5, 2 ], 'passes the Oculus argument shape' );

			} );

			QUnit.test( 'unrelated extension behavior', ( assert ) => {

				const backend = createBackend( {}, false, [ 'WEBGL_multi_draw' ] );

				assert.true( backend.hasFeature( 'WEBGL_multi_draw' ), 'keeps existing feature lookup behavior' );
				assert.false( backend.hasFeature( 'texture-compression-astc' ), 'keeps unavailable feature behavior' );

			} );

		} );

	} );

} );
