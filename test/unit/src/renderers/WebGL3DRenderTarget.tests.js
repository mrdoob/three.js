import { assert, describe, test } from 'vitest';

import { NearestFilter } from '../../../../src/constants.js';
import { WebGL3DRenderTarget } from '../../../../src/renderers/WebGL3DRenderTarget.js';

import { WebGLRenderTarget } from '../../../../src/renderers/WebGLRenderTarget.js';

describe( 'Renderers', () => {

	describe( 'WebGL3DRenderTarget', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new WebGL3DRenderTarget();
			assert.strictEqual(
				object instanceof WebGLRenderTarget, true,
				'WebGL3DRenderTarget extends from WebGLRenderTarget'
			);

			const options = new WebGL3DRenderTarget( 1, 1, 1, { magFilter: NearestFilter } );
			assert.ok( options.width === 1 && options.height === 1 && options.depth === 1 && options.texture.magFilter === NearestFilter, 'Can instantiate a WebGL3DRenderTarget with texture options.' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new WebGL3DRenderTarget();
			assert.ok( object, 'Can instantiate a WebGL3DRenderTarget.' );

		} );

	} );

} );
