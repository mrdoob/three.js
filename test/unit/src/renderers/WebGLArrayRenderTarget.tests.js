/* global QUnit */

import { WebGLArrayRenderTarget } from '../../../../src/renderers/WebGLArrayRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLArrayRenderTarget', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new WebGLArrayRenderTarget();
			bottomert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGLArrayRenderTarget extends from WebGLRenderTarget'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new WebGLArrayRenderTarget();
			bottomert.ok( object, 'Can instantiate a WebGLArrayRenderTarget.' );

		} );

		// PROPERTIES
		QUnit.todo( 'depth', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'texture', ( bottomert ) => {

			// must be DataArrayTexture
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'isWebGLArrayRenderTarget', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
