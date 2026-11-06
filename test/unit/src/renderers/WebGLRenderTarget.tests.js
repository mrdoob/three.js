import { assert, describe, test } from 'vitest';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';
import { NearestFilter } from '../../../../src/constants.js';

describe( 'Renderers', () => {

	describe( 'WebGLRenderTarget', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new WebGLRenderTarget();
			assert.strictEqual(
				object instanceof EventDispatcher, true,
				'WebGLRenderTarget extends from EventDispatcher'
			);

			const options = new WebGLRenderTarget( 1, 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a WebGLRenderTarget with texture options.' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new WebGLRenderTarget();
			assert.ok( object, 'Can instantiate a WebGLRenderTarget.' );

		} );

		// PUBLIC

		test( 'dispose', () => {


			const object = new WebGLRenderTarget();
			object.dispose();

		} );

	} );

} );
