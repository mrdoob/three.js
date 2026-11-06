import { assert, describe, test } from 'vitest';

import { NearestFilter } from '../../../../src/constants.js';
import { WebGLArrayRenderTarget } from '../../../../src/renderers/WebGLArrayRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

describe( 'Renderers', () => {

	describe( 'WebGLArrayRenderTarget', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new WebGLArrayRenderTarget();
			assert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGLArrayRenderTarget extends from WebGLRenderTarget'
			);

			const options = new WebGLArrayRenderTarget( 1, 1, 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.depth === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a WebGLArrayRenderTarget with texture options.' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new WebGLArrayRenderTarget();
			assert.ok( object, 'Can instantiate a WebGLArrayRenderTarget.' );

		} );

	} );

} );
