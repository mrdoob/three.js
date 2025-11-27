/* global QUnit */

import { NearestFilter } from '../../../../src/constants.js';
import { RenderTarget } from '../../../../src/core/RenderTarget.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'RenderTarget', () => {

		// Constructor options
		QUnit.test( 'Constructor', ( assert ) => {

			const empty = new RenderTarget();
			assert.ok( empty.width != null && empty.height != null && empty.textures.length === 1, 'Can instantiate a RenderTarget with no arguments.' );

			const sized = new RenderTarget( 1, 1 );
			assert.ok( sized.width === 1 && sized.height === 1 && sized.textures.length === 1, 'Can instantiate a RenderTarget with custom size.' );

			const mrt = new RenderTarget( 1, 1, { count: 2 } );
			assert.ok( mrt.width === 1 && mrt.height === 1 && mrt.textures.length === 2, 'Can instantiate a RenderTarget with custom count (MRT).' );

			const options = new RenderTarget( 1, 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a RenderTarget with texture options.' );

		} );

		// PROPERTIES
		QUnit.todo( 'texture', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'depthTexture', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'setSize', ( assert ) => {

			const renderTarget = new RenderTarget();
			renderTarget.setSize( 128, 128 );
			assert.ok( renderTarget.width === 128 && renderTarget.height === 128, 'Sets a size with width and height' );
			assert.ok( renderTarget.texture.image.width === 128 && renderTarget.texture.image.height === 128, 'Texture image is updated on resize' );
			assert.ok( renderTarget.viewport.width === 128 && renderTarget.viewport.height === 128, 'Viewport is updated on resize' );
			assert.ok( renderTarget.scissor.width === 128 && renderTarget.scissor.height === 128, 'Scissor is updated on resize' );

			const mrt = new RenderTarget( 0, 0, { count: 2 } );
			mrt.setSize( 128, 128 );
			assert.ok( mrt.width === 128 && mrt.height === 128, 'Sets a size with width and height' );
			assert.ok( mrt.textures[ 0 ].image.width === 128 && mrt.textures[ 0 ].image.height === 128 && mrt.textures[ 1 ].image.width === 128 && mrt.textures[ 1 ].image.height === 128, 'Texture images are updated on resize' );
			assert.ok( mrt.viewport.width === 128 && mrt.viewport.height === 128, 'Viewport is updated on resize' );
			assert.ok( mrt.scissor.width === 128 && mrt.scissor.height === 128, 'Scissor is updated on resize' );

			const renderTarget3D = new RenderTarget();
			renderTarget3D.setSize( 128, 128, 16 );
			assert.ok( renderTarget3D.width === 128 && renderTarget3D.height === 128 && renderTarget3D.depth === 16, 'Sets a size with width, height, and depth' );
			assert.ok( renderTarget3D.texture.image.width === 128 && renderTarget3D.texture.image.height === 128 && renderTarget3D.texture.image.depth === 16, 'Texture image is updated on resize' );
			assert.ok( renderTarget3D.viewport.width === 128 && renderTarget3D.viewport.height === 128, 'Viewport is updated on resize' );
			assert.ok( renderTarget3D.scissor.width === 128 && renderTarget3D.scissor.height === 128, 'Scissor is updated on resize' );

		} );

	} );

} );
