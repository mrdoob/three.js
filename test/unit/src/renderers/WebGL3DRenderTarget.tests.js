/* global QUnit */

import { NearestFilter } from '../../../../src/constants.js';
import { WebGL3DRenderTarget } from '../../../../src/renderers/WebGL3DRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL3DRenderTarget', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new WebGL3DRenderTarget();
			assert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGL3DRenderTarget extends from WebGLRenderTarget'
			);

			const options = new WebGL3DRenderTarget( 1, 1, 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.depth === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a WebGL3DRenderTarget with texture options.' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new WebGL3DRenderTarget();
			assert.ok( object, 'Can instantiate a WebGL3DRenderTarget.' );

		} );

		// PROPERTIES
		QUnit.test( 'depth', ( assert ) => {

			const target = new WebGL3DRenderTarget( 4, 2, 8 );

			assert.strictEqual( target.depth, 8, 'WebGL3DRenderTarget.depth should match the constructor argument.' );

		} );

		QUnit.test( 'texture', ( assert ) => {

			const width = 4;
			const height = 2;
			const depth = 8;
			const target = new WebGL3DRenderTarget( width, height, depth );

			assert.ok( target.texture.isData3DTexture, 'texture is a Data3DTexture.' );
			assert.strictEqual( target.texture.image.width, width, 'texture width matches the render target width.' );
			assert.strictEqual( target.texture.image.height, height, 'texture height matches the render target height.' );
			assert.strictEqual( target.texture.image.depth, depth, 'texture depth matches the render target depth.' );

		} );

		// PUBLIC
		QUnit.test( 'isWebGL3DRenderTarget', ( assert ) => {

			const target = new WebGL3DRenderTarget();

			assert.ok( target.isWebGL3DRenderTarget, 'isWebGL3DRenderTarget should be true.' );

		} );

	} );

} );
