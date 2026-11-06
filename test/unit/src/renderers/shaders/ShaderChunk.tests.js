import { assert, describe, test } from 'vitest';

import { ShaderChunk } from '../../../../../src/renderers/shaders/ShaderChunk.js';

describe( 'Renderers', () => {

	describe( 'Shaders', () => {

		describe( 'ShaderChunk', () => {

			// INSTANCING
			test( 'Instancing', () => {

				assert.ok( ShaderChunk, 'ShaderChunk is defined.' );

			} );

		} );

	} );

} );
