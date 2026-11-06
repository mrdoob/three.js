import { assert, describe, test } from 'vitest';

import { UniformsLib } from '../../../../../src/renderers/shaders/UniformsLib.js';

describe( 'Renderers', () => {

	describe( 'Shaders', () => {

		describe( 'UniformsLib', () => {

			// INSTANCING
			test( 'Instancing', () => {

				assert.ok( UniformsLib, 'UniformsLib is defined.' );

			} );

		} );

	} );

} );
