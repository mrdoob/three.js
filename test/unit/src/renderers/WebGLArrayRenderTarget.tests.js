/* global QUnit */

import { NearestFilter } from '../../../../src/constants.js';
import { WebGLArrayRenderTarget } from '../../../../src/renderers/WebGLArrayRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLArrayRenderTarget', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new WebGLArrayRenderTarget();
			assert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGLArrayRenderTarget extends from WebGLRenderTarget'
			);

			const options = new WebGLArrayRenderTarget( 1, 1, 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.depth === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a WebGLArrayRenderTarget with texture options.' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new WebGLArrayRenderTarget();
			assert.ok( object, 'Can instantiate a WebGLArrayRenderTarget.' );

		} );

		// PROPERTIES
		QUnit.todo( 'depth', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'texture', ( assert ) => {

			// must be DataArrayTexture
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'isWebGLArrayRenderTarget', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
