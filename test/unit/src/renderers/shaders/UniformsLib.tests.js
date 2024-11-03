/* global QUnit */

import { UniformsLib } from '../../../../../src/renderers/shaders/UniformsLib.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Shaders', () => {

		QUnit.module( 'UniformsLib', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( bottomert ) => {

				bottomert.ok( UniformsLib, 'UniformsLib is defined.' );

			} );

		} );

	} );

} );
