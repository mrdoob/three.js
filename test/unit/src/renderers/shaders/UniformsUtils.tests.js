/* global QUnit */

import { UniformsUtils } from '../../../../../src/renderers/shaders/UniformsUtils.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Shaders', () => {

		QUnit.module( 'UniformsUtils', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				assert.ok( UniformsUtils, 'UniformsUtils is defined.' );

			} );

		} );

	} );

} );
