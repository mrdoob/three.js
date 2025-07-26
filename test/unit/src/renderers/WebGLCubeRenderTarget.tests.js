/* global QUnit */

import { NearestFilter } from '../../../../src/constants.js';
import { WebGLCubeRenderTarget } from '../../../../src/renderers/WebGLCubeRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLCubeRenderTarget', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new WebGLCubeRenderTarget();
			assert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGLCubeRenderTarget extends from WebGLRenderTarget'
			);

			const options = new WebGLCubeRenderTarget( 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a WebGLCubeRenderTarget with texture options.' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new WebGLCubeRenderTarget();
			assert.ok( object, 'Can instantiate a WebGLCubeRenderTarget.' );

		} );

		// PROPERTIES
		QUnit.todo( 'texture', ( assert ) => {

			// doc update needed, this needs to be a CubeTexture unlike parent class
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'isWebGLCubeRenderTarget', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'fromEquirectangularTexture', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clear', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
