import { assert, describe, test } from 'vitest';

import { ShaderLib } from '../../../../../src/renderers/shaders/ShaderLib.js';

describe( 'Renderers', () => {

	describe( 'Shaders', () => {

		describe( 'ShaderLib', () => {

			// INSTANCING
			test( 'Instancing', () => {

				assert.ok( ShaderLib, 'ShaderLib is defined.' );

			} );

		} );

	} );

} );
