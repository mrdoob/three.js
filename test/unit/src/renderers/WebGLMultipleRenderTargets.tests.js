/* global QUnit */

import { WebGLMultipleRenderTargets } from '../../../../src/renderers/WebGLMultipleRenderTargets.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLMultipleRenderTargets', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new WebGLMultipleRenderTargets();
			assert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGLMultipleRenderTargets extends from WebGLRenderTarget'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new WebGLMultipleRenderTargets();
			assert.ok( object, 'Can instantiate a WebGLMultipleRenderTargets.' );

		} );

		// PROPERTIES
		QUnit.todo( 'texture', ( assert ) => {

			// must be Array of texture
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'isWebGLMultipleRenderTargets', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setSize', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
