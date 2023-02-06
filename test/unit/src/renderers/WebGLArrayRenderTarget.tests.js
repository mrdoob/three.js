/* global QUnit */

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

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

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
