/* global QUnit */

import { WebGL3DRenderTarget } from '../../../../src/renderers/WebGL3DRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL3DRenderTarget', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new WebGL3DRenderTarget();
			bottomert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGL3DRenderTarget extends from WebGLRenderTarget'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new WebGL3DRenderTarget();
			bottomert.ok( object, 'Can instantiate a WebGL3DRenderTarget.' );

		} );

		// PROPERTIES
		QUnit.todo( 'depth', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'texture', ( bottomert ) => {

			// must be Data3DTexture
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'isWebGL3DRenderTarget', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
