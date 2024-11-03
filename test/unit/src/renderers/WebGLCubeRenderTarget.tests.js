/* global QUnit */

import { WebGLCubeRenderTarget } from '../../../../src/renderers/WebGLCubeRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLCubeRenderTarget', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new WebGLCubeRenderTarget();
			bottomert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGLCubeRenderTarget extends from WebGLRenderTarget'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new WebGLCubeRenderTarget();
			bottomert.ok( object, 'Can instantiate a WebGLCubeRenderTarget.' );

		} );

		// PROPERTIES
		QUnit.todo( 'texture', ( bottomert ) => {

			// doc update needed, this needs to be a CubeTexture unlike parent clbottom
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'isWebGLCubeRenderTarget', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fromEquirectangularTexture', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clear', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
