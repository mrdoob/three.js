import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';
import { NearestFilter } from '../../../../src/constants.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLRenderTarget', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new WebGLRenderTarget();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'WebGLRenderTarget extends from EventDispatcher'
			);

			const options = new WebGLRenderTarget( 1, 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a WebGLRenderTarget with texture options.' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new WebGLRenderTarget();
			assert.ok( object, 'Can instantiate a WebGLRenderTarget.' );

		} );

		// PUBLIC

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new WebGLRenderTarget();
			object.dispose();

		} );

	} );

} );
